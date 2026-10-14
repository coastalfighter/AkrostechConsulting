import { describe, expect, it } from 'vitest';
import { cumulativeMiles, formatMiles, formatMinutes, milesBetween, minutesInText, projector } from '@/lib/geo';
import { locations } from '@/data/locations';
import { routes } from '@/data/routes';

describe('distances', () => {
  it('measures Philadelphia to New York at roughly 80 miles', () => {
    const d = milesBetween({ latitude: 39.9526, longitude: -75.1652 }, { latitude: 40.7128, longitude: -74.006 });
    expect(d).toBeGreaterThan(75);
    expect(d).toBeLessThan(85);
  });
  it('accumulates along a path', () => {
    const pts = [
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 1 },
      { latitude: 0, longitude: 2 },
    ];
    const c = cumulativeMiles(pts);
    expect(c[0]).toBe(0);
    expect(c[2]).toBeCloseTo((c[1] ?? 0) * 2, 5);
  });
});

describe('projection', () => {
  it('puts north at the top and east on the right', () => {
    const p = projector({ west: -76, east: -74, south: 39, north: 41, width: 800, height: 600 });
    const sw = p({ latitude: 39, longitude: -76 });
    const ne = p({ latitude: 41, longitude: -74 });
    expect(ne.x).toBeGreaterThan(sw.x);
    expect(ne.y).toBeLessThan(sw.y);
  });
});

describe('journey time in copy', () => {
  it('reads words and digits', () => {
    expect(minutesInText('Thirty minutes from Center City')).toBe(30);
    expect(minutesInText('about 90 minutes from Penn Station')).toBe(90);
    expect(minutesInText('five minutes from I-95 exit 7')).toBe(5);
    expect(minutesInText('a short ride')).toBeNull();
  });
  it('finds a time in every location and a route for every location', () => {
    locations.forEach((l) => {
      expect(minutesInText(l.distance)).toBeGreaterThan(0);
      expect(routes[l.slug]?.waypoints.length).toBeGreaterThanOrEqual(3);
    });
  });
  it('formats', () => {
    expect(formatMinutes(90)).toBe('1 h 30 min');
    expect(formatMinutes(0.2)).toBe('under 1 min');
    expect(formatMiles(1.44)).toBe('1.4 mi');
    expect(formatMiles(62.4)).toBe('62 mi');
  });
});
