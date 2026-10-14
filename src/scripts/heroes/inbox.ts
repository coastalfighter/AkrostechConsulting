/**
 * Sample inbox triage: switch between "Before" (every message waiting on you) and "With your VA"
 * (three lanes), move single messages between lanes, and keep the counters live. Rows glide to
 * their new place with a FLIP transform; reduced motion moves them instantly.
 */
type Lane = 'va' | 'draft' | 'you';
const LANES: Lane[] = ['va', 'draft', 'you'];
const isLane = (v: string | undefined): v is Lane => v === 'va' || v === 'draft' || v === 'you';

export default function initInbox(root: HTMLElement): void {
  const rows = Array.from(root.querySelectorAll<HTMLElement>('[data-msg]')).sort((a, b) => Number(a.dataset.msg) - Number(b.dataset.msg));
  const lists = new Map<string, HTMLElement>();
  root.querySelectorAll<HTMLElement>('[data-list]').forEach((l) => lists.set(l.dataset.list ?? '', l));
  const laneSections = Array.from(root.querySelectorAll<HTMLElement>('[data-lane]'));
  const modeButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-mode-btn]'));
  const out = (k: string) => root.querySelector<HTMLElement>(`[data-out="${k}"]`);
  if (!rows.length || !lists.size) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let mode: 'before' | 'va' = root.dataset.mode === 'before' ? 'before' : 'va';

  const laneOf = (row: HTMLElement): Lane => (isLane(row.dataset.at) ? row.dataset.at : 'you');

  /** Measure, mutate, then play each row from its old box to its new one. */
  function flip(mutate: () => void): void {
    if (reduce.matches) {
      mutate();
      return;
    }
    const before = new Map(rows.map((r) => [r, r.getBoundingClientRect()]));
    mutate();
    rows.forEach((r) => {
      const a = before.get(r);
      const b = r.getBoundingClientRect();
      if (!a || b.width === 0) return;
      const dx = a.left - b.left;
      const dy = a.top - b.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      r.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 280, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
    });
  }

  function place(): void {
    if (mode === 'before') {
      const all = lists.get('all');
      if (all) rows.forEach((r) => all.appendChild(r));
    } else {
      rows.forEach((r) => lists.get(laneOf(r))?.appendChild(r));
    }
    laneSections.forEach((s) => {
      s.hidden = mode === 'before' ? s.dataset.lane !== 'all' : s.dataset.lane === 'all';
    });
  }

  function paint(): void {
    root.dataset.mode = mode;
    modeButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.modeBtn === mode)));
    const n: Record<Lane, number> = { va: 0, draft: 0, you: 0 };
    rows.forEach((r) => {
      const lane = laneOf(r);
      n[lane] += 1;
      const note = r.querySelector<HTMLElement>('[data-note]');
      if (note) note.textContent = mode === 'before' ? 'Unread' : (r.getAttribute(`data-note-${lane}`) ?? '');
      r.querySelectorAll<HTMLButtonElement>('[data-to]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.to === lane)));
    });
    LANES.forEach((l) => {
      const el = root.querySelector<HTMLElement>(`[data-lane-n="${l}"]`);
      if (el) el.textContent = String(n[l]);
    });
    const you = out('you');
    const va = out('va');
    const draft = out('draft');
    if (you) you.textContent = String(mode === 'before' ? rows.length : n.you);
    if (va) va.textContent = String(mode === 'before' ? 0 : n.va);
    if (draft) draft.textContent = String(mode === 'before' ? 0 : n.draft);
  }

  modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const next = button.dataset.modeBtn === 'before' ? 'before' : 'va';
      if (next === mode) return;
      mode = next;
      flip(place);
      paint();
    });
  });

  rows.forEach((row) => {
    row.querySelectorAll<HTMLButtonElement>('[data-to]').forEach((button) => {
      button.addEventListener('click', () => {
        const to = button.dataset.to;
        if (!isLane(to) || to === laneOf(row) || mode === 'before') return;
        row.dataset.at = to;
        flip(place);
        paint();
        button.focus({ preventScroll: true });
      });
    });
  });

  place();
  paint();
}
