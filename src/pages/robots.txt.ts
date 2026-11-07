import type { APIRoute } from 'astro';

import { SITE } from '../lib/site';

// Mit PUBLIC_NOINDEX=1 (Preview) werden alle Crawler ausgesperrt, sonst alles erlaubt und die Sitemap genannt.
export const GET: APIRoute = () => {
  const noindex = import.meta.env.PUBLIC_NOINDEX === '1';
  const body = noindex ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap-index.xml\n`;
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
