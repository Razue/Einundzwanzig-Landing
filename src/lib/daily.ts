// Tägliche Nachrichten von media.einundzwanzig.space: Nostr-Langtexte des Autorenteams, die die
// Plattform als RSS-Feed anbietet. Zur Build-Zeit geladen wie der Podcast-Feed, mit Snapshot als
// Fallback. Der Hub zeigt Teaser und verlinkt auf die Plattform; die Titelbilder optimiert Astro
// beim Build, damit der Browser nichts von fremden Servern nachlädt.
import { XMLParser } from 'fast-xml-parser';
import { EXTERN } from './site';
import { ladeText } from './laden';
import snapshot from '../data/snapshots/daily.xml?raw';

export interface DailyNews {
  id: string;
  titel: string;
  zusammenfassung: string;
  url: string;
  datum: Date;
  autor: string;
  bild?: string;
}

const ANZAHL = 10;

let cache: Promise<DailyNews[]> | undefined;

export function getDailyNews(): Promise<DailyNews[]> {
  cache ??= laden();
  return cache;
}

async function laden(): Promise<DailyNews[]> {
  const { text } = await ladeText(EXTERN.dailyFeed, snapshot);
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseTagValue: false,
    parseAttributeValue: false,
  });
  const doc = parser.parse(text);
  const roh = doc?.rss?.channel?.item ?? [];
  const items: any[] = Array.isArray(roh) ? roh : [roh];
  const news = items
    .map(zuNews)
    .filter((n): n is DailyNews => n !== null)
    .sort((a, b) => b.datum.getTime() - a.datum.getTime())
    .slice(0, ANZAHL);
  // Ein nicht erreichbares Titelbild würde die Bildoptimierung und damit den Build abbrechen.
  await Promise.all(
    news.map(async (n) => {
      if (n.bild && !(await bildErreichbar(n.bild))) {
        console.warn(`[daily] Titelbild nicht erreichbar, Kachel stattdessen: ${n.bild}`);
        delete n.bild;
      }
    }),
  );
  return news;
}

function zuNews(item: any): DailyNews | null {
  const titel = String(item.title ?? '').trim();
  const url = String(item.link ?? '').trim();
  const datum = new Date(String(item.pubDate ?? ''));
  if (!titel || !/^https:\/\//.test(url) || Number.isNaN(datum.getTime())) return null;
  const enclosure = item.enclosure;
  const bildUrl = enclosure && String(enclosure['@_type'] ?? '').startsWith('image/') ? String(enclosure['@_url'] ?? '') : '';
  return {
    id: String(item.guid?.['#text'] ?? item.guid ?? url),
    titel,
    zusammenfassung: String(item.description ?? '')
      .replace(/\s+/g, ' ')
      .trim(),
    url,
    datum,
    autor: String(item.author ?? '').trim() || 'Einundzwanzig News',
    bild: /^https:\/\//.test(bildUrl) ? bildUrl : undefined,
  };
}

async function bildErreichbar(url: string): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8_000);
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'user-agent': 'start.einundzwanzig.dev build' } });
    clearTimeout(timer);
    const ok = res.ok && (res.headers.get('content-type') ?? '').startsWith('image/');
    await res.body?.cancel();
    return ok;
  } catch {
    return false;
  }
}
