import { getCollection, type CollectionEntry } from 'astro:content';

export type Artikel = CollectionEntry<'artikel'>;

export const RUBRIK_LABEL = { news: 'News', community: 'Community', wissen: 'Wissen' } as const;

export async function getArtikel(): Promise<Artikel[]> {
  return (await getCollection('artikel')).sort((a, b) => b.data.datum.getTime() - a.data.datum.getTime());
}

export function artikelPfad(a: Artikel): string {
  return `/artikel/${a.id}/`;
}
