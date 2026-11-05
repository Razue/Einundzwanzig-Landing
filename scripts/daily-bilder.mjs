// Lädt die Titelbilder der täglichen Nachrichten vor dem Build in src/data/daily-bilder/.
// Astro optimiert sie dann wie eigene Bilder und muss beim Bauen kein fremdes Bild mehr holen:
// Ein ausgefallener Blossom-Server kann den Build so nicht brechen, das Bild wird dann zur Kachel.
// Läuft automatisch vor `npm run build` und `npm run dev` (prebuild/predev).
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises';

const FEED = 'https://media.einundzwanzig.space/s/einundzwanzig-news/feed.xml';
const SNAPSHOT = 'src/data/snapshots/daily.xml';
const ZIEL = 'src/data/daily-bilder';
const ANZAHL = 10;
const UA = 'start.einundzwanzig.dev build';
const ENDUNG = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif' };

export const bildName = (url) => createHash('sha256').update(url).digest('hex').slice(0, 16);

async function feedLaden() {
  try {
    const res = await fetch(FEED, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (err) {
    console.warn(`[daily-bilder] Feed nicht erreichbar (${err.message}), nutze Snapshot`);
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
      if (versuch > 0) console.warn(`[daily-bilder] ${url}: ${err.message}, Kachel stattdessen`);
    }
  }
  return null;
}

await mkdir(ZIEL, { recursive: true });
const xml = await feedLaden();
const urls = [...xml.matchAll(/<enclosure url="([^"]+)" type="image\/[^"]+"/g)].map((m) => m[1]).slice(0, ANZAHL);
const vorhanden = (await readdir(ZIEL)).filter((f) => f !== '.gitkeep');
const behalten = new Set();

await Promise.all(
  urls.map(async (url) => {
    const name = bildName(url);
    const da = vorhanden.find((f) => f.startsWith(name + '.'));
    const datei = da ?? (await laden(url, name));
    if (datei) behalten.add(datei);
  }),
);

// Alte Bilder aufräumen, der Ordner bleibt auf die aktuellen Einträge beschränkt.
for (const f of vorhanden) if (!behalten.has(f)) await unlink(`${ZIEL}/${f}`);
console.log(`[daily-bilder] ${behalten.size} von ${urls.length} Titelbildern bereit`);
