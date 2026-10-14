/**
 * Route strip: a lime marker on a schematic strip map. Drag it (pointer), key it (arrows step,
 * Page keys jump stop to stop, Home/End to the ends), or press a stop to glide there. The
 * position maps piecewise onto real straight-line miles between stops, and the time left is
 * scaled from the journey time published in the location copy.
 */
import { formatMiles, formatMinutes } from '@/lib/geo';

const SNAP = 0.03;

export default function initRoute(root: HTMLElement): void {
  const strip = root.querySelector<HTMLElement>('[data-strip]');
  const track = root.querySelector<HTMLElement>('[data-track]');
  const marker = root.querySelector<HTMLElement>('[data-marker]');
  const stops = [...root.querySelectorAll<HTMLElement>('.rt__stop')];
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-goto]')];
  const out = (k: string) => root.querySelector<HTMLElement>(`[data-out="${k}"]`);
  const status = root.querySelector<HTMLElement>('[data-status]');
  if (!strip || !track || !marker || stops.length < 2) return;

  const cum = (root.dataset.cum ?? '').split(',').map(Number);
  const total = Number(root.dataset.totalMiles ?? 0);
  const minutes = Number(root.dataset.minutes ?? 0);
  const names = stops.map((s) => s.querySelector('.rt__stop-name')?.textContent ?? '');
  const n = stops.length;
  const segs = n - 1;

  let p = 0;
  let announceTimer: number | undefined;

  /** Position 0..1 on the strip → where on the route, in miles and stops. */
  function locate(pos: number): { index: number; t: number; miles: number } {
    const x = Math.min(1, Math.max(0, pos)) * segs;
    const index = Math.min(segs - 1, Math.floor(x));
    const t = x - index;
    const a = cum[index] ?? 0;
    const b = cum[index + 1] ?? a;
    return { index, t, miles: a + (b - a) * t };
  }

  function describe(): { where: string; next: string; leftMi: number; leftMin: number } {
    const { index, t, miles } = locate(p);
    const leftMi = Math.max(0, total - miles);
    const leftMin = total > 0 ? (minutes * leftMi) / total : 0;
    let where: string;
    let next: string;
    if (p >= 0.999) {
      where = `Arrived at ${names[n - 1]}`;
      next = 'None, you have arrived';
    } else if (t < 0.02) {
      where = `At ${names[index]}`;
      next = names[index + 1] ?? '';
    } else if (t > 0.98) {
      where = `At ${names[index + 1]}`;
      next = names[index + 2] ?? names[n - 1] ?? '';
    } else {
      where = `Between ${names[index]} and ${names[index + 1]}`;
      next = names[index + 1] ?? '';
    }
    return { where, next, leftMi, leftMin };
  }

  function render(announce = false): void {
    root.style.setProperty('--p', p.toFixed(4));
    const d = describe();
    const min = out('min');
    const mi = out('mi');
    const where = out('where');
    const next = out('next');
    if (min) min.textContent = String(Math.round(d.leftMin));
    if (mi) mi.textContent = formatMiles(d.leftMi);
    if (where) where.textContent = d.where;
    if (next) next.textContent = d.next;
    stops.forEach((s, i) => {
      const at = i / segs;
      s.classList.toggle('is-passed', at <= p + 0.001);
      s.classList.toggle('is-here', Math.abs(at - p) < 0.02);
    });
    const text = `${d.where}. ${p >= 0.999 ? 'Arrived.' : `${formatMinutes(d.leftMin)} and ${formatMiles(d.leftMi)} to go.`}`;
    marker!.setAttribute('aria-valuenow', String(Math.round(p * 100)));
    marker!.setAttribute('aria-valuetext', text);
    if (announce && status) {
      window.clearTimeout(announceTimer);
      announceTimer = window.setTimeout(() => (status.textContent = text), 300);
    }
  }

  function glideTo(target: number, announce = true): void {
    root.classList.add('is-gliding');
    p = Math.min(1, Math.max(0, target));
    render(announce);
    window.setTimeout(() => root.classList.remove('is-gliding'), 280);
  }

  const posAt = (clientY: number): number => {
    const r = track!.getBoundingClientRect();
    return (clientY - r.top) / Math.max(1, r.height);
  };

  // Dragging: anywhere on the track or the marker, but not on the stop buttons' text.
  let active: number | null = null;
  const startDrag = (e: PointerEvent, el: HTMLElement): void => {
    if (active !== null || e.button > 0) return;
    active = e.pointerId;
    el.setPointerCapture(e.pointerId);
    root.classList.add('is-dragging');
    root.classList.remove('is-gliding');
    p = Math.min(1, Math.max(0, posAt(e.clientY)));
    render();
    e.preventDefault();
  };
  const moveDrag = (e: PointerEvent): void => {
    if (e.pointerId !== active) return;
    p = Math.min(1, Math.max(0, posAt(e.clientY)));
    render();
  };
  const endDrag = (e: PointerEvent): void => {
    if (e.pointerId !== active) return;
    active = null;
    root.classList.remove('is-dragging');
    // Snap to a stop when released close to one.
    const nearest = Math.round(p * segs) / segs;
    if (Math.abs(nearest - p) < SNAP) glideTo(nearest);
    else render(true);
  };
  [marker, track].forEach((el) => {
    el.addEventListener('pointerdown', (e) => {
      startDrag(e, el);
      if (el === track) marker.focus({ preventScroll: true });
    });
    el.addEventListener('pointermove', moveDrag);
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);
  });

  marker.addEventListener('keydown', (e) => {
    const fwd = e.key === 'ArrowDown' || e.key === 'ArrowRight';
    const back = e.key === 'ArrowUp' || e.key === 'ArrowLeft';
    let target: number | null = null;
    if (fwd || back) target = p + (fwd ? 0.02 : -0.02);
    else if (e.key === 'PageDown') target = (Math.floor(p * segs + 0.001) + 1) / segs;
    else if (e.key === 'PageUp') target = (Math.ceil(p * segs - 0.001) - 1) / segs;
    else if (e.key === 'Home') target = 0;
    else if (e.key === 'End') target = 1;
    if (target === null) return;
    e.preventDefault();
    if (fwd || back) {
      p = Math.min(1, Math.max(0, target));
      render(true);
    } else glideTo(target);
  });

  buttons.forEach((b) =>
    b.addEventListener('click', () => {
      const i = Number(b.dataset.goto ?? 0);
      glideTo(i / segs);
    }),
  );

  render();
}
