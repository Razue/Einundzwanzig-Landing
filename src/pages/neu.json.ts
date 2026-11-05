import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Kuratierte Neuigkeiten als JSON, damit der Live-Dienst sie in „Kurz notiert“ mischen kann.
export const GET: APIRoute = async () => {
  const news = (await getCollection('news')).sort((a, b) => b.data.datum.getTime() - a.data.datum.getTime());
  const liste = news.map((n) => ({
    id: n.id,
    label: n.data.quelle,
    titel: n.data.titel,
    url: n.data.url ?? '/',
    datum: n.data.datum.toISOString(),
  }));
  return new Response(JSON.stringify(liste), { headers: { 'content-type': 'application/json; charset=utf-8' } });
};
