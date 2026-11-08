// Design-Entwürfe. Entschieden ist Entwurf 4 „Entdecken“ (8. November 2026), er ist die Startseite „/“.
// VERGLEICH = true schaltet den Vergleichsmodus wieder ein: Die anderen Entwürfe werden unter
// /entwurf/<id>/ gebaut (src/pages/entwurf/[id].astro, Seiten in src/entwuerfe/), unten rechts
// erscheint der Umschalter, und alle geteilten Seiten übernehmen die Kopfzeile des zuletzt gewählten
// Entwurfs (localStorage „entwurf“). Mit false bleibt nur Entdecken, der Umschalter verschwindet von selbst.
export const VERGLEICH: boolean = false;

const ALLE = [
  { id: 'tisch', nummer: 1, name: 'Tisch', kurz: 'Ökosystem-Karte zuerst, Neues darunter', home: '/entwurf/tisch/' },
  { id: 'daily', nummer: 2, name: 'Daily', kurz: 'News zuerst, Ökosystem daneben', home: '/entwurf/daily/' },
  { id: 'magazin', nummer: 3, name: 'Magazin', kurz: 'Nachrichtenportal mit Laufband, Hauptmenü und Artikelraster', home: '/entwurf/magazin/' },
  { id: 'entdecken', nummer: 4, name: 'Entdecken', kurz: 'Helle Entdecker-Ansicht mit Kartenreihen, nach dem Vorbild der Vereinsplattform', home: '/' },
] as const;

export type EntwurfId = (typeof ALLE)[number]['id'];
export const STANDARD_ENTWURF: EntwurfId = 'entdecken';
export const ENTWUERFE: readonly (typeof ALLE)[number][] = VERGLEICH ? ALLE : ALLE.filter((e) => e.id === STANDARD_ENTWURF);
export const HOMES = Object.fromEntries(ALLE.map((e) => [e.id, e.home])) as Record<EntwurfId, string>;
