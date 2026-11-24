// Bereitet die täglichen Nachrichten vor dem Build vor: lädt den Feed, holt die Beiträge als signierte
// Nostr-Events von den Relays (Volltext) nach src/data/daily-events.json und lädt alle Titel- und
// Textbilder nach src/data/daily-bilder/. Astro optimiert die Bilder dann wie eigene und muss beim Bauen
// kein fremdes Bild mehr holen: Ein ausgefallener Blossom-Server kann den Build nicht brechen, das Bild
// fehlt dann (Titelbild wird zur Kachel, Textbild entfällt). Sind die Relays nicht erreichbar, nutzt der
// Build den eingecheckten Snapshot der Events. Läuft automatisch vor `npm run build` und `npm run dev`.
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { bildUrls, dTagsAusFeed, eventsLaden, EVENTS_DATEI, EVENTS_SNAPSHOT, VOLLTEXT } from './daily-events.mjs';

const FEED = 'https://media.einundzwanzig.space/s/einundzwanzig-news/feed.xml';
const SNAPSHOT = 'src/data/snapshots/daily.xml';
const ZIEL = 'src/data/daily-bilder';
const UA = 'start.einundzwanzig.dev build';
const ENDUNG = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif' };

export const bildName = (url) => createHash('sha256').update(url).digest('hex').slice(0, 16);

async function feedLaden() {
  try {
    const res = await fetch(FEED, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (err) {
    console.warn(`[daily] Feed nicht erreichbar (${err.message}), nutze Snapshot`);
    return readFile(SNAPSHOT, 'utf8');
  }
}

async function laden(url, name) {
  for (let versuch = 0; versuch < 2; versuch++) {
    if (versuch > 0) await new Promise((r) => setTimeout(r, 1_500));
    try {
      const res = await fetch(url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(15_000) });
      const typ = (res.headers.get('content-type') ?? '').split(';')[0].trim();
      if (!res.ok || !ENDUNG[typ]) throw new Error(`HTTP ${res.status} ${typ}`);
      const datei = `${name}.${ENDUNG[typ]}`;
      await writeFile(`${ZIEL}/${datei}`, Buffer.from(await res.arrayBuffer()));
      return datei;
    } catch (err) {
      if (versuch > 0) console.warn(`[daily] ${url}: ${err.message}, Bild fehlt`);
    }
  }
  return null;
}

await mkdir(ZIEL, { recursive: true });
const xml = await feedLaden();
const dTags = dTagsAusFeed(xml);
// Titelbilder der Einträge mit Volltext, aus den enclosures in Feed-Reihenfolge.
const urls = new Set(
  [...xml.matchAll(/<enclosure url="([^"]+)" type="image\/[^"]+"/g)].map((m) => m[1]).slice(0, VOLLTEXT),
);

// Volltexte: live von den Relays, sonst Snapshot (nur für die Bilder; der Build liest den Snapshot selbst).
let events = [];
try {
  events = await eventsLaden(dTags);
} catch (err) {
  console.warn(`[daily] Relays: ${err.message}`);
}
if (events.length > 0) {
  await writeFile(EVENTS_DATEI, JSON.stringify(events, null, 1) + '\n');
  console.log(`[daily] ${events.length} von ${dTags.length} Beiträgen als Volltext von den Relays`);
} else {
  await rm(EVENTS_DATEI, { force: true });
  console.warn('[daily] Keine Beiträge von den Relays, der Build nutzt den Snapshot');
  try {
    events = JSON.parse(await readFile(EVENTS_SNAPSHOT, 'utf8'));
  } catch {}
}
for (const e of events) for (const u of bildUrls(e.content ?? '')) urls.add(u);

const vorhanden = (await readdir(ZIEL)).filter((f) => f !== '.gitkeep');
const behalten = new Set();
// Höchstens sechs Downloads gleichzeitig, sonst laufen beim Blossom-Server Anfragen in den Timeout.
const offen = [...urls];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    for (let url = offen.shift(); url; url = offen.shift()) {
      const name = bildName(url);
      const da = vorhanden.find((f) => f.startsWith(name + '.'));
      const datei = da ?? (await laden(url, name));
      if (datei) behalten.add(datei);
    }
  }),
);

// Alte Bilder aufräumen, der Ordner bleibt auf die aktuellen Einträge beschränkt.
for (const f of vorhanden) if (!behalten.has(f)) await rm(`${ZIEL}/${f}`);
console.log(`[daily] ${behalten.size} von ${urls.size} Bildern bereit`);
