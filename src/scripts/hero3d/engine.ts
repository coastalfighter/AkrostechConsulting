/**
 * Hero 3D engine. One WebGL renderer per hero, a studio environment for reflections, and a
 * page-specific scene module (./scenes/*.ts) that builds its object and animates it.
 *
 * Interaction: the pointer tilts the object (parallax), dragging rotates it with inertia, a
 * press sends a pulse the scene can react to. The canvas renders only while on screen and the
 * tab is visible; under reduced motion it renders a single settled frame. Theme changes
 * re-colour the scene without rebuilding it.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export interface Palette {
  dark: boolean;
  paper: THREE.Color;
  ink: THREE.Color;
  mark: THREE.Color;
  lavender: THREE.Color;
  violet: THREE.Color;
  /** Page ground behind the object. */
  ground: THREE.Color;
  /** Main surface colour for objects (paper in light, a lifted ink in dark). */
  surface: THREE.Color;
  /** Line and dot colour that reads on the ground. */
  line: THREE.Color;
  /** Soft accent (lavender in light, violet in dark). */
  soft: THREE.Color;
}

export interface Input {
  /** Pointer position over the hero, −1…1 from the object's centre (smoothed). */
  x: number;
  y: number;
  /** Rotation from dragging, in radians, with inertia. */
  rotX: number;
  rotY: number;
  dragging: boolean;
  /** Seconds since the last press (Infinity before the first). */
  sincePulse: number;
  /** Where the last press landed, in normalised device coordinates. */
  pulseX: number;
  pulseY: number;
}

export interface SceneContext {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  palette: Palette;
  reduced: boolean;
  mobile: boolean;
  seed: string;
  /** Deterministic random numbers for this page. */
  rand: () => number;
}

export interface HeroScene {
  object: THREE.Object3D;
  /** Called every frame; `t` and `dt` in seconds. */
  update(t: number, dt: number, input: Input): void;
  setPalette?(p: Palette): void;
  /** Camera distance and vertical framing for this object (defaults: z 6, y 0, fov 32). */
  camera?: { z?: number; y?: number; fov?: number };
  /** How strongly the pointer tilts the object (default 0.35 rad). */
  tilt?: number;
  /** Whether dragging rotates the object (default true). */
  draggable?: boolean;
}

export type SceneFactory = (ctx: SceneContext) => HeroScene;

const css = (el: Element, name: string, fallback: string): string => getComputedStyle(el).getPropertyValue(name).trim() || fallback;

export function readPalette(): Palette {
  const root = document.documentElement;
  const dark = root.dataset.theme === 'dark';
  const c = (v: string) => new THREE.Color(v);
  const paper = c(css(root, '--carbon-50', '#f3f2ee'));
  const ink = c(css(root, '--carbon-950', '#161110'));
  const lavender = c(css(root, '--violet-300', '#c5baea'));
  const violet = c(css(root, '--violet-600', '#6327c5'));
  return {
    dark,
    paper,
    ink,
    mark: c(css(root, '--lime-400', '#dbde2e')),
    lavender,
    violet,
    ground: dark ? ink.clone() : paper.clone(),
    surface: dark ? c('#2a2220') : c('#fbfaf8'),
    line: dark ? paper.clone() : ink.clone(),
    soft: dark ? violet.clone() : lavender.clone(),
  };
}

/** Deterministic PRNG from a string seed (mulberry32 over a string hash). */
export function seededRandom(seed: string): () => number {
  let a = [...seed].reduce((h, ch) => (Math.imul(h, 31) + ch.charCodeAt(0)) | 0, 7) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A soft round shadow on a plane, drawn once to a canvas texture. */
export function contactShadow(radius: number, opacity = 0.35): THREE.Mesh {
  const size = 256;
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const g = cv.getContext('2d');
  if (g) {
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(22,17,16,1)');
    grad.addColorStop(0.45, 'rgba(22,17,16,0.45)');
    grad.addColorStop(1, 'rgba(22,17,16,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(cv);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(radius * 2, radius * 2),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity, depthWrite: false }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.renderOrder = -1;
  return mesh;
}

/** Glossy physical material: the house finish for objects. */
export function glossy(color: THREE.Color, opts: Partial<THREE.MeshPhysicalMaterialParameters> = {}): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({ color, roughness: 0.32, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.25, ...opts });
}

/** Frosted glass. Real transmission on capable devices, a translucent stand-in on phones. */
export function glass(color: THREE.Color, mobile: boolean, opts: Partial<THREE.MeshPhysicalMaterialParameters> = {}): THREE.MeshPhysicalMaterial {
  if (mobile) return new THREE.MeshPhysicalMaterial({ color, roughness: 0.15, transparent: true, opacity: 0.45, clearcoat: 1, ...opts });
  return new THREE.MeshPhysicalMaterial({ color, roughness: 0.12, transmission: 1, thickness: 0.6, ior: 1.4, clearcoat: 1, clearcoatRoughness: 0.1, attenuationColor: color, attenuationDistance: 2.5, ...opts });
}

export class Hero3D {
  private readonly root: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly pivot = new THREE.Group();
  private readonly tiltGroup = new THREE.Group();
  private hero!: HeroScene;
  private palette: Palette;
  private readonly reduced: boolean;
  private readonly mobile: boolean;
  private readonly clock = new THREE.Clock(false);
  private elapsed = 0;
  private running = false;
  private visible = false;
  private paused = false;
  private raf = 0;
  private w = 0;
  private h = 0;
  private frameOffset = 0;
  private baseZ = 6;
  private readonly input: Input = { x: 0, y: 0, rotX: 0, rotY: 0, dragging: false, sincePulse: Infinity, pulseX: 0, pulseY: 0 };
  private targetX = 0;
  private targetY = 0;
  private velX = 0;
  private velY = 0;
  private pulseAt = -Infinity;

  constructor(root: HTMLElement, canvas: HTMLCanvasElement, factory: SceneFactory, seed: string) {
    this.root = root;
    this.canvas = canvas;
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.mobile = matchMedia('(max-width: 63.99rem), (pointer: coarse)').matches;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.mobile ? 1.6 : 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    this.palette = readPalette();

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.75;
    pmrem.dispose();

    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(-3, 5, 4);
    const rim = new THREE.DirectionalLight(0xffffff, 0.6);
    rim.position.set(4, 2, -3);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7f78, 0.55), key, rim);

    this.tiltGroup.add(this.pivot);
    this.scene.add(this.tiltGroup);

    this.hero = factory({
      renderer: this.renderer,
      scene: this.scene,
      camera: this.camera,
      palette: this.palette,
      reduced: this.reduced,
      mobile: this.mobile,
      seed,
      rand: seededRandom(seed),
    });
    this.pivot.add(this.hero.object);
    const cam = this.hero.camera ?? {};
    this.camera.fov = cam.fov ?? 32;
    this.baseZ = cam.z ?? 6;
    this.camera.position.set(0, cam.y ?? 0, this.baseZ);
    this.camera.lookAt(0, cam.y ?? 0, 0);

    this.resize();
    this.bind();
    // First frame: settle a moment of motion so the still frame is representative.
    this.hero.update(this.reduced ? 2.5 : 0, 0, this.input);
    this.render();
    root.dataset.hero3dReady = 'true';
  }

  private bind(): void {
    new ResizeObserver(() => {
      this.resize();
      if (!this.running) this.render();
    }).observe(this.canvas);
    new IntersectionObserver((entries) => {
      this.visible = entries.some((e) => e.isIntersecting);
      this.update();
    }).observe(this.canvas);
    document.addEventListener('visibilitychange', () => this.update());
    document.addEventListener('themechange', () =>
      requestAnimationFrame(() => {
        this.palette = readPalette();
        this.hero.setPalette?.(this.palette);
        this.render();
      }),
    );
    if (this.reduced) return;

    const ndc = (e: PointerEvent) => {
      const r = this.canvas.getBoundingClientRect();
      // Centre of the object on screen (the projection is shifted right on wide layouts).
      const cx = r.left + r.width / 2 + this.frameOffset;
      return { x: ((e.clientX - cx) / (r.width / 2)) * 1, y: -((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) };
    };
    this.root.addEventListener('pointermove', (e) => {
      const p = ndc(e);
      this.targetX = Math.max(-1.2, Math.min(1.2, p.x));
      this.targetY = Math.max(-1.2, Math.min(1.2, p.y));
    });
    this.root.addEventListener('pointerleave', () => {
      this.targetX = 0;
      this.targetY = 0;
    });

    const draggable = this.hero.draggable !== false;
    let last: { x: number; y: number; t: number } | null = null;
    let pointerId: number | null = null;
    const isControl = (t: EventTarget | null) => (t as Element | null)?.closest?.('a, button, input, select, textarea, label');
    this.canvas.addEventListener('pointerdown', (e) => {
      if (isControl(e.target) || pointerId !== null) return;
      const p = ndc(e);
      this.pulseAt = this.elapsed;
      this.input.pulseX = p.x;
      this.input.pulseY = p.y;
      if (!draggable) return;
      pointerId = e.pointerId;
      last = { x: e.clientX, y: e.clientY, t: performance.now() };
      this.input.dragging = true;
      this.canvas.setPointerCapture(e.pointerId);
    });
    this.canvas.addEventListener('pointermove', (e) => {
      if (e.pointerId !== pointerId || !last) return;
      const now = performance.now();
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      const dt = Math.max(8, now - last.t);
      this.input.rotY += dx * 0.008;
      this.input.rotX = Math.max(-0.9, Math.min(0.9, this.input.rotX + dy * 0.006));
      this.velY = (dx * 0.008) / (dt / 16);
      this.velX = (dy * 0.006) / (dt / 16);
      last = { x: e.clientX, y: e.clientY, t: now };
    });
    const end = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      last = null;
      this.input.dragging = false;
    };
    this.canvas.addEventListener('pointerup', end);
    this.canvas.addEventListener('pointercancel', end);
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
    this.update();
  }

  private resize(): void {
    const r = this.canvas.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    this.w = r.width;
    this.h = r.height;
    this.renderer.setSize(this.w, this.h, false);
    this.camera.aspect = this.w / this.h;
    // Portrait stages (phones) narrow the horizontal view; pull back so the object still fits.
    this.camera.position.z = this.baseZ * Math.max(1, Math.pow(1 / this.camera.aspect, 0.9));
    // On wide layouts the words take the left; shift the projection so the object sits right.
    const shift = this.root.dataset.hero3dShift ? Number(this.root.dataset.hero3dShift) : 0;
    const wide = this.w >= 900 && this.w / this.h > 1.1;
    this.frameOffset = wide ? this.w * shift : 0;
    if (this.frameOffset) this.camera.setViewOffset(this.w, this.h, -this.frameOffset, 0, this.w, this.h);
    else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();
  }

  private update(): void {
    const should = this.visible && !document.hidden && !this.paused && !this.reduced;
    if (should && !this.running) {
      this.running = true;
      this.clock.start();
      const loop = () => {
        if (!this.running) return;
        this.frame(Math.min(0.05, this.clock.getDelta()));
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    } else if (!should && this.running) {
      this.running = false;
      this.clock.stop();
      cancelAnimationFrame(this.raf);
    }
  }

  private frame(dt: number): void {
    this.elapsed += dt;
    const k = 1 - Math.pow(0.0015, dt);
    this.input.x += (this.targetX - this.input.x) * k;
    this.input.y += (this.targetY - this.input.y) * k;
    if (!this.input.dragging) {
      this.input.rotY += this.velY;
      this.input.rotX = Math.max(-0.9, Math.min(0.9, this.input.rotX + this.velX));
      const decay = Math.pow(0.04, dt);
      this.velY *= decay;
      this.velX *= decay;
      // Ease the vertical tilt back toward level once the drag is over.
      this.input.rotX *= Math.pow(0.35, dt);
    }
    this.input.sincePulse = this.elapsed - this.pulseAt;

    const tilt = this.hero.tilt ?? 0.35;
    this.tiltGroup.rotation.y = this.input.x * tilt;
    this.tiltGroup.rotation.x = -this.input.y * tilt * 0.6;
    if (this.hero.draggable !== false) {
      this.pivot.rotation.y = this.input.rotY;
      this.pivot.rotation.x = this.input.rotX;
    }
    this.hero.update(this.elapsed, dt, this.input);
    this.render();
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }
}
