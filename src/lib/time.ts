/**
 * Time-zone maths for the shift planner: given a U.S. client's working day, work out the
 * matching shift in India and whether that shift is live right now.
 *
 * Pure functions over Intl so they run identically in the browser, at build time and in tests.
 * India does not observe daylight saving; the U.S. does, so the gap moves twice a year and
 * everything here is computed for a concrete instant rather than from a fixed offset.
 */

export const INDIA_ZONE = 'Asia/Kolkata';

export const US_ZONES = [
  { id: 'America/New_York', short: 'ET', label: 'Eastern' },
  { id: 'America/Chicago', short: 'CT', label: 'Central' },
  { id: 'America/Denver', short: 'MT', label: 'Mountain' },
  { id: 'America/Los_Angeles', short: 'PT', label: 'Pacific' },
] as const;

export type UsZoneId = (typeof US_ZONES)[number]['id'];

export interface WallClock {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number; // 0-23
  minute: number;
  /** 0 = Sunday … 6 = Saturday */
  weekday: number;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const partsCache = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(timeZone: string): Intl.DateTimeFormat {
  let fmt = partsCache.get(timeZone);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      weekday: 'short',
    });
    partsCache.set(timeZone, fmt);
  }
  return fmt;
}

/** Wall-clock reading of `date` in `timeZone`. */
export function wallClock(timeZone: string, date: Date): WallClock {
  const parts = partsFormatter(timeZone).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes): string => parts.find((p) => p.type === type)?.value ?? '';
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    hour: Number(get('hour')) % 24,
    minute: Number(get('minute')),
    weekday: WEEKDAYS.indexOf(get('weekday')),
  };
}

/** Offset of `timeZone` from UTC at `date`, in minutes (e.g. -240 for EDT, 330 for IST). */
export function zoneOffsetMinutes(timeZone: string, date: Date): number {
  const w = wallClock(timeZone, date);
  const asUtc = Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute);
  const truncated = Math.floor(date.getTime() / 60000) * 60000;
  return Math.round((asUtc - truncated) / 60000);
}

/** The instant at which the wall clock in `timeZone` reads the given local time. */
export function zonedTimeToUtc(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0,
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  // Two passes settle the offset even when the guess lands on the other side of a DST change.
  let offset = zoneOffsetMinutes(timeZone, new Date(guess));
  let result = guess - offset * 60000;
  const second = zoneOffsetMinutes(timeZone, new Date(result));
  if (second !== offset) {
    offset = second;
    result = guess - offset * 60000;
  }
  return new Date(result);
}

/** Signed difference between two zones at `date`, in minutes (India minus client). */
export function gapMinutes(clientZone: string, date: Date, otherZone = INDIA_ZONE): number {
  return zoneOffsetMinutes(otherZone, date) - zoneOffsetMinutes(clientZone, date);
}

export function formatGap(minutes: number): string {
  const sign = minutes < 0 ? '-' : '+';
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return m ? `${sign}${h}h ${m}m` : `${sign}${h}h`;
}

export function formatClock(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', minute: '2-digit', hour12: true })
    .format(date)
    .replace(/ /g, ' ')
    .toLowerCase();
}

export function formatDuration(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (h < 24) return rest ? `${h} h ${rest} min` : `${h} h`;
  const d = Math.floor(h / 24);
  const hh = h % 24;
  return hh ? `${d} d ${hh} h` : `${d} d`;
}

export interface ShiftInput {
  clientZone: string;
  /** Start of the client's working day, local hour 0-23. */
  startHour: number;
  startMinute?: number;
  /** Length of the shift in hours, 1-12. */
  hours: number;
  now: Date;
}

export interface ShiftPlan {
  clientStart: Date;
  clientEnd: Date;
  clientStartLabel: string;
  clientEndLabel: string;
  indiaStartLabel: string;
  indiaEndLabel: string;
  /** True when the India shift runs past local midnight. */
  indiaCrossesMidnight: boolean;
  gap: string;
  gapMinutes: number;
  onShift: boolean;
  /** When the current state flips (shift starts or ends). */
  nextChange: Date;
  minutesToChange: number;
  /** Client-zone weekday the next shift starts on, e.g. "Mon". */
  nextShiftDay: string;
}

const isWorkday = (weekday: number): boolean => weekday >= 1 && weekday <= 5;

function addDays(w: Pick<WallClock, 'year' | 'month' | 'day'>, days: number): { year: number; month: number; day: number } {
  const d = new Date(Date.UTC(w.year, w.month - 1, w.day + days));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

export function clampShiftInput(input: ShiftInput): Required<ShiftInput> {
  const startHour = Math.min(23, Math.max(0, Math.trunc(Number.isFinite(input.startHour) ? input.startHour : 9)));
  const startMinute = [0, 15, 30, 45].includes(input.startMinute ?? 0) ? (input.startMinute ?? 0) : 0;
  const hours = Math.min(12, Math.max(1, Math.trunc(Number.isFinite(input.hours) ? input.hours : 8)));
  const zoneOk = US_ZONES.some((z) => z.id === input.clientZone) || input.clientZone === INDIA_ZONE;
  return {
    clientZone: zoneOk ? input.clientZone : US_ZONES[0].id,
    startHour,
    startMinute,
    hours,
    now: input.now,
  };
}

/**
 * Plan the India shift that mirrors a U.S. working day, Monday to Friday in the client's zone.
 * Picks the shift that is running now, or else the next one to start.
 */
export function planShift(raw: ShiftInput): ShiftPlan {
  const input = clampShiftInput(raw);
  const { clientZone, startHour, startMinute, hours, now } = input;
  const today = wallClock(clientZone, now);

  let current: { start: Date; end: Date } | null = null;
  let upcoming: { start: Date; end: Date; weekday: number } | null = null;

  // Look back one day (a late shift may still be running) and forward a week.
  for (let offset = -1; offset <= 7 && !upcoming; offset++) {
    const day = addDays(today, offset);
    const weekday = new Date(Date.UTC(day.year, day.month - 1, day.day)).getUTCDay();
    if (!isWorkday(weekday)) continue;
    const start = zonedTimeToUtc(clientZone, day.year, day.month, day.day, startHour, startMinute);
    const end = new Date(start.getTime() + hours * 3_600_000);
    if (now >= start && now < end) current = { start, end };
    else if (start > now) upcoming = { start, end, weekday };
  }

  const shift = current ?? upcoming;
  if (!shift) throw new Error('No workday found in the coming week');

  const indiaStart = wallClock(INDIA_ZONE, shift.start);
  const indiaEnd = wallClock(INDIA_ZONE, shift.end);
  const gap = gapMinutes(clientZone, shift.start);
  const nextChange = current ? current.end : shift.start;

  return {
    clientStart: shift.start,
    clientEnd: shift.end,
    clientStartLabel: formatClock(shift.start, clientZone),
    clientEndLabel: formatClock(shift.end, clientZone),
    indiaStartLabel: formatClock(shift.start, INDIA_ZONE),
    indiaEndLabel: formatClock(shift.end, INDIA_ZONE),
    indiaCrossesMidnight: indiaStart.day !== indiaEnd.day,
    gap: formatGap(gap),
    gapMinutes: gap,
    onShift: current !== null,
    nextChange,
    minutesToChange: Math.max(0, Math.round((nextChange.getTime() - now.getTime()) / 60000)),
    nextShiftDay: WEEKDAYS[wallClock(clientZone, shift.start).weekday] ?? 'Mon',
  };
}

/** Hour (0-23) of each of the 24 client hours as read in India, for the 24-cell band. */
export function indiaHoursForClientDay(clientZone: string, now: Date): number[] {
  const today = wallClock(clientZone, now);
  return Array.from({ length: 24 }, (_, h) => {
    const instant = zonedTimeToUtc(clientZone, today.year, today.month, today.day, h, 0);
    return wallClock(INDIA_ZONE, instant).hour;
  });
}
