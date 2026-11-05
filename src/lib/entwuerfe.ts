// Design-Entwürfe, zwischen denen die Vorschau umschalten kann.
// Jeder Entwurf hat eine eigene Startseite. Alle anderen Seiten sind geteilt und übernehmen
// die Kopfzeile des zuletzt gewählten Entwurfs (localStorage „entwurf“, gesetzt beim Besuch
// einer Startseite oder über den Umschalter). Ist ein Entwurf entschieden, bleibt hier nur
// noch einer stehen, und der Umschalter verschwindet von selbst.
export const ENTWUERFE = [
  { id: 'tisch', nummer: 1, name: 'Tisch', kurz: 'Ökosystem-Karte zuerst, Neues darunter', home: '/' },
  { id: 'daily', nummer: 2, name: 'Daily', kurz: 'News zuerst, Ökosystem daneben', home: '/entwurf/daily/' },
  { id: 'magazin', nummer: 3, name: 'Magazin', kurz: 'Nachrichtenportal mit Laufband, Hauptmenü und Artikelraster', home: '/entwurf/magazin/' },
  { id: 'entdecken', nummer: 4, name: 'Entdecken', kurz: 'Helle Entdecker-Ansicht mit Kartenreihen, nach dem Vorbild der Vereinsplattform', home: '/entwurf/entdecken/' },
] as const;

export type EntwurfId = (typeof ENTWUERFE)[number]['id'];
export const STANDARD_ENTWURF: EntwurfId = 'tisch';
export const HOMES = Object.fromEntries(ENTWUERFE.map((e) => [e.id, e.home])) as Record<EntwurfId, string>;
