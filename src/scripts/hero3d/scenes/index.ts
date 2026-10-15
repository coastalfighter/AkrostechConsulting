/**
 * Terms: the clause index. A precise grid of rounded keys on a lavender plate, seen in
 * perspective like a keyboard or the index of a contract. Each key carries a short legend
 * line; a handful are chartreuse, the clauses that matter, and they rise one at a time as the
 * grid breathes in a slow wave. Keys lift under the pointer as it reads across them, and a
 * press sends a ripple out from the key you touched.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { contactShadow, glossy, type HeroScene, type Palette, type SceneContext } from '../engine';

const COLS = 8;
const ROWS = 6;
const PITCH = 0.42;
const KEY = 0.345;
const KEY_H = 0.2;
const KEYS = 4;

export default function index(ctx: SceneContext): HeroScene {
  const { palette, mobile, rand, camera } = ctx;
  const count = COLS * ROWS;
  const group = new THREE.Group();
  const tilt = new THREE.Group();
  tilt.rotation.x = 0.78;
  const board = new THREE.Group();
  board.rotation.y = -0.42;
  tilt.add(board);
  group.add(tilt);
  group.position.set(-0.2, 0.1, 0);

  const w = COLS * PITCH;
  const d = ROWS * PITCH;

  // ---- The plate the keys sit in
  const plateMat = glossy(palette.soft, { roughness: 0.3, clearcoat: 0.8 });
  const plate = new THREE.Mesh(new RoundedBoxGeometry(w + 0.34, 0.16, d + 0.34, 4, 0.08), plateMat);
  plate.position.y = -0.14;
  board.add(plate);

  // ---- Keys
  const keyGeo = new RoundedBoxGeometry(KEY, KEY_H, KEY, mobile ? 2 : 4, 0.06);
  const keyMat = glossy(new THREE.Color(0xffffff), { roughness: 0.28, clearcoat: 0.9, clearcoatRoughness: 0.18 });
  const keys = new THREE.InstancedMesh(keyGeo, keyMat, count);
  const legendGeo = new THREE.BoxGeometry(1, 0.008, 0.035);
  const legendMat = new THREE.MeshBasicMaterial({ toneMapped: false });
  const legends = new THREE.InstancedMesh(legendGeo, legendMat, count * 2);
  board.add(keys, legends);

  const home: { x: number; z: number; len: [number, number] }[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      home.push({
        x: (c - (COLS - 1) / 2) * PITCH,
        z: (r - (ROWS - 1) / 2) * PITCH,
        len: [0.12 + rand() * 0.12, 0.06 + rand() * 0.1],
      });
    }
  }

  // The clauses that matter: spread across the grid, never on the outer edge.
  const marked: number[] = [];
  while (marked.length < KEYS) {
    const c = 1 + Math.floor(rand() * (COLS - 2));
    const r = 1 + Math.floor(rand() * (ROWS - 2));
    const i = r * COLS + c;
    if (marked.some((m) => Math.abs((m % COLS) - c) + Math.abs(Math.floor(m / COLS) - r) < 3)) continue;
    marked.push(i);
  }
  const isMarked = new Uint8Array(count);
  for (const m of marked) isMarked[m] = 1;

  const tmp = new THREE.Color();
  const paint = (p: Palette) => {
    for (let i = 0; i < count; i++) {
      keys.setColorAt(i, isMarked[i] ? p.mark : p.surface);
      // Legends: ink on chartreuse; on plain keys a quiet line that reads in either theme.
      tmp.copy(isMarked[i] ? p.ink : p.line).lerp(p.surface, isMarked[i] ? 0 : p.dark ? 0.55 : 0.62);
      legends.setColorAt(i * 2, tmp);
      legends.setColorAt(i * 2 + 1, tmp);
    }
    if (keys.instanceColor) keys.instanceColor.needsUpdate = true;
    if (legends.instanceColor) legends.instanceColor.needsUpdate = true;
  };
  paint(palette);

  const shadow = contactShadow(2.6, palette.dark ? 0.4 : 0.2);
  shadow.scale.set(1.25, 0.8, 1);
  shadow.position.y = -1.45;
  group.add(shadow);

  // ---- Pointer and press, mapped from the screen onto the board
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const origin = new THREE.Vector3();
  const inv = new THREE.Matrix4();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -KEY_H / 2);
  const hitPoint = new THREE.Vector3();
  const onBoard = (nx: number, ny: number, out: THREE.Vector2): boolean => {
    // Engine input is measured from where the object's centre sits on screen.
    origin.set(0, 0, 0).project(camera);
    ndc.set(nx + origin.x, ny + origin.y);
    ray.setFromCamera(ndc, camera);
    inv.copy(board.matrixWorld).invert();
    ray.ray.applyMatrix4(inv);
    if (!ray.ray.intersectPlane(plane, hitPoint)) return false;
    out.set(hitPoint.x, hitPoint.z);
    return true;
  };

  const heights = new Float32Array(count);
  const pointer = new THREE.Vector2();
  const press = new THREE.Vector2();
  let hover = 0;
  // Whether the pointer is over the hero at all (input eases back to centre when it leaves).
  let over = false;
  const root = ctx.renderer.domElement.closest<HTMLElement>('[data-hero3d]');
  root?.addEventListener('pointerenter', (e) => (over = e.pointerType === 'mouse'));
  root?.addEventListener('pointerleave', () => (over = false));
  let pressAt = -1;
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  const one = new THREE.Vector3(1, 1, 1);
  const legScale = new THREE.Vector3();

  return {
    object: group,
    camera: { z: 10.2, fov: 32 },
    tilt: 0.14,
    draggable: false,
    update(t, dt, input) {
      group.updateMatrixWorld(true);

      // Hover strength: up while a mouse is over the board, fading when it leaves.
      const hasPointer = over && onBoard(input.x, input.y, pointer);
      const inside = hasPointer && Math.abs(pointer.x) < w / 2 + 0.4 && Math.abs(pointer.y) < d / 2 + 0.4;
      const wantHover = inside ? 1 : 0;
      hover += (wantHover - hover) * (1 - Math.exp(-dt * 4));

      // The press ripples from where it landed (recomputed once per press).
      const s = input.sincePulse;
      if (Number.isFinite(s) && pressAt !== t - s) {
        pressAt = t - s;
        if (!onBoard(input.pulseX, input.pulseY, press)) press.set(0, 0);
      }

      // One marked clause at a time rises above the rest.
      const cyc = t / 2.6 + 0.4;
      const active = marked[Math.floor(cyc) % KEYS]!;
      const ph = cyc % 1;
      const rise = THREE.MathUtils.smoothstep(ph, 0, 0.3) * (1 - THREE.MathUtils.smoothstep(ph, 0.72, 1));

      const k = dt > 0 ? 1 - Math.exp(-dt * 12) : 1;
      for (let i = 0; i < count; i++) {
        const h = home[i]!;
        let y = Math.sin(h.x * 1.1 + t * 0.9) * 0.035 + Math.sin(h.z * 1.4 - t * 0.7 + h.x * 0.4) * 0.03;
        if (hover > 0.001) {
          const dx = h.x - pointer.x;
          const dz = h.z - pointer.y;
          y += Math.exp(-(dx * dx + dz * dz) / 0.22) * 0.3 * hover;
        }
        if (s < 4.5) {
          const dx = h.x - press.x;
          const dz = h.z - press.y;
          const dist = Math.sqrt(dx * dx + dz * dz);
          const off = dist - s * 2.4;
          y += Math.cos(off * 5) * Math.exp(-(off * off) / 0.1) * 0.32 * Math.exp(-s * 0.9);
        }
        if (i === active) y += rise * 0.26;
        heights[i] = heights[i]! + (y - heights[i]!) * k;

        const hy = heights[i]!;
        pos.set(h.x, hy, h.z);
        m.compose(pos, q, one);
        keys.setMatrixAt(i, m);
        // Two legend lines on the key top, set toward its front-left corner like a label.
        for (let l = 0; l < 2; l++) {
          const len = h.len[l]!;
          pos.set(h.x - KEY / 2 + 0.07 + len / 2, hy + KEY_H / 2 + 0.002, h.z + 0.05 + l * 0.065);
          m.compose(pos, q, legScale.set(len, 1, 1));
          legends.setMatrixAt(i * 2 + l, m);
        }
      }
      keys.instanceMatrix.needsUpdate = true;
      legends.instanceMatrix.needsUpdate = true;
    },
    setPalette(p) {
      plateMat.color.copy(p.soft);
      paint(p);
      (shadow.material as THREE.MeshBasicMaterial).opacity = p.dark ? 0.4 : 0.2;
    },
  };
}
