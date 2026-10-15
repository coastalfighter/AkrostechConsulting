/**
 * Accounting: a precision balance that keeps the books level. A slim beam on a fulcrum
 * carries two stacks of glossy coins (one InstancedMesh). Coins pass from the heavy pan to the
 * light one, one at a time, until only a single coin of difference is left; then the
 * chartreuse coin, the one that reconciles, drops onto the light pan and the beam comes to
 * rest dead level. The needle over the pivot reads the variance on a fine scale, and a small
 * live label states it in dollars. After a moment the chartreuse coin lifts again, the
 * balance swings the other way, and the next reconciliation begins.
 *
 * Press to tip the balance: three coins tumble onto the pressed side and the scale re-levels
 * itself with a damped spring. Under reduced motion it shows the settled, reconciled frame.
 */
import * as THREE from 'three';
import { contactShadow, glossy, type HeroScene, type Palette, type SceneContext } from '../engine';

const LAVENDER = 13; // odd, so only the chartreuse coin can make the two pans equal
const COIN_R = 0.34;
const COIN_H = 0.074;
const HALF = 1.72; // beam half-length
const POST = 0.2; // pan height above the beam end
const PAN_H = 0.05;
const PIVOT_Y = -0.05;
const BASE_Y = -1.42;
const HOVER = new THREE.Vector3(0, 1.32, 0);
const UNIT = 1250; // dollars of variance per coin, for the label

type Side = -1 | 1;
type Where = 'hover' | Side;

interface Move {
  coin: number; // instance index, or -1 for the chartreuse coin
  to: Where;
  from: THREE.Vector3;
  start: number;
  dur: number;
  flip: number;
}

/** A coin with a rounded edge and a slightly raised rim, turned on a lathe. */
function coinGeometry(segments: number): THREE.LatheGeometry {
  const r = COIN_R;
  const h = COIN_H / 2;
  const e = 0.016;
  const pts: THREE.Vector2[] = [new THREE.Vector2(0, h - 0.006), new THREE.Vector2(r - 0.06, h - 0.006), new THREE.Vector2(r - 0.05, h)];
  for (let i = 0; i <= 4; i++) {
    const a = (Math.PI / 2) * (1 - i / 4);
    pts.push(new THREE.Vector2(r - e + Math.cos(a) * e, h - e + Math.sin(a) * e));
  }
  for (let i = 0; i <= 4; i++) {
    const a = -(Math.PI / 2) * (i / 4);
    pts.push(new THREE.Vector2(r - e + Math.cos(a) * e, -h + e + Math.sin(a) * e));
  }
  pts.push(new THREE.Vector2(0, -h));
  return new THREE.LatheGeometry(pts, segments);
}

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export default function ledger(ctx: SceneContext): HeroScene {
  const { palette, mobile, rand } = ctx;
  const seg = mobile ? 36 : 56;
  const group = new THREE.Group();
  group.position.y = -0.02;

  // ---- Materials
  const structure = glossy(palette.ink, { roughness: 0.28, clearcoat: 0.8 });
  const steel = glossy(palette.ink, { metalness: 0.6, roughness: 0.22, clearcoat: 1 });
  const panMat = glossy(palette.surface, { roughness: 0.22, clearcoat: 1 });
  const coinMat = glossy(new THREE.Color(1, 1, 1), { roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.12, metalness: 0.15 });
  const markMat = glossy(palette.mark, { roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.1, metalness: 0.1 });
  const tickMat = new THREE.MeshBasicMaterial({ color: palette.line, transparent: true, opacity: 0.55, toneMapped: false });
  const zeroMat = new THREE.MeshBasicMaterial({ color: palette.mark, toneMapped: false });
  const ringMat = new THREE.MeshBasicMaterial({ color: palette.mark, transparent: true, opacity: 0, toneMapped: false, depthWrite: false, side: THREE.DoubleSide });

  // ---- Base, column and pivot
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.86, 0.12, seg), structure);
  plinth.position.y = BASE_Y + 0.06;
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.56, 0.06, seg), panMat);
  foot.position.y = BASE_Y + 0.15;
  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.085, PIVOT_Y - BASE_Y - 0.18, 24), structure);
  column.position.y = (PIVOT_Y + BASE_Y + 0.18) / 2;
  const knuckle = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.22, 32), steel);
  knuckle.rotation.x = Math.PI / 2;
  knuckle.position.y = PIVOT_Y;
  const shadow = contactShadow(1.25, palette.dark ? 0.55 : 0.32);
  shadow.position.y = BASE_Y + 0.002;
  group.add(shadow, plinth, foot, column, knuckle);

  // ---- Fine scale behind the needle: ticks on an arc, the zero tick in chartreuse
  const TICKS = 13;
  const scaleArc = 0.36;
  const ticks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.008, 1, 0.004), tickMat, TICKS - 1);
  const tm = new THREE.Matrix4();
  const tq = new THREE.Quaternion();
  const tp = new THREE.Vector3();
  const ts = new THREE.Vector3();
  const zAxis = new THREE.Vector3(0, 0, 1);
  let ti = 0;
  for (let i = 0; i < TICKS; i++) {
    const a = ((i / (TICKS - 1)) * 2 - 1) * scaleArc;
    if (i === (TICKS - 1) / 2) continue;
    const major = i % 3 === 0;
    const len = major ? 0.09 : 0.055;
    const r = 0.72 + len / 2;
    tq.setFromAxisAngle(zAxis, -a);
    tp.set(Math.sin(a) * r, PIVOT_Y + Math.cos(a) * r, -0.12);
    ts.set(1, len, 1);
    tm.compose(tp, tq, ts);
    ticks.setMatrixAt(ti++, tm);
  }
  const zero = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.12, 0.006), zeroMat);
  zero.position.set(0, PIVOT_Y + 0.78, -0.12);
  const arc = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.0035, 4, 80, scaleArc * 2), tickMat);
  arc.rotation.z = Math.PI / 2 - scaleArc;
  arc.position.set(0, PIVOT_Y, -0.12);
  group.add(ticks, zero, arc);

  // ---- The beam: a slim bar with a needle, posts at each end
  const beam = new THREE.Group();
  beam.position.y = PIVOT_Y;
  const bar = new THREE.Mesh(new THREE.BoxGeometry(HALF * 2 + 0.08, 0.055, 0.12), structure);
  const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.016, 0.74, 10), steel);
  needle.position.set(0, 0.37, -0.07);
  const capGeo = new THREE.SphereGeometry(0.05, 20, 14);
  const caps = [-1, 1].map((s) => {
    const cap = new THREE.Mesh(capGeo, steel);
    cap.position.x = s * (HALF + 0.04);
    return cap;
  });
  beam.add(bar, needle, ...caps);
  group.add(beam);

  // Pans stay level as the beam swings (a Roberval balance), so they live outside the beam.
  const postGeo = new THREE.CylinderGeometry(0.022, 0.03, POST, 14);
  const panGeo = new THREE.CylinderGeometry(0.5, 0.46, PAN_H, seg);
  const pans = ([-1, 1] as Side[]).map(() => {
    const g = new THREE.Group();
    const post = new THREE.Mesh(postGeo, steel);
    post.position.y = POST / 2;
    const pan = new THREE.Mesh(panGeo, panMat);
    pan.position.y = POST + PAN_H / 2;
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.49, 0.012, 8, seg), structure);
    lip.rotation.x = Math.PI / 2;
    lip.position.y = POST + PAN_H;
    g.add(post, pan, lip);
    group.add(g);
    return g;
  });

  // ---- Coins
  const geo = coinGeometry(seg);
  const coins = new THREE.InstancedMesh(geo, coinMat, LAVENDER);
  coins.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const jitter = Array.from({ length: LAVENDER }, () => ({ x: (rand() - 0.5) * 0.03, z: (rand() - 0.5) * 0.03, yaw: rand() * Math.PI * 2, tone: rand() }));
  const paintCoins = (p: Palette) => {
    const c = new THREE.Color();
    for (let i = 0; i < LAVENDER; i++) {
      const tone = jitter[i]!.tone;
      c.copy(p.soft).lerp(p.dark ? p.lavender : p.violet, p.dark ? tone * 0.18 : 0.08 + tone * 0.1);
      coins.setColorAt(i, c);
    }
    if (coins.instanceColor) coins.instanceColor.needsUpdate = true;
  };
  paintCoins(palette);
  const signal = new THREE.Mesh(geo, markMat);
  const ring = new THREE.Mesh(new THREE.RingGeometry(COIN_R * 1.05, COIN_R * 1.16, seg), ringMat);
  ring.rotation.x = -Math.PI / 2;
  group.add(coins, signal, ring);

  // ---- Ledger state: which coins sit on which pan, and the one coin in flight
  const stacks: Record<Side, number[]> = { [-1]: [], [1]: [] };
  for (let i = 0; i < LAVENDER; i++) stacks[i < 8 ? -1 : 1].push(i);
  let signalAt: Where = 'hover';
  let move: Move | null = null;
  const forced: Side[] = [];
  let idleUntil = 0.5;
  let heldSince = -1;
  let theta = 0.09;
  let omega = 0;
  let ringAt = -Infinity;
  let lastSince = Infinity;
  const whereOf: Where[] = Array.from({ length: LAVENDER }, (_, i) => (i < 8 ? -1 : 1));

  const mass = (s: Side) => stacks[s].length + (signalAt === s && (!move || move.coin !== -1) ? 1 : 0);

  // Where things are, given the beam angle.
  const panCentre = (s: Side, out: THREE.Vector3) =>
    out.set(s * HALF * Math.cos(theta), PIVOT_Y + s * HALF * Math.sin(theta) + POST + PAN_H, 0);
  const slot = (s: Side, index: number, out: THREE.Vector3) => panCentre(s, out).add(tp.set(0, COIN_H * (index + 0.5), 0));

  // ---- Variance label
  const stage = ctx.renderer.domElement.parentElement;
  const label = document.createElement('div');
  label.className = 'h3d__label';
  label.setAttribute('aria-hidden', 'true');
  label.innerHTML = '<span class="h3d__label-title">Variance</span><span class="h3d__label-time"></span>';
  stage?.appendChild(label);
  const value = label.querySelector<HTMLElement>('.h3d__label-time');
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
  let shown = -1;
  const anchor = new THREE.Vector3();
  const placeLabel = () => {
    const w = ctx.renderer.domElement.clientWidth;
    const h = ctx.renderer.domElement.clientHeight;
    anchor.set(0.82, BASE_Y + 0.12, 0).applyMatrix4(group.matrixWorld).project(ctx.camera);
    const sx = ((anchor.x + 1) / 2) * w;
    const left = sx + label.offsetWidth + 24 > w;
    label.dataset.side = left ? 'left' : 'right';
    label.style.transform = `translate(${sx}px, ${((1 - anchor.y) / 2) * h}px)${left ? ' translateX(-100%)' : ''}`;
    // A coin in flight already counts on the pan it is heading for; the chartreuse coin only once it lands.
    const flying = move && move.coin !== -1 ? (move.to as Side) : 0;
    const placed = move && move.coin === -1 ? 0 : signalAt === 'hover' ? 0 : signalAt;
    const diff = stacks[-1].length - stacks[1].length - flying - placed;
    const v = Math.abs(diff) * UNIT;
    if (v !== shown && value) {
      shown = v;
      value.textContent = money.format(v);
    }
  };

  const begin = (coin: number, to: Where, t: number, dur: number) => {
    const from = new THREE.Vector3();
    if (coin === -1) from.copy(signal.position);
    else {
      const s = whereOf[coin] as Side;
      slot(s, stacks[s].length - 1, from);
      stacks[s].pop();
      from.x += jitter[coin]!.x;
      from.z += jitter[coin]!.z;
    }
    move = { coin, to, from, start: t, dur, flip: coin === -1 ? 0 : (to === 1 ? -1 : 1) * Math.PI * 2 };
  };

  const finish = (t: number) => {
    if (!move) return;
    if (move.coin === -1) {
      signalAt = move.to;
      if (move.to !== 'hover' && mass(-1) === mass(1)) {
        ringAt = t;
        heldSince = t;
      }
    } else {
      const s = move.to as Side;
      stacks[s].push(move.coin);
      whereOf[move.coin] = s;
    }
    move = null;
  };

  /** Decide the next move: level the pans, then let the chartreuse coin reconcile. */
  const schedule = (t: number) => {
    const L = mass(-1);
    const R = mass(1);
    if (forced.length) {
      const to = forced.shift() as Side;
      const from = (-to) as Side;
      if (signalAt !== 'hover') {
        forced.unshift(to);
        begin(-1, 'hover', t, 0.45);
        return;
      }
      if (stacks[from].length > 1) begin(stacks[from][stacks[from].length - 1]!, to, t, 0.55);
      idleUntil = t + (forced.length ? 0.08 : 0.6);
      return;
    }
    if (signalAt !== 'hover') {
      if (Math.abs(L - R) >= 2) {
        heldSince = -1;
        begin(-1, 'hover', t, 0.6);
      } else if (heldSince >= 0 && t - heldSince > 3.4) {
        // The next period: new entries post to the pan the chartreuse coin leaves.
        const s = signalAt;
        heldSince = -1;
        begin(-1, 'hover', t, 0.9);
        forced.push(s, s, s);
        idleUntil = t + 1.2;
      }
      return;
    }
    const heavy: Side = L > R ? -1 : 1;
    const light = (-heavy) as Side;
    if (Math.abs(L - R) > 1) {
      const top = stacks[heavy][stacks[heavy].length - 1];
      if (top !== undefined) begin(top, light, t, 1.05);
      idleUntil = t + 0.3;
    } else {
      begin(-1, light, t, 0.95);
      idleUntil = t + 0.2;
    }
  };

  const pos = new THREE.Vector3();
  const to = new THREE.Vector3();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const one = new THREE.Vector3(1, 1, 1);
  const m = new THREE.Matrix4();

  const place = (t: number) => {
    // Pans follow the beam ends and stay level.
    for (const [i, s] of ([-1, 1] as Side[]).entries()) {
      pans[i]!.position.set(s * HALF * Math.cos(theta), PIVOT_Y + s * HALF * Math.sin(theta), 0);
    }
    // Stacked coins
    for (const s of [-1, 1] as Side[]) {
      const st = stacks[s];
      for (let k = 0; k < st.length; k++) {
        const c = st[k]!;
        slot(s, k, pos);
        pos.x += jitter[c]!.x;
        pos.z += jitter[c]!.z;
        q.setFromEuler(e.set(0, jitter[c]!.yaw, 0));
        m.compose(pos, q, one);
        coins.setMatrixAt(c, m);
      }
    }
    // The chartreuse coin at rest
    if (!move || move.coin !== -1) {
      if (signalAt === 'hover') {
        signal.position.copy(HOVER).y += Math.sin(t * 1.6) * 0.05;
        signal.rotation.set(0.35 + Math.sin(t * 0.9) * 0.08, t * 0.8, 0.22);
      } else {
        slot(signalAt, stacks[signalAt].length, signal.position);
        signal.rotation.set(0, 0.4, 0);
      }
    }
    // The coin in flight: an eased arc that flips once on the way over
    if (move) {
      const k = Math.min(1, (t - move.start) / move.dur);
      const u = ease(k);
      if (move.to === 'hover') to.copy(HOVER);
      else slot(move.to, stacks[move.to].length, to);
      pos.lerpVectors(move.from, to, u);
      const lift = move.to === 'hover' || move.coin === -1 ? 0.25 : 0.55 + Math.abs(to.x - move.from.x) * 0.12;
      pos.y += Math.sin(Math.PI * u) * lift;
      if (move.coin === -1) {
        signal.position.copy(pos);
        const r = move.to === 'hover' ? u : 1 - u;
        signal.rotation.set(0.35 * r, 0.4 + u * Math.PI, 0.22 * r);
      } else {
        q.setFromEuler(e.set(0, jitter[move.coin]!.yaw, move.flip * u));
        m.compose(pos, q, one);
        coins.setMatrixAt(move.coin, m);
      }
      if (k >= 1) finish(t);
    }
    coins.instanceMatrix.needsUpdate = true;
    // Reconciled: a ring opens around the chartreuse coin
    const rk = (t - ringAt) / 1.4;
    if (rk >= 0 && rk <= 1 && signalAt !== 'hover') {
      ring.position.copy(signal.position);
      ring.position.y += COIN_H / 2 + 0.004;
      ring.scale.setScalar(1 + rk * 1.6);
      ringMat.opacity = (1 - rk) * 0.9;
    } else ringMat.opacity = 0;
  };

  const step = (t: number, dt: number) => {
    if (!move && t >= idleUntil) schedule(t);
    // Damped spring toward the angle the masses ask for; slightly under-damped so it swings.
    const target = THREE.MathUtils.clamp((mass(-1) - mass(1)) * 0.04, -0.2, 0.2);
    const acc = -26 * (theta - target) - 4.2 * omega;
    omega += acc * dt;
    theta += omega * dt;
    beam.rotation.z = theta;
    place(t);
  };

  paint(palette);
  let time = 0;
  let started = false;
  return {
    object: group,
    camera: { z: mobile ? 9.8 : 10.6, y: 0.05, fov: 32 },
    tilt: 0.24,
    update(t, dt, input) {
      if (!started) {
        started = true;
        // Run the ledger up to the requested moment so a still frame shows the real state.
        const until = ctx.reduced ? 6 : t;
        while (time < until) {
          time += 1 / 60;
          step(time, 1 / 60);
        }
        if (until === 0) step(0, 0);
      } else {
        time = t;
        if (input.sincePulse < lastSince) {
          // A press tips the balance toward where it landed.
          const side: Side = input.pulseX < 0 ? -1 : 1;
          forced.push(side, side, side);
          omega += side * -0.9;
          idleUntil = t;
        }
        step(t, Math.min(dt, 1 / 30));
      }
      lastSince = input.sincePulse;
      // Gentle turn back to the composed view after a drag
      if (!input.dragging) input.rotY += (0 - input.rotY) * (1 - Math.pow(0.5, dt));
      group.updateMatrixWorld();
      placeLabel();
    },
    setPalette: paint,
  };

  function paint(p: Palette): void {
    structure.color.copy(p.dark ? p.paper : p.ink);
    steel.color.copy(p.dark ? p.paper : p.ink);
    panMat.color.copy(p.surface);
    markMat.color.copy(p.mark);
    tickMat.color.copy(p.line);
    zeroMat.color.copy(p.mark);
    ringMat.color.copy(p.mark);
    (shadow.material as THREE.MeshBasicMaterial).opacity = p.dark ? 0.55 : 0.32;
    paintCoins(p);
  }
}
