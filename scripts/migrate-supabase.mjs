/**
 * Supabase Free → Pro Migration Script
 * =====================================
 * Uses the @supabase/supabase-js client (already installed as a project dep).
 *
 * BEFORE RUNNING:
 *   1. Copy .env.migration.example → .env.migration
 *   2. Fill in the four real values (service-role keys, not anon keys)
 *   3. Ensure the Pro project schema already exists (see SCHEMA note below)
 *   4. node scripts/migrate-supabase.mjs
 *
 * SCHEMA NOTE:
 *   supabase-js cannot CREATE tables. Copy the schema first via one of:
 *     a) Supabase Dashboard → Free project → Schema Visualizer → copy DDL
 *     b) supabase db dump --db-url "postgres://..." --schema-only | supabase db push
 *     c) Settings → Database → Connection string → pg_dump --schema-only ...
 *
 * OUTPUT:
 *   - scripts/snapshots/  (JSON per table, timestamped)
 *   - .env.migrated       (ready-to-use env pointing at Pro project)
 *   - Console before/after row-count table
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ─── Load config ───────────────────────────────────────────────────────────
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dir, '..', '.env.migration');

function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split('\n')
      .filter(l => l.includes('=') && !l.trim().startsWith('#'))
      .map(l => {
        const idx = l.indexOf('=');
        return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^["']|["']$/g, '')];
      })
  );
}

const cfg = loadEnvFile(envPath);

const FREE_URL = process.env.FREE_SUPABASE_URL  ?? cfg.FREE_SUPABASE_URL;
const FREE_KEY = process.env.FREE_SUPABASE_KEY  ?? cfg.FREE_SUPABASE_KEY;   // service-role key
const PRO_URL  = process.env.PRO_SUPABASE_URL   ?? cfg.PRO_SUPABASE_URL;
const PRO_KEY  = process.env.PRO_SUPABASE_KEY   ?? cfg.PRO_SUPABASE_KEY;    // service-role key

// Optional: comma-separated list of tables to include (empty = all public tables)
const ONLY_TABLES = (process.env.ONLY_TABLES ?? cfg.ONLY_TABLES ?? '')
  .split(',').map(t => t.trim()).filter(Boolean);

// Batch size for insert operations (Supabase free limit ~500 rows/req is safely handled)
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE ?? cfg.BATCH_SIZE ?? '500', 10);

// ─── Validate config ────────────────────────────────────────────────────────
const missing = [
  ['FREE_SUPABASE_URL', FREE_URL],
  ['FREE_SUPABASE_KEY', FREE_KEY],
  ['PRO_SUPABASE_URL',  PRO_URL],
  ['PRO_SUPABASE_KEY',  PRO_KEY],
].filter(([, v]) => !v || v.startsWith('REPLACE_') || v.startsWith('['));

if (missing.length) {
  console.error('\n❌  Missing or placeholder config values:');
  missing.forEach(([k]) => console.error(`   • ${k}`));
  console.error(`\n   Fill in .env.migration (copy from .env.migration.example)\n`);
  process.exit(1);
}

// ─── Clients ────────────────────────────────────────────────────────────────
const freeClient = createClient(FREE_URL, FREE_KEY, {
  auth: { persistSession: false },
});
const proClient  = createClient(PRO_URL,  PRO_KEY,  {
  auth: { persistSession: false },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
const snapshotDir = join(__dir, 'snapshots', new Date().toISOString().slice(0, 19).replace(/:/g, '-'));

function ensureSnapshotDir() {
  mkdirSync(snapshotDir, { recursive: true });
}

async function listPublicTables() {
  // Uses information_schema — requires service-role key
  const { data, error } = await freeClient
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_type', 'BASE TABLE')
    .not('table_name', 'like', 'pg_%')
    .not('table_name', 'like', '_prisma_%');

  if (error) {
    // Fallback: some setups restrict information_schema via RLS even with service key
    console.warn('⚠  Could not query information_schema:', error.message);
    console.warn('   Falling back to known tables from ONLY_TABLES env var.\n');
    if (!ONLY_TABLES.length) {
      console.error('❌  Set ONLY_TABLES=table1,table2 in .env.migration and retry.');
      process.exit(1);
    }
    return ONLY_TABLES;
  }

  const all = data.map(r => r.table_name);
  return ONLY_TABLES.length ? all.filter(t => ONLY_TABLES.includes(t)) : all;
}

async function countRows(client, table) {
  const { count, error } = await client
    .from(table)
    .select('*', { count: 'exact', head: true });
  if (error) return `ERR: ${error.message}`;
  return count;
}

async function exportTable(table) {
  const rows = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await freeClient
      .from(table)
      .select('*')
      .range(from, from + pageSize - 1);

    if (error) throw new Error(`Export "${table}": ${error.message}`);
    if (!data || data.length === 0) break;

    rows.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return rows;
}

async function importTable(table, rows) {
  if (!rows.length) return { inserted: 0, errors: [] };

  const errors = [];
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await proClient
      .from(table)
      .upsert(batch, { onConflict: 'id', ignoreDuplicates: false });

    if (error) {
      errors.push(`Batch ${i / BATCH_SIZE + 1}: ${error.message}`);
    } else {
      inserted += batch.length;
    }
  }

  return { inserted, errors };
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n━━━ Maya Cabs — Supabase Migration ━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  FREE  → ${FREE_URL}`);
  console.log(`  PRO   → ${PRO_URL}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  ensureSnapshotDir();

  // 1. Discover tables
  process.stdout.write('🔍  Discovering tables … ');
  const tables = await listPublicTables();
  console.log(`found ${tables.length}: ${tables.join(', ')}\n`);

  if (!tables.length) {
    console.log('⚠  No public tables found. Nothing to migrate.\n');
    return;
  }

  // 2. Collect BEFORE counts
  console.log('📊  Before counts:');
  const before = {};
  for (const t of tables) {
    before[t] = { free: await countRows(freeClient, t), pro: await countRows(proClient, t) };
    console.log(`   ${t.padEnd(30)} free=${before[t].free}  pro=${before[t].pro}`);
  }

  // 3. Export + Import
  console.log('\n📦  Exporting & importing tables …\n');
  const results = {};

  for (const table of tables) {
    process.stdout.write(`   ↳ ${table} … `);

    let rows;
    try {
      rows = await exportTable(table);
    } catch (err) {
      console.log(`❌  export failed: ${err.message}`);
      results[table] = { status: 'export-failed', error: err.message };
      continue;
    }

    // Save snapshot
    writeFileSync(
      join(snapshotDir, `${table}.json`),
      JSON.stringify(rows, null, 2),
    );

    const { inserted, errors } = await importTable(table, rows);

    if (errors.length) {
      console.log(`⚠   exported=${rows.length} inserted=${inserted} errors=${errors.length}`);
      errors.forEach(e => console.log(`      ${e}`));
      results[table] = { status: 'partial', exported: rows.length, inserted, errors };
    } else {
      console.log(`✅  exported=${rows.length} inserted=${inserted}`);
      results[table] = { status: 'ok', exported: rows.length, inserted };
    }
  }

  // 4. Collect AFTER counts & verify
  console.log('\n📊  After counts (verification):\n');
  console.log(
    `${'Table'.padEnd(30)} ${'Free'.padStart(8)} ${'Pro Before'.padStart(10)} ${'Pro After'.padStart(10)} ${'Match?'.padStart(8)}`
  );
  console.log('─'.repeat(70));

  let allMatch = true;
  for (const table of tables) {
    const afterPro = await countRows(proClient, table);
    const match = afterPro === before[table].free ? '✅' : '❌';
    if (afterPro !== before[table].free) allMatch = false;
    console.log(
      `${table.padEnd(30)} ${String(before[table].free).padStart(8)} ${String(before[table].pro).padStart(10)} ${String(afterPro).padStart(10)} ${match.padStart(8)}`
    );
  }

  // 5. Write updated .env pointing to Pro
  const envLines = [
    '# Auto-generated by scripts/migrate-supabase.mjs',
    `# Generated: ${new Date().toISOString()}`,
    '',
    `VITE_SUPABASE_URL=${PRO_URL}`,
    `VITE_SUPABASE_ANON_KEY=REPLACE_WITH_PRO_ANON_KEY`,
    '',
    '# Keep the service-role key OUT of this file — never commit it.',
  ];
  writeFileSync(join(__dir, '..', '.env.migrated'), envLines.join('\n'));

  // 6. Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(allMatch
    ? '✅  Migration complete — all row counts match.'
    : '⚠   Migration finished with count mismatches — review errors above.');
  console.log(`\n   Snapshots saved to: ${snapshotDir}`);
  console.log('   .env.migrated created — rename to .env after adding the Pro anon key.\n');

  if (!allMatch || Object.values(results).some(r => r.status !== 'ok')) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('\n❌  Fatal error:', err);
  process.exit(1);
});
