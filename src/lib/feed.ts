import { getCollection } from 'astro:content';
import { getEpisoden } from './podcast';
import { getDailyNews } from './daily';
import { dailyZuBeitrag, RUBRIK_LABEL } from './artikel';

export type Quelle = 'Podcast' | 'Hub' | 'Daily';

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
  const [episoden, news, daily] = await Promise.all([getEpisoden(), getCollection('news'), getDailyNews()]);
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
    ...daily.map((n) => {
      const b = dailyZuBeitrag(n);
      return { id: b.id, quelle: 'Daily' as const, label: RUBRIK_LABEL[b.rubrik], titel: b.titel, url: b.href, datum: b.datum, extern: true };
    }),
  ].sort((a, b) => b.datum.getTime() - a.datum.getTime());
  return limit ? eintraege.slice(0, limit) : eintraege;
}
