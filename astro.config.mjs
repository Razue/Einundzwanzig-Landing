// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://start.einundzwanzig.dev',
  // Sitemap ohne die Entwurfs-Startseiten; die Adresse steht in robots.txt, sobald PUBLIC_NOINDEX fehlt.
  integrations: [mdx(), sitemap({ filter: (seite) => !seite.includes('/entwurf/') })],
  vite: {
    plugins: [tailwindcss()],
  },
});
