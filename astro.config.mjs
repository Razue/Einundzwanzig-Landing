// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://start.einundzwanzig.dev',
  // Sitemap ohne Entwurfs-Startseiten und ohne die Daily-Volltexte (deren Canonical zeigt auf die Plattform);
  // die Adresse steht in robots.txt, sobald PUBLIC_NOINDEX fehlt.
  integrations: [mdx(), sitemap({ filter: (seite) => !/^\/(entwurf|daily)\//.test(new URL(seite).pathname) })],
  vite: {
    plugins: [tailwindcss()],
  },
});
