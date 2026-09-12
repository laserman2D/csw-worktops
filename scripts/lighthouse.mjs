/**
 * Runs Lighthouse (mobile) against the built site and prints the four scores per page.
 * Requires `npm run build` first and a local Chrome. Reports land in ./lighthouse/.
 */
import { spawn, execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';

const PORT = 4321;
const pages = ['/', '/materials', '/how-it-works', '/gallery', '/pricing', '/areas', '/about', '/contact'];

if (!existsSync('dist')) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}
mkdirSync('lighthouse', { recursive: true });

const preview = spawn('npx', ['astro', 'preview', '--port', String(PORT), '--host', '127.0.0.1'], {
  stdio: 'ignore',
  shell: process.platform === 'win32',
});

async function wait() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/`);
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('preview server did not start');
}

const rows = [];
try {
  await wait();
  for (const p of pages) {
    const name = p === '/' ? 'home' : p.slice(1).replace(/\//g, '-');
    const out = `lighthouse/${name}.json`;
    execSync(
      `npx lighthouse http://127.0.0.1:${PORT}${p} --output=json --output-path=${out} --quiet --chrome-flags="--headless=new --no-sandbox" --only-categories=performance,accessibility,best-practices,seo`,
      { stdio: 'inherit' },
    );
    const r = JSON.parse(readFileSync(out, 'utf8'));
    const c = r.categories;
    rows.push({
      page: p,
      performance: Math.round(c.performance.score * 100),
      accessibility: Math.round(c.accessibility.score * 100),
      'best-practices': Math.round(c['best-practices'].score * 100),
      seo: Math.round(c.seo.score * 100),
    });
  }
} finally {
  if (process.platform === 'win32') spawn('taskkill', ['/pid', String(preview.pid), '/f', '/t'], { stdio: 'ignore' });
  else preview.kill();
}
console.table(rows);
