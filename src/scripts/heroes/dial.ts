/**
 * Shift dial interaction: drag or key the two handles, switch time zones, and keep the
 * "right now" readout live. All time-zone maths comes from lib/time (tested).
 */
import { US_ZONES, planShift, gapMinutes, formatDuration } from '@/lib/time';
import { DAY, R, arcDash, polar, wrap, clockLabel } from '@/lib/dial';

const STEP = 30; // minutes per handle step
const MIN_LEN = 60;
const MAX_LEN = 12 * 60;

export default function initDial(root: HTMLElement): void {
  const svg = root.querySelector<SVGSVGElement>('.dial__svg');
  const arcs = root.querySelectorAll<SVGCircleElement>('[data-arc]');
  const startHandle = root.querySelector<SVGGElement>('[data-handle="start"]');
  const endHandle = root.querySelector<SVGGElement>('[data-handle="end"]');
  const zoneButtons = root.querySelectorAll<HTMLButtonElement>('[data-zone-id]');
  const out = (k: string) => root.querySelector<HTMLElement>(`[data-out="${k}"]`);
  const gapEl = root.querySelector<SVGTextElement>('[data-gap]');
  const desc = root.querySelector<SVGDescElement>('[data-dial-desc]');
  if (!svg || !startHandle || !endHandle) return;

  let start = Number(root.dataset.start ?? 540);
  let length = Number(root.dataset.length ?? 480);
  let zone = root.dataset.zone ?? US_ZONES[0].id;
  let timer: number | undefined;

  const short = () => US_ZONES.find((z) => z.id === zone)?.short ?? 'ET';

  /** The visitor's current minute of the day in the selected zone. */
  const nowMinute = (): number => {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: zone, hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
    const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
    const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
    return h * 60 + m;
  };

  const formatGapClock = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `+${h}:${String(m).padStart(2, '0')}`;
  };

  function renderGeometry(): void {
    const dash = arcDash(start, length);
    arcs.forEach((arc) => {
      arc.setAttribute('stroke-dasharray', dash.dasharray);
      arc.setAttribute('stroke-dashoffset', dash.dashoffset);
    });
    const s = polar(start, R.outer);
    const e = polar(start + length, R.outer);
    startHandle!.setAttribute('transform', `translate(${s.x} ${s.y})`);
    endHandle!.setAttribute('transform', `translate(${e.x} ${e.y})`);
  }

  function renderReadout(): void {
    const plan = planShift({ clientZone: zone, startHour: Math.floor(start / 60), startMinute: start % 60, hours: length / 60, now: new Date() });
    const gap = gapMinutes(zone, new Date());
    root.style.setProperty('--rot', `${-(gap / DAY) * 360}deg`);
    root.style.setProperty('--now', `${(nowMinute() / DAY) * 360}deg`);
    if (gapEl) gapEl.textContent = formatGapClock(gap);
    root.querySelectorAll('[data-zone-short]').forEach((el) => (el.textContent = short()));
    const client = out('client');
    const india = out('india');
    const status = out('status');
    if (client) client.textContent = `${plan.clientStartLabel} – ${plan.clientEndLabel}`;
    if (india) india.textContent = `${plan.indiaStartLabel} – ${plan.indiaEndLabel}${plan.indiaCrossesMidnight ? ' (next day)' : ''}`;
    if (status) {
      status.classList.toggle('is-off', !plan.onShift);
      status.textContent = plan.onShift
        ? `On shift now, ${formatDuration(plan.minutesToChange)} left`
        : `Off shift. Next starts ${plan.nextShiftDay} ${plan.clientStartLabel}, in ${formatDuration(plan.minutesToChange)}`;
    }
    if (desc) desc.textContent = `Outer ring: your U.S. working day, ${plan.clientStartLabel} to ${plan.clientEndLabel} ${short()}. Inner ring: the same hours in India, ${plan.indiaStartLabel} to ${plan.indiaEndLabel} IST.`;
    startHandle!.setAttribute('aria-valuenow', String(start));
    startHandle!.setAttribute('aria-valuetext', clockLabel(start));
    endHandle!.setAttribute('aria-valuenow', String(length / 60));
    endHandle!.setAttribute('aria-valuetext', `${length / 60} hours, ending ${clockLabel(start + length)}`);
  }

  // Readout updates are throttled to one frame while dragging.
  let pending = false;
  function render(): void {
    renderGeometry();
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      renderReadout();
    });
  }

  /** Pointer position → minute of the day, snapped to STEP. */
  function minuteAt(e: PointerEvent): number {
    const rect = svg!.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    const deg = (Math.atan2(y, x) * 180) / Math.PI + 90;
    const minute = wrap((deg / 360) * DAY);
    return wrap(Math.round(minute / STEP) * STEP);
  }

  function drag(handle: SVGGElement, kind: 'start' | 'end'): void {
    let active: number | null = null;
    handle.addEventListener('pointerdown', (e) => {
      if (active !== null) return; // ignore a second finger
      active = e.pointerId;
      handle.setPointerCapture(e.pointerId);
      handle.classList.add('is-dragging');
      root.style.setProperty('--rot-time', '0ms');
      e.preventDefault();
    });
    handle.addEventListener('pointermove', (e) => {
      if (e.pointerId !== active) return;
      const m = minuteAt(e);
      if (kind === 'start') {
        start = m;
      } else {
        const len = wrap(m - start) || DAY;
        length = Math.min(MAX_LEN, Math.max(MIN_LEN, Math.round(len / 60) * 60));
      }
      render();
    });
    const end = (e: PointerEvent) => {
      if (e.pointerId !== active) return;
      active = null;
      handle.classList.remove('is-dragging');
      root.style.removeProperty('--rot-time');
    };
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
  }

  function keys(handle: SVGGElement, kind: 'start' | 'end'): void {
    handle.addEventListener('keydown', (e) => {
      const up = e.key === 'ArrowUp' || e.key === 'ArrowRight';
      const down = e.key === 'ArrowDown' || e.key === 'ArrowLeft';
      const big = e.key === 'PageUp' || e.key === 'PageDown';
      if (!up && !down && !big && e.key !== 'Home' && e.key !== 'End') return;
      e.preventDefault();
      if (kind === 'start') {
        const delta = big ? (e.key === 'PageUp' ? 180 : -180) : up ? STEP : -STEP;
        if (e.key === 'Home') start = 0;
        else if (e.key === 'End') start = DAY - STEP;
        else start = wrap(start + delta);
      } else {
        const delta = big ? (e.key === 'PageUp' ? 180 : -180) : up ? 60 : -60;
        if (e.key === 'Home') length = MIN_LEN;
        else if (e.key === 'End') length = MAX_LEN;
        else length = Math.min(MAX_LEN, Math.max(MIN_LEN, length + delta));
      }
      render();
    });
  }

  drag(startHandle, 'start');
  drag(endHandle, 'end');
  keys(startHandle, 'start');
  keys(endHandle, 'end');

  zoneButtons.forEach((button) => {
    button.addEventListener('click', () => {
      zone = button.dataset.zoneId ?? zone;
      zoneButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      renderReadout();
    });
  });

  // Start with the visitor's own zone when it is one of the four U.S. zones.
  const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const match = US_ZONES.find((z) => z.id === local);
  if (match) {
    zone = match.id;
    zoneButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.zoneId === zone)));
  }

  renderGeometry();
  renderReadout();
  timer = window.setInterval(renderReadout, 30_000);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) window.clearInterval(timer);
    else {
      renderReadout();
      timer = window.setInterval(renderReadout, 30_000);
    }
  });
}
