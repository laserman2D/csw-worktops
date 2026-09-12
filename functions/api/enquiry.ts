/**
 * Cloudflare Pages Function: POST /api/enquiry
 *
 * Receives the enquiry form (multipart/form-data), validates it, checks the
 * honeypot and the Turnstile token, and forwards a clean JSON payload to the
 * n8n webhook. Nothing is stored here.
 *
 * Environment variables (set on the Pages project, or in .dev.vars locally):
 *   ENQUIRY_WEBHOOK_URL    required. The n8n webhook.
 *   ENQUIRY_WEBHOOK_TOKEN  optional. Sent as X-Enquiry-Token so n8n can verify origin.
 *   TURNSTILE_SECRET_KEY   required. Cloudflare Turnstile secret.
 */

interface Env {
  ENQUIRY_WEBHOOK_URL?: string;
  ENQUIRY_WEBHOOK_TOKEN?: string;
  TURNSTILE_SECRET_KEY?: string;
}

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_FILE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
]);

const KITCHEN_STATUS = new Set(['designed', 'being-fitted', 'fitted']);
const MATERIALS = new Set(['quartz', 'granite', 'ultra-compact', 'not-sure']);
const TIMESCALES = new Set(['asap', '1-month', '1-3-months', '3-plus-months', 'not-sure']);

// UK postcode, permissive on spacing/case. Not a lookup, just a sanity check.
const POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
const PHONE_RE = /^\+?[\d\s().-]{9,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Errors = Record<string, string>;

function str(fd: FormData, key: string, max = 500): string {
  const v = fd.get(key);
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function json(body: unknown, status = 200, extra: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...extra,
    },
  });
}

async function verifyTurnstile(secret: string, token: string, ip: string | null): Promise<boolean> {
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

function bytesToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  // Only accept our own origin. Pages sets the Origin header on fetch posts.
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (origin && host && new URL(origin).host !== host) {
    return json({ ok: false, error: 'bad-origin' }, 403);
  }

  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return json({ ok: false, error: 'bad-request', message: 'Could not read the form.' }, 400);
  }

  // Honeypot. Bots fill it; humans never see it. Pretend success and drop it.
  if (str(fd, 'website')) {
    return json({ ok: true, dropped: true });
  }

  // Server-side validation. Mirrors the client rules.
  const errors: Errors = {};
  const name = str(fd, 'name', 120);
  const phone = str(fd, 'phone', 30);
  const email = str(fd, 'email', 200);
  const postcode = str(fd, 'postcode', 12).toUpperCase().replace(/\s+/g, ' ');
  const kitchenStatus = str(fd, 'kitchen_status', 30);
  const material = str(fd, 'material', 30);
  const size = str(fd, 'size', 200);
  const timescale = str(fd, 'timescale', 30);
  const message = str(fd, 'message', 4000);

  if (name.length < 2) errors.name = 'Please enter your name.';
  if (!PHONE_RE.test(phone)) errors.phone = 'Please enter a phone number we can call.';
  if (!EMAIL_RE.test(email)) errors.email = 'Please enter a valid email address.';
  if (!POSTCODE_RE.test(postcode)) errors.postcode = 'Please enter a UK postcode.';
  if (!KITCHEN_STATUS.has(kitchenStatus)) errors.kitchen_status = 'Tell us where the kitchen is up to.';
  if (!MATERIALS.has(material)) errors.material = 'Choose a material, or "not sure".';
  if (!size) errors.size = 'A rough size helps. Metres, or the number of runs.';
  if (!TIMESCALES.has(timescale)) errors.timescale = 'Choose a timescale.';

  // Optional file.
  let file: { name: string; type: string; size: number; base64: string } | null = null;
  const upload = fd.get('plan');
  if (upload instanceof File && upload.size > 0) {
    if (upload.size > MAX_FILE_BYTES) {
      errors.plan = 'The file is too large. Please keep it under 8 MB.';
    } else if (!ALLOWED_FILE_TYPES.has(upload.type)) {
      errors.plan = 'Please upload a photo (JPEG, PNG, HEIC) or a PDF.';
    } else {
      file = {
        name: upload.name.slice(0, 200),
        type: upload.type,
        size: upload.size,
        base64: bytesToBase64(await upload.arrayBuffer()),
      };
    }
  }

  if (Object.keys(errors).length) {
    return json({ ok: false, error: 'validation', errors }, 422);
  }

  // Turnstile.
  const secret = env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return json({ ok: false, error: 'config', message: 'Form is not configured (Turnstile).' }, 500);
  }
  const token = str(fd, 'cf-turnstile-response', 4000);
  const ip = request.headers.get('cf-connecting-ip');
  if (!token || !(await verifyTurnstile(secret, token, ip))) {
    return json(
      { ok: false, error: 'turnstile', message: 'The anti-spam check failed. Please try again.' },
      403,
    );
  }

  // Forward to n8n.
  const webhook = env.ENQUIRY_WEBHOOK_URL;
  if (!webhook) {
    return json({ ok: false, error: 'config', message: 'Form is not configured (webhook).' }, 500);
  }

  const payload = {
    source: 'website-enquiry',
    receivedAt: new Date().toISOString(),
    contact: { name, phone, email, postcode },
    kitchen: { status: kitchenStatus, material, size, timescale },
    message,
    file,
    meta: {
      ip,
      country: request.headers.get('cf-ipcountry'),
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
    },
  };

  try {
    const headers: Record<string, string> = { 'content-type': 'application/json' };
    if (env.ENQUIRY_WEBHOOK_TOKEN) headers['x-enquiry-token'] = env.ENQUIRY_WEBHOOK_TOKEN;

    const res = await fetch(webhook, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
  } catch (err) {
    console.error('Enquiry webhook failed:', err instanceof Error ? err.message : err);
    return json(
      {
        ok: false,
        error: 'webhook',
        message: 'We could not send your enquiry just now. Please phone or email us instead.',
      },
      502,
    );
  }

  return json({ ok: true });
};

// Any method other than POST (onRequestPost above takes precedence for POST).
export const onRequest: PagesFunction<Env> = async () =>
  json({ ok: false, error: 'method' }, 405, { allow: 'POST' });
