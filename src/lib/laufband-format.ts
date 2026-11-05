// Formatierung der Laufband-Felder. Zweimal im Einsatz: beim Build (src/lib/bitcoin.ts) und im
// Browser, wenn der Live-Dienst neue Werte schickt (Laufband.astro). So sehen Build-Werte und
// Live-Werte exakt gleich aus. Die Rohwerte sind der Vertrag mit dem Live-Dienst (/api/ticker).
export interface Rohwerte {
  usd: number;
  eur: number;
  hoehe: number;
  gebuehr: number;
  difficultyAenderung: number;
  restBloecke: number;
  stand: Date;
}

export interface Feld {
  id: string;
  label: string;
  wert: string;
  titel?: string;
}

const HALVING_INTERVALL = 210_000;

export function zuFelder(d: Rohwerte): Feld[] {
  const satsProDollar = Math.round(1e8 / d.usd);
  const naechstesHalving = Math.ceil((d.hoehe + 1) / HALVING_INTERVALL) * HALVING_INTERVALL;
  return [
    { id: 'usd', label: 'Bitcoin', wert: `${zahl(d.usd)} $` },
    { id: 'eur', label: 'Bitcoin', wert: `${zahl(d.eur)} €` },
    { id: 'moskau', label: 'Moskau-Zeit', wert: moskauZeit(satsProDollar), titel: `${zahl(satsProDollar)} Sats pro Dollar` },
    { id: 'block', label: 'Block', wert: zahl(d.hoehe) },
    { id: 'gebuehr', label: 'Gebühr', wert: `${zahl(d.gebuehr)} sat/vB`, titel: 'Empfohlene Gebühr für den nächsten Block' },
    {
      id: 'difficulty',
      label: 'Difficulty',
      wert: `${prozent(d.difficultyAenderung)} in ${zahl(d.restBloecke)} Blöcken`,
      titel: 'Geschätzte nächste Anpassung',
    },
    { id: 'halving', label: 'Halving', wert: `in ${zahl(naechstesHalving - d.hoehe)} Blöcken` },
  ];
}

// Prüft eine JSON-Antwort des Live-Dienstes, bevor sie ins Laufband kommt.
export function rohwerteAus(json: unknown): Rohwerte | null {
  if (!json || typeof json !== 'object') return null;
  const o = json as Record<string, unknown>;
  const zahlen = ['usd', 'eur', 'hoehe', 'gebuehr', 'difficultyAenderung', 'restBloecke'] as const;
  if (!zahlen.every((k) => typeof o[k] === 'number' && Number.isFinite(o[k] as number))) return null;
  const stand = new Date(String(o.stand));
  if (Number.isNaN(stand.getTime()) || (o.usd as number) <= 0) return null;
  return {
    usd: o.usd as number,
    eur: o.eur as number,
    hoehe: o.hoehe as number,
    gebuehr: o.gebuehr as number,
    difficultyAenderung: o.difficultyAenderung as number,
    restBloecke: o.restBloecke as number,
    stand,
  };
}

const zahl = (n: number) => new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(n);

const prozent = (n: number) =>
  new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1, signDisplay: 'always' }).format(n) + ' %';

// Moskau-Zeit: Sats pro Dollar, gelesen wie eine Uhrzeit (1.280 Sats → 12:80).
const moskauZeit = (sats: number) => {
  const s = String(sats);
  return s.length > 2 ? `${s.slice(0, -2)}:${s.slice(-2)}` : s;
};
