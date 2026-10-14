/**
 * Contract abstraction: choosing a field highlights its clause and fills its row; "Abstract all"
 * walks through the open fields one by one. The field list is a roving-tabindex group (arrow keys,
 * Home and End). Renewal + notice together add the derived calendar entry.
 */
export default function initClauses(root: HTMLElement): void {
  const fields = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-field]'));
  const clauses = Array.from(root.querySelectorAll<HTMLElement>('[data-clause]'));
  const doc = root.querySelector<HTMLElement>('[data-doc]');
  const all = root.querySelector<HTMLButtonElement>('[data-all]');
  const reset = root.querySelector<HTMLButtonElement>('[data-reset]');
  const doneOut = root.querySelector<HTMLElement>('[data-out="done"]');
  const derived = root.querySelector<HTMLElement>('[data-derived]');
  if (!fields.length || !clauses.length) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const done = new Set((root.dataset.done ?? '').split(',').filter(Boolean));
  let selected: string | null = root.dataset.selected ?? null;
  let walking = 0;

  function render(filled?: string): void {
    fields.forEach((f) => {
      const id = f.dataset.field ?? '';
      const isDone = done.has(id);
      f.classList.toggle('is-done', isDone);
      f.classList.toggle('is-filling', id === filled);
      f.setAttribute('aria-pressed', String(id === selected));
      const val = f.querySelector<HTMLElement>('[data-val]');
      if (val) val.textContent = isDone ? (f.dataset.value ?? '') : 'Not abstracted';
    });
    clauses.forEach((c) => {
      const id = c.dataset.clause ?? '';
      c.classList.toggle('is-selected', id === selected);
      c.classList.toggle('is-done', done.has(id));
    });
    doc?.classList.toggle('has-selection', selected !== null);
    if (doneOut) doneOut.textContent = String(done.size);
    if (derived) derived.hidden = !(done.has('renewal') && done.has('notice'));
    if (all) all.setAttribute('aria-disabled', String(done.size === fields.length || walking !== 0));
  }

  function choose(id: string): void {
    selected = id;
    const fresh = !done.has(id);
    done.add(id);
    render(fresh ? id : undefined);
  }

  function stopWalk(): void {
    if (walking) window.clearInterval(walking);
    walking = 0;
  }

  // Roving tabindex: one tab stop for the whole field list.
  function focusField(i: number): void {
    const n = fields.length;
    const target = fields[((i % n) + n) % n];
    if (!target) return;
    fields.forEach((f) => (f.tabIndex = f === target ? 0 : -1));
    target.focus();
  }

  fields.forEach((f, i) => {
    f.addEventListener('click', () => {
      stopWalk();
      fields.forEach((g) => (g.tabIndex = g === f ? 0 : -1));
      choose(f.dataset.field ?? '');
    });
    f.addEventListener('keydown', (e) => {
      const map: Record<string, number> = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: fields.length - 1 };
      const to = map[e.key];
      if (to === undefined) return;
      e.preventDefault();
      focusField(to);
    });
  });

  all?.addEventListener('click', () => {
    if (all.getAttribute('aria-disabled') === 'true') return;
    const open = fields.map((f) => f.dataset.field ?? '').filter((id) => id && !done.has(id));
    if (reduce.matches) {
      open.forEach((id) => done.add(id));
      selected = open[open.length - 1] ?? selected;
      render();
      return;
    }
    const queue = [...open];
    const tick = () => {
      const id = queue.shift();
      if (!id) {
        stopWalk();
        render();
        return;
      }
      choose(id);
    };
    walking = window.setInterval(tick, 650);
    tick();
  });

  reset?.addEventListener('click', () => {
    stopWalk();
    done.clear();
    selected = null;
    render();
  });

  render();
}
