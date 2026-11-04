import { getCollection, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { getDailyNews, type DailyNews } from './daily';
import { datumTag } from './format';

export type Artikel = CollectionEntry<'artikel'>;

export const RUBRIK_LABEL = { news: 'News', community: 'Community', wissen: 'Wissen', daily: 'Bitcoin Daily' } as const;
export type Rubrik = keyof typeof RUBRIK_LABEL;

// Gemeinsame Sicht auf eigene Artikel (Collection) und die täglichen Nachrichten von
// media.einundzwanzig.space (Feed), damit Karten und Raster beides gleich behandeln.
export interface Beitrag {
  id: string;
  titel: string;
  teaser: string;
  datum: Date;
  rubrik: Rubrik;
  href: string;
  extern: boolean;
  autor: string;
  bild?: ImageMetadata | string;
  bildAlt: string;
  beispiel: boolean;
}

export async function getArtikel(): Promise<Artikel[]> {
  return (await getCollection('artikel')).sort((a, b) => b.data.datum.getTime() - a.data.datum.getTime());
}

export function artikelPfad(a: Artikel): string {
  return `/artikel/${a.id}/`;
}

export function zuBeitrag(a: Artikel): Beitrag {
  const { titel, teaser, datum, rubrik, autor, bild, bildAlt, beispiel } = a.data;
  return { id: a.id, titel, teaser, datum, rubrik, href: artikelPfad(a), extern: false, autor, bild, bildAlt: bildAlt ?? '', beispiel };
}

// Die Dailys heißen im Feed alle „₿ Bitcoin Daily“; hier werden sie zur Ausgabe des Tages,
// andere Beiträge der Plattform behalten ihren Titel.
export function dailyZuBeitrag(n: DailyNews): Beitrag {
  const reinerTitel = n.titel.replace(/^[^\p{L}\p{N}#]+/u, '').trim();
  const istDaily = /^bitcoin daily/i.test(reinerTitel);
  return {
    id: `daily-${n.id}`,
    titel: istDaily ? `Ausgabe vom ${datumTag(n.datum)}` : reinerTitel,
    teaser: ohneDatum(n.zusammenfassung),
    datum: n.datum,
    rubrik: istDaily ? 'daily' : 'news',
    href: n.url,
    extern: true,
    autor: n.autor,
    bild: n.bild,
    bildAlt: '',
    beispiel: false,
  };
}

// Die Zusammenfassungen beginnen oft mit dem Datum („4 Nov., …“, „2. November 2026 …“); das steht schon daneben.
function ohneDatum(s: string): string {
  return s
    .replace(/^\s*\d{1,2}\.?\s*(?:Jan|Feb|Mär|Mar|Apr|Mai|May|Jun|Jul|Aug|Sep|Okt|Oct|Nov|Dez|Dec)\p{L}*\.?,?\s*(?:\d{4})?\s*[,:–-]?\s*/u, '')
    .trim();
}

// Eigene Artikel und tägliche Nachrichten zusammen, neueste zuerst.
export async function getBeitraege(): Promise<Beitrag[]> {
  const [eigene, daily] = await Promise.all([getArtikel(), getDailyNews()]);
  return [...eigene.map(zuBeitrag), ...daily.map(dailyZuBeitrag)].sort((a, b) => b.datum.getTime() - a.datum.getTime());
}
