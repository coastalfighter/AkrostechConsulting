/**
 * Blog: an open book, riffling. Thin rounded pages printed with lines of text fan out from a
 * vertical spine and drift slowly, as if a thumb were letting them fall one by one. One page
 * carries the signal: a chartreuse highlight across a line and a chartreuse ribbon bookmark.
 * Every article seeds its own book (page count, fan, tints, text layout, which page is marked),
 * so no two guides share a hero. A press riffles the pages: a wave runs through the stack.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { contactShadow, glossy, type HeroScene, type Palette, type SceneContext } from '../engine';
import { framer } from '../frame';

const W = 1.62;
const H = 2.2;
const RADIUS = 0.07;
const THICK = 0.006;
const BEVEL = 0.003;
const FACE = THICK / 2 + BEVEL + 0.0016;

function pageShape(): THREE.Shape {
  const s = new THREE.Shape();
  const r = RADIUS;
  // The spine edge (x = 0) stays square; the free edge is rounded.
  s.moveTo(0, -H / 2);
  s.lineTo(W - r, -H / 2);
  s.quadraticCurveTo(W, -H / 2, W, -H / 2 + r);
  s.lineTo(W, H / 2 - r);
  s.quadraticCurveTo(W, H / 2, W - r, H / 2);
  s.lineTo(0, H / 2);
  s.lineTo(0, -H / 2);
  return s;
}

/** A rounded bar lying on a page face, from x0 to x1 at height y. */
function bar(x0: number, x1: number, y: number, h: number, z: number, back: boolean, round = h / 2): THREE.BufferGeometry {
  const w = Math.abs(x1 - x0);
  const s = new THREE.Shape();
  const r = Math.min(round, h / 2, w / 2);
  s.moveTo(r, 0);
  s.lineTo(w - r, 0);
  s.absarc(w - r, r, r, -Math.PI / 2, 0, false);
  s.lineTo(w, h - r);
  s.absarc(w - r, h - r, r, 0, Math.PI / 2, false);
  s.lineTo(r, h);
  s.absarc(r, h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(0, r);
  s.absarc(r, r, r, Math.PI, (Math.PI * 3) / 2, false);
  const g = new THREE.ShapeGeometry(s, 4);
  g.translate(Math.min(x0, x1), y - h / 2, 0);
  if (back) {
    // Mirror onto the back face so the text reads from behind.
    g.rotateY(Math.PI);
    g.translate(W, 0, 0);
    g.translate(0, 0, -z);
  } else g.translate(0, 0, z);
  return g;
}

interface Layout {
  text: THREE.BufferGeometry;
  block: THREE.BufferGeometry | null;
  /** Height of the line the highlighter sits on (front face). */
  markY: number;
  markW: number;
}

/** Text lines for one page, both faces: a heading, paragraphs, sometimes a picture block. */
function layoutPage(rand: () => number, mobile: boolean): Layout {
  const text: THREE.BufferGeometry[] = [];
  const blocks: THREE.BufferGeometry[] = [];
  const mx = 0.2;
  const inner = W - mx * 2;
  let markY = 0;
  let markW = inner * 0.7;
  for (const back of [false, true]) {
    const xs = (a: number) => a;
    let y = H / 2 - 0.24;
    text.push(bar(xs(mx), xs(mx + inner * (0.45 + rand() * 0.3)), y, 0.085, FACE, back));
    y -= 0.2;
    const picture = rand() < 0.4;
    if (picture) {
      const ph = 0.42 + rand() * 0.2;
      blocks.push(bar(xs(mx), xs(mx + inner), y - ph / 2 + 0.03, ph, FACE, back, 0.05));
      y -= ph + 0.1;
    }
    const lines = mobile ? 6 : 8;
    let made = 0;
    while (y > -H / 2 + 0.22 && made < 40) {
      const paragraph = 2 + Math.floor(rand() * 4);
      for (let i = 0; i < paragraph && y > -H / 2 + 0.22; i++) {
        const last = i === paragraph - 1;
        const w = inner * (last ? 0.35 + rand() * 0.35 : 0.86 + rand() * 0.14);
        text.push(bar(xs(mx), xs(mx + w), y, 0.034, FACE, back));
        if (!back && made === 2) {
          markY = y;
          markW = w;
        }
        y -= 0.1;
        made++;
      }
      y -= 0.07;
      if (made > lines * 3) break;
    }
  }
  return {
    text: mergeGeometries(text) ?? new THREE.BufferGeometry(),
    block: blocks.length ? (mergeGeometries(blocks) ?? null) : null,
    markY,
    markW,
  };
}

const ease = (x: number) => x * x * (3 - 2 * x);

export default function pages(ctx: SceneContext): HeroScene {
  const { palette, mobile, rand } = ctx;
  const group = new THREE.Group();
  const book = new THREE.Group();
  group.add(book);

  // ---- The seed shapes the book
  const n = 8 + Math.floor(rand() * 4);
  const accent = 1 + Math.floor(rand() * (n - 2));
  const tinted = new Set<number>([Math.floor(rand() * n), Math.floor(rand() * n)]);
  tinted.delete(accent);
  const centre = 0.42 + rand() * 0.16;
  const spread = 0.9 + rand() * 0.25;
  const yaw = -0.42 + (rand() - 0.5) * 0.24;
  const pitch = 0.16 + rand() * 0.1;
  book.rotation.set(pitch, yaw, (rand() - 0.5) * 0.08);

  const geo = new THREE.ExtrudeGeometry(pageShape(), { depth: THICK, bevelEnabled: true, bevelThickness: BEVEL, bevelSize: BEVEL, bevelSegments: 1, curveSegments: mobile ? 4 : 8 });
  geo.translate(0, 0, -THICK / 2);
  geo.computeVertexNormals();

  const paperMat = glossy(palette.surface.clone(), { roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.5 });
  const tintMat = glossy(palette.soft.clone(), { roughness: 0.5, clearcoat: 0.3, clearcoatRoughness: 0.5 });
  const inkMat = new THREE.MeshBasicMaterial({ color: palette.ink, transparent: true, opacity: 0.42, toneMapped: false, depthWrite: false });
  const inkOnTintMat = new THREE.MeshBasicMaterial({ color: palette.ink, transparent: true, opacity: 0.5, toneMapped: false, depthWrite: false });
  const blockMat = new THREE.MeshBasicMaterial({ color: palette.soft, transparent: true, opacity: 0.85, toneMapped: false, depthWrite: false });
  const markMat = new THREE.MeshBasicMaterial({ color: palette.mark, toneMapped: false });
  const ribbonMat = new THREE.MeshPhysicalMaterial({ color: palette.mark, roughness: 0.35, clearcoat: 0.8, side: THREE.DoubleSide });

  const leaves = Array.from({ length: n }, (_, i) => {
    const leaf = new THREE.Group();
    const tint = tinted.has(i);
    const sheet = new THREE.Mesh(geo, tint ? tintMat : paperMat);
    leaf.add(sheet);
    const lay = layoutPage(rand, mobile);
    const words = new THREE.Mesh(lay.text, tint ? inkOnTintMat : inkMat);
    words.renderOrder = 2;
    leaf.add(words);
    if (lay.block && !tint) {
      const b = new THREE.Mesh(lay.block, blockMat);
      b.renderOrder = 1;
      leaf.add(b);
    }
    if (i === accent) {
      const hl = new THREE.Mesh(bar(0.17, 0.23 + lay.markW, lay.markY, 0.09, FACE - 0.0006, false), markMat);
      hl.renderOrder = 1;
      leaf.add(hl);
      // A ribbon bookmark hanging over the top edge.
      const rib = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.62, 1, 8), ribbonMat);
      const p = rib.geometry.attributes.position as THREE.BufferAttribute;
      for (let v = 0; v < p.count; v++) {
        const y = p.getY(v);
        p.setZ(v, Math.sin((y + 0.31) * 3.2) * 0.05 + 0.004);
        if (y < -0.25) p.setX(v, p.getX(v) * 0.2 + (p.getX(v) > 0 ? 0.04 : -0.04));
      }
      p.needsUpdate = true;
      rib.geometry.computeVertexNormals();
      rib.position.set(W * 0.72, H / 2 + 0.2, 0);
      leaf.add(rib);
    }
    // A hair of vertical stagger, like pages that never quite align.
    leaf.position.y = (i - n / 2) * 0.008;
    book.add(leaf);
    return { leaf, flutter: rand() * Math.PI * 2 };
  });

  // Spine: a slim rounded rod the pages hinge on.
  const spineMat = glossy(palette.ink.clone(), { roughness: 0.3, clearcoat: 1 });
  const spine = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, H + 0.02, 4, 12), spineMat);
  book.add(spine);

  const shadow = contactShadow(2.3, palette.dark ? 0.5 : 0.24);
  shadow.position.y = -H / 2 - 0.42;
  shadow.scale.set(1.25, 0.55, 1);
  group.add(shadow);
  group.position.y = -0.1;

  // ---- Fan: each page's angle about the spine from a travelling "release" point s
  const MIN = 0.1;
  const MAX = Math.PI - 0.1;
  const k = n * spread;
  const angleFor = (i: number, s: number) => {
    const u = THREE.MathUtils.clamp((s * (n + k) - i) / k, 0, 1);
    return MAX - (MAX - MIN) * ease(u);
  };

  const step = (t: number, sincePulse: number) => {
    const s = centre + Math.sin(t * 0.21) * 0.09 + Math.sin(t * 0.083 + 1.3) * 0.05;
    const riffle = sincePulse < 3 ? sincePulse : Infinity;
    for (let i = 0; i < n; i++) {
      const L = leaves[i]!;
      let a = angleFor(i, s) + Math.sin(t * 0.55 + L.flutter) * 0.025;
      if (Number.isFinite(riffle)) {
        // A thumb runs down the stack: each page lifts toward the left in turn and settles.
        const d = riffle * 9 - i;
        a += Math.exp(-d * d * 0.18) * 0.75 * (1 - riffle / 3);
      }
      // Negative: the fan opens toward the viewer.
      L.leaf.rotation.y = -a;
    }
    book.position.y = Math.sin(t * 0.4) * 0.04;
  };
  step(2.5, Infinity);
  paint(palette);

  const frame = framer(ctx.renderer.domElement, ctx.camera, group, 1.3);

  return {
    object: group,
    camera: { z: 8.6, fov: 32 },
    tilt: 0.25,
    update(t, _dt, input) {
      frame.update(t);
      // Dragging turns the book; it eases back to its composed angle.
      if (!input.dragging) input.rotY += (0 - input.rotY) * (1 - Math.pow(0.6, _dt));
      step(t, input.sincePulse);
    },
    setPalette: paint,
  };
  function paint(p: Palette) {
    paperMat.color.copy(p.surface);
    tintMat.color.copy(p.dark ? p.violet.clone().lerp(p.surface, 0.45) : p.soft);
    inkMat.color.copy(p.dark ? p.paper : p.ink);
    inkMat.opacity = p.dark ? 0.5 : 0.42;
    inkOnTintMat.color.copy(p.dark ? p.paper : p.ink);
    blockMat.color.copy(p.soft);
    markMat.color.copy(p.mark);
    ribbonMat.color.copy(p.mark);
    spineMat.color.copy(p.dark ? p.lavender : p.ink);
    (shadow.material as THREE.MeshBasicMaterial).opacity = p.dark ? 0.5 : 0.24;
  }
}
