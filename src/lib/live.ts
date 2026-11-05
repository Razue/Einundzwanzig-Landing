// Verbindung zum Live-Dienst (einundzwanzig-live), eine pro Seite, geteilt von Laufband und
// Feed-Liste. Läuft nur im Browser und nur, wenn PUBLIC_LIVE_URL beim Build gesetzt war.
let quelle: EventSource | undefined;

export function liveStream(url: string): EventSource {
  quelle ??= new EventSource(`${url.replace(/\/$/, '')}/api/stream`);
  return quelle;
}
