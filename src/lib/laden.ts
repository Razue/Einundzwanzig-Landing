// Holt eine Quelle zur Build-Zeit. Ist sie nicht erreichbar, nimmt der Build
// den eingecheckten Snapshot, damit die Seite nie wegen einer fremden API bricht.
export async function ladeText(
  url: string,
  snapshot: string,
  timeoutMs = 10_000,
): Promise<{ text: string; quelle: 'live' | 'snapshot' }> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'user-agent': 'start.einundzwanzig.dev build' },
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { text: await res.text(), quelle: 'live' };
  } catch (err) {
    console.warn(`[daten] ${url}: ${(err as Error).message}. Nutze Snapshot.`);
    return { text: snapshot, quelle: 'snapshot' };
  }
}
