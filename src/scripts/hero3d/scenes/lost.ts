/**
 * 404: lost and found. A "404" built from glossy rounded voxels, two deep. It holds its shape,
 * then the voxels come loose and drift apart into space, turning slowly, and find their way
 * back one by one until the number is whole again. Three chartreuse voxels are the pieces that
 * always wander furthest and come home last. A press scatters everything from where it lands;
 * the pieces spring back into place.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { contactShadow, glossy, type HeroScene, type Palette, type SceneContext } from '../engine';

/** 5×7 glyphs, top row first. */
const FOUR = ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'];
const ZERO = ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'];
const GLYPHS = [FOUR, ZERO, FOUR];
const PITCH = 0.2;
const SIZE = 0.178;
const DEPTH = 2;
/** Seconds per lost-and-found cycle. */
const CYCLE = 11;

const smooth = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

interface Voxel {
  home: THREE.Vector3;
  away: THREE.Vector3;
  spin: THREE.Euler;
  /** Stagger in the cycle, 0…1. */
  delay: number;
  lost: boolean;
  /** Press offset with velocity (spring back home). */
  off: THREE.Vector3;
  vel: THREE.Vector3;
}

export default function lost(ctx: SceneContext): HeroScene {
  const { palette, mobile, rand, camera } = ctx;
  const group = new THREE.Group();
  const body = new THREE.Group();
  body.rotation.set(0.12, -0.32, 0);
  group.add(body);

  // ---- Lay out the voxels
  const cols = GLYPHS.length * 5 + (GLYPHS.length - 1) * 1;
  const voxels: Voxel[] = [];
  for (const [g, glyph] of GLYPHS.entries()) {
    for (const [r, row] of glyph.entries()) {
      for (let c = 0; c < row.length; c++) {
        if (row[c] !== '#') continue;
        for (let z = 0; z < DEPTH; z++) {
          const col = g * 6 + c;
          const home = new THREE.Vector3((col - (cols - 1) / 2) * PITCH, (3 - r) * PITCH, (z - (DEPTH - 1) / 2) * PITCH);
          // Drift outward from the middle of the number, with plenty of depth.
          const dir = new THREE.Vector3(home.x * 0.6 + (rand() - 0.5) * 1.6, home.y * 0.9 + (rand() - 0.5) * 1.4, (rand() - 0.5) * 2.4).normalize();
          const dist = 0.5 + rand() * 1.1;
          voxels.push({
            home,
            away: home.clone().addScaledVector(dir, dist),
            spin: new THREE.Euler((rand() - 0.5) * 3, (rand() - 0.5) * 3, (rand() - 0.5) * 3),
            delay: rand(),
            lost: false,
            off: new THREE.Vector3(),
            vel: new THREE.Vector3(),
          });
        }
      }
    }
  }
  // The lost pieces: front-face voxels at telling spots (the 0's shoulder, each 4's foot).
  const pick = (x: number, y: number) => {
    let best = 0;
    let bd = Infinity;
    for (const [i, v] of voxels.entries()) {
      if (v.home.z < 0) continue;
      const dd = (v.home.x - x) ** 2 + (v.home.y - y) ** 2;
      if (dd < bd) {
        bd = dd;
        best = i;
      }
    }
    return best;
  };
  for (const i of [pick(0.4, 0.6), pick(-1.0, -0.6), pick(1.4, -0.6)]) {
    const v = voxels[i]!;
    v.lost = true;
    v.away.sub(v.home).setLength(1.25 + rand() * 0.3).add(v.home);
  }

  const count = voxels.length;
  const geo = new RoundedBoxGeometry(SIZE, SIZE, SIZE, mobile ? 2 : 3, 0.035);
  const mat = glossy(new THREE.Color(0xffffff), { roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.12 });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  body.add(mesh);

  const paint = (p: Palette) => {
    for (const [i, v] of voxels.entries()) {
      // Front layer in surface, back layer in the soft accent: the number reads as a solid.
      const c = v.lost ? p.mark : v.home.z > 0 ? (p.dark ? p.lavender : p.surface) : p.dark ? p.violet : p.soft;
      mesh.setColorAt(i, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  };
  paint(palette);

  const shadow = contactShadow(2.2, palette.dark ? 0.42 : 0.2);
  shadow.scale.set(1.3, 0.6, 1);
  shadow.position.y = -1.35;
  group.add(shadow);

  // ---- Press: find where it landed on the number's plane
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const origin = new THREE.Vector3();
  const inv = new THREE.Matrix4();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3();
  let pressAt = -1;

  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const pos = new THREE.Vector3();
  const scl = new THREE.Vector3();
  const push = new THREE.Vector3();

  return {
    object: group,
    camera: { z: 8.6, fov: 32 },
    tilt: 0.3,
    update(t, dt, input) {
      if (!input.dragging) input.rotY += (0 - input.rotY) * (1 - Math.pow(0.5, dt));

      const s = input.sincePulse;
      if (Number.isFinite(s) && pressAt !== t - s) {
        pressAt = t - s;
        group.updateMatrixWorld(true);
        origin.set(0, 0, 0).project(camera);
        ndc.set(input.pulseX + origin.x, input.pulseY + origin.y);
        ray.setFromCamera(ndc, camera);
        ray.ray.applyMatrix4(inv.copy(body.matrixWorld).invert());
        if (!ray.ray.intersectPlane(plane, hit)) hit.set(0, 0, 0);
        for (const v of voxels) {
          push.copy(v.home).sub(hit);
          const dd = push.length();
          push.z += (v.home.z >= 0 ? 0.6 : -0.6) + (rand() - 0.5) * 0.4;
          push.normalize().multiplyScalar((5.5 / (0.6 + dd)) * (0.7 + rand() * 0.6));
          v.vel.add(push);
        }
      }

      // Cycle: whole (0.22–0.4), drifting apart (0.4–0.6), adrift, finding home (0.68–1).
      // The lost pieces leave first (0.3) and only make it home at the start of the next cycle.
      const ph = (t / CYCLE + 0.913) % 1;
      const k = dt > 0 ? dt : 0;
      for (const [i, v] of voxels.entries()) {
        let a: number;
        if (v.lost) a = ph < 0.3 ? 1 - smooth((ph - v.delay * 0.04) / 0.22) : smooth((ph - 0.3) / 0.15);
        else a = smooth((ph - 0.4 - v.delay * 0.12) / 0.18) * (1 - smooth((ph - 0.68 - v.delay * 0.16) / 0.14));
        // Spring the press offset back to zero.
        if (k > 0) {
          v.vel.addScaledVector(v.off, -26 * k);
          v.vel.multiplyScalar(Math.exp(-4.2 * k));
          v.off.addScaledVector(v.vel, k);
        }
        const float = a * 0.06;
        pos.copy(v.home).lerp(v.away, a).add(v.off);
        pos.x += Math.sin(t * 0.7 + i) * float;
        pos.y += Math.cos(t * 0.6 + i * 1.3) * float + Math.sin(t * 0.8 + v.home.x * 0.8) * 0.025;
        const spinAmt = a + Math.min(1, v.off.length() * 0.6);
        e.set(v.spin.x * spinAmt, v.spin.y * spinAmt, v.spin.z * spinAmt);
        q.setFromEuler(e);
        scl.setScalar(1 - a * 0.12);
        m.compose(pos, q, scl);
        mesh.setMatrixAt(i, m);
      }
      mesh.instanceMatrix.needsUpdate = true;
    },
    setPalette(p) {
      paint(p);
      (shadow.material as THREE.MeshBasicMaterial).opacity = p.dark ? 0.42 : 0.2;
    },
  };
}
