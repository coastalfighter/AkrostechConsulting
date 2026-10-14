/**
 * Generative field: the interactive graphic in every page hero.
 *
 * A canvas of particles springs toward a page-specific formation (the scene) while drifting,
 * and reacts to the visitor: the pointer parts the field, a press sends a ripple. Scenes can
 * also move their formation over time (flows, orbits, lanes).
 *
 * Budget: one 2D canvas, batched fills per colour, ≤ 2,400 particles on desktop and ≤ 900 on
 * phones, paused off-screen and in hidden tabs. Under reduced motion the settled formation is
 * drawn once and nothing moves. A visible pause control stops all motion (WCAG 2.2.2).
 */

export interface Point {
  x: number;
  y: number;
  /** Colour index into the palette (0 = base, 1 = highlight, 2 = secondary). */
  c?: number;
  /** Size multiplier. */
  s?: number;
}

export interface SceneContext {
  w: number;
  h: number;
  n: number;
  rand: () => number;
}

export interface Scene {
  /** Formation points in canvas pixels. Called on start and on every resize. */
  targets(ctx: SceneContext): Point[];
  /** Optional per-frame update of a particle's target (flows, orbits). `t` in seconds. */
  move?(p: Particle, t: number, ctx: SceneContext): void;
  /** Draw lines between close particles (network scenes). Distance in px. */
  links?: number;
  /** Spring stiffness toward the target (default 0.035). */
  stiffness?: number;
  /** Optional drawing on top of the particles (e.g. guide lines), in canvas pixels. */
  overlay?(g: CanvasRenderingContext2D, ctx: SceneContext, palette: string[], t: number): void;
  /** Preferred particle density: particles per 1,000 px² (default 5.5). */
  density?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  /** Home target, as set by the scene; `move` may derive tx/ty from it. */
  hx: number;
  hy: number;
  c: number;
  s: number;
  /** Per-particle random seeds, 0–1, independent of each other. */
  r: number;
  q: number;
  /** Free scratch value for scenes (phase, lane, age). */
  k: number;
}

/** Deterministic PRNG so a scene looks the same on every load (mulberry32). */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const css = (el: Element, name: string, fallback: string): string => getComputedStyle(el).getPropertyValue(name).trim() || fallback;

export class Field {
  private readonly canvas: HTMLCanvasElement;
  private readonly g: CanvasRenderingContext2D;
  private readonly root: HTMLElement;
  private readonly scene: Scene;
  private particles: Particle[] = [];
  private palette: string[] = ['#f3f2ee', '#dbde2e', '#c5baea'];
  private w = 0;
  private h = 0;
  private dpr = 1;
  private raf = 0;
  private running = false;
  private visible = false;
  private paused = false;
  private readonly reduced: boolean;
  private readonly pointer = { x: -9999, y: -9999, active: false };
  private ripples: { x: number; y: number; t: number }[] = [];
  private start = performance.now();
  private readonly seed: number;

  constructor(root: HTMLElement, canvas: HTMLCanvasElement, scene: Scene, seed = 7) {
    const g = canvas.getContext('2d', { alpha: true });
    if (!g) throw new Error('Canvas 2D is not available');
    this.root = root;
    this.canvas = canvas;
    this.g = g;
    this.scene = scene;
    this.seed = seed;
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.readPalette();
    this.resize();
    this.bind();
  }

  private readPalette(): void {
    this.palette = [
      css(this.root, '--field-dot', '#f3f2ee'),
      css(this.root, '--field-dot-hi', '#dbde2e'),
      css(this.root, '--field-dot-2', '#c5baea'),
    ];
  }

  private context(): SceneContext {
    return { w: this.w, h: this.h, n: this.particles.length, rand: seeded(this.seed) };
  }

  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.w = rect.width;
    this.h = rect.height;
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    const phone = this.w < 640;
    const density = this.scene.density ?? 5.5;
    const n = Math.round(Math.min(phone ? 900 : 2400, Math.max(260, ((this.w * this.h) / 1000) * density)));
    const rand = seeded(this.seed);
    const targets = this.scene.targets({ w: this.w, h: this.h, n, rand });
    const fresh = this.particles.length === 0;
    const next: Particle[] = targets.slice(0, n).map((t, i) => {
      const old = this.particles[i];
      const r = rand();
      const q = rand();
      return {
        x: old ? old.x : this.reduced ? t.x : this.w * rand(),
        y: old ? old.y : this.reduced ? t.y : this.h * rand(),
        vx: 0,
        vy: 0,
        tx: t.x,
        ty: t.y,
        hx: t.x,
        hy: t.y,
        c: t.c ?? 0,
        s: t.s ?? 1,
        r,
        q,
        k: old ? old.k : r,
      };
    });
    this.particles = next;
    // Without animation, run the scene forward a few seconds off-screen so the single still
    // frame shows the formation (lanes sorted, funnel narrowed, current flowing).
    if (this.reduced) this.settle(6);
    if (fresh || this.reduced || !this.running) this.draw(this.reduced ? 6 : (performance.now() - this.start) / 1000);
  }

  private bind(): void {
    const ro = new ResizeObserver(() => this.resize());
    ro.observe(this.canvas);

    const io = new IntersectionObserver((entries) => {
      this.visible = entries.some((e) => e.isIntersecting);
      this.update();
    });
    io.observe(this.canvas);
    document.addEventListener('visibilitychange', () => this.update());
    document.addEventListener('themechange', () => {
      // Wait a frame so the new theme's custom properties have applied.
      requestAnimationFrame(() => {
        this.readPalette();
        this.draw((performance.now() - this.start) / 1000);
      });
    });

    if (this.reduced) return;
    const local = (e: PointerEvent) => {
      const r = this.canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const target = this.root;
    target.addEventListener('pointermove', (e) => {
      const p = local(e);
      this.pointer.x = p.x;
      this.pointer.y = p.y;
      this.pointer.active = true;
    });
    target.addEventListener('pointerleave', () => {
      this.pointer.active = false;
    });
    target.addEventListener('pointerdown', (e) => {
      if ((e.target as Element | null)?.closest('a, button, input, select, textarea')) return;
      const p = local(e);
      if (p.x < 0 || p.y < 0 || p.x > this.w || p.y > this.h) return;
      this.ripples.push({ x: p.x, y: p.y, t: performance.now() });
    });
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
    this.update();
  }

  private update(): void {
    const shouldRun = this.visible && !document.hidden && !this.paused && !this.reduced;
    if (shouldRun && !this.running) {
      this.running = true;
      const loop = (now: number) => {
        if (!this.running) return;
        this.step((now - this.start) / 1000, now);
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    } else if (!shouldRun && this.running) {
      this.running = false;
      cancelAnimationFrame(this.raf);
    }
  }

  /** Integrate `seconds` of motion at 60 fps without drawing or pointer input. */
  private settle(seconds: number): void {
    const frames = Math.round(seconds * 60);
    for (let f = 0; f < frames; f++) this.integrate(f / 60, 0, false);
  }

  private step(t: number, now: number): void {
    this.integrate(t, now, true);
    this.draw(t);
  }

  private integrate(t: number, now: number, interactive: boolean): void {
    const ctx = this.context();
    const k = this.scene.stiffness ?? 0.035;
    const damping = 0.86;
    const R = Math.max(70, Math.min(150, this.w * 0.12));
    const R2 = R * R;
    const { x: px, y: py } = this.pointer;
    const active = interactive && this.pointer.active;
    if (interactive) this.ripples = this.ripples.filter((r) => now - r.t < 1100);
    const ripples = interactive ? this.ripples : [];

    for (const p of this.particles) {
      if (this.scene.move) this.scene.move(p, t, ctx);
      else {
        // Gentle breathing around the home position.
        p.tx = p.hx + Math.sin(t * 0.7 + p.r * 12) * 2.2;
        p.ty = p.hy + Math.cos(t * 0.6 + p.r * 9) * 2.2;
      }
      let ax = (p.tx - p.x) * k;
      let ay = (p.ty - p.y) * k;

      if (active) {
        const dx = p.x - px;
        const dy = p.y - py;
        const d2 = dx * dx + dy * dy;
        if (d2 < R2 && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const f = (1 - d / R) ** 2 * 2.4;
          ax += (dx / d) * f;
          ay += (dy / d) * f;
        }
      }
      for (const rp of ripples) {
        const age = (now - rp.t) / 1100;
        const ring = age * Math.max(this.w, this.h) * 0.7;
        const dx = p.x - rp.x;
        const dy = p.y - rp.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const band = Math.abs(d - ring);
        if (band < 40) {
          const f = (1 - band / 40) * (1 - age) * 3.2;
          ax += (dx / d) * f;
          ay += (dy / d) * f;
        }
      }
      p.vx = (p.vx + ax) * damping;
      p.vy = (p.vy + ay) * damping;
      p.x += p.vx;
      p.y += p.vy;
    }
  }

  private draw(t: number): void {
    const g = this.g;
    g.clearRect(0, 0, this.w, this.h);
    const ctx = this.context();

    if (this.scene.links) {
      const max = this.scene.links;
      const max2 = max * max;
      g.lineWidth = 1;
      g.strokeStyle = this.palette[2] ?? '#c5baea';
      g.globalAlpha = 0.35;
      g.beginPath();
      const ps = this.particles;
      for (let i = 0; i < ps.length; i++) {
        const a = ps[i]!;
        if (a.s < 1.4) continue;
        for (let j = i + 1; j < ps.length; j++) {
          const b = ps[j]!;
          if (b.s < 1.4) continue;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          if (dx * dx + dy * dy < max2) {
            g.moveTo(a.x, a.y);
            g.lineTo(b.x, b.y);
          }
        }
      }
      g.stroke();
      g.globalAlpha = 1;
    }

    for (let c = 0; c < this.palette.length; c++) {
      g.fillStyle = this.palette[c]!;
      g.beginPath();
      for (const p of this.particles) {
        if (p.c !== c) continue;
        const size = 1.6 * p.s;
        g.moveTo(p.x + size, p.y);
        g.arc(p.x, p.y, size, 0, Math.PI * 2);
      }
      g.fill();
    }

    if (this.scene.overlay) this.scene.overlay(g, ctx, this.palette, t);
  }
}

/* ---------------------------------------------------------------- sampling helpers */

/** Evenly sample points along SVG path data, scaled into a box, with a stroke thickness. */
export function samplePath(d: string, viewBox: [number, number, number, number], box: { x: number; y: number; w: number; h: number }, count: number, thickness: number, rand: () => number): Point[] {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  const total = path.getTotalLength();
  // getPointAtLength is slow; read a fixed polyline once and interpolate along it.
  const steps = 320;
  const xs = new Float32Array(steps + 1);
  const ys = new Float32Array(steps + 1);
  for (let i = 0; i <= steps; i++) {
    const pt = path.getPointAtLength((i / steps) * total);
    xs[i] = pt.x;
    ys[i] = pt.y;
  }
  const [vx, vy, vw, vh] = viewBox;
  const scale = Math.min(box.w / vw, box.h / vh);
  const ox = box.x + (box.w - vw * scale) / 2;
  const oy = box.y + (box.h - vh * scale) / 2;
  const out: Point[] = [];
  for (let i = 0; i < count; i++) {
    const f = (i / count) * steps;
    const j = Math.min(steps - 1, Math.floor(f));
    const u = f - j;
    const px = xs[j]! + (xs[j + 1]! - xs[j]!) * u;
    const py = ys[j]! + (ys[j + 1]! - ys[j]!) * u;
    const nx = -(ys[j + 1]! - ys[j]!);
    const ny = xs[j + 1]! - xs[j]!;
    const len = Math.hypot(nx, ny) || 1;
    const off = (rand() - 0.5) * thickness;
    out.push({ x: ox + (px - vx) * scale + (nx / len) * off * scale, y: oy + (py - vy) * scale + (ny / len) * off * scale });
  }
  return out;
}

/** Sample points from text drawn on an offscreen canvas. */
export function sampleText(text: string, box: { x: number; y: number; w: number; h: number }, count: number, rand: () => number, font = '800 200px "Bricolage Grotesque", Arial, sans-serif'): Point[] {
  const W = 600;
  const H = 240;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  if (!g) return [];
  g.fillStyle = '#000';
  g.font = font;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, W / 2, H / 2 + 10, W * 0.94);
  const data = g.getImageData(0, 0, W, H).data;
  const filled: number[] = [];
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if ((data[(y * W + x) * 4 + 3] ?? 0) > 128) filled.push(x, y);
  const scale = Math.min(box.w / W, box.h / H);
  const ox = box.x + (box.w - W * scale) / 2;
  const oy = box.y + (box.h - H * scale) / 2;
  const out: Point[] = [];
  const pairs = filled.length / 2;
  for (let i = 0; i < count && pairs > 0; i++) {
    const j = Math.floor(rand() * pairs) * 2;
    out.push({ x: ox + (filled[j]! + rand() * 2) * scale, y: oy + (filled[j + 1]! + rand() * 2) * scale });
  }
  return out;
}

/** Scatter `count` points uniformly in a box. */
export function scatter(box: { x: number; y: number; w: number; h: number }, count: number, rand: () => number, c = 0): Point[] {
  return Array.from({ length: count }, () => ({ x: box.x + rand() * box.w, y: box.y + rand() * box.h, c, s: 0.7 + rand() * 0.5 }));
}

/** Assign colours: most base, a share highlight, a share secondary. */
export function colour(points: Point[], rand: () => number, hi = 0.14, second = 0.22): Point[] {
  return points.map((p) => {
    if (p.c !== undefined) return p;
    const r = rand();
    return { ...p, c: r < hi ? 1 : r < hi + second ? 2 : 0 };
  });
}
