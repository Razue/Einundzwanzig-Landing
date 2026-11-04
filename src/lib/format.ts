const ZEITZONE = 'Europe/Berlin';

export function datumKurz(d: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: ZEITZONE,
  }).format(d);
}

export function terminKurz(d: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: ZEITZONE,
  }).format(d);
}

export function isoDatum(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function datumLang(d: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: ZEITZONE,
  }).format(d);
}

export function uhrzeit(d: Date): string {
  return new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: ZEITZONE }).format(d);
}
