import { getCollection } from 'astro:content';
import { getEpisoden } from './podcast';

export type Quelle = 'Podcast' | 'Hub';

export interface FeedEintrag {
  id: string;
  quelle: Quelle;
  label: string;
  titel: string;
  url: string;
  datum: Date;
  extern: boolean;
}

export async function getFeed(limit?: number): Promise<FeedEintrag[]> {
  const [episoden, news] = await Promise.all([getEpisoden(), getCollection('news')]);
  const eintraege: FeedEintrag[] = [
    ...episoden.map((e) => ({
      id: `podcast-${e.id}`,
      quelle: 'Podcast' as const,
      label: e.format,
      titel: e.titel,
      url: e.url,
      datum: e.datum,
      extern: true,
    })),
    ...news.map((n) => ({
      id: `hub-${n.id}`,
      quelle: 'Hub' as const,
      label: n.data.quelle,
      titel: n.data.titel,
      url: n.data.url ?? '/',
      datum: n.data.datum,
      extern: /^https?:/.test(n.data.url ?? ''),
    })),
  ].sort((a, b) => b.datum.getTime() - a.datum.getTime());
  return limit ? eintraege.slice(0, limit) : eintraege;
}
