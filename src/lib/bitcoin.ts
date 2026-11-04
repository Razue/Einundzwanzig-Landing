// Bitcoin-Daten für das Laufband (Entwurf „Magazin“): Preis in Dollar und Euro, Moskau-Zeit,
// Blockhöhe, Gebühren, Difficulty und Halving. Nur Bitcoin, keine anderen Coins.
// Quelle ist mempool.space, abgerufen zur Build-Zeit wie Podcast und Meetups. Der Browser stellt
// keine Verbindung her, deshalb steht der Stand mit im Laufband.
import { ladeText } from './laden';
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

export interface Feld {
  label: string;
  wert: string;
  titel?: string;
}

export interface Laufband {
  felder: Feld[];
  stand: Date;
}

const HALVING_INTERVALL = 210_000;

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
  return zuLaufband(Object.fromEntries(paare) as unknown as Rohdaten);
}

export function zuLaufband(d: Rohdaten): Laufband {
  const satsProDollar = Math.round(1e8 / d.preise.USD);
  const naechstesHalving = Math.ceil((d.hoehe + 1) / HALVING_INTERVALL) * HALVING_INTERVALL;
  return {
    stand: new Date(d.preise.time * 1000),
    felder: [
      { label: 'Bitcoin', wert: `${zahl(d.preise.USD)} $` },
      { label: 'Bitcoin', wert: `${zahl(d.preise.EUR)} €` },
      { label: 'Moskau-Zeit', wert: moskauZeit(satsProDollar), titel: `${zahl(satsProDollar)} Sats pro Dollar` },
      { label: 'Block', wert: zahl(d.hoehe) },
      { label: 'Gebühr', wert: `${zahl(d.gebuehren.fastestFee)} sat/vB`, titel: 'Empfohlene Gebühr für den nächsten Block' },
      {
        label: 'Difficulty',
        wert: `${prozent(d.difficulty.difficultyChange)} in ${zahl(d.difficulty.remainingBlocks)} Blöcken`,
        titel: 'Geschätzte nächste Anpassung',
      },
      { label: 'Halving', wert: `in ${zahl(naechstesHalving - d.hoehe)} Blöcken` },
    ],
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
