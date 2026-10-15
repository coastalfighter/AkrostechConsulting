/**
 * Services hub: one centre, five orbits. The glossy core is the Akrostech team; the five
 * smaller spheres are the five services (virtual assistance, recruitment, accounting, legal,
 * website development), each on its own gently tilted orbit drawn as a fine ring. One sphere
 * carries the signal colour; the others share the lavender, ink and paper of the system.
 * A press sends a pulse ring out from the core, and each sphere lifts a little as it passes.
 */
import * as THREE from 'three';
import type { HeroScene, Palette, SceneContext } from '../engine';
import { glossy } from '../engine';

const CORE = 0.68;

type Tone = 'mark' | 'soft' | 'ink' | 'paper' | 'lavender';

interface OrbitSpec {
  name: string;
  radius: number;
  size: number;
  tone: Tone;
  /** Tilt of the orbit plane (x, z) in radians. */
  tilt: [number, number];
  speed: number;
}

const ORBITS: OrbitSpec[] = [
  { name: 'Virtual assistance', radius: 1.02, size: 0.115, tone: 'paper', tilt: [0.12, -0.18], speed: 0.34 },
  { name: 'Recruitment', radius: 1.28, size: 0.13, tone: 'soft', tilt: [-0.16, 0.1], speed: 0.27 },
  { name: 'Accounting', radius: 1.54, size: 0.15, tone: 'mark', tilt: [0.2, 0.16], speed: 0.21 },
  { name: 'Legal', radius: 1.79, size: 0.12, tone: 'ink', tilt: [-0.08, -0.24], speed: 0.17 },
  { name: 'Website development', radius: 2.04, size: 0.135, tone: 'lavender', tilt: [0.24, 0.06], speed: 0.14 },
];

function toneColor(tone: Tone, p: Palette, out: THREE.Color): THREE.Color {
  switch (tone) {
    case 'mark':
      return out.copy(p.mark);
    case 'soft':
      return out.copy(p.soft);
    case 'lavender':
      return out.copy(p.lavender);
    case 'paper':
      return out.copy(p.dark ? p.paper : p.surface);
    case 'ink':
      // Ink on paper; a lifted ink on the dark ground so it never vanishes.
      return p.dark ? out.copy(p.ink).lerp(p.paper, 0.32) : out.copy(p.ink);
  }
}

export default function orbits(ctx: SceneContext): HeroScene {
  const { palette, mobile, rand } = ctx;
  const group = new THREE.Group();
  // View the system from a little above, so the rings open into ellipses.
  const system = new THREE.Group();
  system.rotation.set(0.5, 0, -0.08);
  group.add(system);

  // ---- The core: the team
  const coreMat = glossy(palette.soft.clone(), { roughness: 0.26, clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.4, sheenColor: palette.paper.clone() });
  const core = new THREE.Mesh(new THREE.SphereGeometry(CORE, mobile ? 64 : 96, mobile ? 48 : 72), coreMat);
  system.add(core);

  // Soft fresnel halo so the core sits in light on both grounds.
  const haloMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: palette.soft.clone() }, uStrength: { value: palette.dark ? 0.75 : 0.5 } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() { vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uStrength; varying vec3 vN; varying vec3 vV;
      void main() {
        float i = pow(clamp(0.6 - dot(vN, vV), 0.0, 1.0), 3.0) * uStrength;
        gl_FragColor = vec4(uColor, i);
        #include <colorspace_fragment>
      }`,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
  });
  const halo = new THREE.Mesh(new THREE.SphereGeometry(CORE * 1.16, 48, 36), haloMat);
  system.add(halo);

  // ---- Orbits: fine rings with a sphere on each
  const ringMat = new THREE.MeshBasicMaterial({ color: palette.line, transparent: true, opacity: palette.dark ? 0.26 : 0.2, toneMapped: false, depthWrite: false });
  const tmpColor = new THREE.Color();
  const sats = ORBITS.map((o) => {
    const plane = new THREE.Group();
    plane.rotation.set(o.tilt[0], 0, o.tilt[1]);
    // Ring geometry lies in the XY plane; lay it flat in XZ.
    const ring = new THREE.Mesh(new THREE.TorusGeometry(o.radius, mobile ? 0.005 : 0.0042, 6, mobile ? 160 : 240), ringMat);
    ring.rotation.x = Math.PI / 2;
    plane.add(ring);
    const mat = glossy(toneColor(o.tone, palette, tmpColor).clone(), { roughness: o.tone === 'mark' ? 0.22 : 0.28, clearcoat: 1, clearcoatRoughness: 0.14 });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(o.size, mobile ? 32 : 48, mobile ? 24 : 32), mat);
    plane.add(sphere);
    system.add(plane);
    return { spec: o, plane, sphere, mat, phase: rand() * Math.PI * 2 };
  });

  // ---- Press: a pulse ring travelling out through the orbits
  const pulseMat = new THREE.MeshBasicMaterial({ color: palette.dark ? palette.mark : palette.violet, transparent: true, opacity: 0, toneMapped: false, depthWrite: false, side: THREE.DoubleSide });
  const pulse = new THREE.Mesh(new THREE.RingGeometry(0.985, 1, mobile ? 128 : 192), pulseMat);
  pulse.rotation.x = -Math.PI / 2;
  pulse.visible = false;
  system.add(pulse);
  const PULSE_TIME = 1.8;
  const PULSE_FROM = CORE * 1.05;
  const PULSE_TO = 2.5;

  // ---- Labels: the service names, projected beside their spheres
  const stage = ctx.renderer.domElement.parentElement;
  const labels = sats.map((s) => {
    const el = document.createElement('div');
    el.className = 'h3d__label h3d__label--orbit';
    el.setAttribute('aria-hidden', 'true');
    const title = document.createElement('span');
    title.className = 'h3d__label-title';
    title.textContent = s.spec.name;
    el.appendChild(title);
    el.style.opacity = '0';
    el.style.transition = 'opacity 400ms ease';
    stage?.appendChild(el);
    return el;
  });
  const world = new THREE.Vector3();
  const view = new THREE.Vector3();
  const centre = new THREE.Vector3();
  const coreView = new THREE.Vector3();
  const placeLabels = () => {
    const w = ctx.renderer.domElement.clientWidth;
    const h = ctx.renderer.domElement.clientHeight;
    // On phones five moving labels crowd the object; the spheres speak for themselves.
    const show = w >= 640;
    centre.setFromMatrixPosition(core.matrixWorld).project(ctx.camera);
    coreView.setFromMatrixPosition(core.matrixWorld).applyMatrix4(ctx.camera.matrixWorldInverse);
    for (let i = 0; i < sats.length; i++) {
      const s = sats[i]!;
      const el = labels[i]!;
      world.setFromMatrixPosition(s.sphere.matrixWorld);
      view.copy(world).applyMatrix4(ctx.camera.matrixWorldInverse);
      // Labelled only while the sphere is on the near half of its orbit.
      const front = view.z > coreView.z + 0.15;
      world.project(ctx.camera);
      const sx = ((world.x + 1) / 2) * w;
      const sy = ((1 - world.y) / 2) * h;
      const lw = el.offsetWidth + 24;
      let left = world.x < centre.x;
      if (left && sx - lw < 0) left = false;
      else if (!left && sx + lw > w) left = true;
      el.dataset.side = left ? 'left' : 'right';
      el.style.transform = `translate(${sx}px, ${sy}px)${left ? ' translateX(-100%)' : ''}`;
      el.style.opacity = show && front ? '1' : '0';
    }
  };

  const setPalette = (p: Palette) => {
    coreMat.color.copy(p.soft);
    coreMat.sheenColor.copy(p.paper);
    haloMat.uniforms.uColor!.value.copy(p.soft);
    haloMat.uniforms.uStrength!.value = p.dark ? 0.75 : 0.5;
    ringMat.color.copy(p.line);
    ringMat.opacity = p.dark ? 0.26 : 0.2;
    pulseMat.color.copy(p.dark ? p.mark : p.violet);
    for (const s of sats) toneColor(s.spec.tone, p, s.mat.color);
  };

  return {
    object: group,
    camera: { z: 8.6, fov: 32 },
    tilt: 0.24,
    update(t, dt, input) {
      // After a drag, settle back to the composed view.
      if (!input.dragging) input.rotY += (0 - input.rotY) * (1 - Math.pow(0.6, dt));
      system.rotation.y = t * 0.035;
      core.rotation.y = t * 0.08;

      const since = input.sincePulse;
      const pulsing = since < PULSE_TIME;
      const k = pulsing ? since / PULSE_TIME : 1;
      const eased = 1 - Math.pow(1 - k, 3);
      const pr = PULSE_FROM + (PULSE_TO - PULSE_FROM) * eased;
      pulse.visible = pulsing;
      if (pulsing) {
        pulse.scale.setScalar(pr);
        pulseMat.opacity = Math.pow(1 - k, 1.6) * 0.85;
      }
      // The core gives a small breath when pressed.
      const breath = pulsing ? Math.sin(Math.min(1, since / 0.5) * Math.PI) * 0.035 : 0;
      core.scale.setScalar(1 + breath);

      for (const s of sats) {
        const a = s.phase + t * s.spec.speed;
        // Lift each sphere as the pulse passes its orbit.
        const d = pulsing ? pr - s.spec.radius : 9;
        const lift = Math.exp(-(d * d) / 0.03) * 0.12 * (1 - k);
        s.sphere.position.set(Math.cos(a) * s.spec.radius, lift, Math.sin(a) * s.spec.radius);
        s.sphere.scale.setScalar(1 + lift * 0.9);
      }

      group.updateMatrixWorld();
      placeLabels();
    },
    setPalette,
  };
}
