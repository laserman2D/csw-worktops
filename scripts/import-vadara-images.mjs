/**
 * Resizes downloaded Vadara product images into src/assets/images/vadara/.
 *
 *   node scripts/import-vadara-images.mjs <folder-of-originals>
 *
 * Slab images are capped at 1600px wide, scenes and renders at 1800px, all
 * saved as JPEG quality 82. Astro then generates the responsive variants at
 * build time. Originals are not kept in the repo.
 */
import sharp from 'sharp';
import { readdirSync, statSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const src = process.argv[2];
const dst = 'src/assets/images/vadara';
if (!src) {
  console.error('Usage: node scripts/import-vadara-images.mjs <folder-of-originals>');
  process.exit(1);
}
mkdirSync(dst, { recursive: true });

let inBytes = 0;
let outBytes = 0;
let n = 0;
for (const f of readdirSync(src)) {
  if (!/\.(jpe?g|png)$/i.test(f)) continue;
  const width = /-slab\./.test(f) ? 1600 : 1800;
  const out = join(dst, f.replace(/\.(jpe?g|png)$/i, '.jpg'));
  const info = await sharp(join(src, f))
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);
  inBytes += statSync(join(src, f)).size;
  outBytes += info.size;
  n++;
}
console.log(`${n} images, ${(inBytes / 1e6).toFixed(0)} MB in, ${(outBytes / 1e6).toFixed(1)} MB out`);
