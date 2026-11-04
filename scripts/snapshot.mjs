// Lädt die externen Datenquellen und legt sie als Fallback-Snapshots ab.
// Der Build nutzt sie nur, wenn die Quelle gerade nicht erreichbar ist.
import { writeFile } from 'node:fs/promises';

const quellen = [
  ['https://einundzwanzig.space/feed.xml', 'src/data/snapshots/podcast.xml'],
  ['https://portal.einundzwanzig.space/api/meetups', 'src/data/snapshots/meetups.json'],
  ['https://media.einundzwanzig.space/s/einundzwanzig-news/feed.xml', 'src/data/snapshots/daily.xml'],
];

for (const [url, ziel] of quellen) {
  const res = await fetch(url, { headers: { 'user-agent': 'start.einundzwanzig.dev snapshot' } });
  if (!res.ok) {
    console.error(`${url}: HTTP ${res.status}`);
    process.exitCode = 1;
    continue;
  }
  await writeFile(ziel, await res.text());
  console.log(`${ziel} aktualisiert`);
}

// Bitcoin-Daten für das Laufband: vier Abfragen in einer Datei, Schlüssel wie in src/lib/bitcoin.ts.
const bitcoin = {
  preise: 'https://mempool.space/api/v1/prices',
  hoehe: 'https://mempool.space/api/blocks/tip/height',
  gebuehren: 'https://mempool.space/api/v1/fees/recommended',
  difficulty: 'https://mempool.space/api/v1/difficulty-adjustment',
};
const daten = {};
for (const [schluessel, url] of Object.entries(bitcoin)) {
  const res = await fetch(url, { headers: { 'user-agent': 'start.einundzwanzig.dev snapshot' } });
  if (!res.ok) {
    console.error(`${url}: HTTP ${res.status}`);
    process.exitCode = 1;
    continue;
  }
  daten[schluessel] = await res.json();
}
if (Object.keys(daten).length === Object.keys(bitcoin).length) {
  await writeFile('src/data/snapshots/bitcoin.json', JSON.stringify(daten, null, 2) + '\n');
  console.log('src/data/snapshots/bitcoin.json aktualisiert');
}
