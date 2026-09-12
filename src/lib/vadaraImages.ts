import type { ImageMetadata } from 'astro';

// All Vadara images, keyed by filename. Eager so the map is available at build time.
const modules = import.meta.glob<ImageMetadata>('/src/assets/images/vadara/*.jpg', {
  eager: true,
  import: 'default',
});

export const vadaraImage = (file: string): ImageMetadata | undefined =>
  file ? modules[`/src/assets/images/vadara/${file}`] : undefined;
