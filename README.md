## Entwicklung

Die Seite ist eine statische Astro-Seite (Astro 7, Tailwind 4), gebaut für `start.einundzwanzig.dev`. Der Plan steht in `PLAN.md`.

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # erzeugt dist/
npm run check-links  # prüft interne Links und Platzhalter in dist/
npm run snapshot     # aktualisiert die Fallback-Snapshots der externen Quellen
```

Node 22.12 oder neuer (siehe `.nvmrc`).

### Inhalte pflegen

| Was | Wo | Format |
|---|---|---|
| Projekte (Ökosystem-Karte, Steckbriefe) | `src/content/projects/*.md` | Frontmatter + Markdown. `status: live / beta / idee`, `karte: <n>` setzt die Position auf der Karte, ohne `karte` erscheint das Projekt nur in der Liste. |
| Empfehlungen | `src/content/empfehlungen/*.md` | Frontmatter + optional Markdown („Warum wir das empfehlen“). `werbelink: true` ist nur mit `programm: bestaetigt` erlaubt, sonst bricht der Build. |
| Kuratierte Neuigkeiten | `src/content/news/*.md` | Frontmatter (`titel`, `datum`, `url`). Erscheinen im „Neu“-Feed neben den Podcast-Folgen. |
| Artikel | `src/content/artikel/*.mdx` | Frontmatter (`titel`, `teaser`, `datum`, `rubrik: news / community / wissen`, optional `bild` + `bildAlt`, `beispiel: true` für Platzhalter) + Text. Eine Empfehlung im Text: `<Empfehlung slug="bitbox02" />`. Artikel erscheinen unter `/artikel/<dateiname>/`, die Übersicht unter `/artikel/`, je Rubrik unter `/artikel/rubrik/<rubrik>/` (nur Rubriken mit Beiträgen). Eigene Artikel ohne `beispiel` stehen im Feed `/rss.xml`. Ein Artikel mit `bild` nutzt es als Vorschaubild (`og:image`), alle anderen Seiten die Hub-Skizze. |
| Tägliche Nachrichten | kommen vom Feed `media.einundzwanzig.space/s/einundzwanzig-news` und als signierte Nostr-Langtexte von den Relays | Keine Pflege nötig. Der Build holt die neuesten Einträge, zeigt Titelbild, Datum, Autor und Zusammenfassung als Karten und baut für die neuesten 30 Ausgaben eigene Seiten mit Volltext unter `/daily/<datum>-<titel>/` (Canonical-Link auf das Original, Hinweiskasten mit Link zur Plattform und auf Nostr). Fehlt ein Beitrag auf den Relays, verlinkt die Karte auf die Plattform. |
| Kategorien der Empfehlungen | `src/data/kategorien.ts` | Titel und Einleitung je Kategorie. |
| Externe Links und Konstanten | `src/lib/site.ts` | |

### Design-Entwürfe

Entschieden ist Entwurf 5 „Zeitung“ (24. November 2026), er ist die Startseite `/` (`src/pages/index.astro`). Die vier anderen Entwürfe liegen weiter im Repo unter `src/entwuerfe/` und bleiben baubar, sind aber abgeschaltet.

Wieder einschalten: In `src/lib/entwuerfe.ts` `VERGLEICH` auf `true` setzen. Dann baut `src/pages/entwurf/[id].astro` die anderen Startseiten unter `/entwurf/<id>/`, der Umschalter erscheint unten rechts, und alle geteilten Seiten übernehmen die Kopfzeile des zuletzt gewählten Entwurfs (`localStorage` „entwurf“).

| Entwurf | Startseite | Idee |
|---|---|---|
| 1 Tisch | `/entwurf/tisch/` (`src/entwuerfe/Tisch.astro`) | Ökosystem-Karte zuerst, Neues darunter |
| 2 Daily | `/entwurf/daily/` (`src/entwuerfe/Daily.astro`) | News zuerst, Ökosystem daneben, Signal-Leiste statt Kurs-Ticker |
| 3 Magazin | `/entwurf/magazin/` (`src/entwuerfe/Magazin.astro`) | Nachrichtenportal, angelehnt an Blocktrainer: Laufband mit Bitcoin-Daten, Hauptmenü, Artikelraster |
| 4 Entdecken | `/entwurf/entdecken/` (`src/entwuerfe/Entdecken.astro`) | Nach discover.einundzwanzig.space: helle Farbwelt mit System-Sans und Serifen-Hero, dunkle Hero-Karte, Kartenreihen mit Pfeilen. Eigene Tokens per `:root[data-entwurf="entdecken"]` in `global.css` |
| 5 Zeitung | `/` (`src/pages/index.astro`) | Zeitungskopf mit Wortmarke und Laufband, Aufmacher, Artikelraster, rechte Spalte mit Kästen (Tippspiele, Podcast, Meetups, Empfehlungen, Ökosystem). Papierton, Playfair Display für Überschriften, Newsreader für den Text, eckige Flächen. Eigene Tokens per `:root[data-entwurf="zeitung"]` in `global.css` |

Die Liste steht in `src/lib/entwuerfe.ts`. Ein neuer Entwurf braucht einen Eintrag dort, eine Seite in `src/entwuerfe/`, die `<Base entwurf="…">` setzt und in `src/pages/entwurf/[id].astro` eingetragen ist, eine Kopfzeile mit der Klasse `nur-<id>` in `Base.astro` und eine Zeile in der Regel am Ende von `global.css`. Eine eigene Farbwelt bekommt ein Entwurf über Token-Overrides auf `:root[data-entwurf="<id>"]` (Beispiele: Entdecken, Zeitung).

### Daten zur Build-Zeit

- Podcast: `https://einundzwanzig.space/feed.xml`
- Meetups: `https://portal.einundzwanzig.space/api/meetups`
- Tägliche Nachrichten: Feed `https://media.einundzwanzig.space/s/einundzwanzig-news/feed.xml` (Einträge, Autor, Titelbild) und die Beiträge selbst als Nostr-Events (Kind 30023) von `nostr.einundzwanzig.space`, `nos.lol` und `relay.primal.net`, nur vom Konto des Autorenteams und nur mit gültiger Signatur (`scripts/daily-events.mjs`, Prüfung mit nostr-tools). `scripts/daily-bilder.mjs` läuft vor jedem Build: holt die Events nach `src/data/daily-events.json` und alle Titel- und Textbilder nach `src/data/daily-bilder/` (beides gitignored); der Workflow behält die Bilder in einem Cache. Der Loader `src/lib/daily-loader.ts` rendert das Markdown mit Astros Pipeline, zeigt rohes HTML als Text, lässt nur Links mit http(s), mailto und Anker zu, lässt fehlende Bilder weg und hängt die Überschriften lückenlos unter die h1 der Seite. Snapshots `daily.xml` und `daily-events.json`.
- Bitcoin-Daten für das Laufband (Startseite und Entwurf 3) und den Kurs im Kasten „Bitcoin-Preis tippen“: `https://mempool.space/api` (Preise, Blockhöhe, Gebühren, Difficulty), Snapshot `bitcoin.json`. Nur zur Build-Zeit, der Browser stellt keine Verbindung her; der Stand steht im Laufband.

Der Build schreibt außerdem `sitemap-index.xml` (ohne die Entwurfs-Startseiten); `robots.txt` nennt sie, sobald `PUBLIC_NOINDEX` fehlt.

Ist eine Quelle nicht erreichbar, nutzt der Build den Snapshot aus `src/data/snapshots/`. Der GitHub-Workflow baut stündlich neu, damit Folgen und Termine aktuell bleiben.

### Live-Dienst (optional)

Mit der Build-Variable `PUBLIC_LIVE_URL` (z. B. `https://live.einundzwanzig.dev`) verbindet sich die Seite im Browser per Server-Sent Events mit dem Phoenix-Dienst aus dem Repo `einundzwanzig-live`. Dann aktualisieren sich das Laufband (Startseite und Entwurf 3) und „Kurz notiert“ (Entwürfe 1 und 2, nur im Vergleichsmodus) laufend; der Dienst holt die Daten bei mempool.space, dem Podcast-Feed, Nostr-Relays und `/neu.json` dieser Seite. Ohne die Variable bleibt alles statisch. Lokal: `PUBLIC_LIVE_URL=http://localhost:4000 npm run dev` bei laufendem Dienst. Die Datenschutzseite zeigt den Abschnitt „Live-Daten“ nur, wenn die Variable gesetzt ist.

### Veröffentlichen

`.github/workflows/deploy.yml` baut bei jedem Push auf `main`, stündlich per Cron und auf Knopfdruck, und veröffentlicht `dist/` auf GitHub Pages (Repo `Razue/Einundzwanzig-Landing`, öffentlich, damit Pages und die stündlichen Actions-Minuten kostenlos sind).
