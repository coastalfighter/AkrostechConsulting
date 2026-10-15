/**
 * Geometry for globe scenes: latitude/longitude to 3D, the sun's direction for an instant,
 * and a great-circle arc lifted off the surface. Pure functions, unit-tested.
 */
import * as THREE from 'three';

/** A point on a sphere of radius `r` (+Y is north, longitude −90° faces +Z). */
export function toVec(lat: number, lon: number, r = 1): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

/** Declination (degrees) and subsolar longitude (degrees) for an instant; accurate to about a degree. */
export function subsolarPoint(date: Date): { lat: number; lon: number } {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const day = (date.getTime() - start) / 86_400_000;
  const lat = -23.44 * Math.cos(((2 * Math.PI) / 365) * (day + 10));
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const lon = THREE.MathUtils.euclideanModulo(-(hours - 12) * 15 + 180, 360) - 180;
  return { lat, lon };
}

/** Unit vector toward the sun in Earth-fixed coordinates for a given instant. */
export function sunDirection(date: Date): THREE.Vector3 {
  const { lat, lon } = subsolarPoint(date);
  return toVec(lat, lon, 1).normalize();
}

/** Shortest path over the globe between two surface points, lifted toward the middle. */
export class GreatArc extends THREE.Curve<THREE.Vector3> {
  private readonly a: THREE.Vector3;
  private readonly b: THREE.Vector3;
  private readonly angle: number;

  constructor(from: THREE.Vector3, to: THREE.Vector3, private readonly radius: number, private readonly lift: number) {
    super();
    this.a = from.clone().normalize();
    this.b = to.clone().normalize();
    this.angle = this.a.angleTo(this.b);
  }

  override getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    const s = Math.sin(this.angle);
    if (s < 1e-6) return target.copy(this.a).multiplyScalar(this.radius + this.lift * Math.sin(Math.PI * t));
    const wa = Math.sin((1 - t) * this.angle) / s;
    const wb = Math.sin(t * this.angle) / s;
    target.copy(this.a).multiplyScalar(wa).addScaledVector(this.b, wb).normalize();
    return target.multiplyScalar(this.radius + this.lift * Math.sin(Math.PI * t));
  }
}
