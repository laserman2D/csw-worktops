/**
 * GALLERY — completed work.
 *
 * To add a real photo:
 *   1. Drop the file in src/assets/images/gallery/ (JPEG or PNG, any size;
 *      Astro resizes and converts it at build time).
 *   2. Import it below and set `image` on the item.
 *   3. Write a real alt text and confirm `permission: true` once the
 *      customer has agreed to the photo being used.
 *
 * Items without an `image` render as a clearly labelled placeholder.
 * Items with `permission: false` are never rendered, even with an image.
 */
import type { ImageMetadata } from 'astro';

// Example import, once you have a photo:
// import knutsfordQuartz from '../assets/images/gallery/knutsford-quartz.jpg';

export type MaterialTag = 'quartz' | 'granite' | 'ultra-compact';

export interface GalleryItem {
  title: string;
  material: MaterialTag;
  /** Short description: material name, colour, edge, anything notable. */
  detail: string;
  /** Town only. Never a full address. */
  location: string;
  alt: string;
  image?: ImageMetadata;
  permission: boolean;
}

export const gallery: GalleryItem[] = [
  {
    title: 'Quartz island with waterfall end',
    material: 'quartz',
    detail: 'Placeholder entry. Replace with a real job.',
    location: 'Knutsford',
    alt: 'Placeholder for a photo of a quartz island worktop with a mitred waterfall end',
    permission: true,
  },
  {
    title: 'Grey quartz L-shape with upstands',
    material: 'quartz',
    detail: 'Placeholder entry. Replace with a real job.',
    location: 'Altrincham',
    alt: 'Placeholder for a photo of a grey quartz L-shaped worktop with matching upstands',
    permission: true,
  },
  {
    title: 'Black granite with undermount sink',
    material: 'granite',
    detail: 'Placeholder entry. Replace with a real job.',
    location: 'Warrington',
    alt: 'Placeholder for a photo of a black polished granite worktop with an undermount sink',
    permission: true,
  },
  {
    title: 'Dekton 12mm run with flush hob',
    material: 'ultra-compact',
    detail: 'Placeholder entry. Replace with a real job.',
    location: 'Wilmslow',
    alt: 'Placeholder for a photo of a thin ultra-compact worktop with a flush-fitted induction hob',
    permission: true,
  },
  {
    title: 'Marble-effect quartz with full-height splashback',
    material: 'quartz',
    detail: 'Placeholder entry. Replace with a real job.',
    location: 'Chester',
    alt: 'Placeholder for a photo of a marble-effect quartz worktop and full-height splashback',
    permission: true,
  },
  {
    title: 'Granite outdoor kitchen',
    material: 'granite',
    detail: 'Placeholder entry. Replace with a real job.',
    location: 'Lymm',
    alt: 'Placeholder for a photo of a granite worktop in an outdoor kitchen',
    permission: true,
  },
];

export const materialLabels: Record<MaterialTag, string> = {
  quartz: 'Quartz',
  granite: 'Granite',
  'ultra-compact': 'Ultra-compact',
};
