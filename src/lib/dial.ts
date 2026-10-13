/**
 * Geometry for the 24-hour shift dial. Minute 0 (midnight) sits at the top and the day runs
 * clockwise, so noon is at the bottom. Shared by the server render and the browser script.
 */
export const DAY = 1440;

export const R = {
  outer: 250,
  inner: 168,
  outerLabel: 207,
  innerLabel: 132,
  tickIn: 274,
  tickOut: 290,
} as const;

export function polar(minute: number, radius: number): { x: number; y: number } {
  const a = ((minute / DAY) * 360 - 90) * (Math.PI / 180);
  return { x: round(Math.cos(a) * radius), y: round(Math.sin(a) * radius) };
}

const round = (n: number): number => Math.round(n * 100) / 100;

export const wrap = (m: number): number => ((m % DAY) + DAY) % DAY;

/** Stroke-dash values for an arc drawn on a circle with pathLength = DAY, rotated to start at the top. */
export function arcDash(startMinute: number, lengthMinutes: number): { dasharray: string; dashoffset: string } {
  const len = Math.max(0, Math.min(DAY, lengthMinutes));
  return { dasharray: `${len} ${DAY - len}`, dashoffset: String(-wrap(startMinute)) };
}

export function clockLabel(minute: number): string {
  const m = wrap(Math.round(minute));
  const h = Math.floor(m / 60);
  const mm = m % 60;
  const suffix = h < 12 ? 'am' : 'pm';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(mm).padStart(2, '0')} ${suffix}`;
}

export const pad2 = (n: number): string => String(n).padStart(2, '0');
