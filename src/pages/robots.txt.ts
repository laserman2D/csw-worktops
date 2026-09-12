import type { APIRoute } from 'astro';
import { site } from '../data/site';

export const GET: APIRoute = ({ site: siteUrl }) => {
  const sitemap = new URL('sitemap-index.xml', siteUrl).href;
  const body = site.indexable
    ? `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${sitemap}\n`
    : `# Site not yet marked indexable. Set indexable: true in src/data/site.ts when live.\nUser-agent: *\nDisallow: /\n\nSitemap: ${sitemap}\n`;
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
