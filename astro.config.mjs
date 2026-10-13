// @ts-check
import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

const SITE = process.env.PUBLIC_SITE_URL ?? 'https://www.akrosstech.com';

export default defineConfig({
  site: SITE,
  trailingSlash: 'never',
  output: 'static',
  adapter: vercel({ imageService: false }),
  compressHTML: true,
  build: { format: 'directory', inlineStylesheets: 'auto' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  image: {
    responsiveStyles: true,
    layout: 'constrained',
  },
  env: {
    schema: {
      PUBLIC_SITE_URL: envField.string({ context: 'client', access: 'public', optional: true }),
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_TO_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_FROM_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      ALLOWED_ORIGINS: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/api/'),
      changefreq: 'weekly',
      serialize(item) {
        const url = item.url.replace(/\/$/, '') || item.url;
        const depth = new URL(url).pathname.split('/').filter(Boolean).length;
        return { ...item, url, priority: depth === 0 ? 1 : depth === 1 ? 0.8 : 0.6 };
      },
    }),
  ],
  vite: {
    build: { cssCodeSplit: true },
  },
});
