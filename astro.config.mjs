// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://start.einundzwanzig.dev',
  integrations: [mdx()],
  // Titelbilder der täglichen Nachrichten liegen auf Blossom-Servern; Astro holt und optimiert sie beim Build.
  image: { remotePatterns: [{ protocol: 'https' }] },
  vite: {
    plugins: [tailwindcss()],
  },
});
