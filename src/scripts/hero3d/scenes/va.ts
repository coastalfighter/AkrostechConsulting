/**
 * Virtual assistance: the inbox, handled. A loose pile of rounded task tiles sits in the
 * inbox tray; one at a time the top tile lifts, turns upright and lands in one of three neat
 * columns: today, delegated, done. The chartreuse tile is the one being handled right now;
 * done tiles settle into lavender. When the inbox is empty the board holds a beat, the tiles
 * gather back and the day starts again. A press reshuffles everything into the inbox.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { HeroScene, Palette, SceneContext } from '../engine';
import { contactShadow, glossy } from '../engine';

const N = 12;
const TILE = { w: 0.82, h: 0.3, d: 0.07 };
const COLS = [-1.0, 0, 1.0];
const COL_NAMES = ['Today', 'Delegated', 'Done'];
const SLOT_TOP = 1.32;
const SLOT_PITCH = 0.4;
const PILE = { x: 0, y: -1.42, z: 0.8, pitch: 0.082 };
const STEP = 0.85;
const FLY = 0.8;
const SORT_FROM = 0.6;
const GATHER_AT = 12.2;
const GATHER_STAGGER = 0.07;
const GATHER_FLY = 0.7;
const CYCLE = 14.4;
const RESHUFFLE = 1.3;
/** Start the clock part-way through a day so the first (and the reduced-motion) frame is full. */
const OFFSET = 5.0;
const FLAT = -Math.PI / 2;

const easeInOut = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);
const clamp01 = (u: number) => Math.min(1, Math.max(0, u));

interface Pose {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
}

/** Shuffle a balanced set of columns for one "day" of sorting. */
function makeDay(rand: () => number): number[] {
  const shapes = [
    [4, 4, 4],
    [5, 4, 3],
    [4, 3, 5],
    [3, 4, 5],
  ];
  const shape = shapes[Math.floor(rand() * shapes.length)]!;
  const cols: number[] = [];
  shape.forEach((n, c) => {
    for (let i = 0; i < n; i++) cols.push(c);
  });
  for (let i = cols.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [cols[i], cols[j]] = [cols[j]!, cols[i]!];
  }
  return cols;
}

export default function va(ctx: SceneContext): HeroScene {
  const { palette, mobile, rand } = ctx;
  const group = new THREE.Group();
  const board = new THREE.Group();
  board.rotation.set(0.14, -0.28, 0);
  group.scale.setScalar(0.8);
  group.add(board);

  // ---- Days of sorting: which column each tile goes to, and its slot there
  const days = Array.from({ length: 6 }, () => {
    const cols = makeDay(rand);
    const counts = [0, 0, 0];
    const slots = cols.map((c) => counts[c]!++);
    return { cols, slots };
  });
  const pileJitter = Array.from({ length: N }, () => ({ x: (rand() - 0.5) * 0.08, z: (rand() - 0.5) * 0.06, ry: (rand() - 0.5) * 0.32 }));
  const bob = Array.from({ length: N }, () => rand() * Math.PI * 2);

  // ---- Trays: three columns and the inbox
  const trayTone = (p: Palette, out: THREE.Color) => out.copy(p.soft).lerp(p.ground, p.dark ? 0.88 : 0.5);
  const trayMat = glossy(trayTone(palette, new THREE.Color()), { roughness: 0.4, clearcoat: 0.4 });
  const trayGeo = new RoundedBoxGeometry(0.98, 2.22, 0.05, mobile ? 2 : 4, 0.025);
  for (const x of COLS) {
    const tray = new THREE.Mesh(trayGeo, trayMat);
    tray.position.set(x, SLOT_TOP - 2 * SLOT_PITCH + 0.03, -0.1);
    board.add(tray);
  }
  const inboxMat = glossy(palette.dark ? palette.ink.clone().lerp(palette.paper, 0.2) : palette.surface.clone(), { roughness: 0.35, clearcoat: 0.8 });
  const inbox = new THREE.Mesh(new RoundedBoxGeometry(1.12, 0.05, 0.64, mobile ? 2 : 4, 0.022), inboxMat);
  inbox.position.set(PILE.x, PILE.y - TILE.d / 2 - 0.026, PILE.z);
  board.add(inbox);
  const shadow = contactShadow(1.0, palette.dark ? 0.5 : 0.22);
  shadow.position.set(PILE.x, inbox.position.y - 0.06, PILE.z);
  shadow.scale.set(1.25, 0.8, 1);
  board.add(shadow);

  // ---- Tiles (light in both themes, so their lines are always ink), with two lines of "text" and a status dot on each face
  const tileMat = glossy(new THREE.Color(1, 1, 1), { roughness: 0.3, clearcoat: 0.9, clearcoatRoughness: 0.18 });
  const tiles = new THREE.InstancedMesh(new RoundedBoxGeometry(TILE.w, TILE.h, TILE.d, mobile ? 2 : 4, 0.03), tileMat, N);
  tiles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  board.add(tiles);
  const barMat = new THREE.MeshBasicMaterial({ color: palette.ink, transparent: true, opacity: 0.45, toneMapped: false });
  const bars = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), barMat, N * 2);
  bars.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  board.add(bars);
  const dotMat = new THREE.MeshBasicMaterial({ color: palette.ink, toneMapped: false });
  const dots = new THREE.InstancedMesh(new THREE.CircleGeometry(0.042, 20), dotMat, N);
  dots.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  board.add(dots);

  const faceZ = TILE.d / 2 + 0.002;
  const localBars = [
    new THREE.Matrix4().compose(new THREE.Vector3(-0.08, 0.05, faceZ), new THREE.Quaternion(), new THREE.Vector3(0.46, 0.034, 1)),
    new THREE.Matrix4().compose(new THREE.Vector3(-0.17, -0.055, faceZ), new THREE.Quaternion(), new THREE.Vector3(0.28, 0.034, 1)),
  ];
  const localDot = new THREE.Matrix4().makeTranslation(0.29, 0, faceZ);

  // ---- Column labels
  const stage = ctx.renderer.domElement.parentElement;
  const anchors = COLS.map((x) => new THREE.Vector3(x - 0.47, SLOT_TOP + 0.33, -0.08));
  const labels = COL_NAMES.map((name) => {
    const el = document.createElement('div');
    el.className = 'h3d__label h3d__label--tray';
    el.setAttribute('aria-hidden', 'true');
    const title = document.createElement('span');
    title.className = 'h3d__label-title';
    title.textContent = name;
    el.appendChild(title);
    stage?.appendChild(el);
    return el;
  });
  const world = new THREE.Vector3();
  const placeLabels = () => {
    const w = ctx.renderer.domElement.clientWidth;
    const h = ctx.renderer.domElement.clientHeight;
    // On phones the trays are too narrow for three labels side by side.
    const show = w >= 640;
    for (let i = 0; i < labels.length; i++) {
      const el = labels[i]!;
      el.style.display = show ? '' : 'none';
      world.copy(anchors[i]!).applyMatrix4(board.matrixWorld).project(ctx.camera);
      el.dataset.side = 'right';
      el.style.transform = `translate(${((world.x + 1) / 2) * w}px, ${((1 - world.y) / 2) * h}px)`;
    }
  };

  // ---- Poses
  const pilePose = (i: number, out: Pose): Pose => {
    const j = pileJitter[i]!;
    out.x = PILE.x + j.x;
    out.y = PILE.y + (N - 1 - i) * PILE.pitch;
    out.z = PILE.z + j.z;
    out.rx = FLAT;
    out.ry = j.ry;
    return out;
  };
  const slotPose = (i: number, day: number, t: number, out: Pose): Pose => {
    const d = days[day % days.length]!;
    out.x = COLS[d.cols[i]!]!;
    out.y = SLOT_TOP - d.slots[i]! * SLOT_PITCH + Math.sin(t * 1.1 + bob[i]!) * 0.012;
    out.z = 0;
    out.rx = 0;
    out.ry = 0;
    return out;
  };
  const arc = (a: Pose, b: Pose, u: number, out: Pose, lift: number): Pose => {
    const e = easeInOut(u);
    const r = easeOut(u);
    const s = Math.sin(Math.PI * u);
    out.x = a.x + (b.x - a.x) * e;
    out.y = a.y + (b.y - a.y) * e + s * 0.22 * lift;
    out.z = a.z + (b.z - a.z) * e + s * 0.55 * lift;
    out.rx = a.rx + (b.rx - a.rx) * r;
    out.ry = a.ry + (b.ry - a.ry) * r;
    return out;
  };

  const poses: Pose[] = Array.from({ length: N }, () => ({ x: 0, y: 0, z: 0, rx: 0, ry: 0 }));
  const from: Pose[] = Array.from({ length: N }, () => ({ x: 0, y: 0, z: 0, rx: 0, ry: 0 }));
  const pA: Pose = { x: 0, y: 0, z: 0, rx: 0, ry: 0 };
  const pB: Pose = { x: 0, y: 0, z: 0, rx: 0, ry: 0 };
  const markAmt = new Float32Array(N);
  const doneAmt = new Float32Array(N);

  let origin = -OFFSET;
  let batch = 0;
  let reshuffleAt = -Infinity;
  let lastSince = Infinity;

  const base = new THREE.Color();
  const doneColor = new THREE.Color();
  const markColor = new THREE.Color();
  const tmp = new THREE.Color();
  let pal = palette;
  const paint = () => {
    base.copy(pal.dark ? pal.paper.clone().lerp(pal.ink, 0.12) : pal.surface);
    doneColor.copy(pal.lavender);
    markColor.copy(pal.mark);
    for (let i = 0; i < N; i++) {
      tmp.copy(base).lerp(doneColor, doneAmt[i]! * 0.9).lerp(markColor, markAmt[i]!);
      tiles.setColorAt(i, tmp);
    }
    if (tiles.instanceColor) tiles.instanceColor.needsUpdate = true;
  };

  const m = new THREE.Matrix4();
  const mm = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const v = new THREE.Vector3();
  const one = new THREE.Vector3(1, 1, 1);

  return {
    object: group,
    camera: { z: 8.6, y: -0.15, fov: 32 },
    tilt: 0.24,
    update(t, dt, input) {
      if (!input.dragging) input.rotY += (0 - input.rotY) * (1 - Math.pow(0.6, dt));
      // Press: snapshot where every tile is, then fly them all home to the inbox.
      if (input.sincePulse < lastSince) {
        for (let i = 0; i < N; i++) Object.assign(from[i]!, poses[i]!);
        reshuffleAt = t;
        origin = t + RESHUFFLE;
        batch += 1;
      }
      lastSince = input.sincePulse;
      board.position.y = Math.sin(t * 0.5) * 0.03;

      const c = t - origin;
      const day = batch + Math.max(0, Math.floor(c / CYCLE));
      const local = c < 0 ? -1 : c % CYCLE;
      const reshuffling = t - reshuffleAt < RESHUFFLE;
      let current = 0;
      if (local >= SORT_FROM && local < GATHER_AT) current = Math.min(N - 1, Math.floor((local - SORT_FROM + 0.3) / STEP));

      for (let i = 0; i < N; i++) {
        const out = poses[i]!;
        let done = 0;
        if (reshuffling) {
          const u = clamp01((t - reshuffleAt - (N - 1 - i) * 0.04) / 0.75);
          arc(from[i]!, pilePose(i, pB), u, out, 1);
        } else {
          const s = SORT_FROM + i * STEP;
          const g = GATHER_AT + (N - 1 - i) * GATHER_STAGGER;
          if (local < s) pilePose(i, out);
          else if (local < s + FLY) arc(pilePose(i, pA), slotPose(i, day, t, pB), (local - s) / FLY, out, 1);
          else if (local < g) {
            slotPose(i, day, t, out);
            done = 1;
          } else if (local < g + GATHER_FLY) arc(slotPose(i, day, t, pA), pilePose(i, pB), (local - g) / GATHER_FLY, out, 0.6);
          else pilePose(i, out);
          if (done) done = days[day % days.length]!.cols[i] === 2 ? 1 : 0;
        }
        const mk = !reshuffling && i === current ? 1 : 0;
        const rate = dt === 0 ? 1 : 1 - Math.pow(0.004, dt);
        markAmt[i] = markAmt[i]! + (mk - markAmt[i]!) * rate;
        doneAmt[i] = doneAmt[i]! + (done - doneAmt[i]!) * (dt === 0 ? 1 : 1 - Math.pow(0.05, dt));

        e.set(out.rx, out.ry, 0, 'YXZ');
        q.setFromEuler(e);
        v.set(out.x, out.y, out.z);
        m.compose(v, q, one);
        tiles.setMatrixAt(i, m);
        mm.multiplyMatrices(m, localBars[0]!);
        bars.setMatrixAt(i * 2, mm);
        mm.multiplyMatrices(m, localBars[1]!);
        bars.setMatrixAt(i * 2 + 1, mm);
        mm.multiplyMatrices(m, localDot);
        dots.setMatrixAt(i, mm);
      }
      tiles.instanceMatrix.needsUpdate = true;
      bars.instanceMatrix.needsUpdate = true;
      dots.instanceMatrix.needsUpdate = true;
      paint();

      group.updateMatrixWorld();
      placeLabels();
    },
    setPalette(p) {
      pal = p;
      trayTone(p, trayMat.color);
      inboxMat.color.copy(p.dark ? p.ink.clone().lerp(p.paper, 0.2) : p.surface);
      (shadow.material as THREE.MeshBasicMaterial).opacity = p.dark ? 0.5 : 0.22;
      barMat.color.copy(p.ink);
      dotMat.color.copy(p.ink);
      paint();
    },
  };
}
