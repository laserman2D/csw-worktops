// Lists every placeholder still outstanding, so nothing is buried in markup.
// Matches TODO('…') calls in data files, [TODO: …] markers in pages (multi-line
// allowed) and REVIEW: notes in legal pages.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const targets = ['src', 'functions'];
const patterns = [
  /TODO\('((?:[^'\\]|\\.)*)'\)/g,
  /\[TODO:\s*([^\]]+)\]/g,
  /REVIEW:\s*([^.]+\.)/g,
];

const hits = [];
function walk(p) {
  if (statSync(p).isDirectory()) {
    for (const f of readdirSync(p)) walk(join(p, f));
    return;
  }
  if (!/\.(ts|mjs|astro|md|css)$/.test(p)) return;
  const text = readFileSync(p, 'utf8');
  for (const re of patterns) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text))) {
      const label = m[1].replace(/\s+/g, ' ').trim();
      const lineStart = text.slice(text.lastIndexOf('\n', m.index) + 1, m.index);
      if (label === '…' || /export const|startsWith\(/.test(lineStart)) continue;
      const line = text.slice(0, m.index).split('\n').length;
      hits.push({ file: relative(root, p), line, label: label.length > 110 ? label.slice(0, 107) + '...' : label });
    }
  }
}
for (const t of targets) walk(join(root, t));

hits.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
if (!hits.length) {
  console.log('No placeholders left.');
} else {
  console.log(`${hits.length} placeholder(s) outstanding:\n`);
  for (const h of hits) console.log(`  ${h.file}:${h.line}  ${h.label}`);
}
