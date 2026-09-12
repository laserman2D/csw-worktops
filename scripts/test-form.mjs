/**
 * End-to-end test of the enquiry form against the Pages Function.
 *
 * 1. Starts a fake webhook on localhost that records what it receives.
 * 2. Starts `wrangler pages dev dist` pointed at that webhook.
 * 3. Posts a valid enquiry (expects 200; webhook receives clean JSON).
 * 4. Posts an invalid enquiry (expects 422 with field errors).
 * 5. Posts a honeypot-filled enquiry (expects 200; webhook receives nothing).
 * 6. Stops the fake webhook and posts again (expects 502 failure path).
 *
 * Requires `npm run build` first. Uses Turnstile's always-pass test keys.
 */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const WEBHOOK_PORT = 9797;
const PAGES_PORT = 8790;
const BASE = `http://127.0.0.1:${PAGES_PORT}`;

if (!existsSync('dist')) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

const received = [];
const webhook = createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    received.push({ headers: req.headers, body: JSON.parse(body) });
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end('{"ok":true}');
  });
});
await new Promise((r) => webhook.listen(WEBHOOK_PORT, '127.0.0.1', r));

const args = [
  'wrangler', 'pages', 'dev', 'dist',
  '--port', String(PAGES_PORT),
  '--ip', '127.0.0.1',
  '--compatibility-date=2025-01-01',
  '--binding', `ENQUIRY_WEBHOOK_URL=http://127.0.0.1:${WEBHOOK_PORT}/webhook/test`,
  '--binding', 'ENQUIRY_WEBHOOK_TOKEN=test-token',
  '--binding', 'TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA',
];
const wrangler = spawn('npx', args, {
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: process.platform === 'win32',
});
let wlog = '';
wrangler.stdout.on('data', (d) => (wlog += d));
wrangler.stderr.on('data', (d) => (wlog += d));

async function waitForServer() {
  for (let i = 0; i < 90; i++) {
    try {
      const r = await fetch(`${BASE}/api/enquiry`);
      if (r.status === 405) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error('wrangler did not start:\n' + wlog);
}

function form(overrides = {}) {
  const fd = new FormData();
  const base = {
    name: 'Test Person',
    phone: '01925 000000',
    email: 'test@example.com',
    postcode: 'wa13 0aa',
    kitchen_status: 'fitted',
    material: 'quartz',
    size: 'About 7 square metres, three runs',
    timescale: '1-month',
    message: 'This is a test enquiry from scripts/test-form.mjs',
    'cf-turnstile-response': 'test-token-always-passes',
    ...overrides,
  };
  for (const [k, v] of Object.entries(base)) if (v !== undefined) fd.set(k, v);
  fd.set('plan', new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], { type: 'image/png' }), 'plan.png');
  return fd;
}

async function post(fd) {
  const r = await fetch(`${BASE}/api/enquiry`, { method: 'POST', body: fd, headers: { origin: BASE } });
  return { status: r.status, body: await r.json() };
}

let failed = 0;
function check(label, cond, detail) {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${cond ? '' : '  ' + JSON.stringify(detail)}`);
  if (!cond) failed++;
}

try {
  await waitForServer();

  const ok = await post(form());
  check('valid enquiry returns 200 ok', ok.status === 200 && ok.body.ok === true, ok);
  const got = received.at(-1);
  check('webhook received JSON payload', !!got && got.body.source === 'website-enquiry', got?.body);
  check('webhook got auth token header', got?.headers['x-enquiry-token'] === 'test-token', got?.headers);
  check('postcode normalised', got?.body.contact.postcode === 'WA13 0AA', got?.body.contact);
  check('file forwarded as base64', got?.body.file?.type === 'image/png' && got.body.file.base64.length > 0, got?.body.file);

  const bad = await post(form({ email: 'nope', postcode: '123', phone: '' }));
  check('invalid enquiry returns 422', bad.status === 422 && bad.body.error === 'validation', bad);
  check('field errors named', !!(bad.body.errors?.email && bad.body.errors?.postcode && bad.body.errors?.phone), bad.body);

  const before = received.length;
  const hp = await post(form({ website: 'http://spam.example' }));
  check('honeypot returns 200 and is dropped', hp.status === 200 && hp.body.dropped === true, hp);
  check('honeypot never reaches webhook', received.length === before, received.length);

  await new Promise((r) => webhook.close(r));
  const down = await post(form());
  check('webhook down returns 502 failure path', down.status === 502 && down.body.error === 'webhook', down);
} catch (e) {
  console.error(e);
  failed++;
} finally {
  if (process.platform === 'win32') spawn('taskkill', ['/pid', String(wrangler.pid), '/f', '/t'], { stdio: 'ignore' });
  else wrangler.kill();
}
console.log(failed ? `\n${failed} check(s) failed` : '\nAll checks passed');
setTimeout(() => process.exit(failed ? 1 : 0), 500);
