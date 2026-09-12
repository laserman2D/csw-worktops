# Cheshire Stoneworks: retail worktops site

Lead-generation site for supply-and-fit worktops, direct to homeowners. Static Astro site on
Cloudflare Pages, with one Pages Function that forwards the enquiry form to n8n.

No CMS, no cart, no tracking, no cookies.

## Run it locally

```bash
npm install
npm run dev          # http://localhost:4321  (pages only; /api/enquiry is not available here)
```

To exercise the enquiry form locally you need the Pages Function too:

```bash
cp .dev.vars.example .dev.vars    # then edit the webhook URL and keys
npm run build
npm run pages:dev                 # http://localhost:8788, pages + function
```

Other commands:

| Command | What it does |
|---|---|
| `npm run build` | Builds to `dist/` |
| `npm run check` | Astro and TypeScript type check |
| `npm run test:form` | End-to-end form test: fake webhook, wrangler, success, validation, honeypot and webhook-down paths |
| `npm run lighthouse` | Lighthouse mobile audit of every public page (needs Chrome) |
| `npm run placeholders` | Lists every placeholder still outstanding |

## Where the content lives

All copy is in a handful of obvious files. Nothing business-specific is in components.

| File | Contents |
|---|---|
| `src/data/site.ts` | **Fill this in first.** Name, phone, email, hours, address, company details, VAT, lead times, guarantee, review links, `indexable` flag, analytics token |
| `src/data/areas.ts` | Towns listed on the Areas page and in the LocalBusiness schema |
| `src/data/materials.ts` | The three materials, brands, comparison ratings, pros and cons, care |
| `src/data/pricing.ts` | Price drivers and the published range for a typical kitchen |
| `src/data/faqs.ts` | FAQs per page (also emitted as FAQPage schema) |
| `src/data/gallery.ts` | Gallery entries. Instructions for adding photos are at the top of the file |
| `src/pages/*.astro` | Page structure and the longer prose (materials, how it works, about, privacy, terms) |

Placeholders are wrapped in `TODO('…')` in data files and `[TODO: …]` in pages. They render
visibly on the page so nothing fake slips through, and any `TODO` value in `site.ts` is left out of
the structured data rather than being published to Google.

## Deploy to Cloudflare Pages

1. Push this folder to a Git repository (GitHub or GitLab).
2. Cloudflare dashboard, Workers & Pages, Create, Pages, Connect to Git. Pick the repo.
3. Build settings:
   - Framework preset: Astro
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Functions are picked up automatically from the `functions/` folder.
4. Environment variables (Settings, Environment variables, Production). Set these before the first
   deploy and mark the secrets as encrypted:

   | Variable | Value |
   |---|---|
   | `SITE_URL` | Final public URL, e.g. `https://worktops.cheshirestoneworks.co.uk` (used at build time for canonicals, sitemap and schema) |
   | `PUBLIC_TURNSTILE_SITE_KEY` | Turnstile site key (build time, public) |
   | `TURNSTILE_SECRET_KEY` | Turnstile secret (runtime, secret) |
   | `ENQUIRY_WEBHOOK_URL` | Your n8n webhook, e.g. `https://n8n.cheshirestoneworks.co.uk/webhook/website-enquiry` (runtime, secret) |
   | `ENQUIRY_WEBHOOK_TOKEN` | Any long random string. The function sends it as `X-Enquiry-Token`; check it in n8n and reject anything else (runtime, secret) |

5. Turnstile: Cloudflare dashboard, Turnstile, Add site. Hostname is the domain you deploy to.
   Widget mode "Managed". Copy the site key and secret into the variables above. Until then the
   example files use Cloudflare's test keys, which always pass.
6. Custom domain: Pages project, Custom domains, add the hostname. DNS is already on Cloudflare so
   the record is created for you.
7. Once the domain is live and the placeholders are filled, set `indexable: true` in
   `src/data/site.ts`. Until then every page carries `noindex` and `robots.txt` disallows crawling,
   so a half-finished site does not get indexed under placeholder details.
8. Optional: Cloudflare Web Analytics (cookieless). Dashboard, Analytics & Logs, Web Analytics, add
   the site, copy the token into `cloudflareAnalyticsToken` in `site.ts`. Leave it empty for no
   analytics at all. The privacy page text adapts either way.

### What the function sends to n8n

`POST` JSON, `content-type: application/json`, header `x-enquiry-token`:

```json
{
  "source": "website-enquiry",
  "receivedAt": "2026-09-12T07:40:00.000Z",
  "contact": { "name": "…", "phone": "…", "email": "…", "postcode": "WA13 0AA" },
  "kitchen": { "status": "designed | being-fitted | fitted", "material": "quartz | granite | ultra-compact | not-sure", "size": "…", "timescale": "asap | 1-month | 1-3-months | 3-plus-months | not-sure" },
  "message": "…",
  "file": { "name": "plan.pdf", "type": "application/pdf", "size": 12345, "base64": "…" },
  "meta": { "ip": "…", "country": "GB", "userAgent": "…", "referer": "…" }
}
```

`file` is `null` when nothing was uploaded. Uploads are capped at 8 MB and limited to JPEG, PNG,
WebP, HEIC and PDF. In n8n, use a Webhook node (POST, respond immediately) followed by a
"Move Binary Data" or Code node to turn `file.base64` back into an attachment for the email and the
ServiceM8 job.

If the webhook is unreachable or returns a non-2xx status, the function returns 502 and the form
shows a message asking the customer to phone or email instead. Nothing is queued or stored.

## Placeholders still to fill

Run `npm run placeholders` for the live list with line numbers. At hand-over it was:

**`src/data/site.ts`** (the important one)
- Public phone number, as displayed, and in E.164 form for the `tel:` links
- WhatsApp number (optional; leave empty to hide the WhatsApp links)
- Public email address
- Business hours (free text, and optionally the structured `openingHours` for schema)
- Street address and postcode of the yard
- Company number, registered office address
- VAT number, or set `vatRegistered: false`
- Lead time from enquiry to survey, and from template to install
- Guarantee summary, and the remedy if a piece is wrong
- Review profile URLs (Google, Checkatrade, Trustpilot). No invented ratings anywhere
- Social links (optional)
- `indexable` flag, once live
- Cloudflare Web Analytics token (optional)

**`src/data/pricing.ts`**
- The published price range for a typical kitchen. The definition of "typical" is written out on the page; check it matches what you would actually quote

**`src/data/areas.ts`**
- The town list is a starting point for roughly 40 miles from Lymm. Edit to match where you will actually go

**`src/data/materials.ts`**
- Brand lists for quartz and ultra-compact. Remove anything you cannot supply direct

**`src/data/gallery.ts`**
- Six placeholder entries. Replace with real jobs and photos, each with customer permission

**`src/pages/about.astro`**
- Team names and bios (optional), credentials (only what you can show a certificate for), team and van photos

**`src/pages/index.astro`**
- Reviews block links to whatever review URLs are in `site.ts`. Nothing else to change

**`src/pages/privacy.astro`** (draft for review)
- ICO registration number if registered
- Named processors (n8n, ServiceM8, fabricator) and whether any data leaves the UK
- Retention periods
- Last-updated date

**`src/pages/terms.astro`** (draft for review)
- Deposit percentage, balance terms, payment methods
- What is refundable at each cancellation stage
- Wasted-visit charge
- Complaints process and any ADR scheme
- Last-updated date

**Photos**
- Every image slot is a labelled "Photo to follow" block. Hero, three material samples, three recent installs, four process shots, three about-page shots, and the gallery. Drop files into `src/assets/images/` and wire them up; the gallery file explains how

**Environment**
- `SITE_URL`, Turnstile keys, webhook URL and token, as above

## Legal items flagged for an adviser

These are marked `REVIEW:` in the pages and are not legal advice.

- **Consumer Contracts Regulations 2013.** A supply-and-fit worktop job agreed by email or phone is
  an off-premises or distance contract. The Schedule 2 pre-contract information must be given in a
  durable medium before the customer is bound, which means on or with the written quote and before
  the deposit. The list is written out on the Terms page. In particular: the specification, total
  price including VAT, timescales, complaints process, and a clear statement that the 14-day
  cancellation right does not apply to goods made to the consumer's specification.
- **Consumer Rights Act 2015.** Goods must be of satisfactory quality and as described; services
  with reasonable care and skill. The guarantee wording sits alongside these rights, not instead of
  them.
- **UK GDPR.** The privacy page names what is collected, why, the lawful basis, who it goes to and
  how long it is kept. It needs the processor list and retention periods confirming, and the ICO
  registration position.
- **PECR.** The site sets no non-essential cookies. Cloudflare's bot protection may set a strictly
  necessary cookie, which is exempt. There is no banner. If anything with consent implications is
  added later, that changes.
- **Footer.** Carries registered name, company number, place of registration, registered office
  and VAT number, all from `site.ts`.

## Test and audit results at hand-over

`npm run test:form` (Pages Function, local wrangler, fake webhook):

```
PASS  valid enquiry returns 200 ok
PASS  webhook received JSON payload
PASS  webhook got auth token header
PASS  postcode normalised
PASS  file forwarded as base64
PASS  invalid enquiry returns 422
PASS  field errors named
PASS  honeypot returns 200 and is dropped
PASS  honeypot never reaches webhook
PASS  webhook down returns 502 failure path
```

`npm run lighthouse` (mobile, Chrome headless, `indexable: true`):

| Page | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| / | 100 | 100 | 100 | 100 |
| /materials | 100 | 100 | 100 | 100 |
| /how-it-works | 100 | 100 | 100 | 100 |
| /gallery | 100 | 100 | 100 | 100 |
| /pricing | 100 | 100 | 100 | 100 |
| /areas | 100 | 100 | 100 | 100 |
| /about | 100 | 100 | 100 | 100 |
| /contact | 100 | 100 | 100 | 100 |

With `indexable: false` (the shipped default) SEO drops to 66 on every page because of the
deliberate `noindex`. Scores were measured on a local preview with placeholder images; real
photography will add weight, and the `Image` component is already set up to serve responsive
WebP so it should hold above 95.

`npm run build` and `npm run check`: no errors, no warnings.

## Decisions you might want to reverse

1. **Astro over plain HTML.** Nine pages sharing header, footer, form, schema and an image pipeline.
   Plain HTML would have meant nine copies of the same chrome.
2. **Static output with a root `functions/` folder** rather than the Astro Cloudflare adapter. Pages
   picks the function up automatically, and it keeps every page a plain HTML file. If you later
   want server-rendered pages, switch to the adapter.
3. **`noindex` by default** until `indexable: true` is set. Protects against indexing placeholder
   details. Easy to forget to flip, so it is in the placeholder list.
4. **Placeholder values are excluded from JSON-LD** rather than published. Google never sees
   "[TODO: …]" as a phone number.
5. **Turnstile loads lazily** when the form scrolls near the viewport, not on page load. Keeps the
   pages script-free until someone is actually going to use the form.
6. **The file upload is base64 inside the JSON payload**, capped at 8 MB. Simple for n8n. If you
   expect large PDFs, a Cloudflare R2 bucket with a signed URL would be the next step.
7. **A shared secret header to n8n** (`ENQUIRY_WEBHOOK_TOKEN`) instead of relying on the webhook
   URL being unguessable. Optional, but cheap.
8. **Relative cost bands (£ to ££££) on the materials page** rather than per-metre prices, and a
   single published range on the pricing page. This is the honest-not-bait position from the brief.
   If you decide to publish per-material ranges, they go in `pricing.ts`.
9. **Gallery filter only appears when there are four or more items across two or more materials.**
   With a handful of photos a filter is noise.
10. **No separate "thank you" page.** Success is shown in place, with the reply timescale from
    `site.ts`.
11. **Trailing slashes off, `.html` files.** URLs are `/materials`, not `/materials/`. Cloudflare
    Pages serves both and canonicals point at the no-slash form.
12. **Domain decision is deferred.** `SITE_URL` is an environment variable so any of the three
    options works without a code change. The brand name in `site.ts` is currently
    "Cheshire Stoneworks" with a "Worktops" sub-label; if you go for a separate brand, change
    `name`, `titleSuffix` and the footer strapline there.
13. **Headless Chrome is assumed for Lighthouse.** The script uses whatever `npx lighthouse` finds.
14. **The hatched "Photo to follow" blocks** are the only decorative element on the site and are
    meant to be replaced. They are labelled so nobody mistakes them for stock imagery.

## Structure

```
functions/api/enquiry.ts   Pages Function: validate, honeypot, Turnstile, forward to n8n
public/_headers            Security headers and caching for Cloudflare Pages
public/favicon.svg
scripts/                   test-form, lighthouse, placeholders
src/data/                  All business content (see table above)
src/layouts/Layout.astro   Head, meta, LocalBusiness schema, header, footer
src/components/            Header, Footer, EnquiryForm, Faq, Placeholder
src/pages/                 One file per page, plus robots.txt
src/styles/global.css      Brand tokens and shared styles
```
