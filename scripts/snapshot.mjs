// Lädt die externen Datenquellen und legt sie als Fallback-Snapshots ab.
// Der Build nutzt sie nur, wenn die Quelle gerade nicht erreichbar ist.
import { writeFile } from 'node:fs/promises';

const quellen = [
  ['https://einundzwanzig.space/feed.xml', 'src/data/snapshots/podcast.xml'],
  ['https://portal.einundzwanzig.space/api/meetups', 'src/data/snapshots/meetups.json'],
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
