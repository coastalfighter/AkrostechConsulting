import { describe, expect, it } from 'vitest';
import {
  clampShiftInput,
  formatDuration,
  formatGap,
  gapMinutes,
  indiaHoursForClientDay,
  planShift,
  wallClock,
  zonedTimeToUtc,
  zoneOffsetMinutes,
} from '@/lib/time';

describe('zone offsets', () => {
  it('reads IST as +5:30 all year', () => {
    expect(zoneOffsetMinutes('Asia/Kolkata', new Date('2026-01-15T12:00:00Z'))).toBe(330);
    expect(zoneOffsetMinutes('Asia/Kolkata', new Date('2026-07-15T12:00:00Z'))).toBe(330);
  });

  it('follows U.S. daylight saving', () => {
    expect(zoneOffsetMinutes('America/New_York', new Date('2026-01-15T12:00:00Z'))).toBe(-300);
    expect(zoneOffsetMinutes('America/New_York', new Date('2026-07-15T12:00:00Z'))).toBe(-240);
  });

  it('computes the India gap for each season', () => {
    expect(gapMinutes('America/New_York', new Date('2026-01-15T12:00:00Z'))).toBe(630);
    expect(gapMinutes('America/New_York', new Date('2026-07-15T12:00:00Z'))).toBe(570);
    expect(gapMinutes('America/Los_Angeles', new Date('2026-07-15T12:00:00Z'))).toBe(750);
  });
});

describe('zonedTimeToUtc', () => {
  it('round-trips a wall-clock time', () => {
    const instant = zonedTimeToUtc('America/Chicago', 2026, 3, 9, 9, 30);
    const w = wallClock('America/Chicago', instant);
    expect([w.year, w.month, w.day, w.hour, w.minute]).toEqual([2026, 3, 9, 9, 30]);
  });

  it('handles the day after spring-forward', () => {
    const instant = zonedTimeToUtc('America/New_York', 2026, 3, 9, 9, 0);
    expect(instant.toISOString()).toBe('2026-03-09T13:00:00.000Z');
  });
});

describe('planShift', () => {
  // Wednesday 14 Jan 2026, 10:00 ET (EST, UTC-5)
  const midShift = new Date('2026-01-14T15:00:00Z');

  it('mirrors a 9-to-5 Eastern day into the India evening', () => {
    const plan = planShift({ clientZone: 'America/New_York', startHour: 9, hours: 8, now: midShift });
    expect(plan.onShift).toBe(true);
    expect(plan.indiaStartLabel).toBe('7:30 pm');
    expect(plan.indiaEndLabel).toBe('3:30 am');
    expect(plan.indiaCrossesMidnight).toBe(true);
    expect(plan.gap).toBe('+10h 30m');
    expect(plan.minutesToChange).toBe(7 * 60);
  });

  it('points to the next workday when the shift is over', () => {
    // Friday 16 Jan 2026, 20:00 ET → next shift Monday
    const plan = planShift({ clientZone: 'America/New_York', startHour: 9, hours: 8, now: new Date('2026-01-17T01:00:00Z') });
    expect(plan.onShift).toBe(false);
    expect(plan.nextShiftDay).toBe('Mon');
    expect(plan.clientStart.toISOString()).toBe('2026-01-19T14:00:00.000Z');
  });

  it('shifts by an hour in summer', () => {
    const plan = planShift({ clientZone: 'America/New_York', startHour: 9, hours: 8, now: new Date('2026-07-15T15:00:00Z') });
    expect(plan.indiaStartLabel).toBe('6:30 pm');
  });

  it('clamps invalid input instead of throwing', () => {
    const clamped = clampShiftInput({ clientZone: 'Mars/Olympus', startHour: 99, hours: -4, startMinute: 7, now: midShift });
    expect(clamped).toMatchObject({ clientZone: 'America/New_York', startHour: 23, hours: 1, startMinute: 0 });
    expect(() => planShift({ clientZone: 'Mars/Olympus', startHour: Number.NaN, hours: Number.NaN, now: midShift })).not.toThrow();
  });
});

describe('formatting helpers', () => {
  it('formats gaps and durations', () => {
    expect(formatGap(570)).toBe('+9h 30m');
    expect(formatGap(-60)).toBe('-1h');
    expect(formatDuration(45)).toBe('45 min');
    expect(formatDuration(150)).toBe('2 h 30 min');
    expect(formatDuration(60 * 27)).toBe('1 d 3 h');
  });

  it('maps 24 client hours into India hours', () => {
    const hours = indiaHoursForClientDay('America/New_York', new Date('2026-01-14T15:00:00Z'));
    expect(hours).toHaveLength(24);
    expect(hours[9]).toBe(19);
  });
});
