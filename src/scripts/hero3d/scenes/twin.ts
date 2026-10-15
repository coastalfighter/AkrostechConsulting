/**
 * Contact: two small worlds, one conversation. A dotted globe turned to the United States and
 * another turned to India, each with its city pinned and its local time live beside it, joined
 * by a glowing bridge. Chartreuse packets cross it both ways: your message going out, the
 * answer coming back within a business day. A press sends a message across, and it lands
 * with a ripple at the other end.
 */
import * as THREE from 'three';
import type { HeroScene, Palette, SceneContext } from '../engine';
import { framer } from '../frame';
import land from '../land.json';

const R = 0.8;
const GAP = 1.4;
interface Place {
  lat: number;
  lon: number;
  label: string;
  zone: string;
  /** Rough bounding box of the country, [lat0, lat1, lon0, lon1]. */
  box: readonly [number, number, number, number];
}
const US: Place = { lat: 39.75, lon: -75.56, label: 'Wilmington, DE', zone: 'America/New_York', box: [24, 50, -126, -66] };
const IN: Place = { lat: 21.15, lon: 79.09, label: 'India delivery centre', zone: 'Asia/Kolkata', box: [6, 36, 68, 98] };

function toVec(lat: number, lon: number, r: number): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

/** Orientation that brings (lat, lon) to face the camera, then turns it by yaw and lifts it by rise (radians). */
function facing(lat: number, lon: number, yaw: number, rise: number): THREE.Quaternion {
  const p = toVec(lat, lon, 1);
  const qY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.atan2(p.x, p.z));
  const qX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), THREE.MathUtils.degToRad(lat) - rise);
  const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
  return qYaw.multiply(qX).multiply(qY);
}

const clock = (zone: string) => new Intl.DateTimeFormat('en-US', { timeZone: zone, hour: 'numeric', minute: '2-digit' });

export default function twin(ctx: SceneContext): HeroScene {
  const { palette, mobile } = ctx;
  const outer = new THREE.Group();
  const group = new THREE.Group();
  outer.add(group);
  const up = new THREE.Vector3(0, 0, 1);

  // ---- Shared pieces
  const sphereGeo = new THREE.SphereGeometry(R, mobile ? 48 : 72, mobile ? 36 : 54);
  const sphereMat = new THREE.ShaderMaterial({
    uniforms: { uBase: { value: palette.surface.clone() }, uRim: { value: palette.soft.clone() }, uDark: { value: palette.dark ? 1 : 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uBase; uniform vec3 uRim; uniform float uDark; varying vec3 vN; varying vec3 vV;
      void main() {
        float lambert = clamp(dot(vN, normalize(vec3(-0.5, 0.7, 0.6))) * 0.5 + 0.5, 0.0, 1.0);
        vec3 col = uBase * mix(mix(0.84, 0.9, uDark), 1.06, lambert);
        float fres = pow(1.0 - clamp(dot(vN, vV), 0.0, 1.0), 2.2);
        col = mix(col, uRim, fres * 0.7);
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const haloMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: palette.soft.clone() }, uStrength: { value: palette.dark ? 0.75 : 0.6 } },
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
  });
  const haloGeo = new THREE.SphereGeometry(R * 1.12, 48, 32);
  const dotGeo = new THREE.CircleGeometry(0.0085, 6);
  const dotMat = new THREE.MeshBasicMaterial({ toneMapped: false });
  const count = land.length / 2;

  // Land dot positions are the same on both globes; build the matrices once.
  const mats: THREE.Matrix4[] = [];
  const lat: number[] = [];
  const lon: number[] = [];
  {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3(1, 1, 1);
    for (let i = 0; i < count; i++) {
      const la = land[i * 2]! / 10;
      const lo = land[i * 2 + 1]! / 10;
      lat.push(la);
      lon.push(lo);
      const p = toVec(la, lo, R * 1.004);
      q.setFromUnitVectors(up, p.clone().normalize());
      mats.push(m.compose(p, q, s).clone());
    }
  }

  const pinMat = new THREE.MeshBasicMaterial({ color: palette.mark, toneMapped: false });
  const pinEdgeMat = new THREE.MeshBasicMaterial({ color: palette.ink, toneMapped: false, side: THREE.BackSide });
  const ringMat = new THREE.MeshBasicMaterial({ color: palette.dark ? palette.mark : palette.violet, toneMapped: false, transparent: true, side: THREE.DoubleSide, depthWrite: false });

  const makeGlobe = (place: Place, x: number, yaw: number) => {
    const g = new THREE.Group();
    g.position.x = x;
    const earth = new THREE.Group();
    earth.quaternion.copy(facing(place.lat, place.lon, yaw, 0.28));
    g.add(earth);
    earth.add(new THREE.Mesh(sphereGeo, sphereMat));
    const dots = new THREE.InstancedMesh(dotGeo, dotMat, count);
    mats.forEach((m, i) => dots.setMatrixAt(i, m));
    earth.add(dots);
    g.add(new THREE.Mesh(haloGeo, haloMat));

    const pinPos = toVec(place.lat, place.lon, R * 1.01);
    const pin = new THREE.Group();
    pin.position.copy(pinPos);
    pin.quaternion.setFromUnitVectors(up, pinPos.clone().normalize());
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.04, 20, 14), pinMat);
    const edge = new THREE.Mesh(new THREE.SphereGeometry(0.054, 20, 14), pinEdgeMat);
    const ripple = new THREE.Mesh(new THREE.RingGeometry(0.07, 0.082, 48), ringMat.clone());
    const landing = new THREE.Mesh(new THREE.RingGeometry(0.07, 0.09, 48), ringMat.clone());
    pin.add(core, edge, ripple, landing);
    earth.add(pin);
    group.add(g);
    return { g, earth, dots, place, pinPos, ripple, landing };
  };
  const a = makeGlobe(US, -GAP, 0.62);
  a.landing.visible = false;
  const b = makeGlobe(IN, GAP, -0.62);
  a.g.position.y = -0.12;
  b.g.position.y = -0.12;

  const dotA = new THREE.Color();
  const dotB = new THREE.Color();
  const paintDots = (p: Palette) => {
    dotA.copy(p.dark ? p.paper : p.ink);
    dotB.copy(p.dark ? p.lavender : p.violet);
    for (const globe of [a, b]) {
      const [la0, la1, lo0, lo1] = globe.place.box;
      for (let i = 0; i < count; i++) {
        const home = lat[i]! >= la0 && lat[i]! <= la1 && lon[i]! >= lo0 && lon[i]! <= lo1;
        globe.dots.setColorAt(i, home ? dotB : dotA);
      }
      if (globe.dots.instanceColor) globe.dots.instanceColor.needsUpdate = true;
    }
  };
  paintDots(palette);

  // ---- The bridge: a lifted curve from pin to pin, with a soft wide glow under a crisp core
  group.updateMatrixWorld(true);
  const pa = a.pinPos.clone().applyMatrix4(a.earth.matrixWorld);
  const pb = b.pinPos.clone().applyMatrix4(b.earth.matrixWorld);
  const na = pa.clone().sub(a.g.position).normalize();
  const nb = pb.clone().sub(b.g.position).normalize();
  const curve = new THREE.CubicBezierCurve3(
    pa,
    pa.clone().addScaledVector(na, 0.75).add(new THREE.Vector3(0.2, 0.55, 0.2)),
    pb.clone().addScaledVector(nb, 0.75).add(new THREE.Vector3(-0.2, 0.55, 0.2)),
    pb,
  );
  const bridgeMat = new THREE.MeshBasicMaterial({ color: palette.dark ? palette.mark : palette.violet, toneMapped: false });
  const glowMat = new THREE.MeshBasicMaterial({ color: palette.dark ? palette.mark : palette.violet, toneMapped: false, transparent: true, opacity: 0.16, depthWrite: false });
  group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 140, 0.011, 8, false), bridgeMat));
  group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 140, 0.04, 10, false), glowMat));

  // ---- Packets: messages out (to India) and answers back (to the U.S.)
  const P = 6;
  const packetMat = new THREE.MeshBasicMaterial({ color: palette.mark, toneMapped: false });
  const packetEdgeMat = new THREE.MeshBasicMaterial({ color: palette.dark ? palette.mark : palette.ink, toneMapped: false, transparent: true, opacity: 0.9, side: THREE.BackSide });
  const pGeo = new THREE.SphereGeometry(0.034, 16, 12);
  const pEdgeGeo = new THREE.SphereGeometry(0.046, 16, 12);
  const makePacket = (scale: number) => {
    const m = new THREE.Mesh(pGeo, packetMat);
    m.add(new THREE.Mesh(pEdgeGeo, packetEdgeMat));
    m.scale.setScalar(scale);
    group.add(m);
    return m;
  };
  const packets = Array.from({ length: P }, () => makePacket(1));
  const sent = makePacket(1.6);
  sent.visible = false;

  // ---- Live local times beside each pin
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
    { el: makeLabel(US.label), at: a, fmt: clock(US.zone), left: true },
    { el: makeLabel(IN.label), at: b, fmt: clock(IN.zone), left: false },
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
  const bottom = new THREE.Vector3();
  const placeLabels = (narrow: boolean) => {
    const w = ctx.renderer.domElement.clientWidth;
    const h = ctx.renderer.domElement.clientHeight;
    for (const l of labels) {
      if (narrow) {
        // Phones: each label hangs centred under its own globe, so the two never meet.
        bottom.set(0, -R * 0.62, 0).applyMatrix4(l.at.g.matrixWorld);
        world.copy(bottom).project(ctx.camera);
        l.el.dataset.side = 'right';
        l.el.dataset.below = 'true';
        l.el.style.marginLeft = '0';
        l.el.style.transform = `translate(${((world.x + 1) / 2) * w}px, ${((1 - world.y) / 2) * h}px) translateX(-50%)`;
        continue;
      }
      world.copy(l.at.pinPos).applyMatrix4(l.at.earth.matrixWorld).project(ctx.camera);
      const sx = ((world.x + 1) / 2) * w;
      const lw = l.el.offsetWidth + 24;
      let left = l.left;
      if (left && sx - lw < 0) left = false;
      else if (!left && sx + lw > w) left = true;
      l.el.dataset.side = left ? 'left' : 'right';
      // Hang below the pin, clear of the bridge that leaves upward.
      l.el.dataset.below = 'true';
      l.el.style.marginLeft = '';
      l.el.style.transform = `translate(${sx}px, ${((1 - world.y) / 2) * h}px)${left ? ' translateX(-100%)' : ''}`;
    }
  };

  let lastClock = 0;
  const frame = framer(ctx.renderer.domElement, ctx.camera, outer, 1.2);

  return {
    object: outer,
    camera: { z: 8.4, fov: 32 },
    tilt: 0.2,
    update(t, dt, input) {
      frame.update(t);
      if (!input.dragging) input.rotY += (0 - input.rotY) * (1 - Math.pow(0.55, dt));
      // Each world breathes on its own slow rhythm.
      a.g.position.y = -0.12 + Math.sin(t * 0.5) * 0.035;
      b.g.position.y = -0.12 + Math.sin(t * 0.5 + 1.6) * 0.035;
      for (let i = 0; i < P; i++) {
        const out = i % 2 === 0;
        const phase = (t * 0.13 + i / P) % 1;
        packets[i]!.position.copy(curve.getPoint(out ? phase : 1 - phase));
        packets[i]!.scale.setScalar(0.4 + Math.sin(phase * Math.PI) * 0.75);
      }
      // A press sends a message: it crosses in a little over a second and lands with a ripple.
      const s = input.sincePulse;
      const travel = 1.3;
      sent.visible = s < travel;
      if (sent.visible) {
        const x = s / travel;
        sent.position.copy(curve.getPoint(x * x * (3 - 2 * x)));
      }
      const since = s - travel;
      b.landing.visible = since > 0 && since < 1.2;
      if (b.landing.visible) {
        const k = since / 1.2;
        b.landing.scale.setScalar(1 + k * 4);
        (b.landing.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.9;
      }
      for (const [i, g] of [a, b].entries()) {
        const k = (((t * 0.6 + i * 0.5) % 1) + 1) % 1;
        g.ripple.scale.setScalar(1 + k * 2.4);
        (g.ripple.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.8;
      }
      if (t - lastClock > 20) {
        lastClock = t;
        setTimes();
      }
      // Portrait stages: draw the pair a little smaller so both worlds stay whole.
      const narrow = ctx.camera.aspect < 1;
      group.scale.setScalar(narrow ? 0.84 : 1);
      outer.updateMatrixWorld();
      placeLabels(narrow);
    },
    setPalette(p) {
      sphereMat.uniforms.uBase!.value.copy(p.surface);
      sphereMat.uniforms.uRim!.value.copy(p.soft);
      sphereMat.uniforms.uDark!.value = p.dark ? 1 : 0;
      haloMat.uniforms.uColor!.value.copy(p.soft);
      haloMat.uniforms.uStrength!.value = p.dark ? 0.75 : 0.6;
      paintDots(p);
      pinMat.color.copy(p.mark);
      pinEdgeMat.color.copy(p.ink);
      const line = p.dark ? p.mark : p.violet;
      for (const g of [a, b]) {
        (g.ripple.material as THREE.MeshBasicMaterial).color.copy(line);
        (g.landing.material as THREE.MeshBasicMaterial).color.copy(line);
      }
      bridgeMat.color.copy(line);
      glowMat.color.copy(line);
      packetMat.color.copy(p.mark);
      packetEdgeMat.color.copy(p.dark ? p.mark : p.ink);
    },
  };
}
