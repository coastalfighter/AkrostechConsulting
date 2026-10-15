/**
 * About: a constellation of people. Glossy beads of different sizes (the people on a client's
 * team, their managers, the specialists behind them) sit on a slowly turning spherical shell,
 * each joined to its nearest neighbours by fine lines. Signals travel the lines and light them
 * as they pass. At the heart sits one chartreuse bead, Akrostech, wired to the shell by spokes
 * and sending soft pulses outward. A press sends a wave through the whole network, hop by hop
 * from the heart.
 */
import * as THREE from 'three';
import { glossy, type HeroScene, type Palette, type SceneContext } from '../engine';
import { framer } from '../frame';

const R = 1.42;
const CORE = 0.2;

interface Edge {
  a: number;
  b: number;
  /** Hops from the heart, for the press wave. */
  hop: number;
}

export default function network(ctx: SceneContext): HeroScene {
  const { palette, mobile, rand } = ctx;
  const group = new THREE.Group();
  const shell = new THREE.Group();
  group.add(shell);
  shell.rotation.set(0.32, 0, -0.12);

  // ---- People: points on a sphere (Fibonacci spread, jittered), with a few slightly inside
  const N = mobile ? 40 : 54;
  const pos: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - ((i + 0.5) / N) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = i * golden + (rand() - 0.5) * 0.5;
    const v = new THREE.Vector3(Math.cos(th) * r, y + (rand() - 0.5) * 0.08, Math.sin(th) * r).normalize();
    pos.push(v.multiplyScalar(R * (0.9 + rand() * 0.12)));
  }
  // The heart is node N.
  const HEART = N;
  pos.push(new THREE.Vector3());

  // ---- Edges: each person to their nearest few; spokes from the heart to six of them
  const edges: Edge[] = [];
  const seen = new Set<string>();
  const add = (a: number, b: number) => {
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    if (seen.has(key) || a === b) return;
    seen.add(key);
    edges.push({ a, b, hop: 0 });
  };
  const near: number[] = [];
  for (let i = 0; i < N; i++) {
    near.length = 0;
    for (let j = 0; j < N; j++) if (j !== i) near.push(j);
    near.sort((p, q) => pos[i]!.distanceToSquared(pos[p]!) - pos[i]!.distanceToSquared(pos[q]!));
    const k = 2 + (rand() < 0.45 ? 1 : 0);
    for (let n = 0; n < k; n++) add(i, near[n]!);
  }
  const spokeCount = 6;
  const spokes: number[] = [];
  for (let s = 0; s < spokeCount; s++) {
    const pick = Math.floor((s / spokeCount) * N + rand() * (N / spokeCount));
    spokes.push(Math.min(N - 1, pick));
    add(HEART, Math.min(N - 1, pick));
  }

  // Adjacency and hop distance from the heart (breadth first).
  const adj: number[][] = Array.from({ length: N + 1 }, () => []);
  edges.forEach((e, i) => {
    adj[e.a]!.push(i);
    adj[e.b]!.push(i);
  });
  const hopOf = new Array<number>(N + 1).fill(Infinity);
  hopOf[HEART] = 0;
  const queue = [HEART];
  while (queue.length) {
    const n = queue.shift()!;
    for (const ei of adj[n]!) {
      const e = edges[ei]!;
      const o = e.a === n ? e.b : e.a;
      if (hopOf[o]! > hopOf[n]! + 1) {
        hopOf[o] = hopOf[n]! + 1;
        queue.push(o);
      }
    }
  }
  const maxHop = Math.max(...hopOf.filter(Number.isFinite));
  for (const e of edges) e.hop = Math.min(hopOf[e.a]!, hopOf[e.b]!);

  // ---- Beads: one instanced mesh, coloured per person
  const sizes: number[] = [];
  const tone: number[] = [];
  for (let i = 0; i < N; i++) {
    const r = rand();
    sizes.push(r < 0.12 ? 0.11 + rand() * 0.03 : r < 0.5 ? 0.07 + rand() * 0.02 : 0.042 + rand() * 0.018);
    const c = rand();
    tone.push(c < 0.5 ? 0 : c < 0.86 ? 1 : 2);
  }
  const beadGeo = new THREE.SphereGeometry(1, mobile ? 18 : 26, mobile ? 12 : 18);
  const beadMat = glossy(new THREE.Color(0xffffff), { roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.12 });
  const beads = new THREE.InstancedMesh(beadGeo, beadMat, N);
  shell.add(beads);
  const beadColour = new THREE.Color();
  const paintBeads = (p: Palette) => {
    for (let i = 0; i < N; i++) {
      const t = tone[i]!;
      if (t === 0) beadColour.copy(p.dark ? p.violet : p.lavender);
      else if (t === 1) beadColour.copy(p.dark ? p.paper : p.surface);
      else beadColour.copy(p.dark ? p.lavender : p.ink);
      beads.setColorAt(i, beadColour);
    }
    if (beads.instanceColor) beads.instanceColor.needsUpdate = true;
  };
  paintBeads(palette);

  // ---- The heart: Akrostech, with an ink outline so it reads on paper
  const heartMat = new THREE.MeshPhysicalMaterial({ color: palette.mark, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.1 });
  const heart = new THREE.Mesh(new THREE.SphereGeometry(CORE, 40, 28), heartMat);
  const heartEdgeMat = new THREE.MeshBasicMaterial({ color: palette.ink, toneMapped: false, side: THREE.BackSide });
  const heartEdge = new THREE.Mesh(new THREE.SphereGeometry(CORE * 1.09, 40, 28), heartEdgeMat);
  heart.add(heartEdge);
  group.add(heart);

  // Pulses: fresnel shells expanding from the heart.
  const pulseMats: THREE.ShaderMaterial[] = [];
  const pulses: THREE.Mesh[] = [];
  const pulseGeo = new THREE.SphereGeometry(1, 48, 32);
  for (let i = 0; i < 2; i++) {
    const mat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: (palette.dark ? palette.mark : palette.violet).clone() }, uAlpha: { value: 0 } },
      vertexShader: /* glsl */ `
        varying vec3 vN; varying vec3 vV;
        void main() { vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uAlpha; varying vec3 vN; varying vec3 vV;
        void main() {
          float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 3.0);
          gl_FragColor = vec4(uColor, f * uAlpha);
          #include <colorspace_fragment>
        }`,
      transparent: true,
      depthWrite: false,
    });
    const m = new THREE.Mesh(pulseGeo, mat);
    pulseMats.push(mat);
    pulses.push(m);
    group.add(m);
  }

  // ---- Lines: one segment buffer, per-vertex colour with alpha so each line can light up
  const E = edges.length;
  const linePos = new Float32Array(E * 6);
  const lineCol = new Float32Array(E * 8);
  edges.forEach((e, i) => {
    pos[e.a]!.toArray(linePos, i * 6);
    pos[e.b]!.toArray(linePos, i * 6 + 3);
  });
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  const colAttr = new THREE.BufferAttribute(lineCol, 4);
  colAttr.setUsage(THREE.DynamicDrawUsage);
  lineGeo.setAttribute('color', colAttr);
  const lineMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, toneMapped: false });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  shell.add(lines);

  // ---- The lattice: three faint great circles give the shell its shape
  const ringMat = new THREE.MeshBasicMaterial({ color: palette.line, transparent: true, opacity: palette.dark ? 0.14 : 0.1, toneMapped: false, depthWrite: false });
  const ringGeo = new THREE.TorusGeometry(R * 1.04, 0.0035, 4, 200);
  const rings = [0, 1, 2].map((i) => {
    const m = new THREE.Mesh(ringGeo, ringMat);
    m.rotation.set(i === 0 ? Math.PI / 2 : 0.4 * i, i * 1.1, 0.3 * i);
    shell.add(m);
    return m;
  });

  // ---- Signals: chartreuse sparks walking the network
  const S = mobile ? 7 : 10;
  const sparkMat = new THREE.MeshBasicMaterial({ color: palette.mark, toneMapped: false });
  const sparkEdgeMat = new THREE.MeshBasicMaterial({ color: palette.dark ? palette.mark : palette.ink, toneMapped: false, side: THREE.BackSide, transparent: true, opacity: 0.85 });
  const sparkGeo = new THREE.SphereGeometry(0.024, 12, 8);
  const sparkEdgeGeo = new THREE.SphereGeometry(0.034, 12, 8);
  const sparks = Array.from({ length: S }, () => {
    const m = new THREE.Mesh(sparkGeo, sparkMat);
    m.add(new THREE.Mesh(sparkEdgeGeo, sparkEdgeMat));
    shell.add(m);
    return { m, edge: 0, from: HEART, u: 0, speed: 1 };
  });
  const lit = new Float32Array(E);
  const startAt = (s: (typeof sparks)[number], node: number) => {
    const opts = adj[node]!;
    s.edge = opts[Math.floor(rand() * opts.length)]!;
    s.from = node;
    s.u = 0;
    const e = edges[s.edge]!;
    s.speed = 0.85 / Math.max(0.3, pos[e.a]!.distanceTo(pos[e.b]!));
  };
  sparks.forEach((s, i) => {
    startAt(s, i < spokeCount ? HEART : Math.floor(rand() * N));
    s.u = rand();
  });

  const hot = new THREE.Color();
  const cold = new THREE.Color();
  let baseAlpha = 0.2;
  const setLineColours = (p: Palette) => {
    hot.copy(p.dark ? p.mark : p.violet);
    cold.copy(p.line);
    baseAlpha = p.dark ? 0.2 : 0.16;
  };
  setLineColours(palette);
  const mix = new THREE.Color();

  let wave = Infinity;
  let dark = palette.dark;
  let lastT = 0;
  const m = new THREE.Matrix4();
  const step = (t: number, dt: number) => {
    lastT = t;
    // Sparks walk; when one reaches a person it moves on, and now and then a fresh one leaves the heart.
    for (const s of sparks) {
      s.u += dt * s.speed;
      lit[s.edge] = Math.max(lit[s.edge]!, Math.sin(Math.min(1, s.u) * Math.PI) * 0.6 + 0.4);
      if (s.u >= 1) {
        const e = edges[s.edge]!;
        const to = e.a === s.from ? e.b : e.a;
        startAt(s, rand() < 0.14 ? HEART : to);
      }
      const e = edges[s.edge]!;
      const a = s.from === e.a ? pos[e.a]! : pos[e.b]!;
      const b = s.from === e.a ? pos[e.b]! : pos[e.a]!;
      s.m.position.lerpVectors(a, b, s.u);
      s.m.scale.setScalar(0.6 + Math.sin(s.u * Math.PI) * 0.6);
    }
    const decay = Math.exp(-dt * 1.6);
    for (let i = 0; i < E; i++) {
      let l = (lit[i] = lit[i]! * decay);
      if (Number.isFinite(wave)) {
        const d = wave - edges[i]!.hop;
        l = Math.max(l, Math.exp(-d * d * 1.4) * Math.max(0, 1 - wave / (maxHop + 3)));
      }
      mix.copy(cold).lerp(hot, Math.min(1, l * 1.2));
      const alpha = baseAlpha + (0.95 - baseAlpha) * Math.min(1, l);
      for (let v = 0; v < 2; v++) {
        const o = i * 8 + v * 4;
        lineCol[o] = mix.r;
        lineCol[o + 1] = mix.g;
        lineCol[o + 2] = mix.b;
        lineCol[o + 3] = alpha;
      }
    }
    colAttr.needsUpdate = true;

    // Beads breathe a little; the press wave swells each person as it reaches them.
    for (let i = 0; i < N; i++) {
      let sc = sizes[i]! * (1 + Math.sin(t * 0.9 + i * 1.7) * 0.05);
      if (Number.isFinite(wave)) {
        const d = wave - hopOf[i]!;
        sc *= 1 + Math.exp(-d * d * 2) * 0.45 * Math.max(0, 1 - wave / (maxHop + 3));
      }
      m.makeScale(sc, sc, sc).setPosition(pos[i]!);
      beads.setMatrixAt(i, m);
    }
    beads.instanceMatrix.needsUpdate = true;

    for (let i = 0; i < pulses.length; i++) {
      const k = (((t * 0.28 + i * 0.5) % 1) + 1) % 1;
      pulses[i]!.scale.setScalar(CORE * 1.3 + k * R * 1.05);
      pulseMats[i]!.uniforms.uAlpha!.value = Math.pow(1 - k, 1.6) * (dark ? 0.55 : 0.45);
    }
    heart.scale.setScalar(1 + Math.sin(t * 1.8) * 0.03);
  };

  // Settle a few seconds so the first (and the reduced-motion) frame shows a living network.
  for (let i = 0; i < 75; i++) step(i / 30, 1 / 30);

  const frame = framer(ctx.renderer.domElement, ctx.camera, group);

  return {
    object: group,
    camera: { z: 8.6, fov: 32 },
    tilt: 0.25,
    update(t, dt, input) {
      frame.update(t);
      if (dt > 0) step(t, dt);
      wave = input.sincePulse < 6 ? input.sincePulse * 3.2 : Infinity;
      shell.rotation.y = t * 0.07;
      for (const r of rings) r.rotation.z += dt * 0.01;
    },
    setPalette(p) {
      dark = p.dark;
      paintBeads(p);
      heartMat.color.copy(p.mark);
      heartEdgeMat.color.copy(p.ink);
      for (const mat of pulseMats) mat.uniforms.uColor!.value.copy(p.dark ? p.mark : p.violet);
      ringMat.color.copy(p.line);
      ringMat.opacity = p.dark ? 0.14 : 0.1;
      sparkMat.color.copy(p.mark);
      sparkEdgeMat.color.copy(p.dark ? p.mark : p.ink);
      setLineColours(p);
      step(lastT, 0);
    },
  };
}
