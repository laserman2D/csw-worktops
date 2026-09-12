/**
 * SWATCH GRID on the home page: ten tiles, like a product catalogue.
 *
 * Built from the Vadara library (src/data/vadara.ts). Change the slugs below
 * to feature different designs. Cost bands are relative, not prices; see
 * src/data/materials.ts. Add non-Vadara tiles by pushing to the array.
 */
import type { ImageMetadata } from 'astro';
import type { MaterialTag } from './gallery';
import { vadara } from './vadara';
import { vadaraImage } from '../lib/vadaraImages';

export interface Swatch {
  brand: string;
  name: string;
  href: string;
  material: MaterialTag;
  costBand: '££' | '£££' | '££££';
  image?: ImageMetadata;
}

/** Which Vadara designs to feature, in order. */
const featured = [
  'sterling-light',
  'aurum',
  'white-aurora',
  'carrara',
  'moonlit-lace',
  'sereno-bianco',
  'medina',
  'petra-grigio',
  'scandi-blue',
  'canyon-choir',
];

/** Relative cost band per design. Edit once you have Vadara's price groups. */
const band = (slug: string): Swatch['costBand'] =>
  ['carrara', 'sterling-light', 'sereno-bianco'].includes(slug) ? '££' : ['scandi-blue', 'canyon-choir', 'medina'].includes(slug) ? '££££' : '£££';

export const swatches: Swatch[] = featured
  .map((slug) => vadara.find((d) => d.slug === slug))
  .filter((d): d is NonNullable<typeof d> => Boolean(d))
  .map((d) => ({
    brand: 'Vadara quartz',
    name: d.name,
    href: `/colours/${d.slug}`,
    material: 'quartz',
    costBand: band(d.slug),
    image: vadaraImage(d.slab),
  }));
