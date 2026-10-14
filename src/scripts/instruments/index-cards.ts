/**
 * Terms clause index: filter chips narrow the index (non-matching entries dim and leave the tab
 * order), entries select a clause, and the index card swaps to its summary and jump link.
 * Up/Down, Home and End move through the entries that match the filter.
 */
interface Clause {
  id: string;
  title: string;
  group: string;
  summary: string;
}

const isClause = (v: unknown): v is Clause =>
  typeof v === 'object' && v !== null && ['id', 'title', 'group', 'summary'].every((k) => typeof (v as Record<string, unknown>)[k] === 'string');

export default function initClauseIndex(root: HTMLElement): void {
  const data = root.querySelector<HTMLScriptElement>('[data-clauses]');
  const chips = root.querySelectorAll<HTMLButtonElement>('[data-filter]');
  const entries = [...root.querySelectorAll<HTMLButtonElement>('[data-clause]')];
  const ticks = root.querySelectorAll<HTMLElement>('[data-tick]');
  const card = root.querySelector<HTMLElement>('.ci__card');
  const out = (k: string) => root.querySelector<HTMLElement>(`[data-out="${k}"]`);
  if (!data || !entries.length) return;

  let clauses: Clause[] = [];
  try {
    const parsed: unknown = JSON.parse(data.textContent ?? '[]');
    if (Array.isArray(parsed)) clauses = parsed.filter(isClause);
  } catch {
    return;
  }
  if (!clauses.length) return;

  let selected = clauses[0]!.id;
  let filter = 'all';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const matches = (c: Clause) => filter === 'all' || c.group === filter;

  function paintCard(c: Clause): void {
    const write = () => {
      const g = out('group');
      const t = out('title');
      const s = out('summary');
      const p = out('pos');
      const j = out('jump');
      if (g) g.textContent = c.group;
      if (t) t.textContent = c.title;
      if (s) s.textContent = c.summary;
      if (p) p.textContent = String(clauses.indexOf(c) + 1);
      if (j instanceof HTMLAnchorElement) j.href = `#${c.id}`;
    };
    if (reduce || !card) {
      write();
      return;
    }
    card.classList.add('is-swapping');
    window.setTimeout(() => {
      write();
      card.classList.remove('is-swapping');
    }, 150);
  }

  function select(id: string, focus = false): void {
    const c = clauses.find((x) => x.id === id);
    if (!c) return;
    const changed = id !== selected;
    selected = id;
    entries.forEach((e) => {
      const on = e.dataset.clause === id;
      e.setAttribute('aria-pressed', String(on));
      if (on && focus) e.focus();
    });
    ticks.forEach((t) => t.classList.toggle('is-sel', t.dataset.tick === id));
    if (changed) paintCard(c);
  }

  function applyFilter(next: string): void {
    filter = next;
    chips.forEach((ch) => ch.setAttribute('aria-pressed', String(ch.dataset.filter === next)));
    const visible = clauses.filter(matches);
    entries.forEach((e) => {
      const c = clauses.find((x) => x.id === e.dataset.clause);
      e.disabled = !c || !matches(c);
    });
    ticks.forEach((t) => {
      const c = clauses.find((x) => x.id === t.dataset.tick);
      t.classList.toggle('is-out', !c || !matches(c));
    });
    const current = clauses.find((x) => x.id === selected);
    if (!current || !matches(current)) {
      const firstMatch = visible[0];
      if (firstMatch) select(firstMatch.id);
    }
    const count = out('count');
    if (count) count.textContent = next === 'all' ? `All ${clauses.length} clauses shown.` : `${visible.length} of ${clauses.length} clauses: ${next}.`;
  }

  chips.forEach((ch) => ch.addEventListener('click', () => applyFilter(ch.dataset.filter ?? 'all')));

  entries.forEach((e) => {
    e.addEventListener('click', () => select(e.dataset.clause ?? selected));
    e.addEventListener('keydown', (ev) => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(ev.key)) return;
      ev.preventDefault();
      const enabled = entries.filter((x) => !x.disabled);
      const i = enabled.indexOf(e);
      const to =
        ev.key === 'Home' ? 0 : ev.key === 'End' ? enabled.length - 1 : (i + (ev.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length;
      const target = enabled[to];
      if (target) select(target.dataset.clause ?? selected, true);
    });
  });
}
