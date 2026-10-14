/**
 * Hiring-funnel planning model for the RPO hero. Works backwards from the hires you need through
 * stage pass-through rates the visitor sets. The default rates are planning assumptions, shown
 * and labelled as such on the page; they are not Akrostech performance figures.
 */

export type FunnelOwner = 'rpo' | 'you';

export interface FunnelStage {
  id: string;
  label: string;
  owner: FunnelOwner;
  /** What happens at this stage, in one line. */
  note: string;
}

export interface FunnelRate {
  id: string;
  from: string;
  to: string;
  /** Default pass-through, percent. */
  value: number;
}

export const funnelStages: FunnelStage[] = [
  { id: 'sourced', label: 'Sourced', owner: 'rpo', note: 'Profiles found and contacted' },
  { id: 'screened', label: 'Screened', owner: 'rpo', note: 'Phone screens against your scorecard' },
  { id: 'shortlisted', label: 'Shortlisted', owner: 'rpo', note: 'Written notes, ranked for you' },
  { id: 'interviewed', label: 'Interviewed', owner: 'you', note: 'Your team’s interview loop' },
  { id: 'offered', label: 'Offers', owner: 'you', note: 'Your decision; paperwork by the recruiter' },
  { id: 'hired', label: 'Hires', owner: 'you', note: 'Signed offers' },
];

export const funnelRates: FunnelRate[] = [
  { id: 'screen', from: 'Sourced', to: 'screened', value: 30 },
  { id: 'shortlist', from: 'Screened', to: 'shortlisted', value: 40 },
  { id: 'interview', from: 'Shortlisted', to: 'interview', value: 60 },
  { id: 'offer', from: 'Interview', to: 'offer', value: 35 },
  { id: 'accept', from: 'Offer', to: 'accept', value: 80 },
];

export const HIRES = { min: 1, max: 25, default: 5 } as const;
export const RATE = { min: 5, max: 95, step: 5 } as const;

export const clampRate = (v: number): number => Math.min(RATE.max, Math.max(RATE.min, Math.round(v / RATE.step) * RATE.step));

/**
 * Candidates needed at each stage, top of funnel first, so that `hires` offers are accepted.
 * Each earlier stage is rounded up: you cannot interview half a person.
 */
export function planFunnel(hires: number, rates: readonly number[]): number[] {
  const counts: number[] = [Math.max(0, Math.round(hires))];
  for (let i = rates.length - 1; i >= 0; i--) {
    const r = Math.max(1, rates[i] ?? 100) / 100;
    counts.unshift(Math.ceil(counts[0]! / r - 1e-9));
  }
  return counts;
}
