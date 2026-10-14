/**
 * Which stock photograph illustrates what. Photographs show people at work in general and are
 * never presented as Akrostech staff or clients. Licences: src/assets/photos/credits.json.
 */
import type { PhotoName } from '@/components/Photo.astro';
import type { ArtKey } from './legacy';
import type { ServiceSlug } from './services';

export const servicePhoto: Record<ServiceSlug, PhotoName> = {
  'virtual-assistance': 'svc-virtual-assistance',
  recruitment: 'svc-recruitment',
  accounting: 'svc-accounting',
  legal: 'svc-legal',
  'website-development': 'svc-website-development',
};

/** A second photograph per practice, for "what we handle" sections. */
export const serviceSecondPhoto: Record<ServiceSlug, PhotoName> = {
  'virtual-assistance': 'svc-virtual-assistance-work',
  recruitment: 'svc-recruitment-work',
  accounting: 'svc-accounting-work',
  legal: 'svc-legal-work',
  'website-development': 'svc-website-development-work',
};

/** Pools used for article covers, picked by their art key and variant. */
const pools: Record<ArtKey, PhotoName[]> = {
  va: ['phone-laptop', 'two-women-laptop', 'desk-window', 'pair-at-laptop'],
  rpo: ['talking-hands', 'meeting-room', 'team-table', 'standup'],
  accounting: ['tax-forms', 'desk-overhead', 'pair-at-laptop', 'workspace-cafe'],
  legal: ['contract-signing', 'lady-justice', 'office-hallway', 'meeting-presentation'],
  web: ['code-laptop', 'code-desk', 'developers', 'sticky-notes'],
};

export const photoFor = (art: ArtKey, variant = 0): PhotoName => {
  const pool = pools[art];
  return pool[variant % pool.length]!;
};
