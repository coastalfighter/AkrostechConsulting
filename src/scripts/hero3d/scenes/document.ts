/**
 * Legal: the contract on the desk. Four sheets of paper and a lavender folder, fanned from a
 * point below them like a hand of cards, breathe slowly open and closed. Every sheet carries
 * its own set of clauses (thin ink bars, seeded so each page reads differently). On the top
 * sheet a highlighter comes down, sweeps a chartreuse stroke across the one clause that
 * matters, and lifts away; the stroke holds, fades, and the review begins again.
 *
 * Press to fan the pages wide; they spring back together. Under reduced motion it shows the
 * clause already highlighted, the pen at rest.
 */
import * as THREE from 'three';
import { glossy, type HeroScene, type Palette, type SceneContext } from '../engine';

const W = 1.62;
const H = 2.2;
const D = 0.014;
const FRONT = D * 0.75; // front face of a sheet, bevel included
const SHEETS = 4;
const PIVOT_DROP = 0.42; // the fan opens about a point this far below the sheets
const PIVOT_Y = -1.55;
const CYCLE = 8.5;

function roundedRect(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
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

/** A folder: a rounded board with a tab rising from its top edge. */
function folderShape(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  const tx = x + 0.12;
  const tw = 0.62;
  const th = 0.16;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(tx + tw + th * 0.7, y + h);
  s.quadraticCurveTo(tx + tw + 0.04, y + h, tx + tw, y + h + th - 0.04);
  s.quadraticCurveTo(tx + tw - 0.03, y + h + th, tx + tw - 0.08, y + h + th);
  s.lineTo(tx + 0.06, y + h + th);
  s.quadraticCurveTo(tx, y + h + th, tx, y + h + th - 0.06);
  s.lineTo(tx, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function slab(shape: THREE.Shape, depth: number, curve: number): THREE.ExtrudeGeometry {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: depth * 0.25, bevelSize: depth * 0.25, bevelSegments: 2, curveSegments: curve });
  g.translate(0, 0, -depth / 2);
  return g;
}

interface Line {
  x: number; // left edge
  y: number;
  w: number;
  h: number;
  kind: 0 | 1; // 0 heading/ink, 1 body
}

/** Lay out one page of clauses: a title, numbered paragraphs, a signature line. */
function layout(rand: () => number, top: boolean): { lines: Line[]; clause: Line[] } {
  const lines: Line[] = [];
  const left = -W / 2 + 0.17;
  const full = W - 0.34;
  let y = H / 2 - 0.24;
  lines.push({ x: left, y, w: full * (0.46 + rand() * 0.12), h: 0.062, kind: 0 });
  y -= 0.1;
  lines.push({ x: left, y, w: full * (0.28 + rand() * 0.1), h: 0.024, kind: 1 });
  y -= 0.15;
  const paragraphs = top ? [3, 3, 4, 3] : [3 + Math.floor(rand() * 2), 3, 3 + Math.floor(rand() * 2), 3];
  const clause: Line[] = [];
  paragraphs.forEach((n, p) => {
    lines.push({ x: left, y, w: 0.05, h: 0.026, kind: 0 });
    for (let i = 0; i < n; i++) {
      const last = i === n - 1;
      const w = (full - 0.1) * (last ? 0.35 + rand() * 0.35 : 0.9 + rand() * 0.1);
      const l: Line = { x: left + 0.1, y, w, h: 0.024, kind: 1 };
      lines.push(l);
      if (top && p === 1) clause.push(l);
      y -= 0.082;
    }
    y -= 0.07;
  });
  // Signature block
  const sy = -H / 2 + 0.26;
  lines.push({ x: W / 2 - 0.17 - 0.62, y: sy, w: 0.62, h: 0.012, kind: 0 });
  lines.push({ x: W / 2 - 0.17 - 0.62, y: sy - 0.07, w: 0.3, h: 0.02, kind: 1 });
  lines.push({ x: left, y: sy, w: 0.36, h: 0.012, kind: 0 });
  return { lines, clause };
}

const smooth = (x: number) => {
  const k = Math.min(1, Math.max(0, x));
  return k * k * (3 - 2 * k);
};

export default function documentScene(ctx: SceneContext): HeroScene {
  const { palette, mobile, rand } = ctx;
  const curve = mobile ? 4 : 8;
  const group = new THREE.Group();
  group.rotation.set(-0.12, -0.3, 0);

  const fan = new THREE.Group();
  fan.position.y = PIVOT_Y;
  group.add(fan);

  const paperMats: THREE.MeshPhysicalMaterial[] = [];
  const folderMat = glossy(palette.soft, { roughness: 0.38, clearcoat: 0.7 });
  const textMat = new THREE.MeshBasicMaterial({ toneMapped: false });
  const sheetGeo = slab(roundedRect(W, H, 0.05), D, curve);
  const folderGeo = slab(folderShape(W + 0.14, H + 0.12, 0.07), D * 2.2, curve);
  const bar = new THREE.PlaneGeometry(1, 1);
  bar.translate(0.5, 0, 0); // grow from the left edge

  const hinges: THREE.Group[] = [];
  const texts: { mesh: THREE.InstancedMesh; lines: Line[] }[] = [];
  let clause: Line[] = [];
  const m = new THREE.Matrix4();
  const p = new THREE.Vector3();
  const q = new THREE.Quaternion();
  const sc = new THREE.Vector3();

  // k = 0 is the top sheet, nearest the viewer; the last is the folder at the back.
  for (let k = 0; k <= SHEETS; k++) {
    const hinge = new THREE.Group();
    const folder = k === SHEETS;
    let mat: THREE.MeshPhysicalMaterial;
    if (folder) mat = folderMat;
    else {
      mat = glossy(palette.paper, { roughness: 0.62, clearcoat: 0.12, clearcoatRoughness: 0.6 });
      paperMats.push(mat);
    }
    const sheet = new THREE.Mesh(folder ? folderGeo : sheetGeo, mat);
    sheet.position.y = PIVOT_DROP + H / 2;
    hinge.add(sheet);
    if (!folder) {
      const { lines, clause: c } = layout(rand, k === 0);
      if (k === 0) clause = c;
      const mesh = new THREE.InstancedMesh(bar, textMat, lines.length);
      lines.forEach((l, i) => {
        p.set(l.x, l.y, FRONT + 0.005);
        sc.set(l.w, l.h, 1);
        m.compose(p, q, sc);
        mesh.setMatrixAt(i, m);
      });
      sheet.add(mesh);
      texts.push({ mesh, lines });
    }
    fan.add(hinge);
    hinges.push(hinge);
  }
  const topSheet = hinges[0]!.children[0] as THREE.Mesh;

  // ---- The highlighter stroke, one bar per line of the clause
  const strokeMat = new THREE.MeshBasicMaterial({ color: palette.mark, transparent: true, opacity: 0.9, toneMapped: false, depthWrite: false });
  const strokes = clause.map((l) => {
    const s = new THREE.Mesh(bar, strokeMat);
    s.position.set(l.x - 0.03, l.y, FRONT + 0.0022);
    s.scale.set(0.0001, 0.07, 1);
    topSheet.add(s);
    return { mesh: s, x: l.x - 0.03, w: l.w + 0.06, y: l.y };
  });
  const total = strokes.reduce((a, s) => a + s.w, 0);

  // ---- The highlighter itself: an ink barrel with a chartreuse chisel tip
  const pen = new THREE.Group();
  const penBody = glossy(palette.ink, { roughness: 0.25, clearcoat: 1 });
  const penTip = glossy(palette.mark, { roughness: 0.3, clearcoat: 0.6 });
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.82, 28), penBody);
  barrel.position.y = 0.2 + 0.41;
  const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.03, 0.14, 28), penBody);
  cone.position.y = 0.13;
  const nib = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.022), penTip);
  nib.position.y = 0.04;
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.064, 0.05, 28), penTip);
  band.position.y = 0.92;
  const end = new THREE.Mesh(new THREE.SphereGeometry(0.062, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), penBody);
  end.position.y = 1.02;
  const penAxis = new THREE.Group();
  penAxis.add(barrel, cone, nib, band, end);
  penAxis.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0.42, 0.28, 0.86).normalize());
  pen.add(penAxis);
  topSheet.add(pen);
  const rest = new THREE.Vector3(W / 2 + 0.08, (strokes[0]?.y ?? 0) + 0.35, 0.55);
  const tip = new THREE.Vector3();


  const paint = (pal: Palette) => {
    const sheetColor = pal.dark ? pal.paper.clone().multiplyScalar(0.9) : pal.surface.clone();
    paperMats.forEach((mat, k) => mat.color.copy(sheetColor).lerp(pal.paper, k * 0.25).multiplyScalar(1 - k * 0.025));
    folderMat.color.copy(pal.soft);
    strokeMat.color.copy(pal.mark);
    penBody.color.copy(pal.ink);
    penTip.color.copy(pal.mark);
    const heading = pal.ink.clone();
    const body = pal.ink.clone().lerp(pal.paper, 0.42);
    for (const t of texts) {
      t.lines.forEach((l, i) => t.mesh.setColorAt(i, l.kind === 0 ? heading : body));
      if (t.mesh.instanceColor) t.mesh.instanceColor.needsUpdate = true;
    }
  };
  paint(palette);

  let spread = 0.09;
  let vel = 0;
  let first = true;

  const pose = (t: number, dt: number, sincePulse: number) => {
    // Breathe open and closed; a press throws the fan wide and it springs back.
    const breath = 0.075 + 0.055 * (0.5 - 0.5 * Math.cos((t / 9) * Math.PI * 2));
    const target = breath + (sincePulse < 1.3 ? 0.2 : 0);
    if (first || dt === 0) {
      spread = target;
      first = false;
    } else {
      const h = Math.min(dt, 1 / 30);
      vel += (-38 * (spread - target) - 7.5 * vel) * h;
      spread += vel * h;
    }
    hinges.forEach((hinge, k) => {
      hinge.rotation.z = (k - 1.4) * spread;
      hinge.rotation.y = k * 0.035;
      hinge.position.z = -k * 0.055 - spread * k * 0.08;
    });
    fan.rotation.z = -0.02;

    // Highlighter: come down, sweep the clause line by line, lift away; the stroke holds, then fades.
    const c = (((t - 0.4) % CYCLE) + CYCLE) % CYCLE;
    const sweep = smooth((c - 0.7) / 1.7);
    let run = sweep * total;
    let headLine = 0;
    let headX = strokes[0]?.x ?? 0;
    strokes.forEach((s, i) => {
      const len = Math.max(0, Math.min(s.w, run));
      run -= s.w;
      s.mesh.scale.x = Math.max(0.0001, len);
      s.mesh.visible = len > 0.001;
      if (len > 0 || i === 0) {
        headLine = i;
        headX = s.x + len;
      }
    });
    strokeMat.opacity = 0.9 * (1 - smooth((c - 6.6) / 0.9));
    const head = strokes[headLine];
    const down = smooth((c - 0.1) / 0.6) * (1 - smooth((c - 2.45) / 0.8));
    if (head) {
      // Hop slightly between lines
      const local = head.w > 0 ? (headX - head.x) / head.w : 0;
      const hop = sweep > 0 && sweep < 1 && (local < 0.04 || local > 0.98) ? 0.04 : 0;
      tip.set(headX, head.y, FRONT + 0.006 + hop);
    }
    pen.position.lerpVectors(rest, tip, down);
    pen.rotation.z = (1 - down) * 0.25;
  };

  return {
    object: group,
    camera: { z: mobile ? 7.2 : 8.6, y: -0.1, fov: 32 },
    tilt: 0.28,
    update(t, dt, input) {
      // Settle back toward the composed view after a drag.
      if (!input.dragging) input.rotY += (0 - input.rotY) * (1 - Math.pow(0.5, dt));
      // Reduced motion: the moment after the stroke, pen lifted away.
      pose(ctx.reduced ? 3.6 : t, dt, input.sincePulse);
    },
    setPalette: paint,
  };
}
