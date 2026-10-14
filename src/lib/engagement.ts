/**
 * Reading engagement blueprints for the work instruments: the length of an engagement from its
 * duration line, and when each deliverable is unlocked along the approach. Pure functions.
 */

const NUMBERS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
};

export interface EngagementLength {
  /** Fixed length in weeks, or null when the engagement is ongoing from the start. */
  weeks: number | null;
  /** A fixed project that continues as ongoing work afterwards. */
  thenOngoing: boolean;
}

/** "Ten weeks" → 10; "Eight-week project, then ongoing intake" → 8, then ongoing; "Ongoing, …" → null. */
export function lengthOf(duration: string): EngagementLength {
  const d = duration.trim().toLowerCase();
  if (d.startsWith('ongoing')) return { weeks: null, thenOngoing: false };
  const m = d.match(/^([a-z]+|\d+)[-\s]weeks?/);
  const word = m?.[1] ?? '';
  const weeks = NUMBERS[word] ?? Number(word);
  return { weeks: Number.isFinite(weeks) && weeks > 0 ? weeks : null, thenOngoing: d.includes('ongoing') };
}

/** Short label for the end of an engagement track. */
export function lengthLabel(len: EngagementLength): string {
  if (len.weeks === null) return 'Ongoing';
  return len.thenOngoing ? `${len.weeks} weeks, then ongoing` : `${len.weeks} weeks`;
}

/** Phase index (0-based) at which each of `count` deliverables is unlocked across `phases` phases. */
export function unlockPhases(count: number, phases: number): number[] {
  return Array.from({ length: count }, (_, j) => Math.min(phases - 1, Math.floor((j * phases) / Math.max(1, count))));
}
