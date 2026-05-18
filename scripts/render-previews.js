"use strict";

const fs = require("node:fs");
const path = require("node:path");
const hljs = require("highlight.js/lib/core");
const murex = require("../src/languages/murex");

hljs.registerLanguage("murex", murex);

const THEMES = ["github", "atom-one-dark", "monokai-sublime", "vs2015"];
const repoRoot = path.resolve(__dirname, "..");
const corpusDir = path.join(repoRoot, "test", "corpus");
const outDir = path.join(repoRoot, "previews");
const stylesDir = path.join(repoRoot, "node_modules", "highlight.js", "styles");

function readFixtureFiles() {
  const files = [];

  function walk(dir, prefix = "") {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = prefix ? path.join(prefix, entry.name) : entry.name;
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(abs, rel);
      } else if (entry.isFile() && /\.(mx|sh|json)$/.test(entry.name)) {
        files.push({ rel, abs });
      }
    }
  }

  walk(corpusDir);
  return files.sort((a, b) => a.rel.localeCompare(b.rel));
}

function escapeHtml(input) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderThemePage(theme, fixtures) {
  const cssPath = path.join(stylesDir, `${theme}.css`);
  if (!fs.existsSync(cssPath)) {
    throw new Error(`Missing highlight.js theme: ${theme}`);
  }

  const css = fs.readFileSync(cssPath, "utf8");
  const sections = fixtures
    .map(({ rel, abs }) => {
      const code = fs.readFileSync(abs, "utf8");
      const highlighted = hljs.highlight(code, { language: "murex" }).value;
      return `
<section class="fixture">
  <h2>${escapeHtml(rel)}</h2>
  <div class="grid">
    <div>
      <h3>Highlighted (murex)</h3>
      <pre><code class="hljs language-murex">${highlighted}</code></pre>
    </div>
    <div>
      <h3>Raw Source</h3>
      <pre><code>${escapeHtml(code)}</code></pre>
    </div>
  </div>
</section>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Murex Preview - ${theme}</title>
  <style>
${css}
:root {
  --bg: #101418;
  --panel: #161d24;
  --text: #dce3eb;
  --muted: #9ca9b8;
  --border: #2a3644;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: radial-gradient(circle at top right, #1f2a36, #101418 42%);
  color: var(--text);
  font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
}
header {
  padding: 24px;
  border-bottom: 1px solid var(--border);
  background: rgba(10, 16, 22, 0.75);
  backdrop-filter: blur(4px);
}
header h1 { margin: 0 0 8px; font-size: 22px; }
header p { margin: 0; color: var(--muted); }
main { padding: 24px; display: grid; gap: 20px; }
.fixture {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: rgba(16, 22, 28, 0.75);
  padding: 16px;
}
.fixture h2 { margin: 0 0 12px; font-size: 16px; color: #b8c9da; }
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 14px;
}
h3 { margin: 0 0 8px; font-size: 13px; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; }
pre {
  margin: 0;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: auto;
  padding: 12px;
  background: rgba(10, 15, 20, 0.8);
}
  </style>
</head>
<body>
  <header>
    <h1>Murex highlight.js preview: ${theme}</h1>
    <p>Generated from test corpus fixtures. Use this page to review operator/comment readability and token consistency.</p>
  </header>
  <main>
${sections}
  </main>
</body>
</html>`;
}

function renderIndex(themes) {
  const links = themes
    .map((theme) => `<li><a href="${theme}.html">${theme}</a></li>`)
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Murex Preview Index</title>
  <style>
body { font-family: "IBM Plex Sans", "Segoe UI", sans-serif; margin: 32px; background: #f7f9fc; color: #1c2430; }
h1 { margin: 0 0 8px; }
ul { line-height: 1.9; }
a { color: #0a5cc0; text-decoration: none; }
a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>Murex highlight.js theme previews</h1>
  <p>Open a theme page and review highlighted corpus fixtures.</p>
  <ul>
    ${links}
  </ul>
</body>
</html>`;
}

function main() {
  const fixtures = readFixtureFiles();
  fs.mkdirSync(outDir, { recursive: true });

  for (const theme of THEMES) {
    const html = renderThemePage(theme, fixtures);
    fs.writeFileSync(path.join(outDir, `${theme}.html`), html, "utf8");
  }

  fs.writeFileSync(path.join(outDir, "index.html"), renderIndex(THEMES), "utf8");

  console.log(`Generated ${THEMES.length} themed previews in ${outDir}`);
}

main();
