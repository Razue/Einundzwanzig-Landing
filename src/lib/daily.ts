// Tägliche Nachrichten von media.einundzwanzig.space: Nostr-Langtexte des Autorenteams, die die
// Plattform als RSS-Feed anbietet. Zur Build-Zeit geladen wie der Podcast-Feed, mit Snapshot als
// Fallback. Liegt zu einem Eintrag der signierte Nostr-Langtext vor (src/lib/daily-events.ts), bekommt
// er eine eigene Seite unter /daily/<slug>/, sonst verlinkt die Karte auf die Plattform. Die Bilder lädt
// scripts/daily-bilder.mjs vor dem Build nach src/data/daily-bilder/; hier werden sie über den
// Hash der Bild-URL zugeordnet und von Astro wie eigene Bilder optimiert.
import { createHash } from 'node:crypto';
import type { ImageMetadata } from 'astro';
import { XMLParser } from 'fast-xml-parser';
import { EXTERN } from './site';
import { ladeText } from './laden';
import { getDailyEvents } from './daily-events';
import snapshot from '../data/snapshots/daily.xml?raw';

const bilder = import.meta.glob<ImageMetadata>('../data/daily-bilder/*.{jpg,png,webp,gif,avif}', { eager: true, import: 'default' });

export interface DailyNews {
  id: string;
  titel: string;
  zusammenfassung: string;
  url: string;
  datum: Date;
  autor: string;
  bild?: ImageMetadata;
  // d-Tag des Nostr-Events, aus der guid „30023:<pubkey>:<d>“.
  d: string;
  bildUrl?: string;
  // Pfadteil der eigenen Seite, wenn der Volltext vorliegt.
  slug?: string;
}

const ANZAHL = 10;

let cache: Promise<DailyNews[]> | undefined;

// Die neuesten Einträge für Karten und Reihen.
export async function getDailyNews(): Promise<DailyNews[]> {
  return (await getDailyNewsAlle()).slice(0, ANZAHL);
}

// Alle Einträge des Feeds, für die Volltext-Seiten.
export function getDailyNewsAlle(): Promise<DailyNews[]> {
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
  return items
    .map(zuNews)
    .filter((n): n is DailyNews => n !== null)
    .sort((a, b) => b.datum.getTime() - a.datum.getTime());
}

// Gleiche Namensregel wie in scripts/daily-bilder.mjs.
export function lokalesBild(url: string): ImageMetadata | undefined {
  const name = createHash('sha256').update(url).digest('hex').slice(0, 16);
  const pfad = Object.keys(bilder).find((k) => k.includes(`/${name}.`));
  return pfad ? bilder[pfad] : undefined;
}

function zuNews(item: any): DailyNews | null {
  const titel = String(item.title ?? '').trim();
  const url = String(item.link ?? '').trim();
  const datum = new Date(String(item.pubDate ?? ''));
  if (!titel || !/^https:\/\//.test(url) || Number.isNaN(datum.getTime())) return null;
  const enclosure = item.enclosure;
  const bildUrl = enclosure && String(enclosure['@_type'] ?? '').startsWith('image/') ? String(enclosure['@_url'] ?? '') : '';
  const id = String(item.guid?.['#text'] ?? item.guid ?? url);
  const d = id.match(/^30023:[0-9a-f]{64}:(.+)$/)?.[1] ?? '';
  return {
    id,
    titel,
    zusammenfassung: String(item.description ?? '')
      .replace(/\s+/g, ' ')
      .trim(),
    url,
    datum,
    autor: String(item.author ?? '').trim() || 'Einundzwanzig News',
    bild: /^https:\/\//.test(bildUrl) ? lokalesBild(bildUrl) : undefined,
    d,
    bildUrl: /^https:\/\//.test(bildUrl) ? bildUrl : undefined,
    slug: d ? getDailyEvents().get(d)?.slug : undefined,
  };
}
