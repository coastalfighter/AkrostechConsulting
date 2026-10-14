/**
 * Article search instrument: one filter (query + category) drives the index in the hero, the
 * register of lit cells, the count, and the article grid in the page body. Matched words are
 * marked. The state is mirrored in the URL (?q=, ?category=) so a filtered view can be shared,
 * and tag links in the A–Z index set the query without a reload.
 */

interface Entry {
  id: string;
  cat: string;
  text: string;
  row: HTMLElement;
  cell: HTMLElement | null;
  items: HTMLElement[];
  marks: { el: HTMLElement; src: string }[];
}

const pad = (n: number): string => String(n).padStart(2, '0');

const escapeHtml = (s: string): string => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Wraps every occurrence of any term in <mark>, on escaped text. */
function highlight(src: string, terms: string[]): string {
  if (!terms.length) return escapeHtml(src);
  const re = new RegExp(`(${terms.map(escapeRe).sort((a, b) => b.length - a.length).join('|')})`, 'gi');
  return src
    .split(re)
    .map((part, i) => (i % 2 === 1 ? `<mark>${escapeHtml(part)}</mark>` : escapeHtml(part)))
    .join('');
}

export default function initSearch(root: HTMLElement): void {
  const input = root.querySelector<HTMLInputElement>('[data-query]');
  const form = root.querySelector<HTMLFormElement>('[data-search-form]');
  const clear = root.querySelector<HTMLButtonElement>('[data-clear]');
  const shown = root.querySelector<HTMLElement>('[data-shown]');
  const status = root.querySelector<HTMLElement>('[data-status]');
  const empty = root.querySelector<HTMLElement>('[data-empty]');
  const emptyQ = root.querySelector<HTMLElement>('[data-empty-q]');
  const reset = root.querySelector<HTMLButtonElement>('[data-reset]');
  const cats = [...root.querySelectorAll<HTMLButtonElement>('button[data-cat]')];
  if (!input || !form) return;

  // Body counterparts, anywhere on the page.
  const bodyEmpty = document.querySelector<HTMLElement>('[data-filter-empty]');
  const bodyStatus = document.querySelector<HTMLElement>('[data-filter-status]');
  const bodyResets = document.querySelectorAll<HTMLButtonElement>('[data-filter-reset]');
  const tagLinks = document.querySelectorAll<HTMLAnchorElement>('[data-tag-link]');
  const total = Number(root.dataset.total ?? 0);

  const entries: Entry[] = [...root.querySelectorAll<HTMLElement>('[data-row]')].map((row) => {
    const id = row.dataset.row ?? '';
    const items = [...document.querySelectorAll<HTMLElement>(`[data-filter-item="${CSS.escape(id)}"]`)];
    const markEls = [...row.querySelectorAll<HTMLElement>('[data-hl]'), ...items.flatMap((it) => [...it.querySelectorAll<HTMLElement>('.post__title a')])];
    return {
      id,
      cat: row.dataset.cat ?? '',
      text: row.dataset.text ?? '',
      row,
      cell: root.querySelector<HTMLElement>(`[data-cell="${CSS.escape(id)}"]`),
      items,
      marks: markEls.map((el) => ({ el, src: el.textContent ?? '' })),
    };
  });

  let cat = 'all';

  function apply(syncUrl = true): void {
    const raw = input!.value.trim();
    const terms = raw.toLowerCase().split(/\s+/).filter(Boolean);
    let count = 0;
    let lead = true;
    entries.forEach((e) => {
      const on = (cat === 'all' || e.cat === cat) && terms.every((t) => e.text.includes(t));
      if (on) count++;
      e.row.hidden = !on;
      e.cell?.classList.toggle('is-on', on);
      e.items.forEach((it) => {
        it.hidden = !on;
        it.classList.toggle('is-lead', on && lead);
      });
      if (on) lead = false;
      e.marks.forEach((m) => (m.el.innerHTML = highlight(m.src, terms)));
    });

    if (shown) shown.textContent = pad(count);
    const catName = cats.find((b) => b.dataset.cat === cat)?.querySelector('span')?.textContent ?? '';
    const sentence = `${count} of ${total} article${total === 1 ? '' : 's'}${cat !== 'all' ? ` in ${catName}` : ''}${raw ? ` matching “${raw}”` : ''}`;
    if (status) status.textContent = sentence;
    if (bodyStatus) bodyStatus.textContent = `Showing ${sentence}.`;
    if (empty) empty.hidden = count > 0;
    if (bodyEmpty) bodyEmpty.hidden = count > 0;
    if (emptyQ) emptyQ.textContent = raw ? `“${raw}”` : 'this filter';
    if (clear) clear.hidden = raw.length === 0;
    if (terms.length || cat !== 'all') root.dataset.active = '';
    else delete root.dataset.active;

    if (syncUrl) {
      const url = new URL(location.href);
      if (raw) url.searchParams.set('q', raw);
      else url.searchParams.delete('q');
      if (cat !== 'all') url.searchParams.set('category', cat);
      else url.searchParams.delete('category');
      history.replaceState(history.state, '', url);
    }
  }

  function setCat(next: string): void {
    cat = cats.some((b) => b.dataset.cat === next) ? next : 'all';
    cats.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === cat)));
  }

  function resetAll(): void {
    input!.value = '';
    setCat('all');
    apply();
    input!.focus({ preventScroll: true });
  }

  cats.forEach((b) =>
    b.addEventListener('click', () => {
      setCat(b.dataset.cat ?? 'all');
      apply();
    }),
  );

  let t: number | undefined;
  input.addEventListener('input', () => {
    window.clearTimeout(t);
    t = window.setTimeout(apply, 90);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && input.value) {
      e.preventDefault();
      input.value = '';
      apply();
    }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    apply();
  });
  clear?.addEventListener('click', () => {
    input.value = '';
    apply();
    input.focus();
  });
  reset?.addEventListener('click', resetAll);
  bodyResets.forEach((b) => b.addEventListener('click', resetAll));

  tagLinks.forEach((a) =>
    a.addEventListener('click', (e) => {
      const tag = a.dataset.tagLink;
      if (!tag) return;
      e.preventDefault();
      input.value = tag;
      setCat('all');
      apply();
      const target = document.getElementById('articles');
      target?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }),
  );

  // Hold the instrument at its full height while it filters, so the hero does not jump.
  const hold = (): void => {
    root.style.minHeight = '';
    if (!root.dataset.active) root.style.minHeight = `${root.offsetHeight}px`;
  };
  hold();
  let lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    root.style.minHeight = '';
  });

  const params = new URL(location.href).searchParams;
  const q = params.get('q');
  const c = params.get('category');
  if (q) input.value = q;
  if (c) setCat(c);
  apply(false);
}
