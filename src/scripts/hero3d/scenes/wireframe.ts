/**
 * Website development: an exploded browser. The page comes apart into the layers a site is
 * built from, floating in depth like a design file: the browser window and its chrome at the
 * back, the layout grid, the content blocks, a lavender image, and in front the chartreuse
 * call to action with a cursor resting on it. Faint guides join the corners of the panes.
 * In a slow loop the layers fly together, front first, into one finished page (the guides
 * fade, the cursor clicks the button), hold, and come apart again.
 *
 * Pointer parallax comes from the engine's tilt. Press to snap the page together; it then
 * re-explodes. Under reduced motion it shows the exploded view.
 */
import * as THREE from 'three';
import { glossy, type HeroScene, type Palette, type SceneContext } from '../engine';

const PW = 3.2;
const PH = 2.2;
const LAYERS = 5;
const GAP = 0.36;
const CYCLE = 10.5;

function roundedRect(w: number, h: number, r: number, cx = 0, cy = 0): THREE.Shape {
  const s = new THREE.Shape();
  const x = cx - w / 2;
  const y = cy - h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** A thin rounded slab whose back face sits at z = 0. */
function slab(shape: THREE.Shape, depth: number, curve: number): THREE.ExtrudeGeometry {
  const b = Math.min(0.012, depth * 0.3);
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 2, curveSegments: curve });
  g.translate(0, 0, b);
  return g;
}

/** Positions for a rounded-rect outline drawn as line segments. */
function outline(shape: THREE.Shape, z: number): THREE.BufferGeometry {
  const pts = shape.getPoints(6);
  const arr: number[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]!;
    const b = pts[(i + 1) % pts.length]!;
    arr.push(a.x, a.y, z, b.x, b.y, z);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
  return g;
}

const smooth = (x: number) => {
  const k = Math.min(1, Math.max(0, x));
  return k * k * k * (k * (k * 6 - 15) + 10);
};

/** The loop: apart, together (front layers first), hold, apart again. 1 = exploded. */
function loop(t: number, i: number): number {
  const c = ((t % CYCLE) + CYCLE) % CYCLE;
  const lag = (LAYERS - 1 - i) * 0.12;
  const together = smooth((c - 4 - lag) / 1.5);
  const apart = smooth((c - 7.6 - i * 0.1) / 1.8);
  return 1 - together + apart;
}

export default function wireframe(ctx: SceneContext): HeroScene {
  const { palette, mobile } = ctx;
  const curve = mobile ? 5 : 10;
  const group = new THREE.Group();
  const stack = new THREE.Group();
  group.add(stack);

  // ---- Materials
  const pageMat = glossy(palette.surface, { roughness: 0.4, clearcoat: 0.5 });
  const inkMat = glossy(palette.ink, { roughness: 0.3, clearcoat: 0.7 });
  const cardMat = glossy(palette.surface, { roughness: 0.36, clearcoat: 0.6 });
  const imageMat = glossy(palette.soft, { roughness: 0.28, clearcoat: 0.9 });
  const glyphMat = glossy(palette.surface, { roughness: 0.4, clearcoat: 0.4 });
  const ctaMat = glossy(palette.mark, { roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.12 });
  const greyMat = new THREE.MeshBasicMaterial({ toneMapped: false });
  const chromeMat = new THREE.MeshBasicMaterial({ toneMapped: false });
  const gridMat = new THREE.LineBasicMaterial({ transparent: true, toneMapped: false, depthWrite: false });
  const paneMat = new THREE.LineBasicMaterial({ transparent: true, toneMapped: false, depthWrite: false });
  const fillMat = new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false, depthWrite: false, side: THREE.DoubleSide });
  const guideMat = new THREE.LineBasicMaterial({ transparent: true, toneMapped: false, depthWrite: false });

  const layers: THREE.Group[] = [];
  for (let i = 0; i < LAYERS; i++) {
    const g = new THREE.Group();
    stack.add(g);
    layers.push(g);
  }
  const frame = roundedRect(PW, PH, 0.1);

  // Panes 1–4 read as sheets of glass while apart: a faint fill and a hairline edge.
  const paneFill = new THREE.ShapeGeometry(frame, curve);
  const paneEdge = outline(frame, 0);
  const fills: THREE.Mesh[] = [];
  for (let i = 1; i < LAYERS; i++) {
    const f = new THREE.Mesh(paneFill, fillMat);
    f.renderOrder = -1;
    const e = new THREE.LineSegments(paneEdge, paneMat);
    layers[i]!.add(f, e);
    fills.push(f);
  }

  // ---- 0: the browser window with its chrome
  const page = new THREE.Mesh(slab(frame, 0.06, curve), pageMat);
  const top = PH / 2 - 0.16;
  const chrome = new THREE.Group();
  chrome.position.z = 0.085;
  const dots = new THREE.InstancedMesh(new THREE.CircleGeometry(0.032, 20), chromeMat, 3);
  const m = new THREE.Matrix4();
  for (let i = 0; i < 3; i++) dots.setMatrixAt(i, m.makeTranslation(-PW / 2 + 0.17 + i * 0.1, top, 0));
  const url = new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(1.3, 0.12, 0.06, 0.1, top), curve), chromeMat);
  const rule = new THREE.Mesh(new THREE.PlaneGeometry(PW - 0.02, 0.008), chromeMat);
  rule.position.y = top - 0.13;
  chrome.add(dots, url, rule);
  layers[0]!.add(page, chrome);

  // ---- 1: the layout grid, twelve columns with gutters, and a baseline
  {
    const arr: number[] = [];
    const left = -PW / 2 + 0.16;
    const width = PW - 0.32;
    const gutter = 0.05;
    const col = (width - gutter * 11) / 12;
    const y0 = -PH / 2 + 0.12;
    const y1 = top - 0.2;
    for (let c = 0; c < 12; c++) {
      const a = left + c * (col + gutter);
      arr.push(a, y0, 0, a, y1, 0, a + col, y0, 0, a + col, y1, 0);
    }
    for (const y of [y0, y1, 0.02, -0.33]) arr.push(left, y, 0, left + width, y, 0);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
    layers[1]!.add(new THREE.LineSegments(g, gridMat));
  }

  // ---- 2: content — headline, copy, three cards
  const L = -PW / 2 + 0.16;
  const box = new THREE.BoxGeometry(1, 1, 1);
  box.translate(0.5, 0, 0.5);
  const inkBars: [number, number, number, number][] = [
    [L, 0.62, 1.55, 0.15],
    [L, 0.4, 1.1, 0.15],
    [L + 0.1, -0.56, 0.5, 0.06],
    [L + 0.1 + 0.98, -0.56, 0.42, 0.06],
    [L + 0.1 + 1.96, -0.56, 0.55, 0.06],
  ];
  const greyBars: [number, number, number][] = [
    [L, 0.2, 1.42],
    [L, 0.12, 1.25],
    [L + 0.1, -0.68, 0.7],
    [L + 0.1, -0.76, 0.55],
    [L + 0.1 + 0.98, -0.68, 0.72],
    [L + 0.1 + 0.98, -0.76, 0.48],
    [L + 0.1 + 1.96, -0.68, 0.7],
    [L + 0.1 + 1.96, -0.76, 0.6],
  ];
  const inks = new THREE.InstancedMesh(box, inkMat, inkBars.length);
  const pos = new THREE.Vector3();
  const q = new THREE.Quaternion();
  const scl = new THREE.Vector3();
  inkBars.forEach(([x, y, w, h], i) => inks.setMatrixAt(i, m.compose(pos.set(x, y, 0.035), q, scl.set(w, h, 0.03))));
  const greys = new THREE.InstancedMesh(box, greyMat, greyBars.length);
  greyBars.forEach(([x, y, w], i) => greys.setMatrixAt(i, m.compose(pos.set(x, y, 0.05), q, scl.set(w, 0.035, 0.012))));
  const cardW = 0.92;
  const cards = new THREE.InstancedMesh(slab(roundedRect(cardW, 0.5, 0.05), 0.03, curve), cardMat, 3);
  for (let i = 0; i < 3; i++) cards.setMatrixAt(i, m.makeTranslation(L + cardW / 2 + i * 0.98, -0.66, 0));
  layers[2]!.add(inks, greys, cards);

  // ---- 3: the image, lavender in light, violet in dark, with a sun and a hill
  const image = new THREE.Group();
  image.position.set(0.88, 0.32, 0);
  const imgShape = roundedRect(1.12, 0.84, 0.06);
  const imgMesh = new THREE.Mesh(slab(imgShape, 0.05, curve), imageMat);
  const sun = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 28), glyphMat);
  sun.rotation.x = Math.PI / 2;
  sun.position.set(0.24, 0.17, 0.09);
  const hill = new THREE.Shape();
  hill.moveTo(-0.5, -0.36);
  hill.lineTo(-0.16, 0.04);
  hill.lineTo(0.08, -0.18);
  hill.lineTo(0.2, -0.06);
  hill.lineTo(0.5, -0.36);
  hill.lineTo(-0.5, -0.36);
  const hills = new THREE.Mesh(slab(hill, 0.02, 1), glyphMat);
  hills.position.z = 0.06;
  image.add(imgMesh, sun, hills);
  layers[3]!.add(image);

  // ---- 4: the call to action, and a cursor on it
  const cta = new THREE.Group();
  cta.position.set(L + 0.36, -0.12, 0);
  const pill = new THREE.Mesh(slab(roundedRect(0.72, 0.2, 0.1), 0.06, curve), ctaMat);
  const label = new THREE.Mesh(box, inkMat);
  label.position.set(-0.22, 0, 0.08);
  label.scale.set(0.34, 0.04, 0.012);
  const arrow = new THREE.Mesh(box, inkMat);
  arrow.position.set(0.18, 0, 0.08);
  arrow.scale.set(0.08, 0.04, 0.012);
  cta.add(pill, label, arrow);
  const cursorShape = new THREE.Shape();
  cursorShape.moveTo(0, 0);
  cursorShape.lineTo(0, -0.22);
  cursorShape.lineTo(0.055, -0.17);
  cursorShape.lineTo(0.095, -0.255);
  cursorShape.lineTo(0.13, -0.24);
  cursorShape.lineTo(0.09, -0.155);
  cursorShape.lineTo(0.16, -0.155);
  cursorShape.lineTo(0, 0);
  const cursor = new THREE.Mesh(slab(cursorShape, 0.03, 1), inkMat);
  const cursorEdge = new THREE.Mesh(slab(cursorShape, 0.02, 1), glyphMat);
  cursorEdge.scale.setScalar(1.22);
  cursorEdge.position.set(-0.012, 0.016, -0.012);
  const pointer = new THREE.Group();
  pointer.add(cursor, cursorEdge);
  pointer.position.set(0.24, -0.05, 0.2);
  cta.add(pointer);
  layers[4]!.add(cta);

  // ---- Guides joining the corners of the back and front panes
  const guideGeo = new THREE.BufferGeometry();
  {
    const arr: number[] = [];
    for (const [x, y] of [[-1, -1], [1, -1], [1, 1], [-1, 1]] as const) arr.push((x * PW) / 2, (y * PH) / 2, 0, (x * PW) / 2, (y * PH) / 2, 1);
    guideGeo.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
  }
  const guides = new THREE.LineSegments(guideGeo, guideMat);
  stack.add(guides);


  let paneOpacity = 0;
  const paint = (p: Palette) => {
    pageMat.color.copy(p.surface);
    inkMat.color.copy(p.dark ? p.paper : p.ink);
    cardMat.color.copy(p.surface).lerp(p.dark ? p.paper : p.soft, p.dark ? 0.07 : 0.22);
    imageMat.color.copy(p.soft);
    glyphMat.color.copy(p.dark ? p.lavender : p.surface);
    ctaMat.color.copy(p.mark);
    greyMat.color.copy(p.line).lerp(p.surface, 0.55);
    chromeMat.color.copy(p.line).lerp(p.surface, 0.72);
    gridMat.color.copy(p.dark ? p.lavender : p.violet);
    paneMat.color.copy(p.line);
    fillMat.color.copy(p.soft);
    guideMat.color.copy(p.line);
    paneOpacity = p.dark ? 0.1 : 0.12;
  };
  paint(palette);

  const ex = new Float32Array(LAYERS).fill(1);
  const vel = new Float32Array(LAYERS);
  let first = true;

  const pose = (t: number, dt: number, sincePulse: number) => {
    const snap = sincePulse < 1.5;
    let sum = 0;
    for (let i = 0; i < LAYERS; i++) {
      const target = snap ? 0 : loop(t, i);
      if (first || dt === 0) {
        ex[i] = target;
        vel[i] = 0;
      } else {
        const h = Math.min(dt, 1 / 30);
        // A press snaps hard; the loop eases.
        const k = snap ? 140 : 40;
        const c = snap ? 17 : 12.5;
        vel[i]! += (-k * (ex[i]! - target) - c * vel[i]!) * h;
        ex[i]! += vel[i]! * h;
      }
      const e = ex[i]!;
      sum += e;
      const layer = layers[i]!;
      // Together, the panes stack just above the window's face (it is 0.08 deep).
      layer.position.z = (i - 2) * GAP * e + (i === 0 ? -0.09 : i * 0.012) * (1 - e);
      layer.position.y = Math.sin(t * 0.7 + i * 0.9) * 0.025 * e;
    }
    first = false;
    const apart = THREE.MathUtils.clamp(sum / LAYERS, 0, 1);
    // Turned to show the depth while apart; facing the viewer once it is one page.
    stack.rotation.set(-0.14 - 0.1 * apart, -0.24 - 0.3 * apart, -0.02 * apart);
    const z0 = layers[0]!.position.z;
    guides.position.z = z0;
    guides.scale.z = Math.max(0.001, layers[LAYERS - 1]!.position.z - z0);
    guideMat.opacity = 0.22 * apart;
    paneMat.opacity = 0.32 * apart;
    fillMat.opacity = paneOpacity * apart;
    for (const f of fills) f.visible = apart > 0.02;
    paneMat.visible = apart > 0.02;
    gridMat.opacity = 0.2 + 0.45 * apart;
    // The cursor clicks the button once the page has come together.
    const c = ((t % CYCLE) + CYCLE) % CYCLE;
    const click = snap ? Math.max(0, 1 - Math.abs(sincePulse - 0.45) / 0.2) : Math.max(0, 1 - Math.abs(c - 6.1) / 0.18);
    pointer.scale.setScalar(1 - click * 0.14);
    pointer.position.z = 0.06 + 0.16 * apart;
    cta.scale.setScalar(1 - click * 0.04);
  };

  return {
    object: group,
    camera: { z: mobile ? 8.6 : 10.6, y: 0, fov: 32 },
    tilt: 0.3,
    update(t, dt, input) {
      if (!input.dragging) input.rotY += (0 - input.rotY) * (1 - Math.pow(0.5, dt));
      pose(t, dt, input.sincePulse);
    },
    setPalette: paint,
  };
}
