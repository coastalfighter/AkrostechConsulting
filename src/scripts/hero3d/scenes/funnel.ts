/**
 * Recruitment: the funnel. Candidates (small glossy spheres in the soft palette) pour in over
 * the rim of a glass funnel, spiral down its wall, slowing and narrowing as they go; most are
 * screened out before the neck. The few who make it through turn chartreuse, drop from the
 * spout and come to rest in the dish below: the shortlist. A press pours in a new batch.
 */
import * as THREE from 'three';
import type { HeroScene, Palette, SceneContext } from '../engine';
import { contactShadow, glass, glossy } from '../engine';

const MOUTH_Y = 1.0;
const MOUTH_R = 1.25;
const NECK_Y = -0.55;
const NECK_R = 0.13;
const SPOUT_Y = -1.0;
const DISH_Y = -1.62;
const BEAD = 0.05;

/** Funnel wall radius at height y: a flared, trumpet-like profile into a straight spout. */
function wall(y: number): number {
  if (y <= NECK_Y) return NECK_R - (NECK_Y - y) * 0.03;
  const s = Math.min(1, (y - NECK_Y) / (MOUTH_Y - NECK_Y));
  return NECK_R + (MOUTH_R - NECK_R) * Math.pow(s, 1.7);
}

const smooth = (a: number, b: number, x: number) => {
  const u = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return u * u * (3 - 2 * u);
};

interface Candidate {
  a0: number;
  rf: number;
  period: number;
  phase: number;
  chosen: boolean;
  tone: number;
  spin: number;
  drop: number;
  spot: number;
  /** For the batch: delay after the press before this one is poured. */
  delay: number;
  batch: boolean;
}

export default function funnel(ctx: SceneContext): HeroScene {
  const { palette, mobile, rand } = ctx;
  const group = new THREE.Group();
  const rig = new THREE.Group();
  // Tip the mouth toward the viewer so the spiral inside reads.
  rig.rotation.set(0.34, 0, 0.04);
  group.add(rig);
  group.scale.setScalar(0.9);

  // ---- The glass funnel
  const pts: THREE.Vector2[] = [];
  const steps = mobile ? 40 : 64;
  for (let i = 0; i <= steps; i++) {
    const y = SPOUT_Y + ((MOUTH_Y - SPOUT_Y) * i) / steps;
    pts.push(new THREE.Vector2(wall(y), y));
  }
  const funnelGeo = new THREE.LatheGeometry(pts, mobile ? 64 : 112);
  const glassMat = glass(palette.soft.clone().lerp(palette.paper, 0.55), mobile, { side: THREE.DoubleSide, thickness: 0.18 });
  const shell = new THREE.Mesh(funnelGeo, glassMat);
  rig.add(shell);

  // Fresnel edge so the glass silhouette reads on both grounds.
  const edgeMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: palette.line.clone() }, uStrength: { value: palette.dark ? 0.55 : 0.42 } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() { vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uStrength; varying vec3 vN; varying vec3 vV;
      void main() {
        float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 3.0) * uStrength;
        gl_FragColor = vec4(uColor, f);
        #include <colorspace_fragment>
      }`,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
  });
  const edge = new THREE.Mesh(funnelGeo, edgeMat);
  edge.renderOrder = 2;
  rig.add(edge);

  const rimTone = (p: Palette, out: THREE.Color) => (p.dark ? out.copy(p.paper) : out.copy(p.ink));
  const rimMat = glossy(rimTone(palette, new THREE.Color()), { roughness: 0.25, clearcoat: 1 });
  const rim = new THREE.Mesh(new THREE.TorusGeometry(MOUTH_R, 0.02, 12, mobile ? 96 : 160), rimMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = MOUTH_Y;
  rig.add(rim);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(wall(SPOUT_Y), 0.014, 10, 40), rimMat);
  lip.rotation.x = Math.PI / 2;
  lip.position.y = SPOUT_Y;
  rig.add(lip);

  // ---- The dish: where the shortlist lands
  const dishTone = (p: Palette, out: THREE.Color) => (p.dark ? out.copy(p.ink).lerp(p.paper, 0.22) : out.copy(p.surface));
  const dishMat = glossy(dishTone(palette, new THREE.Color()), { roughness: 0.3, clearcoat: 1 });
  const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.33, 0.05, mobile ? 48 : 72), dishMat);
  dish.position.y = DISH_Y - 0.025;
  rig.add(dish);
  const shadow = contactShadow(0.7, palette.dark ? 0.55 : 0.28);
  shadow.position.y = DISH_Y - 0.06;
  rig.add(shadow);

  // ---- Candidates
  const NS = mobile ? 96 : 150;
  const NB = mobile ? 44 : 72;
  const people: Candidate[] = [];
  const chosenEvery = Math.round(NS / 8);
  for (let i = 0; i < NS + NB; i++) {
    const batch = i >= NS;
    const k = batch ? i - NS : i;
    const chosen = batch ? k % Math.round(NB / 4) === 3 : k % chosenEvery === 5;
    const r = rand();
    people.push({
      a0: rand() * Math.PI * 2,
      rf: 0.32 + rand() * 0.55,
      period: batch ? 5.2 + rand() * 0.8 : 7 + rand() * 1.4,
      phase: batch ? 0 : (k / NS) * 8 + rand() * 0.6,
      chosen,
      tone: r < 0.46 ? 0 : r < 0.8 ? 1 : 2,
      spin: 2.4 + rand() * 1.4,
      drop: 1.5 + rand() * 0.4,
      spot: 0,
      delay: batch ? (k / NB) * 0.9 + rand() * 0.1 : 0,
      batch,
    });
  }
  // Each chosen candidate has its own place in the dish.
  let spot = 0;
  for (const c of people) if (c.chosen) c.spot = spot++;
  const spots = Math.max(1, spot);

  const beadMat = glossy(new THREE.Color(1, 1, 1), { roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.12 });
  const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(BEAD, mobile ? 12 : 18, mobile ? 9 : 14), beadMat, people.length);
  beads.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  rig.add(beads);

  const tones = [new THREE.Color(), new THREE.Color(), new THREE.Color()];
  const markColor = new THREE.Color();
  const col = new THREE.Color();
  const setTones = (p: Palette) => {
    tones[0]!.copy(p.soft);
    tones[1]!.copy(p.dark ? p.paper : p.surface);
    tones[2]!.copy(p.dark ? p.lavender : p.ink);
    markColor.copy(p.mark);
    for (let i = 0; i < people.length; i++) beads.setColorAt(i, tones[people[i]!.tone]!);
    if (beads.instanceColor) beads.instanceColor.needsUpdate = true;
  };
  setTones(palette);

  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  const scl = new THREE.Vector3();

  /**
   * Where a candidate is at path position u (0…1). Writes pos, returns scale and how far it
   * has turned chartreuse (0…1).
   */
  const place = (c: Candidate, u: number, t: number): [number, number] => {
    // Timeline: in over the rim, down the wall, and (for the chosen) out of the spout and into the dish.
    const fallEnd = c.chosen ? 0.1 : 0.12;
    const wallEnd = c.chosen ? 0.6 : 0.9;
    if (u < fallEnd) {
      const s = u / fallEnd;
      const y = MOUTH_Y + 0.95 * (1 - s * s) + 0.02;
      const r = MOUTH_R * c.rf * 0.9;
      pos.set(Math.cos(c.a0) * r, y, Math.sin(c.a0) * r);
      return [smooth(0, 0.35, s), 0];
    }
    if (u < wallEnd) {
      const s = (u - fallEnd) / (wallEnd - fallEnd);
      // Fast at the rim, slowing as it narrows.
      const p = 1 - Math.pow(1 - s, 2.1);
      const y = MOUTH_Y - 0.02 - (MOUTH_Y - 0.02 - (NECK_Y + 0.06)) * p;
      const lane = c.chosen ? c.rf * (1 - smooth(0.6, 1, p)) : c.rf;
      const r = Math.max(0, wall(y) - BEAD * 1.4) * lane;
      const a = c.a0 + c.spin * p * (1 + 1.6 * p);
      pos.set(Math.cos(a) * r, y, Math.sin(a) * r);
      if (c.chosen) return [1.08, smooth(0.55, 1, p)];
      // Screened out before the neck.
      return [1 - smooth(0.7, 0.98, p), 0];
    }
    if (!c.chosen) return [0, 0];
    const dropEnd = wallEnd + 0.07;
    const angle = (c.spot / spots) * Math.PI * 2 + 0.4;
    const restR = c.spot % 2 === 0 ? 0.13 : 0.24;
    const rx = Math.cos(angle) * restR;
    const rz = Math.sin(angle) * restR;
    if (u < dropEnd) {
      const s = (u - wallEnd) / (dropEnd - wallEnd);
      const y = NECK_Y + 0.06 + (DISH_Y + BEAD - (NECK_Y + 0.06)) * s * s;
      const k = smooth(0.55, 1, s);
      pos.set(rx * k, y, rz * k);
      return [1.08, 1];
    }
    // Resting in the dish with a small settle, then gone as the next shortlist forms.
    const s = (u - dropEnd) / (1 - dropEnd);
    const settle = Math.exp(-s * 40) * Math.sin(s * 90) * 0.02;
    pos.set(rx, DISH_Y + BEAD * 1.08 + Math.max(0, settle) + Math.sin(t * 2 + c.a0) * 0.002, rz);
    return [1.08 * (1 - smooth(0.9, 1, s)), 1];
  };

  return {
    object: group,
    camera: { z: 9.0, y: 0.05, fov: 32 },
    tilt: 0.22,
    update(t, _dt, input) {
      if (!input.dragging) input.rotY += (0 - input.rotY) * (1 - Math.pow(0.6, _dt));
      rig.position.y = Math.sin(t * 0.45) * 0.03;
      let colorDirty = false;
      for (let i = 0; i < people.length; i++) {
        const c = people[i]!;
        let u: number;
        if (c.batch) {
          const since = input.sincePulse - c.delay;
          u = since >= 0 && since < c.period ? since / c.period : -1;
        } else {
          u = (((t + c.phase) / c.period) % 1 + 1) % 1;
        }
        let s = 0;
        let mark = 0;
        if (u >= 0) [s, mark] = place(c, u, t);
        if (s <= 0.001) {
          pos.set(0, MOUTH_Y + 2, 0);
          s = 0;
        }
        scl.setScalar(s);
        m.compose(pos, q, scl);
        beads.setMatrixAt(i, m);
        if (c.chosen) {
          col.copy(tones[c.tone]!).lerp(markColor, mark);
          beads.setColorAt(i, col);
          colorDirty = true;
        }
      }
      beads.instanceMatrix.needsUpdate = true;
      if (colorDirty && beads.instanceColor) beads.instanceColor.needsUpdate = true;
    },
    setPalette(p) {
      glassMat.color.copy(p.soft).lerp(p.paper, 0.55);
      if (glassMat.transmission > 0) glassMat.attenuationColor.copy(glassMat.color);
      edgeMat.uniforms.uColor!.value.copy(p.line);
      edgeMat.uniforms.uStrength!.value = p.dark ? 0.55 : 0.42;
      rimTone(p, rimMat.color);
      dishTone(p, dishMat.color);
      (shadow.material as THREE.MeshBasicMaterial).opacity = p.dark ? 0.55 : 0.28;
      setTones(p);
    },
  };
}
