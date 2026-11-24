// Holt die täglichen Nachrichten als signierte Nostr-Langtexte (Kind 30023) von festen Relays und
// behält nur Events, die Signatur, Autor und Kind bestehen. Genutzt vor dem Build (daily-bilder.mjs)
// und für den Snapshot (snapshot.mjs).
import { verifyEvent } from 'nostr-tools/pure';

// Konto „Einundzwanzig News“ auf media.einundzwanzig.space, steht auch in jeder guid des Feeds.
export const DAILY_PUBKEY = 'f240be2b684f85cc81566f2081386af81d7427ea86250c8bde6b7a8500c761ba';
// Das Relay des Vereins zuerst, dazu zwei große Relays, auf denen die Plattform ebenfalls veröffentlicht.
export const RELAYS = ['wss://nostr.einundzwanzig.space', 'wss://nos.lol', 'wss://relay.primal.net'];
export const EVENTS_DATEI = 'src/data/daily-events.json';
export const EVENTS_SNAPSHOT = 'src/data/snapshots/daily-events.json';
// So viele Ausgaben bekommen eine eigene Seite mit Volltext und Bildern; die Karten zeigen weniger.
export const VOLLTEXT = 30;

// d-Tags der Feed-Einträge in Feed-Reihenfolge (neueste zuerst), aus der guid „30023:<pubkey>:<d>“.
export function dTagsAusFeed(xml) {
  return [...xml.matchAll(/<guid[^>]*>30023:[0-9a-f]{64}:([^<]+)<\/guid>/g)].map((m) => m[1]).slice(0, VOLLTEXT);
}

// Bild-URLs aus dem Markdown eines Beitrags, nur https.
export function bildUrls(content) {
  return [...content.matchAll(/!\[[^\]]*\]\((https:\/\/[^)\s]+)/g)].map((m) => m[1]);
}

function vonRelay(url, filter, timeoutMs) {
  return new Promise((resolve) => {
    const events = [];
    let ws;
    const fertig = () => {
      clearTimeout(timer);
      try {
        ws?.close();
      } catch {}
      resolve(events);
    };
    const timer = setTimeout(fertig, timeoutMs);
    try {
      ws = new WebSocket(url);
    } catch {
      return fertig();
    }
    ws.onopen = () => ws.send(JSON.stringify(['REQ', 'daily', filter]));
    ws.onmessage = (m) => {
      let d;
      try {
        d = JSON.parse(m.data);
      } catch {
        return;
      }
      if (d[0] === 'EVENT' && d[1] === 'daily') events.push(d[2]);
      else if (d[0] === 'EOSE') fertig();
    };
    ws.onerror = fertig;
  });
}

// Je d-Tag das neueste gültige Event, Reihenfolge wie dTags. Fehlende Ausgaben fehlen einfach.
export async function eventsLaden(dTags, timeoutMs = 8_000) {
  if (dTags.length === 0) return [];
  const filter = { kinds: [30023], authors: [DAILY_PUBKEY], '#d': dTags };
  const alle = (await Promise.all(RELAYS.map((r) => vonRelay(r, filter, timeoutMs)))).flat();
  const beste = new Map();
  for (const e of alle) {
    const d = e?.tags?.find((t) => t[0] === 'd')?.[1];
    if (!d || e.kind !== 30023 || e.pubkey !== DAILY_PUBKEY || !dTags.includes(d)) continue;
    let gueltig = false;
    try {
      gueltig = verifyEvent(e);
    } catch {}
    if (!gueltig) continue;
    const alt = beste.get(d);
    if (!alt || e.created_at > alt.created_at) beste.set(d, e);
  }
  return dTags.map((d) => beste.get(d)).filter(Boolean);
}
