import type { KATEGORIE_SLUGS } from '../content.config';

export type KategorieSlug = (typeof KATEGORIE_SLUGS)[number];

export interface Kategorie {
  slug: KategorieSlug;
  titel: string;
  intro: string;
}

export const KATEGORIEN: Kategorie[] = [
  {
    slug: 'kaufen',
    titel: 'Bitcoin kaufen',
    intro:
      'Vom Sparplan bis zum Handel von Person zu Person. Wir zeigen bei jedem Anbieter, wie viel Identitätsprüfung er verlangt. Ohne KYC zu kaufen ist für Privatpersonen legal, kostet aber meist einen Aufschlag.',
  },
  {
    slug: 'karten',
    titel: 'Karten und Bezahlen',
    intro:
      'Eine Kreditkarte ganz ohne Identitätsprüfung gibt es derzeit nicht. Was es gibt: Gutscheine und Prepaid-Lösungen mit Limits, die oft ab einer Schwelle doch einen Ausweis verlangen. Wir nennen die Grenzen, statt sie zu verschweigen.',
  },
  {
    slug: 'wallets',
    titel: 'Hardware Wallets',
    intro:
      'Eigene Schlüssel, eigene Coins. Eine Hardware Wallet hält die Schlüssel offline. Welche zu dir passt, hängt davon ab, ob du Bitcoin-only willst, ein Display brauchst oder selbst bauen magst.',
  },
  {
    slug: 'nostr',
    titel: 'Nostr und Lightning',
    intro:
      'Die Werkzeuge, mit denen die Community kommuniziert und bezahlt: Relays, Namen, eigene Lightning-Knoten. Vieles davon finanziert direkt den Verein statt eines Konzerns.',
  },
  {
    slug: 'steuer',
    titel: 'Steuer',
    intro:
      'Bitcoin ist in Deutschland nach einem Jahr Haltefrist steuerfrei, vorher nicht. Wer handelt, braucht eine saubere Aufstellung. Diese Werkzeuge lesen Transaktionen ein und erzeugen den Report fürs Finanzamt.',
  },
  {
    slug: 'buecher-events',
    titel: 'Bücher und Events',
    intro: 'Lesen, treffen, mitdiskutieren. Verlage und Konferenzen aus dem Umfeld der Community.',
  },
];

export function kategorie(slug: string): Kategorie | undefined {
  return KATEGORIEN.find((k) => k.slug === slug);
}
