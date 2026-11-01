import { EXTERN } from './site';
import { ladeText } from './laden';
import snapshot from '../data/snapshots/meetups.json?raw';

export interface Termin {
  id: number;
  start: string;
  title: string | null;
  portalLink: string;
  location: string | null;
}

export interface Meetup {
  id: number;
  name: string;
  portalLink: string;
  url: string | null;
  country: string;
  city: string | null;
  longitude: number | null;
  latitude: number | null;
  nostr: string | null;
  website: string | null;
  next_event: Termin | null;
}

export interface KommenderTermin {
  meetup: Meetup;
  start: Date;
  termin: Termin;
}

let cache: Promise<Meetup[]> | undefined;

export function getMeetups(): Promise<Meetup[]> {
  cache ??= laden();
  return cache;
}

async function laden(): Promise<Meetup[]> {
  const { text } = await ladeText(EXTERN.meetupsApi, snapshot);
  const daten = JSON.parse(text);
  return Array.isArray(daten) ? (daten as Meetup[]) : [];
}

export async function getMeetupStatistik() {
  const meetups = await getMeetups();
  const laender = new Map<string, number>();
  for (const m of meetups) laender.set(m.country, (laender.get(m.country) ?? 0) + 1);
  const jetzt = Date.now();
  const kommende: KommenderTermin[] = meetups
    .filter((m): m is Meetup & { next_event: Termin } => m.next_event !== null)
    .map((m) => ({ meetup: m, termin: m.next_event, start: new Date(m.next_event.start) }))
    .filter((k) => !Number.isNaN(k.start.getTime()) && k.start.getTime() > jetzt)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
  return {
    gesamt: meetups.length,
    laender: laender.size,
    deutschland: laender.get('DE') ?? 0,
    mitNostr: meetups.filter((m) => m.nostr).length,
    kommende,
  };
}
