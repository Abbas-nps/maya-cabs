import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Routes to prerender as static HTML
const routes = [
  "/home",
  "/services",
  "/how-it-works",
  "/wheelchair-transport",
  "/hospital-transport",
  "/airport-transfer",
  "/areas-served",
  "/about",
  "/contact",
];

async function prerender() {
  // Read the built client index.html
  const templatePath = path.join(__dirname, "dist", "index.html");
  let template = fs.readFileSync(templatePath, "utf-8");

  // Load the SSR bundle
  const serverBundle = path.join(__dirname, "dist-server", "entry-server.js");
  const { render } = await import(serverBundle);

  console.log("🔧 Prerendering routes...");

  for (const url of routes) {
    try {
      const { html: appHtml, helmet } = await render(url);

      // Build helmet strings (tags for <head>)
      const headTags = [
        helmet?.title?.toString() ?? "",
        helmet?.meta?.toString() ?? "",
        helmet?.link?.toString() ?? "",
      ].join("\n    ");

      // Inject into template
      let html = template
        .replace("<!--ssr-head-->", headTags)
        .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

      // Write file
      const filePath =
        url === "/"
          ? path.join(__dirname, "dist", "index.html")
          : path.join(__dirname, "dist", url.slice(1), "index.html");

      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, html);
      console.log(`  ✅ ${url} → ${path.relative(__dirname, filePath)}`);
    } catch (err) {
      console.warn(`  ⚠️  Failed to prerender ${url}: ${err.message}`);
    }
  }

  console.log("✨ Prerendering complete.");
}

prerender();
