export const SITE = {
  url: 'https://start.einundzwanzig.dev',
  name: 'Einundzwanzig Start',
  claim: 'Alles rund um Einundzwanzig, an einem Tisch.',
  description:
    'Der Einstieg für Neue und der Überblick für alle, die schon länger dabei sind: Podcast, Meetups, Apps und Werkzeuge der Einundzwanzig-Community, verbunden über Bitcoin und Nostr.',
  npub: 'npub1qv02xpsc3lhxxx5x7xswf88w3u7kykft9ea7t78tz7ywxf7mxs9qrxujnc',
  nav: [
    { href: '/start', label: 'Start' },
    { href: '/projekte', label: 'Projekte' },
    { href: '/empfehlungen', label: 'Empfehlungen' },
    { href: '/unterstuetzen', label: 'Unterstützen' },
  ],
} as const;

// Adresse des Live-Dienstes (einundzwanzig-live). Leer, wenn PUBLIC_LIVE_URL beim Build fehlt:
// dann bleibt die Seite rein statisch.
export const LIVE_URL = (import.meta.env.PUBLIC_LIVE_URL ?? '').trim().replace(/\/$/, '');

export const EXTERN = {
  podcast: 'https://einundzwanzig.space/',
  podcastFeed: 'https://einundzwanzig.space/feed.xml',
  podcastFolgen: 'https://einundzwanzig.space/podcast/',
  dailyNews: 'https://media.einundzwanzig.space/s/einundzwanzig-news',
  dailyFeed: 'https://media.einundzwanzig.space/s/einundzwanzig-news/feed.xml',
  derWeg: 'https://einundzwanzig.space/podcast/der-weg/',
  spenden: 'https://einundzwanzig.space/spenden/',
  kontakt: 'https://einundzwanzig.space/kontakt/',
  portal: 'https://portal.einundzwanzig.space/',
  portalKarte: 'https://portal.einundzwanzig.space/de/meetups',
  meetupKarte: 'https://einundzwanzig.space/meetups/',
  meetupsApi: 'https://portal.einundzwanzig.space/api/meetups',
  verein: 'https://verein.einundzwanzig.space/',
  vereinVorteile: 'https://verein.einundzwanzig.space/association/benefits',
  shoutout: 'https://shoutout.einundzwanzig.space/',
  shop: 'https://einundzwanzig.shop/',
  youtube: 'https://www.youtube.com/c/EinundzwanzigPodcast',
  telegramNews: 'https://t.me/einundzwanzigbitcoin',
  nostrProfil: 'https://njump.me/npub1qv02xpsc3lhxxx5x7xswf88w3u7kykft9ea7t78tz7ywxf7mxs9qrxujnc',
  twentyoneWorld: 'https://twentyone.world/',
  zapstoreMeetupApp: 'https://zapstore.dev/apps/space.einundzwanzig.meetup',
} as const;
