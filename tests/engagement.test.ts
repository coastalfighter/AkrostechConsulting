import { describe, expect, it } from 'vitest';
import { lengthOf, lengthLabel, unlockPhases } from '@/lib/engagement';
import { work } from '@/data/work';

describe('engagement length', () => {
  it('reads weeks, ongoing and project-then-ongoing durations', () => {
    expect(lengthOf('Ten weeks')).toEqual({ weeks: 10, thenOngoing: false });
    expect(lengthOf('Eight-week project, then ongoing intake')).toEqual({ weeks: 8, thenOngoing: true });
    expect(lengthOf('Ongoing, Pacific hours, seven days')).toEqual({ weeks: null, thenOngoing: false });
    expect(lengthLabel(lengthOf('Twelve weeks'))).toBe('12 weeks');
    expect(lengthLabel(lengthOf('Ongoing, Central hours'))).toBe('Ongoing');
  });

  it('places every blueprint on the board', () => {
    for (const w of work) {
      const len = lengthOf(w.duration);
      const known = len.weeks !== null || w.duration.toLowerCase().startsWith('ongoing');
      expect(known, w.duration).toBe(true);
    }
  });

  it('unlocks deliverables in order across the phases', () => {
    expect(unlockPhases(4, 4)).toEqual([0, 1, 2, 3]);
    expect(unlockPhases(2, 4)).toEqual([0, 2]);
    expect(unlockPhases(6, 3)).toEqual([0, 0, 1, 1, 2, 2]);
  });
});
