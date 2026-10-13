/**
 * Hero 3D: a particle globe with a lit arc from Wilmington, Delaware to India.
 *
 * Seen from above the North Atlantic so both ends of the arc sit on the visible face. Pauses when
 * off-screen or the tab is hidden, caps device pixel ratio, follows the colour scheme, and renders
 * a single still frame for reduced-motion visitors.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  Line,
  LineBasicMaterial,
  PerspectiveCamera,
  Points,
  QuadraticBezierCurve3,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from 'three';

const WILMINGTON = { lat: 39.75, lon: -75.55 };
const INDIA = { lat: 21.15, lon: 79.09 };
const RADIUS = 1;

function latLonToVec(lat: number, lon: number, r = RADIUS): Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

function themeColors(): { dot: Color; accent: Color; glow: Color } {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')?.content ?? 'light dark';
  const dark = meta === 'dark' || (meta === 'light dark' && matchMedia('(prefers-color-scheme: dark)').matches);
  return dark
    ? { dot: new Color('#b3ad9a'), accent: new Color('#a2ba7c'), glow: new Color('#e0e8d2') }
    : { dot: new Color('#4d483c'), accent: new Color('#3f5a2a'), glow: new Color('#4f6238') };
}

const pointVertex = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vFacing;
  varying float vSeed;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normalize(position));
    vFacing = clamp(dot(n, vec3(0.0, 0.0, 1.0)) * 0.5 + 0.5, 0.0, 1.0);
    vSeed = aSeed;
    float twinkle = 0.85 + 0.15 * sin(uTime * 1.6 + aSeed * 40.0);
    gl_PointSize = aSize * uPixelRatio * twinkle * (3.2 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const pointFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vFacing;
  varying float vSeed;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.2, d) * mix(0.08, 1.0, pow(vFacing, 1.6)) * uOpacity;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

function fibonacciSphere(count: number): { positions: Float32Array; sizes: Float32Array; seeds: Float32Array } {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    positions.set([Math.cos(theta) * r * RADIUS, y * RADIUS, Math.sin(theta) * r * RADIUS], i * 3);
    sizes[i] = 2.2 + Math.random() * 1.6;
    seeds[i] = Math.random();
  }
  return { positions, sizes, seeds };
}

export function initHero3d(host: HTMLElement): void {
  const canvas = host.querySelector<HTMLCanvasElement>('canvas');
  if (!canvas) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = matchMedia('(max-width: 767px)').matches;

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: !small, powerPreference: 'low-power' });
  } catch {
    host.classList.add('is-fallback');
    return;
  }
  const pixelRatio = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);
  renderer.setPixelRatio(pixelRatio);

  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 4.4);

  const globe = new Group();
  scene.add(globe);
  // Face the North Atlantic, tipped toward the viewer so Delaware and India share the visible face.
  globe.rotation.set(0.62, -1.62, 0.08);

  const colors = themeColors();
  const { positions, sizes, seeds } = fibonacciSphere(small ? 1400 : 2600);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('aSize', new BufferAttribute(sizes, 1));
  geometry.setAttribute('aSeed', new BufferAttribute(seeds, 1));
  const pointsMaterial = new ShaderMaterial({
    vertexShader: pointVertex,
    fragmentShader: pointFragment,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uColor: { value: colors.dot },
      uOpacity: { value: 0 },
    },
  });
  globe.add(new Points(geometry, pointsMaterial));

  // Arc between the two places, lifted off the surface.
  const a = latLonToVec(WILMINGTON.lat, WILMINGTON.lon);
  const b = latLonToVec(INDIA.lat, INDIA.lon);
  const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(RADIUS * 1.55);
  const curve = new QuadraticBezierCurve3(a, mid, b);
  const arcPoints = curve.getPoints(160);
  const arcGeometry = new BufferGeometry().setFromPoints(arcPoints);
  arcGeometry.setDrawRange(0, 0);
  const arcMaterial = new LineBasicMaterial({ color: colors.accent, transparent: true, opacity: 0.95 });
  globe.add(new Line(arcGeometry, arcMaterial));

  // End markers and a travelling pulse, drawn as additive points.
  const markerGeometry = new BufferGeometry();
  const markerPositions = new Float32Array(9);
  markerPositions.set([a.x * 1.01, a.y * 1.01, a.z * 1.01, b.x * 1.01, b.y * 1.01, b.z * 1.01, a.x, a.y, a.z]);
  markerGeometry.setAttribute('position', new BufferAttribute(markerPositions, 3));
  markerGeometry.setAttribute('aSize', new BufferAttribute(new Float32Array([16, 16, 11]), 1));
  markerGeometry.setAttribute('aSeed', new BufferAttribute(new Float32Array([0.1, 0.6, 0.3]), 1));
  const markerMaterial = new ShaderMaterial({
    vertexShader: pointVertex,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float core = smoothstep(0.22, 0.0, d);
        float ring = smoothstep(0.5, 0.36, d) * smoothstep(0.26, 0.38, d) * 0.6;
        gl_FragColor = vec4(uColor, (core + ring) * uOpacity);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: pixelRatio }, uColor: { value: colors.glow }, uOpacity: { value: 0 } },
  });
  globe.add(new Points(markerGeometry, markerMaterial));

  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Keep the globe a comfortable size on tall phone screens.
    camera.position.z = camera.aspect < 0.8 ? 5.6 : 4.4;
    camera.updateProjectionMatrix();
  };
  resize();
  new ResizeObserver(resize).observe(host);

  document.addEventListener('themechange', () => {
    const c = themeColors();
    pointsMaterial.uniforms.uColor!.value = c.dot;
    arcMaterial.color = c.accent;
    markerMaterial.uniforms.uColor!.value = c.glow;
    if (reduce) renderer.render(scene, camera);
  });

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  if (!reduce) {
    window.addEventListener(
      'pointermove',
      (e) => {
        pointer.tx = (e.clientX / window.innerWidth - 0.5) * 0.5;
        pointer.ty = (e.clientY / window.innerHeight - 0.5) * 0.3;
      },
      { passive: true },
    );
  }

  const baseY = globe.rotation.y;
  const baseX = globe.rotation.x;
  let running = false;
  let visible = true;
  let raf = 0;
  const startTime = performance.now();

  const frame = (now: number) => {
    const t = (now - startTime) / 1000;
    const intro = Math.min(1, t / 1.6);
    const eased = 1 - (1 - intro) ** 3;
    pointsMaterial.uniforms.uTime!.value = t;
    markerMaterial.uniforms.uTime!.value = t;
    pointsMaterial.uniforms.uOpacity!.value = eased;
    markerMaterial.uniforms.uOpacity!.value = eased;

    // Arc draws in, then the pulse travels Wilmington → India on a loop.
    const draw = Math.min(1, Math.max(0, (t - 0.6) / 1.4));
    arcGeometry.setDrawRange(0, Math.floor(arcPoints.length * draw));
    const loop = ((t - 2) % 3.2) / 3.2;
    const p = curve.getPoint(Math.max(0, loop));
    markerPositions.set([p.x, p.y, p.z], 6);
    markerGeometry.attributes.position!.needsUpdate = true;

    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;
    globe.rotation.y = baseY + Math.sin(t * 0.12) * 0.18 + pointer.x;
    globe.rotation.x = baseX + pointer.y;

    renderer.render(scene, camera);
    if (running) raf = requestAnimationFrame(frame);
  };

  const start = () => {
    if (running || reduce || !visible || document.hidden) return;
    running = true;
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  if (reduce) {
    // One finished frame: arc drawn, no travel.
    pointsMaterial.uniforms.uOpacity!.value = 1;
    markerMaterial.uniforms.uOpacity!.value = 1;
    arcGeometry.setDrawRange(0, arcPoints.length);
    renderer.render(scene, camera);
  } else {
    new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) start();
      else stop();
    }).observe(host);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    start();
  }
  host.classList.add('is-ready');
}
