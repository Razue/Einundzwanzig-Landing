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
| Artikel (Entwurf „Daily“) | `src/content/artikel/*.mdx` | Frontmatter (`titel`, `teaser`, `datum`, `rubrik: news / community / wissen`, optional `bild` + `bildAlt`, `beispiel: true` für Platzhalter) + Text. Eine Empfehlung im Text: `<Empfehlung slug="bitbox02" />`. Artikel erscheinen unter `/artikel/<dateiname>/`, die Übersicht unter `/artikel/`. |
| Tägliche Nachrichten | kommen vom Feed `media.einundzwanzig.space/s/einundzwanzig-news` | Keine Pflege nötig. Der Build holt die neuesten zehn Einträge, zeigt Titelbild, Datum, Autor und Zusammenfassung als Rubrik „Bitcoin Daily“ und verlinkt auf die Plattform. |
| Kategorien der Empfehlungen | `src/data/kategorien.ts` | Titel und Einleitung je Kategorie. |
| Externe Links und Konstanten | `src/lib/site.ts` | |

### Design-Entwürfe

Die Vorschau kann zwischen Design-Entwürfen umschalten (Knopf unten rechts). Jeder Entwurf hat eine eigene Startseite, alle anderen Seiten sind geteilt und übernehmen die Kopfzeile des zuletzt gewählten Entwurfs (`localStorage` „entwurf“).

| Entwurf | Startseite | Idee |
|---|---|---|
| 1 Tisch | `/` (`src/pages/index.astro`) | Ökosystem-Karte zuerst, Neues darunter |
| 2 Daily | `/entwurf/daily/` (`src/pages/entwurf/daily/index.astro`) | News zuerst, Ökosystem daneben, Signal-Leiste statt Kurs-Ticker |
| 3 Magazin | `/entwurf/magazin/` (`src/pages/entwurf/magazin/index.astro`) | Nachrichtenportal, angelehnt an Blocktrainer: Laufband mit Bitcoin-Daten, Hauptmenü, Artikelraster |

Die Liste steht in `src/lib/entwuerfe.ts`. Ein neuer Entwurf braucht einen Eintrag dort, eine Startseite, die `<Base entwurf="…">` setzt, eine Kopfzeile mit der Klasse `nur-<id>` in `Base.astro` und eine Zeile in der Regel am Ende von `global.css`. Ist ein Entwurf entschieden, kommt seine Startseite nach `/`, die anderen Einträge fallen weg, und der Umschalter verschwindet von selbst.

### Daten zur Build-Zeit

- Podcast: `https://einundzwanzig.space/feed.xml`
- Meetups: `https://portal.einundzwanzig.space/api/meetups`
- Tägliche Nachrichten: `https://media.einundzwanzig.space/s/einundzwanzig-news/feed.xml` (Nostr-Langtexte des Autorenteams; Titelbilder werden beim Build optimiert, nicht erreichbare Bilder werden zur Kachel)
- Bitcoin-Daten für das Laufband (Entwurf 3): `https://mempool.space/api` (Preise, Blockhöhe, Gebühren, Difficulty), Snapshot `bitcoin.json`. Nur zur Build-Zeit, der Browser stellt keine Verbindung her; der Stand steht im Laufband.

Ist eine Quelle nicht erreichbar, nutzt der Build den Snapshot aus `src/data/snapshots/`. Der GitHub-Workflow baut stündlich neu, damit Folgen und Termine aktuell bleiben.

### Veröffentlichen

`.github/workflows/deploy.yml` baut bei jedem Push auf `main`, stündlich per Cron und auf Knopfdruck, und veröffentlicht `dist/` auf GitHub Pages (Repo `Razue/Einundzwanzig-Landing`, öffentlich, damit Pages und die stündlichen Actions-Minuten kostenlos sind).
