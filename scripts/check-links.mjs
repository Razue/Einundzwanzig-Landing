// Prüft nach dem Build alle internen Links und Assets in dist/ und meldet
// Platzhalter, die vor dem ersten Deploy ausgefüllt werden müssen.
// Im Preview (PUBLIC_NOINDEX=1, Seite ist für Suchmaschinen gesperrt) sind Platzhalter erlaubt.
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const dist = 'dist';
const preview = process.env.PUBLIC_NOINDEX === '1';

async function* htmlDateien(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* htmlDateien(p);
    else if (e.name.endsWith('.html')) yield p;
  }
}

async function existiert(p) {
  try { await stat(p); return true; } catch { return false; }
}

const fehler = [];
let geprueft = 0;

for await (const datei of htmlDateien(dist)) {
  const text = await readFile(datei, 'utf8');
  if (!preview && text.includes('data-platzhalter')) {
    fehler.push(`${relative(dist, datei)}: enthält Platzhalter, bitte ausfüllen`);
  }
  for (const m of text.matchAll(/\b(?:href|src)="(\/[^"#?]*)/g)) {
    const ziel = m[1];
    if (ziel.startsWith('//')) continue;
    geprueft++;
    const pfad = join(dist, decodeURIComponent(ziel));
    const ok = await existiert(pfad)
      || await existiert(join(pfad, 'index.html'))
      || await existiert(pfad.replace(/\/$/, '') + '.html');
    if (!ok) fehler.push(`${relative(dist, datei)}: ${ziel} nicht gefunden`);
  }
}

console.log(`${geprueft} interne Verweise geprüft`);
if (fehler.length) {
  console.error(fehler.join('\n'));
  process.exit(1);
}
console.log(preview ? 'Keine toten internen Links. Preview: Platzhalter erlaubt.' : 'Keine toten internen Links, keine Platzhalter.');
