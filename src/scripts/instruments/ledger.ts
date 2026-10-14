/**
 * Mini bank reconciliation: match bank lines to ledger entries, count the unreconciled difference
 * down to $0.00, and advance the five-day close as the reconciliation completes.
 */
const money = (n: number): string => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function initLedger(root: HTMLElement): void {
  const bankRows = Array.from(root.querySelectorAll<HTMLElement>('[data-bank]'));
  const ledgerRows = Array.from(root.querySelectorAll<HTMLElement>('[data-ledger]'));
  const segs = Array.from(root.querySelectorAll<HTMLElement>('[data-seg]'));
  const days = Array.from(root.querySelectorAll<HTMLElement>('[data-day]'));
  const next = root.querySelector<HTMLButtonElement>('[data-next]');
  const reset = root.querySelector<HTMLButtonElement>('[data-reset]');
  const diffOut = root.querySelector<HTMLElement>('[data-out="diff"]');
  const matchedOut = root.querySelector<HTMLElement>('[data-out="matched"]');
  if (!bankRows.length || !diffOut) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const initial = (root.dataset.matched ?? '').split(',').filter(Boolean);
  const matched = new Set<string>(initial);
  const amountOf = (id: string): number => Math.abs(Number(bankRows.find((r) => r.dataset.bank === id)?.dataset.amount ?? 0));
  const openTotal = (): number => bankRows.filter((r) => !matched.has(r.dataset.bank ?? '')).reduce((s, r) => s + amountOf(r.dataset.bank ?? ''), 0);

  let shown = openTotal();
  let raf = 0;
  let dayTimers: number[] = [];

  function tweenDiff(to: number): void {
    cancelAnimationFrame(raf);
    const from = shown;
    if (reduce.matches || from === to) {
      shown = to;
      diffOut!.textContent = money(to);
      return;
    }
    const start = performance.now();
    const dur = 420;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const e = 1 - (1 - p) ** 3;
      shown = from + (to - from) * e;
      diffOut!.textContent = money(Math.round(shown * 100) / 100);
      if (p < 1) raf = requestAnimationFrame(step);
      else shown = to;
    };
    raf = requestAnimationFrame(step);
  }

  function setDay(i: number, state: 'done' | 'now' | 'next'): void {
    const d = days[i];
    if (!d) return;
    d.classList.toggle('is-done', state === 'done');
    d.classList.toggle('is-now', state === 'now');
    const label = d.querySelector<HTMLElement>('[data-day-state]');
    if (label) label.textContent = state === 'done' ? 'Done' : state === 'now' ? 'In progress' : 'Next';
  }

  /** Close calendar: day 1 is booked; day 2 runs until every line is matched, then days 3 to 5 follow. */
  function renderDays(complete: boolean, animate: boolean): void {
    dayTimers.forEach((t) => window.clearTimeout(t));
    dayTimers = [];
    setDay(0, 'done');
    if (!complete) {
      setDay(1, 'now');
      for (let i = 2; i < days.length; i++) setDay(i, 'next');
      return;
    }
    if (!animate || reduce.matches) {
      days.forEach((_, i) => setDay(i, 'done'));
      return;
    }
    setDay(1, 'done');
    for (let i = 2; i < days.length; i++) {
      setDay(i, 'next');
      dayTimers.push(window.setTimeout(() => setDay(i, 'now'), (i - 2) * 520 + 120));
      dayTimers.push(window.setTimeout(() => setDay(i, 'done'), (i - 2) * 520 + 440));
    }
  }

  function render(animate: boolean, justMatched?: string): void {
    const total = bankRows.length;
    bankRows.forEach((r) => {
      const on = matched.has(r.dataset.bank ?? '');
      r.classList.toggle('is-matched', on);
      r.classList.toggle('just-matched', on && r.dataset.bank === justMatched);
    });
    ledgerRows.forEach((r) => {
      const on = matched.has(r.dataset.pair ?? '');
      r.classList.toggle('is-matched', on);
      r.classList.toggle('just-matched', on && r.dataset.pair === justMatched);
    });
    segs.forEach((s) => s.classList.toggle('is-on', matched.has(s.dataset.seg ?? '')));
    if (matchedOut) matchedOut.textContent = String(matched.size);
    tweenDiff(openTotal());
    const complete = matched.size === total;
    root.classList.toggle('is-done', complete);
    if (next) {
      next.setAttribute('aria-disabled', String(complete));
      next.textContent = complete ? 'Reconciled' : 'Reconcile next';
    }
    renderDays(complete, animate);
  }

  function match(id: string, focusNext: boolean): void {
    if (!id || matched.has(id)) return;
    matched.add(id);
    render(true, id);
    if (focusNext) {
      // Keep keyboard users in the list: move focus to the next open Match button.
      const nextBtn = root.querySelector<HTMLButtonElement>('.lg__line:not(.is-matched) [data-match]');
      (nextBtn ?? next)?.focus({ preventScroll: true });
    }
  }

  root.querySelectorAll<HTMLButtonElement>('[data-match]').forEach((b) => {
    b.addEventListener('click', () => match(b.dataset.match ?? '', true));
  });

  next?.addEventListener('click', () => {
    if (next.getAttribute('aria-disabled') === 'true') return;
    const open = bankRows.find((r) => !matched.has(r.dataset.bank ?? ''));
    if (open) match(open.dataset.bank ?? '', false);
  });

  reset?.addEventListener('click', () => {
    matched.clear();
    render(false);
  });

  render(false);
}
