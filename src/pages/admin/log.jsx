import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabase';

// ── Change this to your preferred PIN ────────────────────────────────────────
const LOG_PIN = '1122';

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:      '#edeae3',
  card:    '#faf8f4',
  border:  '#e0ddd7',
  header:  '#161310',
  gold:    '#c9a84c',
  black:   '#111111',
  red:     '#a8341e',
  green:   '#1a5e38',
  muted:   '#8a8580',
  divider: '#dedad4',
};

const SERIF = "'Cormorant Garamond', Georgia, serif";
const MONO  = "'DM Mono', 'Courier New', monospace";

// ── Formatters ────────────────────────────────────────────────────────────────
function fmt(n) {
  if (n == null || isNaN(n)) return '—';
  const abs  = Math.abs(Math.round(n));
  const sign = n < 0 ? '\u2212' : '';
  return sign + 'Rs.\u202f' + abs.toLocaleString('en');
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PinGate({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [err, setErr] = useState(false);

  function submit(e) {
    e.preventDefault();
    if (pin === LOG_PIN) {
      onUnlock();
    } else {
      setErr(true);
      setPin('');
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
        <div style={{ fontFamily: SERIF, fontSize: '28px', fontWeight: 700, color: T.black, letterSpacing: '-0.01em' }}>
          MayaCabs
        </div>
        <div style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: T.muted }}>
          Operations Log
        </div>
        <input
          type="password"
          autoFocus
          autoComplete="current-password"
          placeholder="PIN"
          value={pin}
          onChange={e => { setPin(e.target.value); setErr(false); }}
          style={{
            marginTop: '16px',
            border: `1px solid ${err ? T.red : T.border}`,
            background: T.card,
            fontFamily: MONO,
            fontSize: '14px',
            padding: '8px 16px',
            outline: 'none',
            textAlign: 'center',
            letterSpacing: '0.3em',
            width: '160px',
            color: T.black,
          }}
        />
        {err && (
          <div style={{ fontFamily: MONO, fontSize: '11px', color: T.red }}>Incorrect PIN</div>
        )}
        <button
          type="submit"
          style={{
            background: T.header, color: '#fff', fontFamily: MONO, fontSize: '11px',
            letterSpacing: '0.15em', textTransform: 'uppercase', border: 'none',
            padding: '8px 24px', cursor: 'pointer',
          }}
        >
          Enter
        </button>
      </form>
    </div>
  );
}

function Modal({ title, onClose, onSave, saving, children }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(22,19,16,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: T.card, border: `1px solid ${T.border}`, padding: '32px', width: '380px', maxWidth: '90vw' }}>
        <div style={{ fontFamily: SERIF, fontSize: '22px', fontWeight: 700, color: T.black, marginBottom: '20px' }}>
          {title}
        </div>
        {children}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              fontFamily: MONO, fontSize: '11px', letterSpacing: '0.1em',
              background: 'none', border: `1px solid ${T.border}`,
              padding: '6px 16px', cursor: 'pointer', color: T.muted,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            style={{
              fontFamily: MONO, fontSize: '11px', letterSpacing: '0.1em',
              background: T.header, color: '#fff', border: 'none',
              padding: '6px 16px', cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  border: `1px solid ${T.border}`,
  background: '#fff',
  fontFamily: MONO,
  fontSize: '13px',
  padding: '7px 10px',
  outline: 'none',
  color: T.black,
  width: '100%',
  boxSizing: 'border-box',
};

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
      <label style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Card({ children, fullWidth }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        padding: '28px',
        transition: 'box-shadow 0.15s ease',
        boxShadow: hovered ? '0 4px 18px rgba(0,0,0,0.08)' : 'none',
        gridColumn: fullWidth ? '1 / -1' : undefined,
      }}
    >
      {children}
    </div>
  );
}

function LogRow({ left, right, rightColor }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      padding: '7px 0', borderBottom: `1px solid ${T.divider}`,
    }}>
      <span style={{ fontFamily: MONO, fontSize: '11px', color: T.muted, marginRight: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {left}
      </span>
      <span style={{ fontFamily: MONO, fontSize: '11px', color: rightColor || T.black, whiteSpace: 'nowrap' }}>
        {right}
      </span>
    </div>
  );
}

function AddLink({ label, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: MONO, fontSize: '11px', letterSpacing: '0.08em',
        color: hov ? T.black : T.muted,
        cursor: 'pointer', textAlign: 'right',
        paddingTop: '10px',
        transition: 'color 0.1s',
        userSelect: 'none',
      }}
    >
      {label}
    </div>
  );
}

// ── Empty state helper ────────────────────────────────────────────────────────
function Empty() {
  return (
    <div style={{ fontFamily: MONO, fontSize: '11px', color: T.muted, padding: '10px 0' }}>
      No entries yet
    </div>
  );
}

// ── Card label + number + subtitle ───────────────────────────────────────────
function Metric({ label, value, subtitle, color }) {
  return (
    <>
      <div style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: T.muted, marginBottom: '10px' }}>
        {label}
      </div>
      <div style={{ fontFamily: SERIF, fontSize: '52px', fontWeight: 700, lineHeight: 1, color: color || T.black }}>
        {value}
      </div>
      <div style={{ fontFamily: MONO, fontSize: '11px', color: T.muted, marginTop: '4px', marginBottom: '16px' }}>
        {subtitle}
      </div>
      <div style={{ borderTop: `1px solid ${T.divider}` }} />
    </>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function OperationsLog() {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem('ops_log_pin') === LOG_PIN
  );

  const [slotLog,  setSlotLog]  = useState([]);
  const [fuelLog,  setFuelLog]  = useState([]);
  const [maintLog, setMaintLog] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const [modal,  setModal]  = useState(null); // 'log_day' | 'add_fill' | 'add_maint'
  const [form,   setForm]   = useState({});
  const [saving, setSaving] = useState(false);

  // Inject Google Fonts (idempotent)
  useEffect(() => {
    const id = 'ops-log-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id   = id;
    link.rel  = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=DM+Mono:wght@400&display=swap';
    document.head.appendChild(link);
  }, []);

  function handleUnlock() {
    sessionStorage.setItem('ops_log_pin', LOG_PIN);
    setUnlocked(true);
  }

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [{ data: sl }, { data: fl }, { data: ml }] = await Promise.all([
      supabase.from('slot_log') .select('*').order('date', { ascending: false }),
      supabase.from('fuel_log') .select('*').order('date', { ascending: false }),
      supabase.from('maint_log').select('*').order('date', { ascending: false }),
    ]);
    setSlotLog(sl  || []);
    setFuelLog(fl  || []);
    setMaintLog(ml || []);
    setLoading(false);
  }, []);

  useEffect(() => { if (unlocked) fetchAll(); }, [unlocked, fetchAll]);

  if (!unlocked) return <PinGate onUnlock={handleUnlock} />;

  // ── Totals ──────────────────────────────────────────────────────────────────
  const totalSlots      = slotLog.reduce((s, r) => s + (Number(r.slots)        || 0), 0);
  const totalRevenue    = slotLog.reduce((s, r) => s + (Number(r.slots) || 0) * (Number(r.rate_per_hour) || 0), 0);
  const totalDriverFees = slotLog.reduce((s, r) => s + (Number(r.driver_fee)   || 0), 0);
  const totalFuelCost   = fuelLog.reduce((s, r) => s + (Number(r.litres) || 0) * (Number(r.ppl) || 0), 0);
  const totalMaintCost  = maintLog.reduce((s, r) => s + (Number(r.cost)        || 0), 0);
  const netProfit       = totalRevenue - totalFuelCost - totalDriverFees - totalMaintCost;

  // ── Modal helpers ───────────────────────────────────────────────────────────
  function openModal(type) {
    const today = new Date().toISOString().slice(0, 10);
    const defaults = {
      log_day:   { date: today, driver: '', slots: '', rate_per_hour: '', driver_fee: '', note: '' },
      add_fill:  { date: today, litres: '', ppl: '', note: '' },
      add_maint: { date: today, item: '', cost: '', done: false },
    };
    setForm(defaults[type]);
    setModal(type);
  }

  function closeModal() { setModal(null); setForm({}); }
  function setF(key, value) { setForm(prev => ({ ...prev, [key]: value })); }

  async function handleSave() {
    setSaving(true);
    let error;
    if (modal === 'log_day') {
      ({ error } = await supabase.from('slot_log').insert({
        date:         form.date,
        driver:       form.driver     || null,
        slots:        parseFloat(form.slots)        || 0,
        rate_per_hour: parseFloat(form.rate_per_hour) || 0,
        driver_fee:   parseFloat(form.driver_fee)   || 0,
        note:         form.note       || null,
      }));
    } else if (modal === 'add_fill') {
      ({ error } = await supabase.from('fuel_log').insert({
        date:   form.date,
        litres: parseFloat(form.litres) || 0,
        ppl:    parseFloat(form.ppl)    || 0,
        note:   form.note || null,
      }));
    } else if (modal === 'add_maint') {
      ({ error } = await supabase.from('maint_log').insert({
        date: form.date,
        item: form.item,
        cost: parseFloat(form.cost) || 0,
        done: form.done,
      }));
    }
    setSaving(false);
    if (!error) { closeModal(); fetchAll(); }
    else alert('Save failed: ' + error.message);
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: MONO }}>

      {/* ── Sticky header ───────────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: T.header, padding: '0 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '56px',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <span style={{ fontFamily: SERIF, fontSize: '22px', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
            MayaCabs
          </span>
          <span style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
            Operations
          </span>
        </div>
        <span style={{ fontFamily: MONO, fontSize: '11px', color: T.gold, letterSpacing: '0.05em' }}>
          Car fixed cost&nbsp;&nbsp;Rs.&nbsp;3,000,000
        </span>
      </header>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: '1040px', margin: '0 auto', padding: '40px 24px 80px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', fontFamily: MONO, fontSize: '12px', color: T.muted, padding: '100px 0' }}>
            Loading…
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

            {/* ── Slots Booked ─────────────────────────────────────────────── */}
            <Card>
              <Metric
                label="Slots Booked"
                value={totalSlots}
                subtitle="total hours worked"
                color={T.black}
              />
              <div style={{ marginTop: '4px' }}>
                {slotLog.length === 0 ? <Empty /> : slotLog.slice(0, 3).map(r => (
                  <LogRow
                    key={r.id}
                    left={`${r.date}${r.driver ? ' · ' + r.driver : ''}`}
                    right={`${r.slots} hrs`}
                  />
                ))}
              </div>
              <AddLink label="+ LOG DAY" onClick={() => openModal('log_day')} />
            </Card>

            {/* ── Fuel Cost ────────────────────────────────────────────────── */}
            <Card>
              <Metric
                label="Fuel Cost"
                value={fmt(totalFuelCost)}
                subtitle="running total"
                color={T.red}
              />
              <div style={{ marginTop: '4px' }}>
                {fuelLog.length === 0 ? <Empty /> : fuelLog.slice(0, 3).map(r => (
                  <LogRow
                    key={r.id}
                    left={r.date}
                    right={`${r.litres}L @ Rs.${r.ppl}/L`}
                    rightColor={T.red}
                  />
                ))}
              </div>
              <AddLink label="+ ADD FILL" onClick={() => openModal('add_fill')} />
            </Card>

            {/* ── Revenue ──────────────────────────────────────────────────── */}
            <Card>
              <Metric
                label="Revenue"
                value={fmt(totalRevenue)}
                subtitle="gross from all logged days"
                color={T.green}
              />
              <div style={{ marginTop: '4px' }}>
                {slotLog.length === 0 ? <Empty /> : slotLog.slice(0, 3).map(r => (
                  <LogRow
                    key={r.id}
                    left={`${r.date}${r.driver ? ' · ' + r.driver : ''}`}
                    right={fmt((Number(r.slots) || 0) * (Number(r.rate_per_hour) || 0))}
                    rightColor={T.green}
                  />
                ))}
              </div>
            </Card>

            {/* ── Net Profit ───────────────────────────────────────────────── */}
            <Card>
              <Metric
                label="Net Profit"
                value={fmt(netProfit)}
                subtitle="after all deductions"
                color={netProfit >= 0 ? T.black : T.red}
              />
              <div style={{ marginTop: '8px' }}>
                {[
                  { label: 'Revenue',     value: fmt(totalRevenue),    color: T.black },
                  { label: 'Fuel',        value: `\u2212${fmt(totalFuelCost)}`,   color: T.red   },
                  { label: 'Driver fees', value: `\u2212${fmt(totalDriverFees)}`, color: T.red   },
                  { label: 'Maintenance', value: `\u2212${fmt(totalMaintCost)}`,  color: T.red   },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '6px 0', borderBottom: `1px solid ${T.divider}`,
                    }}
                  >
                    <span style={{ fontFamily: MONO, fontSize: '11px', color: T.muted }}>{label}</span>
                    <span style={{ fontFamily: MONO, fontSize: '11px', color }}>{value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* ── Maintenance Logbook ───────────────────────────────────────── */}
            <Card fullWidth>
              <div style={{ fontFamily: SERIF, fontSize: '22px', fontWeight: 700, color: T.black, marginBottom: '4px' }}>
                Maintenance Logbook
              </div>
              <div style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: T.muted, marginBottom: '16px' }}>
                Tyres&nbsp;·&nbsp;Oil&nbsp;·&nbsp;Service&nbsp;·&nbsp;Repairs&nbsp;·&nbsp;Battery
              </div>
              <div style={{ borderTop: `1px solid ${T.divider}` }} />
              {maintLog.length === 0 ? (
                <div style={{ fontFamily: MONO, fontSize: '11px', color: T.muted, padding: '16px 0' }}>No entries yet</div>
              ) : (
                maintLog.map(r => (
                  <div
                    key={r.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '110px 1fr 130px 84px',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '10px 0',
                      borderBottom: `1px solid ${T.divider}`,
                    }}
                  >
                    <span style={{ fontFamily: MONO, fontSize: '11px', color: T.muted }}>{r.date}</span>
                    <span style={{ fontFamily: MONO, fontSize: '12px', color: T.black }}>{r.item}</span>
                    <span style={{ fontFamily: MONO, fontSize: '12px', color: T.red, textAlign: 'right' }}>{fmt(r.cost)}</span>
                    <span style={{ fontFamily: MONO, fontSize: '11px', color: r.done ? T.green : T.muted, textAlign: 'right' }}>
                      {r.done ? '\u2713 Done' : 'Pending'}
                    </span>
                  </div>
                ))
              )}
              <AddLink label="+ ADD ENTRY" onClick={() => openModal('add_maint')} />
            </Card>

          </div>
        )}
      </main>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}

      {modal === 'log_day' && (
        <Modal title="Log Day" onClose={closeModal} onSave={handleSave} saving={saving}>
          <Field label="Date">
            <input type="date" style={inputStyle} value={form.date} onChange={e => setF('date', e.target.value)} />
          </Field>
          <Field label="Driver">
            <input type="text" style={inputStyle} placeholder="Name" value={form.driver} onChange={e => setF('driver', e.target.value)} />
          </Field>
          <Field label="Hours Worked (Slots)">
            <input type="number" style={inputStyle} placeholder="0" min="0" step="0.5" value={form.slots} onChange={e => setF('slots', e.target.value)} />
          </Field>
          <Field label="Rate per Hour (Rs.)">
            <input type="number" style={inputStyle} placeholder="0" min="0" value={form.rate_per_hour} onChange={e => setF('rate_per_hour', e.target.value)} />
          </Field>
          <Field label="Driver Fee (Rs.)">
            <input type="number" style={inputStyle} placeholder="0" min="0" value={form.driver_fee} onChange={e => setF('driver_fee', e.target.value)} />
          </Field>
          <Field label="Note (optional)">
            <input type="text" style={inputStyle} placeholder="…" value={form.note} onChange={e => setF('note', e.target.value)} />
          </Field>
        </Modal>
      )}

      {modal === 'add_fill' && (
        <Modal title="Add Fill" onClose={closeModal} onSave={handleSave} saving={saving}>
          <Field label="Date">
            <input type="date" style={inputStyle} value={form.date} onChange={e => setF('date', e.target.value)} />
          </Field>
          <Field label="Litres">
            <input type="number" style={inputStyle} placeholder="0" min="0" step="0.1" value={form.litres} onChange={e => setF('litres', e.target.value)} />
          </Field>
          <Field label="Price per Litre (Rs.)">
            <input type="number" style={inputStyle} placeholder="0" min="0" step="0.01" value={form.ppl} onChange={e => setF('ppl', e.target.value)} />
          </Field>
          <Field label="Note (optional)">
            <input type="text" style={inputStyle} placeholder="…" value={form.note} onChange={e => setF('note', e.target.value)} />
          </Field>
        </Modal>
      )}

      {modal === 'add_maint' && (
        <Modal title="Add Maintenance Entry" onClose={closeModal} onSave={handleSave} saving={saving}>
          <Field label="Date">
            <input type="date" style={inputStyle} value={form.date} onChange={e => setF('date', e.target.value)} />
          </Field>
          <Field label="Item">
            <input type="text" style={inputStyle} placeholder="e.g. Tyre replacement" value={form.item} onChange={e => setF('item', e.target.value)} />
          </Field>
          <Field label="Cost (Rs.)">
            <input type="number" style={inputStyle} placeholder="0" min="0" value={form.cost} onChange={e => setF('cost', e.target.value)} />
          </Field>
          <Field label="Status">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: MONO, fontSize: '12px', color: T.black, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.done}
                onChange={e => setF('done', e.target.checked)}
                style={{ accentColor: T.green, width: '14px', height: '14px' }}
              />
              Mark as done
            </label>
          </Field>
        </Modal>
      )}

    </div>
  );
}
