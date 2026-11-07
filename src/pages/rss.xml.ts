import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { artikelPfad, getArtikel, RUBRIK_LABEL } from '../lib/artikel';
import { SITE } from '../lib/site';

// Feed der eigenen Artikel. Die täglichen Nachrichten von media.einundzwanzig.space haben ihren
// eigenen Feed (EXTERN.dailyFeed) und werden hier bewusst nicht weiterverteilt. Beispielartikel bleiben draußen.
export async function GET(context: APIContext) {
  const artikel = (await getArtikel()).filter((a) => !a.data.beispiel);
  return rss({
    title: `${SITE.name}: Artikel`,
    description: `Eigene Artikel von ${new URL(SITE.url).host}: Neues aus der Einundzwanzig-Community, Projekte und Wissen rund um Bitcoin und Nostr.`,
    site: context.site ?? SITE.url,
    items: artikel.map((a) => ({
      title: a.data.titel,
      description: a.data.teaser,
      pubDate: a.data.datum,
      link: artikelPfad(a),
      categories: [RUBRIK_LABEL[a.data.rubrik]],
    })),
    customData: '<language>de</language>',
  });
}
