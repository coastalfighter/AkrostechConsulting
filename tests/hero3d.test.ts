import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { GreatArc, subsolarPoint, sunDirection, toVec } from '@/scripts/hero3d/geo';
import { seededRandom } from '@/scripts/hero3d/engine';
import land from '@/scripts/hero3d/land.json';

describe('toVec', () => {
  it('puts the poles on the Y axis and keeps the radius', () => {
    expect(toVec(90, 0, 2).y).toBeCloseTo(2);
    expect(toVec(-90, 45).y).toBeCloseTo(-1);
    expect(toVec(12, -140, 3).length()).toBeCloseTo(3);
  });
  it('faces longitude -90 toward +Z and the prime meridian toward +X', () => {
    expect(toVec(0, -90).z).toBeCloseTo(1);
    expect(toVec(0, 0).x).toBeCloseTo(1);
  });
});

describe('subsolarPoint', () => {
  it('is over the prime meridian at noon UTC', () => {
    expect(subsolarPoint(new Date(Date.UTC(2026, 2, 20, 12))).lon).toBeCloseTo(0, 5);
  });
  it('is over the tropics at the solstices and the equator at the equinox', () => {
    expect(subsolarPoint(new Date(Date.UTC(2026, 5, 21, 12))).lat).toBeGreaterThan(23);
    expect(subsolarPoint(new Date(Date.UTC(2026, 11, 21, 12))).lat).toBeLessThan(-23);
    expect(Math.abs(subsolarPoint(new Date(Date.UTC(2026, 2, 20, 12))).lat)).toBeLessThan(1.5);
  });
  it('keeps longitude within -180..180', () => {
    for (let h = 0; h < 24; h++) {
      const { lon } = subsolarPoint(new Date(Date.UTC(2026, 0, 1, h)));
      expect(lon).toBeGreaterThanOrEqual(-180);
      expect(lon).toBeLessThan(180);
    }
  });
  it('gives a unit sun vector that lights the subsolar point', () => {
    const d = new Date(Date.UTC(2026, 9, 15, 17, 30));
    const { lat, lon } = subsolarPoint(d);
    const sun = sunDirection(d);
    expect(sun.length()).toBeCloseTo(1);
    expect(sun.dot(toVec(lat, lon))).toBeCloseTo(1);
  });
});

describe('GreatArc', () => {
  const a = toVec(39.75, -75.56, 1.5);
  const b = toVec(21.15, 79.09, 1.5);
  const arc = new GreatArc(a, b, 1.5, 0.45);
  it('starts and ends on the surface points', () => {
    expect(arc.getPoint(0).distanceTo(a)).toBeLessThan(1e-6);
    expect(arc.getPoint(1).distanceTo(b)).toBeLessThan(1e-6);
  });
  it('rises to radius + lift at the middle and never dips below the surface', () => {
    expect(arc.getPoint(0.5).length()).toBeCloseTo(1.95);
    for (let t = 0; t <= 1; t += 0.05) expect(arc.getPoint(t).length()).toBeGreaterThanOrEqual(1.5 - 1e-9);
  });
  it('handles coincident points', () => {
    const p = new GreatArc(a, a.clone(), 1.5, 0.2).getPoint(0.5, new THREE.Vector3());
    expect(Number.isFinite(p.x)).toBe(true);
  });
});

describe('seededRandom', () => {
  it('is deterministic per seed and stays in [0, 1)', () => {
    const r1 = seededRandom('pages:hiring-guide');
    const r2 = seededRandom('pages:hiring-guide');
    const r3 = seededRandom('pages:other');
    const a = Array.from({ length: 50 }, r1);
    expect(Array.from({ length: 50 }, r2)).toEqual(a);
    expect(Array.from({ length: 50 }, r3)).not.toEqual(a);
    for (const v of a) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('land dots', () => {
  it('holds valid latitude/longitude pairs (tenths of a degree)', () => {
    expect(land.length % 2).toBe(0);
    expect(land.length / 2).toBeGreaterThan(5000);
    for (let i = 0; i < land.length; i += 2) {
      expect(Math.abs(land[i]!)).toBeLessThanOrEqual(900);
      expect(Math.abs(land[i + 1]!)).toBeLessThanOrEqual(1800);
    }
  });
});
