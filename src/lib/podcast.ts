import { XMLParser } from 'fast-xml-parser';
import { EXTERN } from './site';
import { ladeText } from './laden';
import snapshot from '../data/snapshots/podcast.xml?raw';

export type Format = 'News' | 'Interview' | 'Lesestunde' | 'Der Weg' | 'Podcast';

export interface Episode {
  id: string;
  titel: string;
  url: string;
  datum: Date;
  format: Format;
  dauer?: string;
  nummer?: number;
  audio?: string;
}

let cache: Promise<Episode[]> | undefined;

export function getEpisoden(): Promise<Episode[]> {
  cache ??= laden();
  return cache;
}

async function laden(): Promise<Episode[]> {
  const { text } = await ladeText(EXTERN.podcastFeed, snapshot);
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseTagValue: false,
    parseAttributeValue: false,
  });
  const doc = parser.parse(text);
  const roh = doc?.rss?.channel?.item ?? [];
  const items: any[] = Array.isArray(roh) ? roh : [roh];
  return items
    .map(zuEpisode)
    .filter((e): e is Episode => e !== null)
    .sort((a, b) => b.datum.getTime() - a.datum.getTime());
}

function zuEpisode(item: any): Episode | null {
  const titel = String(item.title ?? '').trim();
  const url = String(item.link ?? '').trim();
  const datum = new Date(String(item.pubDate ?? ''));
  if (!titel || !url || Number.isNaN(datum.getTime())) return null;
  const nummerRoh = item['itunes:episode'];
  const nummer = nummerRoh ? Number(nummerRoh) : undefined;
  return {
    id: String(item.guid?.['#text'] ?? item.guid ?? url),
    titel,
    url,
    datum,
    format: formatAus(url),
    dauer: item['itunes:duration'] ? String(item['itunes:duration']) : undefined,
    nummer: nummer && !Number.isNaN(nummer) ? nummer : undefined,
    audio: item.enclosure?.['@_url'],
  };
}

function formatAus(url: string): Format {
  const slug = url.split('/podcast/')[1] ?? '';
  if (slug.startsWith('news-')) return 'News';
  if (slug.startsWith('interview')) return 'Interview';
  if (slug.startsWith('lesestunde')) return 'Lesestunde';
  if (slug.startsWith('der-weg')) return 'Der Weg';
  return 'Podcast';
}
