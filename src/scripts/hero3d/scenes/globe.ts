/**
 * Home: the live Earth. Land drawn as dots, the real day/night terminator from the sun's
 * position right now, Wilmington and the India delivery centre pinned with their live local
 * times, and work travelling the arc between them. Drag to spin; it settles back to the view
 * where both ends of the arc are visible.
 */
import * as THREE from 'three';
import type { HeroScene, Palette, SceneContext } from '../engine';
import land from '../land.json';

const R = 1.5;
const WILMINGTON = { lat: 39.75, lon: -75.56, label: 'Wilmington, DE', zone: 'America/New_York' };
const INDIA = { lat: 21.15, lon: 79.09, label: 'India delivery centre', zone: 'Asia/Kolkata' };

function toVec(lat: number, lon: number, r = R): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

/** Unit vector toward the sun in Earth-fixed coordinates for a given instant. */
function sunDirection(date: Date): THREE.Vector3 {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const day = (date.getTime() - start) / 86_400_000;
  const decl = -23.44 * Math.cos(((2 * Math.PI) / 365) * (day + 10));
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60;
  const lon = -(hours - 12) * 15;
  return toVec(decl, lon, 1).normalize();
}

/** Shortest path over the globe between two surface points, lifted toward the middle. */
class GreatArc extends THREE.Curve<THREE.Vector3> {
  private readonly a: THREE.Vector3;
  private readonly b: THREE.Vector3;
  private readonly angle: number;
  constructor(from: THREE.Vector3, to: THREE.Vector3, private readonly radius: number, private readonly lift: number) {
    super();
    this.a = from.clone().normalize();
    this.b = to.clone().normalize();
    this.angle = this.a.angleTo(this.b);
  }
  override getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    const s = Math.sin(this.angle);
    const wa = Math.sin((1 - t) * this.angle) / s;
    const wb = Math.sin(t * this.angle) / s;
    target.copy(this.a).multiplyScalar(wa).addScaledVector(this.b, wb).normalize();
    return target.multiplyScalar(this.radius + this.lift * Math.sin(Math.PI * t));
  }
}

function glossyBead(p: Palette): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({ color: p.mark, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.15 });
}

const clock = (zone: string) => new Intl.DateTimeFormat('en-US', { timeZone: zone, hour: 'numeric', minute: '2-digit' });

export default function globe(ctx: SceneContext): HeroScene {
  const { palette, mobile } = ctx;
  currentPalette = palette;
  const group = new THREE.Group();
  const earth = new THREE.Group();
  group.add(earth);

  // Composed view: face the north Atlantic so the U.S. east coast and India sit on either limb.
  const home = new THREE.Euler(THREE.MathUtils.degToRad(30), THREE.MathUtils.degToRad(-92), 0, 'XYZ');
  earth.rotation.copy(home);

  // ---- Sphere with night-side shading, terminator and fresnel rim
  const sun = sunDirection(new Date());
  const sphereMat = new THREE.ShaderMaterial({
    uniforms: {
      uDay: { value: palette.surface.clone() },
      uNight: { value: palette.soft.clone() },
      uRim: { value: palette.soft.clone() },
      uSun: { value: sun.clone() },
      uDark: { value: palette.dark ? 1 : 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormalW;
      varying vec3 vNormalV;
      varying vec3 vViewDir;
      void main() {
        vNormalW = normalize(normal); // Earth-fixed, like uSun
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vNormalV = normalize(normalMatrix * normal);
        vViewDir = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uDay; uniform vec3 uNight; uniform vec3 uRim; uniform vec3 uSun; uniform float uDark;
      varying vec3 vNormalW; varying vec3 vNormalV; varying vec3 vViewDir;
      void main() {
        float sunAmt = dot(normalize(vNormalW), normalize(uSun));
        float day = smoothstep(-0.12, 0.18, sunAmt);
        vec3 col = mix(uNight * mix(0.82, 0.55, uDark), uDay, day);
        // soft studio light from upper left
        float lambert = clamp(dot(vNormalV, normalize(vec3(-0.5, 0.7, 0.6))) * 0.5 + 0.5, 0.0, 1.0);
        col *= mix(0.86, 1.06, lambert);
        float fres = pow(1.0 - clamp(dot(vNormalV, vViewDir), 0.0, 1.0), 2.4);
        col = mix(col, uRim, fres * 0.55);
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(R, mobile ? 64 : 96, mobile ? 48 : 72), sphereMat);
  earth.add(sphere);

  // ---- Land dots, coloured by day/night
  const count = land.length / 2;
  const dot = new THREE.CircleGeometry(0.0115, 8);
  const dotMat = new THREE.MeshBasicMaterial({ toneMapped: false });
  const dots = new THREE.InstancedMesh(dot, dotMat, count);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 0, 1);
  const s = new THREE.Vector3(1, 1, 1);
  const normals: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const p = toVec(land[i * 2]! / 10, land[i * 2 + 1]! / 10, R * 1.003);
    const n = p.clone().normalize();
    normals.push(n);
    q.setFromUnitVectors(up, n);
    m.compose(p, q, s);
    dots.setMatrixAt(i, m);
  }
  earth.add(dots);

  const dayDot = new THREE.Color();
  const nightDot = new THREE.Color();
  const tmp = new THREE.Color();
  const paintDots = (p: Palette, sunDir: THREE.Vector3) => {
    dayDot.copy(p.dark ? p.paper : p.ink);
    nightDot.copy(p.dark ? p.lavender : p.paper);
    for (let i = 0; i < count; i++) {
      const d = THREE.MathUtils.smoothstep(normals[i]!.dot(sunDir), -0.1, 0.15);
      tmp.copy(nightDot).lerp(dayDot, d);
      dots.setColorAt(i, tmp);
    }
    if (dots.instanceColor) dots.instanceColor.needsUpdate = true;
  };
  paintDots(palette, sun);

  // ---- Atmosphere halo
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.1, 64, 48),
    new THREE.ShaderMaterial({
      uniforms: { uColor: { value: palette.soft.clone() }, uStrength: { value: palette.dark ? 0.7 : 0.55 } },
      vertexShader: /* glsl */ `
        varying vec3 vN; varying vec3 vV;
        void main() { vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uStrength; varying vec3 vN; varying vec3 vV;
        void main() {
          float i = pow(clamp(0.62 - dot(vN, vV), 0.0, 1.0), 3.0) * uStrength;
          gl_FragColor = vec4(uColor, i);
          #include <colorspace_fragment>
        }`,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    }),
  );
  group.add(halo);

  // ---- One tilted orbit with a bead travelling it: depth and scale for the planet
  const orbit = new THREE.Group();
  orbit.rotation.set(THREE.MathUtils.degToRad(74), THREE.MathUtils.degToRad(-18), THREE.MathUtils.degToRad(12));
  const orbitMat = new THREE.MeshBasicMaterial({ color: palette.line, transparent: true, opacity: palette.dark ? 0.22 : 0.16, toneMapped: false, depthWrite: false });
  orbit.add(new THREE.Mesh(new THREE.TorusGeometry(R * 1.34, 0.0045, 6, 220), orbitMat));
  const bead = new THREE.Mesh(new THREE.SphereGeometry(0.05, 20, 14), glossyBead(palette));
  orbit.add(bead);
  group.add(orbit);

  // ---- The link: an arc lifted off the surface, with work travelling it
  const a = toVec(WILMINGTON.lat, WILMINGTON.lon, R * 1.005);
  const b = toVec(INDIA.lat, INDIA.lon, R * 1.005);
  const curve = new GreatArc(a, b, R * 1.005, R * 0.3);
  const arcMat = new THREE.MeshBasicMaterial({ color: palette.dark ? palette.mark : palette.violet, toneMapped: false });
  const arc = new THREE.Mesh(new THREE.TubeGeometry(curve, 160, 0.011, 8, false), arcMat);
  earth.add(arc);

  const packets: THREE.Mesh[] = [];
  const packetMat = new THREE.MeshBasicMaterial({ color: palette.mark, toneMapped: false });
  const packetEdge = new THREE.MeshBasicMaterial({ color: palette.dark ? palette.mark : palette.ink, toneMapped: false, transparent: true, opacity: 0.9 });
  for (let i = 0; i < 6; i++) {
    const pk = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 12), packetMat);
    const ring = new THREE.Mesh(new THREE.SphereGeometry(0.041, 16, 12), packetEdge);
    ring.scale.setScalar(1);
    (ring.material as THREE.MeshBasicMaterial).side = THREE.BackSide;
    pk.add(ring);
    earth.add(pk);
    packets.push(pk);
  }

  // ---- Pins with pulsing rings
  const pinMat = new THREE.MeshBasicMaterial({ color: palette.mark, toneMapped: false });
  const pinRingMat = new THREE.MeshBasicMaterial({ color: palette.dark ? palette.mark : palette.violet, toneMapped: false, transparent: true, side: THREE.DoubleSide });
  const pins = [a, b].map((pos) => {
    const g = new THREE.Group();
    g.position.copy(pos);
    g.quaternion.setFromUnitVectors(up, pos.clone().normalize());
    // A bead rather than a flat disc, so the pin reads even near the limb.
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.042, 20, 14), pinMat);
    core.position.z = 0.02;
    const outline = new THREE.Mesh(new THREE.SphereGeometry(0.056, 20, 14), new THREE.MeshBasicMaterial({ color: palette.ink, toneMapped: false, side: THREE.BackSide }));
    outline.position.z = 0.02;
    const pulse = new THREE.Mesh(new THREE.RingGeometry(0.07, 0.085, 48), pinRingMat.clone());
    g.add(core, outline, pulse);
    earth.add(g);
    return { g, pulse };
  });

  // ---- HTML labels with live local times, projected each frame
  const stage = ctx.renderer.domElement.parentElement;
  const makeLabel = (title: string) => {
    const el = document.createElement('div');
    el.className = 'h3d__label';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<span class="h3d__label-title"></span><span class="h3d__label-time"></span>`;
    (el.firstElementChild as HTMLElement).textContent = title;
    stage?.appendChild(el);
    return el;
  };
  const labels = [
    { el: makeLabel(WILMINGTON.label), at: a, fmt: clock(WILMINGTON.zone) },
    { el: makeLabel(INDIA.label), at: b, fmt: clock(INDIA.zone) },
  ];
  const setTimes = () => {
    const now = new Date();
    for (const l of labels) {
      const t = l.el.querySelector('.h3d__label-time');
      if (t) t.textContent = l.fmt.format(now);
    }
  };
  setTimes();

  const world = new THREE.Vector3();
  const camDir = new THREE.Vector3();
  const centre = new THREE.Vector3();
  const placeLabels = () => {
    const w = ctx.renderer.domElement.clientWidth;
    const h = ctx.renderer.domElement.clientHeight;
    centre.setFromMatrixPosition(earth.matrixWorld).project(ctx.camera);
    for (const l of labels) {
      world.copy(l.at).applyMatrix4(earth.matrixWorld);
      const facing = world.clone().normalize().dot(camDir.copy(ctx.camera.position).sub(world).normalize());
      world.project(ctx.camera);
      const sx = ((world.x + 1) / 2) * w;
      // Labels open outward, away from the globe, unless that would run off the stage.
      const lw = l.el.offsetWidth + 24;
      let left = world.x < centre.x;
      if (left && sx - lw < 0) left = false;
      else if (!left && sx + lw > w) left = true;
      l.el.dataset.side = left ? 'left' : 'right';
      // On narrow stages the second label hangs below its pin so the two never collide.
      l.el.dataset.below = String(w < 640 && l === labels[1]);
      l.el.style.transform = `translate(${sx}px, ${((1 - world.y) / 2) * h}px)${left ? ' translateX(-100%)' : ''}`;
      l.el.style.opacity = facing > 0.05 ? '1' : '0';
    }
  };

  let lastSun = 0;
  return {
    object: group,
    camera: { z: 8.6, fov: 32 },
    tilt: 0.22,
    update(t, dt, input) {
      // Drift gently; after a drag, settle back to the composed view.
      if (!input.dragging) input.rotY += (0 - input.rotY) * (1 - Math.pow(0.55, dt));
      earth.rotation.y = home.y + Math.sin(t * 0.12) * 0.12;
      for (let i = 0; i < packets.length; i++) {
        const forward = i % 2 === 0;
        const phase = (t * 0.16 + i / packets.length) % 1;
        const u = forward ? phase : 1 - phase;
        packets[i]!.position.copy(curve.getPoint(u));
        const sc = Math.sin(phase * Math.PI);
        packets[i]!.scale.setScalar(0.4 + sc * 0.8);
      }
      const ob = t * 0.22;
      bead.position.set(Math.cos(ob) * R * 1.34, Math.sin(ob) * R * 1.34, 0);
      for (const [i, p] of pins.entries()) {
        const k = ((t * 0.7 + i * 0.5) % 1 + 1) % 1;
        p.pulse.scale.setScalar(1 + k * 2.4);
        (p.pulse.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.8;
      }
      // The terminator moves about 0.25° a minute; refresh it twice a minute.
      if (t - lastSun > 30) {
        lastSun = t;
        const sd = sunDirection(new Date());
        sphereMat.uniforms.uSun!.value.copy(sd);
        paintDots(currentPalette, sd);
        setTimes();
      }
      group.updateMatrixWorld();
      placeLabels();
    },
    setPalette(p) {
      currentPalette = p;
      sphereMat.uniforms.uDay!.value.copy(p.surface);
      sphereMat.uniforms.uNight!.value.copy(p.soft);
      sphereMat.uniforms.uRim!.value.copy(p.soft);
      sphereMat.uniforms.uDark!.value = p.dark ? 1 : 0;
      (halo.material as THREE.ShaderMaterial).uniforms.uColor!.value.copy(p.soft);
      arcMat.color.copy(p.dark ? p.mark : p.violet);
      orbitMat.color.copy(p.line);
      orbitMat.opacity = p.dark ? 0.22 : 0.16;
      packetEdge.color.copy(p.dark ? p.mark : p.ink);
      for (const pin of pins) (pin.pulse.material as THREE.MeshBasicMaterial).color.copy(p.dark ? p.mark : p.violet);
      paintDots(p, sphereMat.uniforms.uSun!.value as THREE.Vector3);
    },
  };
}

let currentPalette: Palette;
