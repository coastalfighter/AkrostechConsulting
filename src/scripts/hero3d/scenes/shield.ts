/**
 * Privacy: the vault. Your data is the glossy core, held inside a glass sphere and wrapped by
 * three machined gimbal rings, nested like a real gimbal (each turns on an axis carried by the
 * ring outside it). At rest the rings tumble slowly and the keys on their faces wander apart;
 * every few seconds, and whenever you press, the rings click one after another into the same
 * plane with their keys aligned at the top, like a combination falling into place, hold a
 * moment, then let go. Drag to turn the whole vault.
 */
import * as THREE from 'three';
import { contactShadow, glass, glossy, type HeroScene, type Palette, type SceneContext } from '../engine';

const TAU = Math.PI * 2;
/** Seconds between the vault locking itself while idle, and when the first lock lands. */
const CYCLE = 9;
const FIRST = 5;

/** A flat machined washer in the XY plane, with softened edges. */
function washer(outer: number, inner: number, depth: number, segments: number): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outer, 0, TAU, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, inner, 0, TAU, true);
  shape.holes.push(hole);
  const bevel = Math.min(0.014, depth * 0.3);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: depth - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: segments,
  });
  geo.translate(0, 0, -(depth - bevel * 2) / 2);
  geo.computeVertexNormals();
  return geo;
}

/** Overshooting ease: the ring passes its seat slightly and settles back, which reads as a click. */
function easeOutBack(x: number): number {
  const c1 = 2.2;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}
const smooth = (x: number) => x * x * (3 - 2 * x);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** How locked a ring is, `s` seconds after a lock began (0 = free, 1 = seated). */
function lockWeight(s: number): number {
  if (s < 0) return 0;
  if (s < 0.42) return easeOutBack(s / 0.42);
  if (s < 2.1) return 1;
  return 1 - smooth(clamp01((s - 2.1) / 1.3));
}

interface Ring {
  /** The gimbal frame: turns on its axis inside the ring outside it. */
  frame: THREE.Group;
  /** The ring itself; spins in its own plane (only the inner one does). */
  body: THREE.Group;
  mat: THREE.MeshPhysicalMaterial;
  keyMat: THREE.MeshPhysicalMaterial;
  /** Which colour role this ring plays. */
  role: 'line' | 'mark';
}

export default function shield(ctx: SceneContext): HeroScene {
  const { palette, mobile, rand } = ctx;
  const group = new THREE.Group();
  const seg = mobile ? 72 : 128;

  // The mechanism sits at a three-quarter view so the aligned dial reads as a dial, not a disc.
  const mech = new THREE.Group();
  mech.rotation.set(-0.42, 0.5, 0.06);
  group.add(mech);

  // ---- Core (your data) and the glass that holds it
  const coreMat = glossy(palette.soft, { roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 });
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.5, mobile ? 48 : 64, mobile ? 32 : 48), coreMat);
  mech.add(core);
  // A thin chartreuse equator on the core: the one thing in here that matters.
  const bandMat = new THREE.MeshBasicMaterial({ color: palette.mark, toneMapped: false });
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.503, 0.012, 8, 96), bandMat);
  band.rotation.x = Math.PI / 2;
  core.add(band);

  const shellMat = glass(palette.dark ? palette.lavender : palette.paper, mobile, {
    attenuationColor: palette.lavender,
    attenuationDistance: 3,
    thickness: 0.9,
    roughness: 0.06,
  });
  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.98, mobile ? 48 : 72, mobile ? 32 : 54), shellMat);
  mech.add(shell);

  // ---- Three nested gimbal rings
  const specs = [
    { outer: 1.6, inner: 1.46, depth: 0.075, role: 'line' as const, ticks: mobile ? 48 : 72 },
    { outer: 1.36, inner: 1.285, depth: 0.065, role: 'mark' as const, ticks: 0 },
    { outer: 1.19, inner: 1.1, depth: 0.06, role: 'line' as const, ticks: 24 },
  ];
  const ringColor = (p: Palette, role: Ring['role']) => (role === 'mark' ? p.mark : p.line);
  const keyColor = (p: Palette, role: Ring['role']) => (role === 'mark' ? p.line : p.mark);
  const tickMat = new THREE.MeshBasicMaterial({ color: palette.ground, toneMapped: false });
  const pinMat = glossy(palette.soft, { roughness: 0.2, clearcoat: 1 });

  const rings: Ring[] = [];
  let parent: THREE.Object3D = mech;
  for (const [i, s] of specs.entries()) {
    const frame = new THREE.Group();
    const body = new THREE.Group();
    frame.add(body);
    parent.add(frame);
    parent = frame;

    const mat = glossy(ringColor(palette, s.role), { roughness: 0.26, clearcoat: 1, clearcoatRoughness: 0.12, metalness: s.role === 'line' ? 0.05 : 0 });
    body.add(new THREE.Mesh(washer(s.outer, s.inner, s.depth, seg), mat));

    // Graduations, engraved through both faces near the outer edge.
    if (s.ticks) {
      const tickGeo = new THREE.BoxGeometry(0.008, (s.outer - s.inner) * 0.38, s.depth + 0.004);
      const ticks = new THREE.InstancedMesh(tickGeo, tickMat, s.ticks);
      const m = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const z = new THREE.Vector3(0, 0, 1);
      const pos = new THREE.Vector3();
      for (let k = 0; k < s.ticks; k++) {
        const a = (k / s.ticks) * TAU;
        const major = k % (s.ticks / 12) === 0;
        const r = s.outer - (s.outer - s.inner) * (major ? 0.3 : 0.24);
        pos.set(Math.cos(a) * r, Math.sin(a) * r, 0);
        q.setFromAxisAngle(z, a - Math.PI / 2);
        m.compose(pos, q, new THREE.Vector3(major ? 1.6 : 1, major ? 1.25 : 0.8, 1));
        ticks.setMatrixAt(k, m);
      }
      body.add(ticks);
    }

    // The key: a small block standing on the ring at twelve o'clock.
    const keyMat = glossy(keyColor(palette, s.role), { roughness: 0.22, clearcoat: 1 });
    const w = s.outer - s.inner;
    const key = new THREE.Mesh(new THREE.BoxGeometry(0.1, w + 0.05, s.depth + 0.05, 1, 1, 1), keyMat);
    key.position.set(0, (s.outer + s.inner) / 2, 0);
    body.add(key);

    // Axle pins where this ring hangs inside the one around it.
    if (i > 0) {
      const prev = specs[i - 1]!;
      const axleX = i === 1; // middle ring turns on X inside the outer; inner on Y inside the middle
      for (const side of [-1, 1]) {
        const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, prev.inner - s.outer + 0.06, 16), pinMat);
        const r = (prev.inner + s.outer) / 2;
        if (axleX) {
          pin.rotation.z = Math.PI / 2;
          pin.position.set(side * r, 0, 0);
        } else {
          pin.position.set(0, side * r, 0);
        }
        frame.add(pin);
      }
    }
    rings.push({ frame, body, mat, keyMat, role: s.role });
  }

  const shadow = contactShadow(1.5, palette.dark ? 0.45 : 0.22);
  shadow.position.y = -2.05;
  group.add(shadow);

  // ---- Motion: four free angles (outer about Y, middle about X, inner about Y, inner spin).
  const phase = Array.from({ length: 4 }, () => rand() * TAU);
  const speed = [0.21, 0.33, -0.27, 0.4];
  const idle = new Float64Array(4);
  const target = new Float64Array(4);
  const setIdle = (t: number) => {
    idle[0] = phase[0]! + t * speed[0]!;
    idle[1] = 0.9 * Math.sin(phase[1]! + t * speed[1]!) + 0.35 * Math.sin(t * 0.13);
    idle[2] = phase[2]! + t * speed[2]!;
    idle[3] = phase[3]! + t * speed[3]!;
  };
  // Each angle seats at the nearest position where the rings are coplanar with keys at the top.
  // A half turn of the outer ring about Y keeps its key on top; the others need a full turn.
  const periods = [Math.PI, TAU, Math.PI, TAU];
  let lockStart = -Infinity;
  const coreScale = new THREE.Vector3();

  return {
    object: group,
    camera: { z: 9.6, fov: 32 },
    tilt: 0.26,
    update(t, _dt, input) {
      if (!input.dragging) input.rotY *= 1 - Math.min(1, _dt * 0.6);
      setIdle(t);

      // Which lock is current: the latest press, or the idle cycle.
      const press = Number.isFinite(input.sincePulse) ? t - input.sincePulse : -Infinity;
      const cycle = t >= FIRST ? FIRST + Math.floor((t - FIRST) / CYCLE) * CYCLE : -Infinity;
      const start = Math.max(press, cycle);
      if (start !== lockStart) {
        lockStart = start;
        // Each ring seats at its nearest position, so no ring travels more than half a turn.
        for (let k = 0; k < 4; k++) target[k] = Math.round(idle[k]! / periods[k]!) * periods[k]!;
      }
      const s = t - lockStart;
      // Outer ring seats first, then the middle, then the inner: three clicks.
      const w0 = lockWeight(s);
      const w1 = lockWeight(s - 0.16);
      const w2 = lockWeight(s - 0.32);
      const mix = (k: number, w: number) => idle[k]! + (target[k]! - idle[k]!) * w;
      rings[0]!.frame.rotation.y = mix(0, w0);
      rings[1]!.frame.rotation.x = mix(1, w1);
      rings[2]!.frame.rotation.y = mix(2, w2);
      rings[2]!.body.rotation.z = mix(3, w2);

      // The core answers the last click with a small, quick swell.
      const hit = s - 0.32 - 0.38;
      const swell = hit > 0 && hit < 0.6 ? Math.sin((hit / 0.6) * Math.PI) * Math.exp(-hit * 3) * 0.12 : 0;
      core.scale.copy(coreScale.setScalar(1 + swell + Math.sin(t * 1.3) * 0.012));
      core.rotation.y = t * 0.25;
      mech.position.y = Math.sin(t * 0.6) * 0.04;
    },
    setPalette(p) {
      coreMat.color.copy(p.soft);
      bandMat.color.copy(p.mark);
      shellMat.color.copy(p.dark ? p.lavender : p.paper);
      shellMat.attenuationColor.copy(p.lavender);
      tickMat.color.copy(p.ground);
      pinMat.color.copy(p.soft);
      for (const r of rings) {
        r.mat.color.copy(ringColor(p, r.role));
        r.keyMat.color.copy(keyColor(p, r.role));
      }
      (shadow.material as THREE.MeshBasicMaterial).opacity = p.dark ? 0.45 : 0.22;
    },
  };
}
