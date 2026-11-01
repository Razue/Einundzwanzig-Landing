import type { APIRoute } from 'astro';

// Mit PUBLIC_NOINDEX=1 (Preview) werden alle Crawler ausgesperrt, sonst alles erlaubt.
export const GET: APIRoute = () => {
  const noindex = import.meta.env.PUBLIC_NOINDEX === '1';
  const body = noindex ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\n';
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
