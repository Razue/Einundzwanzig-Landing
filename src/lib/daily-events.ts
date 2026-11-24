// Volltexte der täglichen Nachrichten: signierte Nostr-Langtexte (Kind 30023), die scripts/daily-bilder.mjs
// vor dem Build geprüft von den Relays holt und in src/data/daily-events.json ablegt. Fehlt die Datei,
// gilt der eingecheckte Snapshot. Jeder Beitrag bekommt hier seinen Pfad unter /daily/<slug>/.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as nip19 from 'nostr-tools/nip19';
import snapshot from '../data/snapshots/daily-events.json';

export interface DailyEvent {
  id: string;
  pubkey: string;
  d: string;
  titel: string;
  datum: Date;
  content: string;
  slug: string;
  // Adresse des Beitrags auf Nostr, unabhängig von der Plattform.
  njump: string;
}

// Der Build läuft im Projektverzeichnis; import.meta.url zeigt im gebündelten Code auf dist/.
const LIVE = resolve('src/data/daily-events.json');
const tagBerlin = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' });

let cache: Map<string, DailyEvent> | undefined;

// Je d-Tag ein Beitrag.
export function getDailyEvents(): Map<string, DailyEvent> {
  cache ??= laden();
  return cache;
}

function laden(): Map<string, DailyEvent> {
  let roh: any[] = snapshot as any[];
  if (existsSync(LIVE)) {
    try {
      roh = JSON.parse(readFileSync(LIVE, 'utf8'));
    } catch (err) {
      console.warn(`[daily] ${LIVE}: ${(err as Error).message}. Nutze Snapshot.`);
    }
  }
  const map = new Map<string, DailyEvent>();
  const slugs = new Set<string>();
  for (const e of roh) {
    const tag = (n: string): string | undefined => e.tags?.find((t: string[]) => t[0] === n)?.[1];
    const d = tag('d');
    if (!d || typeof e.content !== 'string') continue;
    const sekunden = Number(tag('published_at')) || Number(e.created_at);
    const datum = new Date(sekunden * 1000);
    const titel = String(tag('title') ?? '').trim();
    let slug = `${tagBerlin.format(datum)}-${kebab(titel.replace(/^[^\p{L}\p{N}]+/u, '')) || 'ausgabe'}`;
    if (slugs.has(slug)) slug += `-${String(e.id).slice(0, 6)}`;
    slugs.add(slug);
    map.set(d, {
      id: String(e.id),
      pubkey: String(e.pubkey),
      d,
      titel,
      datum,
      content: e.content,
      slug,
      njump: `https://njump.me/${nip19.naddrEncode({ kind: 30023, pubkey: String(e.pubkey), identifier: d })}`,
    });
  }
  return map;
}

function kebab(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
    .replace(/-+$/, '');
}
