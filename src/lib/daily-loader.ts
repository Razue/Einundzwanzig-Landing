// Content-Loader für die Collection „daily“: je Feed-Eintrag mit Volltext ein Eintrag, gerendert mit
// Astros Markdown-Pipeline. Bilder zeigen auf die vorab geladenen Dateien in src/data/daily-bilder/;
// der virtuelle Dateipfad dort sorgt dafür, dass Astro sie wie eigene Bilder optimiert. Rohes HTML
// im Markdown wird zu sichtbarem Text, Links gehen nur auf http(s), mailto und Anker, fehlende Bilder
// entfallen, Überschriften hängen sich lückenlos unter die h1 der Seite.
import { createHash } from 'node:crypto';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Loader } from 'astro/loaders';
import { getDailyNewsAlle } from './daily';
import { getDailyEvents } from './daily-events';

const BILDER = resolve('src/data/daily-bilder');

export function dailyLoader(): Loader {
  return {
    name: 'daily-volltext',
    async load({ store, parseData, renderMarkdown, generateDigest, logger }) {
      const events = getDailyEvents();
      const dateien = readdirSync(BILDER);
      // Gleiche Namensregel wie in scripts/daily-bilder.mjs.
      const lokal = (url: string): string | undefined => {
        const name = createHash('sha256').update(url).digest('hex').slice(0, 16);
        return dateien.find((f) => f.startsWith(name + '.'));
      };
      store.clear();
      let anzahl = 0;
      for (const news of await getDailyNewsAlle()) {
        const e = events.get(news.d);
        if (!e) continue;
        const { bild: _bild, ...felder } = news;
        const data = await parseData({ id: e.slug, data: { ...felder, slug: e.slug, njump: e.njump } });
        const rendered = await renderMarkdown(bereinigen(e.content, lokal), { fileURL: pathToFileURL(resolve(BILDER, `${e.slug}.md`)) });
        // Zweite Linie nach bereinigen(): Links nur mit http(s), mailto oder Anker, gesucht wird nur in
        // öffnenden a-Tags, damit Codebeispiele im Text heil bleiben. Zum Schluss wird der Platzhalter
        // für „<“ als &lt; ausgegeben.
        rendered.html = stufeTiefer(rendered.html)
          .replace(/<a\b(?:[^>"]|"[^"]*")*>/g, (tag) => tag.replace(/\shref="(?!https?:\/\/|mailto:|#)[^"]*"/g, ''))
          .replace(/\uE000/g, '&lt;');
        store.set({
          id: e.slug,
          data,
          rendered,
          filePath: `src/data/daily-bilder/${e.slug}.md`,
          assetImports: rendered.metadata?.imagePaths,
          digest: generateDigest({ id: e.id, data }),
        });
        anzahl++;
      }
      logger.info(`${anzahl} Ausgaben mit Volltext`);
    },
  };
}

function bereinigen(md: string, lokal: (url: string) => string | undefined): string {
  // Leeres Frontmatter vorweg: Sonst liest Astro einen Text, der mit „---“ oder „+++“ beginnt, als
  // Frontmatter, und der Build bricht ab oder verschluckt den Anfang.
  return '---\n---\n' + md
    .replace(/\uE000/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/!\[(?:([^\]]*)\]\((https?:\/\/[^)\s]+)[^)\n]*\))?/g, (_, alt: string, url?: string) => {
      // Jede andere Bildform wird Text, sonst bliebe ein Fremdbild oder ein Pfad, an dem der Build scheitert.
      if (!url) return '!\\[';
      const datei = lokal(url);
      // Ein fehlendes Bild hinterlässt ein Leerzeichen, damit sich davor und dahinter keine neue Bildform zusammensetzt.
      return datei ? `![${alt}](./${datei})` : ' ';
    })
    // Rohes HTML wird Text: Jedes „<“ wird zum Platzhalter U+E000, statt Tags per Muster zu entfernen
    // (das ließ sich mit verschachtelten oder umbrochenen Tags umgehen). Der Renderer reicht das Zeichen
    // in Text, Code und Attributen unverändert durch, der Loader gibt es danach als &lt; aus.
    // Autolinks wie <https://…> bleiben erhalten.
    .replace(/<(?!https?:\/\/[^\s<>]*>)/g, '\uE000')
    // Zeilen, die nur aus „#“ bestehen, ergäben leere Überschriften.
    .replace(/^#{1,6}[ \t]*$/gm, '');
}

// Überschriften hängen sich lückenlos unter die h1 der Seite: Beginnt ein Text mit „##“ oder überspringt
// er eine Stufe, entstünde sonst ein Sprung wie von h1 auf h3. Aufeinanderfolgende gleiche Stufen unter
// derselben Überschrift bleiben Geschwister; ein „##“ vor dem ersten „#“ steht auf der Stufe des „#“.
function stufeTiefer(html: string): string {
  // Offene Gliederung als [Stufe im Text, Stufe auf der Seite]; zuunterst die h1 der Seite.
  const offen: [number, number][] = [[0, 1]];
  // Nur echte Tags: Der Renderer gibt Überschriften mit id aus, „<h1“ in einem Linktitel zählt nicht.
  return html.replace(/<(\/?)h([1-6])(?= (?:id|class)="|>)/g, (_, schluss: string, n: string) => {
    if (!schluss) {
      while (offen[offen.length - 1][0] >= Number(n)) offen.pop();
      offen.push([Number(n), Math.min(offen[offen.length - 1][1] + 1, 6)]);
    }
    return `<${schluss}h${offen[offen.length - 1][1]}`;
  });
}
