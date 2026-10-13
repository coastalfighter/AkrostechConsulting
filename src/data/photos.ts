/**
 * Which stock photograph illustrates what. Photographs show people at work in general and are
 * never presented as Akrostech staff or clients. Licences: src/assets/photos/credits.json.
 */
import type { PhotoName } from '@/components/Photo.astro';
import type { ArtKey, ServiceSlug } from './services';

export const servicePhoto: Record<ServiceSlug, PhotoName> = {
  'virtual-assistance': 'phone-laptop',
  'recruitment-process-outsourcing': 'talking-hands',
  'accounting-assistance': 'tax-forms',
  'legal-process-outsourcing': 'contract-signing',
  'website-development': 'code-laptop',
};

/** A second photograph per practice, for page bodies. */
export const serviceSecondPhoto: Record<ServiceSlug, PhotoName> = {
  'virtual-assistance': 'two-women-laptop',
  'recruitment-process-outsourcing': 'meeting-room',
  'accounting-assistance': 'desk-overhead',
  'legal-process-outsourcing': 'lady-justice',
  'website-development': 'developers',
};

/** Pools used for articles and blueprints, picked by their art key and variant. */
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
