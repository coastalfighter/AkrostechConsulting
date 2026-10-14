/**
 * Page-builder estimate for the website-development hero. An illustrative model, not a
 * measurement: each block adds transfer weight, requests and a share of Largest Contentful
 * Paint on a mid-range phone over 4G. The LCP bands use Google's published Core Web Vitals
 * thresholds (good at or under 2.5 s, poor over 4 s). Shared by the server render and the script.
 */

export type BlockId = 'hero' | 'services' | 'proof' | 'pricing' | 'blog' | 'contact' | 'chat' | 'video' | 'tracking';

export interface Block {
  id: BlockId;
  name: string;
  /** Transfer weight in KB. */
  kb: number;
  requests: number;
  /** Seconds this block adds to the estimated LCP. */
  lcp: number;
  /** Wireframe height in the browser frame, px at scale 1. Zero for overlays. */
  height: number;
  /** How the block appears: a block in the page flow, a floating widget, or nothing visible. */
  kind: 'flow' | 'overlay' | 'hidden';
  /** Short note shown in the readout when the block is the heaviest one switched on. */
  note: string;
}

export const BASE = { kb: 165, requests: 6, lcp: 0.9, nav: 30, footer: 40, gap: 8 } as const;

export const blocks: Block[] = [
  { id: 'hero', name: 'Hero', kb: 140, requests: 2, lcp: 0.5, height: 140, kind: 'flow', note: 'The hero image is usually the LCP element: sized, compressed and preloaded.' },
  { id: 'services', name: 'Services', kb: 30, requests: 1, lcp: 0.05, height: 92, kind: 'flow', note: 'Text and a few inline icons cost almost nothing.' },
  { id: 'proof', name: 'Proof', kb: 25, requests: 0, lcp: 0.05, height: 58, kind: 'flow', note: 'Figures set in type, not images, stay light.' },
  { id: 'pricing', name: 'Pricing', kb: 15, requests: 0, lcp: 0.02, height: 104, kind: 'flow', note: 'Pricing tables are text and CSS.' },
  { id: 'blog', name: 'Blog', kb: 120, requests: 4, lcp: 0.08, height: 92, kind: 'flow', note: 'Below-the-fold thumbnails are lazy-loaded.' },
  { id: 'contact', name: 'Contact form', kb: 30, requests: 2, lcp: 0.1, height: 100, kind: 'flow', note: 'A small validation script and one API call.' },
  { id: 'chat', name: 'Chat widget', kb: 420, requests: 14, lcp: 0.7, height: 0, kind: 'overlay', note: 'Chat widgets load hundreds of KB of third-party script on every page.' },
  { id: 'video', name: 'Video background', kb: 2600, requests: 3, lcp: 1.6, height: 0, kind: 'overlay', note: 'A background video is the heaviest thing on most slow pages.' },
  { id: 'tracking', name: 'Third-party tracking', kb: 360, requests: 22, lcp: 0.9, height: 0, kind: 'hidden', note: 'Tag managers and pixels compete with your content for the main thread.' },
];

export const DEFAULT_ON: BlockId[] = ['hero', 'services', 'proof', 'pricing', 'contact'];

export type Band = 'good' | 'ni' | 'poor';
export const THRESHOLDS = { good: 2.5, poor: 4 } as const;
/** Upper end of the LCP scale drawn in the gauge, in seconds. */
export const LCP_SCALE = 6;
/** Upper end of the weight bar, in KB. */
export const KB_SCALE = 4000;

export const bandOf = (lcp: number): Band => (lcp <= THRESHOLDS.good ? 'good' : lcp <= THRESHOLDS.poor ? 'ni' : 'poor');
export const bandLabel: Record<Band, string> = { good: 'Good', ni: 'Needs improvement', poor: 'Poor' };

export interface Estimate {
  kb: number;
  requests: number;
  lcp: number;
  band: Band;
  heaviest: Block | undefined;
}

export function estimate(on: Iterable<BlockId>): Estimate {
  const set = new Set(on);
  const active = blocks.filter((b) => set.has(b.id));
  const kb = active.reduce<number>((sum, b) => sum + b.kb, BASE.kb);
  const requests = active.reduce<number>((sum, b) => sum + b.requests, BASE.requests);
  const lcp = Math.round(active.reduce<number>((sum, b) => sum + b.lcp, BASE.lcp) * 10) / 10;
  const heaviest = [...active].sort((a, b) => b.kb - a.kb)[0];
  return { kb, requests, lcp, band: bandOf(lcp), heaviest };
}

/** Vertical layout of the wireframe: y offset of each flow block (nav first, footer last). */
export function layout(on: Iterable<BlockId>): { y: Partial<Record<BlockId | 'footer', number>>; height: number } {
  const set = new Set(on);
  const y: Partial<Record<BlockId | 'footer', number>> = {};
  let cursor = BASE.nav + BASE.gap;
  for (const b of blocks) {
    if (b.kind !== 'flow') continue;
    y[b.id] = cursor;
    if (set.has(b.id)) cursor += b.height + BASE.gap;
  }
  y.footer = cursor;
  return { y, height: cursor + BASE.footer };
}

export const formatKb = (kb: number): string => (kb >= 1000 ? `${(kb / 1000).toFixed(2)} MB` : `${Math.round(kb)} KB`);
