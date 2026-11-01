import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const STATUS = ['live', 'beta', 'idee'] as const;
export const KATEGORIE_SLUGS = ['kaufen', 'karten', 'wallets', 'nostr', 'steuer', 'buecher-events'] as const;
export const KYC = ['keine', 'leicht', 'voll', 'entfaellt'] as const;

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    kurz: z.string().max(120),
    status: z.enum(STATUS),
    offiziell: z.boolean().default(false),
    themen: z.array(z.string()).default([]),
    links: z
      .object({
        web: z.url().optional(),
        repo: z.url().optional(),
        nostr: z.string().optional(),
        zapstore: z.url().optional(),
        appstore: z.url().optional(),
        rss: z.url().optional(),
      })
      .default({}),
    // Position auf der Ökosystem-Karte. Fehlt der Wert, erscheint das Projekt nur in der Liste.
    karte: z.number().int().optional(),
  }),
});

const empfehlungen = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/empfehlungen' }),
  schema: z
    .object({
      anbieter: z.string(),
      kategorie: z.enum(KATEGORIE_SLUGS),
      kyc: z.enum(KYC),
      laender: z.array(z.string()).default([]),
      url: z.url(),
      // Pflichtfeld ohne Default: jede Empfehlung muss sich entscheiden.
      werbelink: z.boolean(),
      programm: z.enum(['bestaetigt', 'offen', 'kein']),
      code: z.string().optional(),
      vorteil: z.string(),
      risiken: z.string().optional(),
      geprueft_am: z.coerce.date(),
      reihenfolge: z.number().default(50),
    })
    .refine((d) => !d.werbelink || d.programm === 'bestaetigt', {
      error: 'werbelink: true ist nur mit programm: bestaetigt erlaubt',
    })
    .refine((d) => !d.werbelink || d.url.length > 0, {
      error: 'Werbelink braucht eine URL',
    }),
});

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    titel: z.string(),
    datum: z.coerce.date(),
    url: z.string().optional(),
    quelle: z.string().default('Hub'),
  }),
});

export const collections = { projects, empfehlungen, news };
