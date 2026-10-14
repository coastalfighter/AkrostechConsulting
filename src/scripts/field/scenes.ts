/**
 * The formations, one per page. Each returns target points in canvas pixels for `n`
 * particles; some also move their targets over time. Formations are abstract: a mark, a
 * current, an orbit; never a picture of the service or a chart of data.
 */
import { colour, samplePath, sampleText, scatter, seeded, type Particle, type Point, type Scene, type SceneContext } from './engine';

const TAU = Math.PI * 2;

/** The M-wave mark from the Akrostech logo (viewBox 150 400 1270 800). */
const WAVE = 'M213 1110 L 438 538 A 104 104 0 0 1 641 591 L 489 990 A 106 106 0 0 0 694 1050 L 873 586 Q 940 432 1004 468 A 104 104 0 0 1 1104 611 L 1001 876';
const DASH = 'M1220 876 L 1349 550';

const inset = ({ w, h }: SceneContext, m = 0.1) => ({ x: w * m, y: h * m, w: w * (1 - m * 2), h: h * (1 - m * 2) });

/** Fill the remainder of `n` with faint ambient particles. */
function withAmbient(points: Point[], ctx: SceneContext): Point[] {
  const rest = Math.max(0, ctx.n - points.length);
  return [...points, ...scatter({ x: 0, y: 0, w: ctx.w, h: ctx.h }, rest, ctx.rand, 2).map((p) => ({ ...p, s: 0.6 }))];
}

/* ------------------------------------------------------------------ home: the mark */
const wave: Scene = {
  targets(ctx) {
    const box = inset(ctx, 0.12);
    const main = Math.round(ctx.n * 0.78);
    const markPts = samplePath(WAVE, [150, 400, 1270, 800], box, Math.round(main * 0.9), 110, ctx.rand);
    const dashPts = samplePath(DASH, [150, 400, 1270, 800], box, Math.round(main * 0.1), 110, ctx.rand).map((p) => ({ ...p, c: 1 }));
    return withAmbient(colour([...markPts, ...dashPts], ctx.rand, 0.12, 0.14), ctx);
  },
  move(p, t) {
    // Ambient particles drift slowly; the mark breathes.
    const drift = p.s < 0.8 ? 14 : 2.4;
    p.tx = p.hx + Math.sin(t * 0.35 + p.r * 20) * drift;
    p.ty = p.hy + Math.cos(t * 0.3 + p.r * 14) * drift;
  },
};

/* ------------------------------------------------------- services hub: five orbits */
const orbits: Scene = {
  targets(ctx) {
    const pts: Point[] = [];
    const cx = ctx.w / 2;
    const cy = ctx.h / 2;
    const R = Math.min(ctx.w, ctx.h) * 0.36;
    for (let i = 0; i < ctx.n; i++) {
      const ring = i % 5;
      const a = ctx.rand() * TAU;
      const rr = R * (0.32 + ring * 0.17) + (ctx.rand() - 0.5) * 8;
      pts.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr * 0.62, c: ring === 4 ? 1 : ring % 2 ? 2 : 0, s: ring === 4 ? 1.15 : 1 });
    }
    return pts;
  },
  move(p, t, ctx) {
    const cx = ctx.w / 2;
    const cy = ctx.h / 2;
    const dx = p.hx - cx;
    const dy = (p.hy - cy) / 0.62;
    const rr = Math.hypot(dx, dy);
    const a0 = Math.atan2(dy, dx);
    const speed = 0.12 + (1 - rr / (Math.min(ctx.w, ctx.h) * 0.36)) * 0.18;
    const a = a0 + t * speed;
    p.tx = cx + Math.cos(a) * rr;
    p.ty = cy + Math.sin(a) * rr * 0.62;
  },
  stiffness: 0.06,
};

/* ------------------------------------------------- virtual assistance: sorted lanes */
const lanes: Scene = {
  targets(ctx) {
    return Array.from({ length: ctx.n }, () => ({ x: ctx.rand() * ctx.w, y: ctx.rand() * ctx.h, c: 0 }));
  },
  move(p, t, ctx) {
    // Each particle travels left to right: tangled on the left, sorted into three lanes on the right.
    const period = 9 + p.r * 5;
    const phase = ((t / period + ((p.r * 7.13 + p.q * 3.17) % 1)) % 1 + 1) % 1;
    const lane = Math.floor(p.q * 3);
    const laneY = ctx.h * (0.3 + lane * 0.2);
    const tangled = ctx.h * (0.12 + ((p.q * 7.31 + p.r * 3.7) % 1) * 0.76);
    const sort = Math.min(1, Math.max(0, (phase - 0.3) / 0.35));
    const ease = sort * sort * (3 - 2 * sort);
    p.tx = ctx.w * (-0.05 + phase * 1.1);
    p.ty = tangled + (laneY + (p.q * 3 - lane - 0.5) * 22 - tangled) * ease + Math.sin(t * 2 + p.r * 30) * (1 - ease) * 10;
    p.c = ease > 0.9 ? (lane === 1 ? 1 : lane === 0 ? 0 : 2) : 0;
    // Wrap without a visible streak.
    if (phase < 0.01) {
      p.x = p.tx;
      p.y = p.ty;
    }
  },
  stiffness: 0.08,
};

/* --------------------------------------------------------- recruitment: the narrowing */
const funnel: Scene = {
  targets(ctx) {
    return Array.from({ length: ctx.n }, () => ({ x: ctx.rand() * ctx.w, y: ctx.rand() * ctx.h, c: 0 }));
  },
  move(p, t, ctx) {
    const period = 7 + p.r * 6;
    const phase = ((t / period + ((p.r * 5.31 + p.q * 2.71) % 1)) % 1 + 1) % 1;
    const cx = ctx.w / 2;
    // Most particles leave the stream at each stage; one in twelve reaches the end.
    const survives = p.q > 0.92;
    const exitAt = 0.25 + ((p.q * 13.7) % 1) * 0.55;
    const width = ctx.w * 0.46 * (1 - phase) ** 1.6 + 6;
    const lateral = (p.q * 2 - 1) * width;
    p.tx = cx + lateral;
    p.ty = ctx.h * (0.04 + phase * 0.92);
    if (!survives && phase > exitAt) {
      const out = (phase - exitAt) * 3;
      p.tx = cx + lateral + Math.sign(lateral || 1) * out * ctx.w * 0.6;
      p.ty = ctx.h * (0.04 + exitAt * 0.92) - out * 40;
    }
    p.c = survives && phase > 0.55 ? 1 : survives ? 2 : 0;
    p.s = survives && phase > 0.55 ? 1.6 : 1;
    if (phase < 0.01) {
      p.x = p.tx;
      p.y = p.ty;
    }
  },
  stiffness: 0.07,
};

/* ------------------------------------------------------------- accounting: balance */
const ledger: Scene = {
  targets(ctx) {
    const cols = 14;
    const rows = Math.max(8, Math.round(ctx.n / cols / 6));
    const pts: Point[] = [];
    const box = inset(ctx, 0.1);
    for (let i = 0; i < ctx.n; i++) {
      const col = i % cols;
      // Two mirrored stacks of columns that must come out level.
      const left = col < cols / 2;
      const height = 0.35 + 0.55 * Math.abs(Math.sin(col * 1.7 + 0.4));
      const cx = box.x + (col + 0.5) * (box.w / cols);
      const level = box.y + box.h * (1 - height * ctx.rand());
      pts.push({ x: cx + (ctx.rand() - 0.5) * (box.w / cols) * 0.55, y: level, c: left ? 0 : 2 });
    }
    void rows;
    return pts;
  },
  move(p, t, ctx) {
    // Columns settle toward one level line, then rise again: the books balancing.
    const box = inset(ctx, 0.1);
    const lineY = box.y + box.h * 0.5;
    const cycle = (Math.sin(t * 0.45) + 1) / 2;
    p.tx = p.hx;
    p.ty = p.hy + (lineY + (p.hy - box.y - box.h * 0.5) * 0.12 - p.hy) * cycle;
    p.c = cycle > 0.9 && Math.abs(p.ty - lineY) < box.h * 0.08 ? 1 : p.hx < ctx.w / 2 ? 0 : 2;
  },
  overlay(g, ctx, palette, t) {
    const box = inset(ctx, 0.1);
    const cycle = (Math.sin(t * 0.45) + 1) / 2;
    g.globalAlpha = 0.25 + cycle * 0.5;
    g.strokeStyle = palette[1] ?? '#dbde2e';
    g.lineWidth = 1;
    g.setLineDash([4, 6]);
    g.beginPath();
    g.moveTo(box.x, box.y + box.h * 0.5);
    g.lineTo(box.x + box.w, box.y + box.h * 0.5);
    g.stroke();
    g.setLineDash([]);
    g.globalAlpha = 1;
  },
};

/* ------------------------------------------------------------ legal: lines of a page */
const documentScene: Scene = {
  targets(ctx) {
    const box = inset(ctx, 0.12);
    const lines = 14;
    const pts: Point[] = [];
    const rand = seeded(42);
    const lengths = Array.from({ length: lines }, (_, i) => (i % 5 === 4 ? 0.45 : 0.75 + rand() * 0.25));
    const highlight = new Set([5, 6]);
    for (let i = 0; i < ctx.n; i++) {
      const line = i % lines;
      const y = box.y + (line + 0.5) * (box.h / lines);
      const x = box.x + ctx.rand() * box.w * lengths[line]!;
      pts.push({ x, y: y + (ctx.rand() - 0.5) * 3, c: highlight.has(line) ? 1 : line % 3 === 0 ? 2 : 0 });
    }
    return pts;
  },
  move(p, t) {
    // A reading line passes down the page; particles on it lift slightly.
    p.tx = p.hx + Math.sin(t * 0.8 + p.r * 30) * 1.5;
    p.ty = p.hy + Math.cos(t * 0.6 + p.r * 20) * 1.2;
  },
};

/* ------------------------------------------------------- website development: layout */
const wireframe: Scene = {
  targets(ctx) {
    const box = inset(ctx, 0.1);
    const rects: { x: number; y: number; w: number; h: number; c: number; fill?: boolean }[] = [
      { x: 0, y: 0, w: 1, h: 1, c: 0 },
      { x: 0, y: 0, w: 1, h: 0.08, c: 2, fill: true },
      { x: 0.06, y: 0.16, w: 0.5, h: 0.28, c: 1, fill: true },
      { x: 0.62, y: 0.16, w: 0.32, h: 0.28, c: 0 },
      { x: 0.06, y: 0.52, w: 0.27, h: 0.2, c: 2 },
      { x: 0.365, y: 0.52, w: 0.27, h: 0.2, c: 2 },
      { x: 0.67, y: 0.52, w: 0.27, h: 0.2, c: 2 },
      { x: 0.06, y: 0.8, w: 0.88, h: 0.12, c: 0, fill: true },
    ];
    const perimeter = rects.reduce((sum, r) => sum + (r.fill ? r.w * r.h * 8 : (r.w + r.h) * 2), 0);
    const pts: Point[] = [];
    for (const r of rects) {
      const share = (r.fill ? r.w * r.h * 8 : (r.w + r.h) * 2) / perimeter;
      const count = Math.round(ctx.n * share);
      for (let i = 0; i < count; i++) {
        let u: number;
        let v: number;
        if (r.fill) {
          u = ctx.rand();
          v = ctx.rand();
        } else {
          const along = ctx.rand() * (r.w + r.h) * 2;
          if (along < r.w) [u, v] = [along / r.w, 0];
          else if (along < r.w + r.h) [u, v] = [1, (along - r.w) / r.h];
          else if (along < r.w * 2 + r.h) [u, v] = [(along - r.w - r.h) / r.w, 1];
          else [u, v] = [0, (along - r.w * 2 - r.h) / r.h];
        }
        pts.push({ x: box.x + (r.x + u * r.w) * box.w, y: box.y + (r.y + v * r.h) * box.h, c: r.c });
      }
    }
    return pts;
  },
  move(p, t, ctx) {
    // Blocks assemble from the top, hold, and reflow.
    const box = inset(ctx, 0.1);
    const cycle = (t * 0.12 + p.r * 0.04) % 1;
    const build = Math.min(1, cycle * 3);
    const yIn = box.y + (p.hy - box.y) * build;
    p.tx = p.hx;
    p.ty = cycle > 0.92 ? p.hy + (cycle - 0.92) * 400 * (p.r - 0.5) : yIn;
  },
  stiffness: 0.05,
};

/* --------------------------------------------------------------- about: the network */
const network: Scene = {
  targets(ctx) {
    const pts: Point[] = [];
    const cx = ctx.w / 2;
    const levels = [1, 3, 9, 18];
    const nodes: Point[] = [];
    levels.forEach((count, level) => {
      const y = ctx.h * (0.16 + level * 0.23);
      for (let i = 0; i < count; i++) {
        const spread = ctx.w * (0.12 + level * 0.25);
        const x = count === 1 ? cx : cx - spread / 2 + (spread * i) / (count - 1);
        nodes.push({ x, y, c: level === 0 ? 1 : level === 1 ? 2 : 0, s: 3 - level * 0.45 });
      }
    });
    pts.push(...nodes);
    // Halo particles cling to each node.
    const rest = ctx.n - nodes.length;
    for (let i = 0; i < rest; i++) {
      const node = nodes[i % nodes.length]!;
      const a = ctx.rand() * TAU;
      const rr = 6 + ctx.rand() * 22;
      pts.push({ x: node.x + Math.cos(a) * rr, y: node.y + Math.sin(a) * rr, c: node.c, s: 0.6 });
    }
    return pts;
  },
  move(p, t) {
    const amp = p.s > 1.4 ? 3 : 7;
    p.tx = p.hx + Math.sin(t * 0.9 + p.r * 17) * amp;
    p.ty = p.hy + Math.cos(t * 0.7 + p.r * 11) * amp;
  },
  links: 160,
  density: 3,
};

/* --------------------------------------------------------------- blog: the current */
function flow(seed: number): Scene {
  return {
    targets(ctx) {
      return Array.from({ length: ctx.n }, (_, i) => ({ x: ctx.rand() * ctx.w, y: ctx.rand() * ctx.h, c: i % 9 === 0 ? 1 : i % 4 === 0 ? 2 : 0 }));
    },
    move(p, t, ctx) {
      // Each particle rides its own wave line left to right, like a current read from above;
      // the lines stay evenly spread down the panel and wrap at the right edge.
      const speed = 0.018 + p.q * 0.022;
      const phase = (((p.r + t * speed) % 1) + 1) % 1;
      const x = (phase * 1.1 - 0.05) * ctx.w;
      const lines = 15;
      const line = Math.floor(p.q * lines);
      const base = ((line + 0.5) / lines) * ctx.h + (((p.q * lines) % 1) - 0.5) * 6;
      const y = base + Math.sin(x * 0.007 + t * 0.55 + seed + line * 0.45) * ctx.h * 0.035 + Math.sin(x * 0.0026 - t * 0.25 + seed * 3) * ctx.h * 0.07;
      p.tx = x;
      p.ty = y;
      if (phase < 0.004) {
        p.x = x;
        p.y = y;
      }
    },
    stiffness: 0.12,
    density: 4.5,
  };
}

/* ------------------------------------------------------------- contact: the relay */
const relay: Scene = {
  targets(ctx) {
    return Array.from({ length: ctx.n }, (_, i) => ({ x: ctx.rand() * ctx.w, y: ctx.rand() * ctx.h, c: i % 2 ? 0 : 2 }));
  },
  move(p, t, ctx) {
    // Two clusters, one for each side of the world; a share of particles travels between them.
    const a = { x: ctx.w * 0.24, y: ctx.h * 0.55 };
    const b = { x: ctx.w * 0.76, y: ctx.h * 0.45 };
    const home = p.r < 0.5 ? a : b;
    const traveller = p.q < 0.2;
    if (!traveller) {
      const ang = p.r * 200 + t * (0.25 + p.q * 0.2);
      const rr = 14 + Math.sqrt(p.q) * Math.min(ctx.w, ctx.h) * 0.22;
      p.tx = home.x + Math.cos(ang) * rr;
      p.ty = home.y + Math.sin(ang) * rr * 0.8;
      p.c = p.r < 0.5 ? 0 : 2;
      return;
    }
    const period = 5 + p.q * 3;
    const phase = ((t / period + p.r * 7.1) % 1 + 1) % 1;
    const from = p.r < 0.5 ? a : b;
    const to = p.r < 0.5 ? b : a;
    const lift = Math.sin(phase * Math.PI) * ctx.h * 0.3;
    p.tx = from.x + (to.x - from.x) * phase;
    p.ty = from.y + (to.y - from.y) * phase - lift;
    p.c = 1;
  },
  stiffness: 0.07,
};

/* ------------------------------------------------------------- privacy: the boundary */
const shield: Scene = {
  targets(ctx) {
    const cx = ctx.w / 2;
    const cy = ctx.h / 2;
    const R = Math.min(ctx.w, ctx.h) * 0.36;
    const ringCount = Math.round(ctx.n * 0.3);
    const pts: Point[] = [];
    for (let i = 0; i < ringCount; i++) {
      const a = (i / ringCount) * TAU;
      pts.push({ x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R, c: 1, s: 1.1 });
    }
    for (let i = ringCount; i < ctx.n; i++) {
      const a = ctx.rand() * TAU;
      const rr = Math.sqrt(ctx.rand()) * R * 0.86;
      pts.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr, c: ctx.rand() < 0.3 ? 2 : 0 });
    }
    return pts;
  },
  move(p, t, ctx) {
    if (p.c === 1) {
      const cx = ctx.w / 2;
      const cy = ctx.h / 2;
      const a = Math.atan2(p.hy - cy, p.hx - cx) + t * 0.05;
      const R = Math.hypot(p.hx - cx, p.hy - cy);
      p.tx = cx + Math.cos(a) * R;
      p.ty = cy + Math.sin(a) * R;
      return;
    }
    p.tx = p.hx + Math.sin(t * 0.5 + p.r * 30) * 5;
    p.ty = p.hy + Math.cos(t * 0.4 + p.r * 22) * 5;
  },
  stiffness: 0.05,
};

/* ------------------------------------------------------------------ terms: the index */
const indexGrid: Scene = {
  targets(ctx) {
    const box = inset(ctx, 0.1);
    const cols = Math.max(12, Math.round(Math.sqrt((ctx.n * box.w) / box.h)));
    const rows = Math.ceil(ctx.n / cols);
    return Array.from({ length: ctx.n }, (_, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const section = Math.floor((row / rows) * 9);
      return { x: box.x + (col + 0.5) * (box.w / cols), y: box.y + (row + 0.5) * (box.h / rows), c: section % 3 === 1 ? 2 : section === 4 ? 1 : 0 };
    });
  },
  move(p, t, ctx) {
    // A scan line reads down the index; entries it passes nudge right.
    const box = inset(ctx, 0.1);
    const scan = box.y + ((t * 0.12) % 1) * box.h;
    const near = Math.max(0, 1 - Math.abs(p.hy - scan) / 30);
    p.tx = p.hx + near * 8;
    p.ty = p.hy;
  },
  density: 3.5,
};

/* ----------------------------------------------------------------- 404: lost, then found */
const lost: Scene = {
  targets(ctx) {
    const box = inset(ctx, 0.14);
    const text = sampleText('404', box, Math.round(ctx.n * 0.75), ctx.rand);
    return withAmbient(colour(text, ctx.rand, 0.15, 0.15), ctx);
  },
  move(p, t) {
    // The figures drift apart and regroup, as if looking for the right page.
    const loose = (Math.sin(t * 0.5) + 1) / 2;
    const spread = p.s < 0.8 ? 18 : 2 + loose * 26 * p.r;
    p.tx = p.hx + Math.sin(t * 0.6 + p.r * 25) * spread;
    p.ty = p.hy + Math.cos(t * 0.5 + p.r * 19) * spread;
  },
};

const scenes: Record<string, Scene> = {
  wave,
  orbits,
  lanes,
  funnel,
  ledger,
  document: documentScene,
  wireframe,
  network,
  flow: flow(1.3),
  'flow-article': flow(4.1),
  relay,
  shield,
  index: indexGrid,
  lost,
};

export function sceneFor(name: string): Scene {
  return scenes[name] ?? wave;
}

export type { Particle };
