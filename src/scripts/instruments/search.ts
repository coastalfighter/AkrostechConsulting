/**
 * Guide finder: one filter (query + service) drives the guide grid in the page body, the
 * register of lit cells and the count. Matched words in the visible titles are marked. The
 * first visible guide takes the lead (large) slot. The state is mirrored in the URL
 * (?q=, ?category=) so a filtered view can be shared.
 */

interface Entry {
  id: string;
  cat: string;
  text: string;
  item: HTMLElement;
  cell: HTMLElement | null;
  marks: { el: HTMLElement; src: string }[];
}

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
  const cats = [...root.querySelectorAll<HTMLButtonElement>('button[data-cat]')];
  if (!input || !form) return;

  // Body counterparts, anywhere on the page.
  const bodyEmpty = document.querySelector<HTMLElement>('[data-filter-empty]');
  const bodyEmptyQ = document.querySelector<HTMLElement>('[data-filter-empty-q]');
  const bodyStatus = document.querySelector<HTMLElement>('[data-filter-status]');
  const bodyResets = document.querySelectorAll<HTMLButtonElement>('[data-filter-reset]');
  const total = Number(root.dataset.total ?? 0);

  const entries: Entry[] = [...document.querySelectorAll<HTMLElement>('[data-filter-item]')].map((item) => {
    const id = item.dataset.filterItem ?? '';
    return {
      id,
      cat: item.dataset.cat ?? '',
      text: (item.dataset.text ?? '').toLowerCase(),
      item,
      cell: root.querySelector<HTMLElement>(`[data-cell="${CSS.escape(id)}"]`),
      marks: [...item.querySelectorAll<HTMLElement>('[data-hl]')].map((el) => ({ el, src: el.textContent ?? '' })),
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
      e.item.hidden = !on;
      e.item.classList.toggle('is-lead', on && lead);
      if (on) lead = false;
      e.cell?.classList.toggle('is-on', on);
      e.marks.forEach((m) => (m.el.innerHTML = highlight(m.src, terms)));
    });

    if (shown) shown.textContent = String(count);
    const catName = cats.find((b) => b.dataset.cat === cat)?.querySelector('span')?.textContent ?? '';
    const sentence = `${count} of ${total} guide${total === 1 ? '' : 's'}${cat !== 'all' ? ` in ${catName}` : ''}${raw ? ` matching “${raw}”` : ''}`;
    if (status) status.textContent = sentence;
    if (bodyStatus) bodyStatus.textContent = `Showing ${sentence}.`;
    if (bodyEmpty) bodyEmpty.hidden = count > 0;
    if (bodyEmptyQ) bodyEmptyQ.textContent = raw ? `“${raw}”` : 'this filter';
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
  bodyResets.forEach((b) => b.addEventListener('click', resetAll));

  const params = new URL(location.href).searchParams;
  const q = params.get('q');
  const c = params.get('category');
  if (q) input.value = q;
  if (c) setCat(c);
  apply(false);
}
