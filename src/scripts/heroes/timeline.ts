/**
 * Engagement timeline interaction: drag the scrubber along the track (or tap a phase, use the
 * arrow keys or the step buttons). The readout follows the phase under the scrubber and ticks
 * off the deliverables unlocked so far. On release the scrubber settles in the phase's centre.
 */
interface Phase {
  title: string;
  body: string;
}

function parsePhases(root: HTMLElement): Phase[] {
  const raw = root.querySelector<HTMLScriptElement>('[data-phases]')?.textContent ?? '[]';
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter((p): p is Phase => typeof p === 'object' && p !== null && 'title' in p && 'body' in p);
  } catch {
    return [];
  }
}

export default function initTimeline(root: HTMLElement): void {
  const phases = parsePhases(root);
  const n = phases.length;
  const track = root.querySelector<HTMLElement>('[data-track]');
  const handle = root.querySelector<HTMLElement>('[data-handle]');
  const cells = Array.from(root.querySelectorAll<HTMLElement>('[data-phase-cell]'));
  const deliverables = Array.from(root.querySelectorAll<HTMLElement>('[data-unlock]'));
  const out = (k: string) => root.querySelector<HTMLElement>(`[data-out="${k}"]`);
  const count = out('count');
  const title = out('title');
  const body = out('body');
  const tally = out('tally');
  const steps = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-step]'));
  if (!n || !track || !handle) return;

  let phase = Number(root.dataset.phase ?? 0);
  const centre = (i: number): number => (i + 0.5) / n;

  function render(pos: number): void {
    const p = Math.min(1, Math.max(0, pos));
    root.style.setProperty('--pos', String(p));
    const next = Math.min(n - 1, Math.floor(p * n));
    if (next === phase && root.dataset.rendered) return;
    root.dataset.rendered = 'true';
    phase = next;
    root.dataset.phase = String(phase);
    const current = phases[phase];
    if (!current) return;
    cells.forEach((c, i) => {
      c.classList.toggle('is-done', i < phase);
      c.classList.toggle('is-current', i === phase);
    });
    let unlocked = 0;
    deliverables.forEach((d) => {
      const on = Number(d.dataset.unlock ?? 0) <= phase;
      d.classList.toggle('is-on', on);
      const state = d.querySelector<HTMLElement>('[data-state]');
      if (state) state.textContent = on ? ', delivered' : ', not yet';
      if (on) unlocked++;
    });
    if (count) count.textContent = `Phase ${phase + 1} of ${n}`;
    if (title) title.textContent = current.title;
    if (body) body.textContent = current.body;
    if (tally) tally.textContent = `${unlocked} / ${deliverables.length}`;
    handle!.setAttribute('aria-valuenow', String(phase + 1));
    handle!.setAttribute('aria-valuetext', `Phase ${phase + 1} of ${n}: ${current.title}`);
    steps.forEach((b) => {
      const step = Number(b.dataset.step ?? 0);
      b.disabled = (step < 0 && phase === 0) || (step > 0 && phase === n - 1);
    });
  }

  const goTo = (i: number): void => render(centre(Math.min(n - 1, Math.max(0, i))));

  /** Pointer x → position along the track, 0 to 1. */
  const posAt = (e: PointerEvent): number => {
    const r = track.getBoundingClientRect();
    return (e.clientX - r.left) / r.width;
  };

  let active: number | null = null;
  let moved = false;
  handle.addEventListener('pointerdown', (e) => {
    if (active !== null) return;
    active = e.pointerId;
    moved = false;
    handle.setPointerCapture(e.pointerId);
    root.classList.add('is-dragging');
    e.preventDefault();
  });
  handle.addEventListener('pointermove', (e) => {
    if (e.pointerId !== active) return;
    moved = true;
    render(posAt(e));
  });
  const end = (e: PointerEvent): void => {
    if (e.pointerId !== active) return;
    active = null;
    root.classList.remove('is-dragging');
    if (moved) goTo(phase);
  };
  handle.addEventListener('pointerup', end);
  handle.addEventListener('pointercancel', end);

  handle.addEventListener('keydown', (e) => {
    const map: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 1, PageDown: -1 };
    if (e.key === 'Home') goTo(0);
    else if (e.key === 'End') goTo(n - 1);
    else if (map[e.key] !== undefined) goTo(phase + (map[e.key] ?? 0));
    else return;
    e.preventDefault();
  });

  root.querySelectorAll<HTMLButtonElement>('[data-goto]').forEach((b) => b.addEventListener('click', () => goTo(Number(b.dataset.goto ?? 0))));
  steps.forEach((b) => b.addEventListener('click', () => goTo(phase + Number(b.dataset.step ?? 0))));

  render(centre(phase));
}
