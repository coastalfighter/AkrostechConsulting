/**
 * Small geography helpers for the service-area diagrams: great-circle distance, a flat
 * projection for drawing a short stretch of the East Coast, and reading a journey time out of
 * the plain-English "distance" copy in data/locations. Shared by server renders and scripts.
 */

export interface LatLng {
  latitude: number;
  longitude: number;
}

const EARTH_MILES = 3958.8;
const rad = (deg: number): number => (deg * Math.PI) / 180;

/** Great-circle ("as the crow flies") distance in statute miles. */
export function milesBetween(a: LatLng, b: LatLng): number {
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_MILES * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Cumulative miles at each point of a path, starting at 0. */
export function cumulativeMiles(points: LatLng[]): number[] {
  const out: number[] = [];
  let total = 0;
  points.forEach((p, i) => {
    const prev = points[i - 1];
    if (prev) total += milesBetween(prev, p);
    out.push(total);
  });
  return out;
}

export interface Frame {
  /** Bounding box in degrees. */
  west: number;
  east: number;
  south: number;
  north: number;
  /** Target drawing size in SVG units. */
  width: number;
  height: number;
}

/**
 * Equirectangular projection scaled to fit the frame, longitudes shrunk by the cosine of the
 * middle latitude so distances read true at this scale. Returns a projector to SVG units.
 */
export function projector(frame: Frame): (p: LatLng) => { x: number; y: number } {
  const midLat = rad((frame.north + frame.south) / 2);
  const spanX = (frame.east - frame.west) * Math.cos(midLat);
  const spanY = frame.north - frame.south;
  const k = Math.min(frame.width / spanX, frame.height / spanY);
  const offX = (frame.width - spanX * k) / 2;
  const offY = (frame.height - spanY * k) / 2;
  return (p) => ({
    x: Math.round((offX + (p.longitude - frame.west) * Math.cos(midLat) * k) * 10) / 10,
    y: Math.round((offY + (frame.north - p.latitude) * k) * 10) / 10,
  });
}

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  fifteen: 15, twenty: 20, 'twenty-five': 25, thirty: 30, forty: 40, 'forty-five': 45, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90,
};

/**
 * The first journey time written in a sentence, in minutes: "Thirty minutes from Center City",
 * "about 90 minutes from Penn Station", "five minutes from I-95". Null when none is stated.
 */
export function minutesInText(text: string): number | null {
  const m = /\b(\d{1,3}|[a-z]+(?:-[a-z]+)?)\s+minutes?\b/i.exec(text);
  if (!m?.[1]) return null;
  const raw = m[1].toLowerCase();
  const n = /^\d+$/.test(raw) ? Number(raw) : NUMBER_WORDS[raw];
  return n ?? null;
}

/** "1 h 30 min", "45 min", "under 1 min". */
export function formatMinutes(minutes: number): string {
  const m = Math.round(minutes);
  if (m < 1) return 'under 1 min';
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
}

/** "0.4 mi" under ten miles, whole miles above. */
export function formatMiles(miles: number): string {
  if (miles < 10) return `${(Math.round(miles * 10) / 10).toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}
