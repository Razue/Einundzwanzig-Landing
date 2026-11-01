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
| Kategorien der Empfehlungen | `src/data/kategorien.ts` | Titel und Einleitung je Kategorie. |
| Externe Links und Konstanten | `src/lib/site.ts` | |

### Daten zur Build-Zeit

- Podcast: `https://einundzwanzig.space/feed.xml`
- Meetups: `https://portal.einundzwanzig.space/api/meetups`

Ist eine Quelle nicht erreichbar, nutzt der Build den Snapshot aus `src/data/snapshots/`. Der GitHub-Workflow baut stündlich neu, damit Folgen und Termine aktuell bleiben.

### Veröffentlichen

`.github/workflows/deploy.yml` baut bei jedem Push auf `main`, stündlich per Cron und auf Knopfdruck, und veröffentlicht `dist/` auf GitHub Pages (Repo `Razue/Einundzwanzig-Landing`, öffentlich, damit Pages und die stündlichen Actions-Minuten kostenlos sind).
