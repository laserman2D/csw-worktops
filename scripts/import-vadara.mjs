/**
 * Pulls the Vadara quartz product library from vadara.com and writes:
 *   - src/data/vadara.ts            (names, codes, attributes, image filenames)
 *   - <out>/…jpg                    (original images: one slab, up to three
 *                                    installation photos, up to three renders)
 *
 *   node scripts/import-vadara.mjs <folder-for-originals>
 *   node scripts/import-vadara-images.mjs <that-folder>
 *
 * Sources: the public WordPress REST API (product post type) for the list,
 * and each product page for attributes and image URLs. Re-run to refresh.
 * Product content and images are Vadara's copyright; see README.
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'https://www.vadara.com';
const UA = { 'user-agent': 'Mozilla/5.0 (CheshireStoneworks site build)' };
const out = process.argv[2];
if (!out) {
  console.error('Usage: node scripts/import-vadara.mjs <folder-for-originals>');
  process.exit(1);
}
mkdirSync(out, { recursive: true });

const get = async (url) => (await fetch(url, { headers: UA })).text();
const getJson = async (url) => (await fetch(url, { headers: UA })).json();
const strip = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript>[\s\S]*?<\/noscript>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&#8220;|&ldquo;/g, '“')
    .replace(/&#8221;|&rdquo;/g, '”')
    .replace(/&amp;/g, '&')
    .replace(/&#\d+;|&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const products = await getJson(`${BASE}/wp-json/wp/v2/product?per_page=100`);
const tags = Object.fromEntries((await getJson(`${BASE}/wp-json/wp/v2/product_tag?per_page=100`)).map((t) => [t.id, t.name]));

function family(background, short) {
  const s = `${background} ${short}`.toLowerCase();
  if (/dark grey|charcoal|black/.test(s)) return 'Dark';
  if (/grey and white|grey background|^grey/.test(s)) return 'Grey';
  if (/beige|taupe|cream|two-toned|soft-leather/.test(s)) return 'Beige';
  if (/blue/.test(background.toLowerCase())) return 'Blue';
  return 'White';
}

const designs = [];
for (const p of products) {
  const name = strip(p.title.rendered).trim();
  const slug = p.slug;
  const html = await get(p.link);
  const text = strip(html);
  const n = esc(name);

  const m = text.match(
    new RegExp(
      `Where To Buy ${n} (V\\d+) .*?Download Image Where To Buy (.+?) Collection (.+?) Thickness (.+?) (?:Style Inspiration (.+?) )?(?:Background Color (.+?) )?(?:Vein Color (.+?) )?(?:Hue (.+?) )?(?:Features (.+?) )?(?:[“"]([^”"]+)[”"] (.+?) Gallery View)?`,
    ),
  );
  const a = m
    ? {
        code: m[1],
        short: m[2].trim(),
        collection: m[3].trim(),
        thicknessRaw: m[4].trim(),
        inspiration: (m[5] || '').trim(),
        background: (m[6] || '').trim(),
        vein: (m[7] || '').trim(),
        hue: (m[8] || '').trim(),
        features: (m[9] || '').trim(),
        storyTitle: (m[10] || '').trim(),
        story: (m[11] || '').trim(),
      }
    : { code: '', short: '', collection: '', thicknessRaw: '', inspiration: '', background: '', vein: '', hue: '', features: '', storyTitle: '', story: '' };

  const finish = (text.match(/Finish (Soft Leather|Polished|Honed|Matte|Leather)/) || [, 'Polished'])[1];
  const slabMatch = text.match(/(\d{4})\s*mm x (\d{4})\s*mm/);
  const slabSize = slabMatch ? `${slabMatch[1]} x ${slabMatch[2]}mm` : '';
  const thick = [...new Set((a.thicknessRaw.match(/(\d)cm/g) || []).map((t) => `${t[0]}0mm`))];

  // Image URLs: full-size entries from srcset attributes, design-specific only.
  const key = slug.replace(/-/g, '');
  const urls = new Set();
  for (const ss of html.matchAll(/(?:data-)?srcset="([^"]+)"/g)) {
    for (const part of ss[1].split(',')) {
      const u = part.trim().split(' ')[0];
      if (/-\d+x\d+\.(jpe?g|png|webp)$/i.test(u)) continue;
      if (/LOGO|FAVICON|CERTLOGO|Kosher|FLOAT|ICON/.test(u)) continue;
      if (u.toLowerCase().replace(/[^a-z]/g, '').includes(key.slice(0, 6))) urls.add(u);
    }
  }
  const list = [...urls];
  const slab = list.filter((u) => /_Web\.jpg$|SLAB_WEB/i.test(u) && u.toLowerCase().replace(/[^a-z]/g, '').includes(key)).slice(0, 1);
  const scenes = list.filter((u) => /INSTALL/i.test(u) && !/Render/.test(u)).slice(0, 3);
  const renders = list.filter((u) => /Render/.test(u)).slice(0, 3);

  const save = async (kind, arr) => {
    const files = [];
    for (let i = 0; i < arr.length; i++) {
      const fn = `${slug}-${kind}${kind === 'slab' ? '' : `-${i + 1}`}.jpg`;
      const path = join(out, fn);
      if (!existsSync(path)) {
        const buf = Buffer.from(await (await fetch(arr[i], { headers: UA })).arrayBuffer());
        writeFileSync(path, buf);
      }
      files.push(fn);
    }
    return files;
  };

  designs.push({
    slug,
    name,
    code: a.code,
    collection: a.collection,
    finish,
    short: a.short,
    storyTitle: a.storyTitle,
    story: a.story,
    inspiration: a.inspiration,
    background: a.background,
    vein: a.vein,
    hue: a.hue,
    features: a.features,
    family: family(a.background, a.short),
    slabSize,
    thickness: thick.length ? thick.join(', ') : '20mm, 30mm',
    isNew: (p.product_tag || []).some((t) => tags[t] === 'New'),
    superJumbo: (p.product_tag || []).some((t) => tags[t] === 'Super Jumbo'),
    slab: (await save('slab', slab))[0] || '',
    scenes: await save('scenes', scenes),
    renders: await save('renders', renders),
  });
  console.log(`${name.padEnd(18)} ${a.code.padEnd(5)} slab=${slab.length} scenes=${scenes.length} renders=${renders.length}`);
}

const header = `/**
 * VADARA QUARTZ PRODUCT LIBRARY
 *
 * Generated by scripts/import-vadara.mjs on ${new Date().toISOString().slice(0, 10)}.
 * Do not hand-edit the data; re-run the import instead.
 * Images live in src/assets/images/vadara/ (see scripts/import-vadara-images.mjs).
 *
 * Copyright: product names, descriptions and images are Vadara's. They are
 * used here as a stockist showing the range. Confirm permission with Vadara
 * (media pack or dealer agreement) before the site goes live.
 *
 * \`scenes\` are Vadara's photographs of real installations.
 * \`renders\` are Vadara's CGI visualisations, and are labelled as such on the page.
 */
export type Family = 'White' | 'Grey' | 'Beige' | 'Dark' | 'Blue';

export interface VadaraDesign {
  slug: string;
  name: string;
  code: string;
  collection: string;
  finish: string;
  short: string;
  storyTitle: string;
  story: string;
  inspiration: string;
  background: string;
  vein: string;
  hue: string;
  features: string;
  family: Family;
  slabSize: string;
  thickness: string;
  isNew: boolean;
  superJumbo: boolean;
  /** Filename in src/assets/images/vadara/ */
  slab: string;
  scenes: string[];
  renders: string[];
}

export const vadara: VadaraDesign[] = `;
const footer = `;

export const families: Family[] = ['White', 'Beige', 'Grey', 'Dark', 'Blue'];
export const finishes = [...new Set(vadara.map((d) => d.finish))];
export const collections = [...new Set(vadara.map((d) => d.collection).filter(Boolean))];
`;
writeFileSync('src/data/vadara.ts', header + JSON.stringify(designs, null, 2) + footer);
console.log(`\nWrote src/data/vadara.ts with ${designs.length} designs. Originals in ${out}.`);
