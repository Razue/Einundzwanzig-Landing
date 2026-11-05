// Bitcoin-Daten für das Laufband (Entwurf „Magazin“) zur Build-Zeit: Quelle ist mempool.space,
// abgerufen wie Podcast und Meetups, mit Snapshot als Fallback. Die Formatierung liegt in
// laufband-format.ts, weil der Browser sie mit den Werten des Live-Dienstes genauso braucht.
import { ladeText } from './laden';
import { zuFelder, type Feld, type Rohwerte } from './laufband-format';
import snapshot from '../data/snapshots/bitcoin.json?raw';

const API = 'https://mempool.space/api';
export const BITCOIN_QUELLEN = {
  preise: `${API}/v1/prices`,
  hoehe: `${API}/blocks/tip/height`,
  gebuehren: `${API}/v1/fees/recommended`,
  difficulty: `${API}/v1/difficulty-adjustment`,
} as const;

type Quelle = keyof typeof BITCOIN_QUELLEN;

interface Rohdaten {
  preise: { time: number; USD: number; EUR: number };
  hoehe: number;
  gebuehren: { fastestFee: number };
  difficulty: { difficultyChange: number; remainingBlocks: number };
}

export interface Laufband {
  felder: Feld[];
  stand: Date;
}

let cache: Promise<Laufband> | undefined;

export function getLaufband(): Promise<Laufband> {
  cache ??= laden();
  return cache;
}

async function laden(): Promise<Laufband> {
  const snap = JSON.parse(snapshot) as Record<Quelle, unknown>;
  const paare = await Promise.all(
    (Object.keys(BITCOIN_QUELLEN) as Quelle[]).map(async (k) => {
      const { text } = await ladeText(BITCOIN_QUELLEN[k], JSON.stringify(snap[k]));
      return [k, JSON.parse(text)] as const;
    }),
  );
  const roh = zuRohwerte(Object.fromEntries(paare) as unknown as Rohdaten);
  return { felder: zuFelder(roh), stand: roh.stand };
}

export function zuRohwerte(d: Rohdaten): Rohwerte {
  return {
    usd: d.preise.USD,
    eur: d.preise.EUR,
    hoehe: d.hoehe,
    gebuehr: d.gebuehren.fastestFee,
    difficultyAenderung: d.difficulty.difficultyChange,
    restBloecke: d.difficulty.remainingBlocks,
    stand: new Date(d.preise.time * 1000),
  };
}
