// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The public URL of the site. Set SITE_URL in Cloudflare Pages build settings
// (and in .env locally) once the domain decision is made. See README.
const site = process.env.SITE_URL || 'https://worktops.example.co.uk';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
    // The whole stylesheet is small, so inline it and avoid a render-blocking request.
    inlineStylesheets: 'always',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/api/'),
    }),
  ],
});
