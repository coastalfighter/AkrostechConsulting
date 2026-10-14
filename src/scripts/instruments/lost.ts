/**
 * 404 "wrong turn": draws the requested path as a route checked segment by segment against the
 * site's real pages, offers the closest page, and runs a fuzzy page finder as an accessible
 * combobox (Up/Down to move, Enter to open, Escape to clear).
 */
import { normalise, pathWords, search, bestMatch, type SearchEntry } from '@/lib/fuzzy';

interface Payload {
  entries: SearchEntry[];
  starters: SearchEntry[];
  known: string[];
}

const isEntry = (v: unknown): v is SearchEntry =>
  typeof v === 'object' && v !== null && typeof (v as SearchEntry).title === 'string' && typeof (v as SearchEntry).path === 'string';

function readPayload(el: HTMLScriptElement | null): Payload | null {
  if (!el) return null;
  try {
    const raw: unknown = JSON.parse(el.textContent ?? '');
    if (typeof raw !== 'object' || raw === null) return null;
    const r = raw as Record<string, unknown>;
    const entries = Array.isArray(r.entries) ? r.entries.filter(isEntry) : [];
    const starters = Array.isArray(r.starters) ? r.starters.filter(isEntry) : [];
    const known = Array.isArray(r.known) ? r.known.filter((k): k is string => typeof k === 'string') : [];
    return { entries, starters, known };
  } catch {
    return null;
  }
}

const trimSlash = (p: string): string => (p.length > 1 ? p.replace(/\/+$/, '') : p);

/** Title text with each query word that appears in it wrapped in <mark>. Built as nodes, never HTML. */
function highlighted(title: string, query: string): DocumentFragment {
  const frag = document.createDocumentFragment();
  const words = normalise(query).split(' ').filter((w) => w.length > 1);
  if (!words.length) {
    frag.append(title);
    return frag;
  }
  const lower = title.toLowerCase();
  const marks: [number, number][] = [];
  for (const w of words) {
    let from = 0;
    let at = lower.indexOf(w, from);
    while (at !== -1) {
      marks.push([at, at + w.length]);
      from = at + w.length;
      at = lower.indexOf(w, from);
    }
  }
  marks.sort((a, b) => a[0] - b[0]);
  let cursor = 0;
  for (const [a, b] of marks) {
    if (a < cursor) continue;
    frag.append(title.slice(cursor, a));
    const m = document.createElement('mark');
    m.textContent = title.slice(a, b);
    frag.append(m);
    cursor = b;
  }
  frag.append(title.slice(cursor));
  return frag;
}

export default function initLost(root: HTMLElement): void {
  const data = readPayload(root.querySelector<HTMLScriptElement>('[data-pages]'));
  const route = root.querySelector<HTMLOListElement>('[data-route]');
  const input = root.querySelector<HTMLInputElement>('[data-input]');
  const form = root.querySelector<HTMLFormElement>('[data-find]');
  const list = root.querySelector<HTMLUListElement>('[data-results]');
  const label = root.querySelector<HTMLElement>('[data-results-label]');
  const count = root.querySelector<HTMLElement>('[data-results-count]');
  if (!data || !input || !list || !form) return;

  const known = new Set(data.known.map(trimSlash));
  const path = trimSlash(window.location.pathname || '/');
  const fromPath = pathWords(path);

  // ---- The route ----
  if (route) {
    const segs = path.split('/').filter(Boolean);
    const items: HTMLLIElement[] = [];
    const root0 = route.querySelector('.wt__seg--root');
    let broken = false;
    segs.forEach((seg, i) => {
      const prefix = `/${segs.slice(0, i + 1).join('/')}`;
      const exists = !broken && known.has(prefix) && i < segs.length - 1;
      const li = document.createElement('li');
      li.className = 'wt__seg';
      li.style.setProperty('--i', String(i + 1));
      const name = document.createElement('span');
      name.className = 'wt__seg-name';
      let text = seg;
      try {
        text = decodeURIComponent(seg);
      } catch {
        /* keep the raw segment */
      }
      name.textContent = `/${text}`;
      const state = document.createElement('span');
      state.className = 'wt__seg-state';
      if (exists) state.textContent = 'Page exists';
      else if (!broken) {
        li.classList.add('wt__seg--broken');
        state.textContent = 'Not found';
        broken = true;
      } else {
        li.classList.add('wt__seg--after');
        state.textContent = 'Unreachable';
      }
      li.append(name, state);
      items.push(li);
    });
    if (items.length) {
      route.replaceChildren(...(root0 ? [root0] : []), ...items);
      route.setAttribute('aria-label', `The address you followed, ${path}, segment by segment`);
    }
  }

  // ---- Closest page to the broken address ----
  const best = fromPath ? bestMatch(fromPath, data.entries) : undefined;
  const suggest = root.querySelector<HTMLElement>('[data-suggest]');
  if (best && suggest) {
    const link = suggest.querySelector<HTMLAnchorElement>('[data-suggest-link]');
    const t = suggest.querySelector<HTMLElement>('[data-suggest-title]');
    const p = suggest.querySelector<HTMLElement>('[data-suggest-path]');
    if (link) link.href = best.path;
    if (t) t.textContent = best.title;
    if (p) p.textContent = best.path;
    suggest.hidden = false;
  }

  // ---- Finder: combobox + listbox ----
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-controls', list.id);
  input.setAttribute('aria-expanded', 'true');
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-label', 'Matching pages');

  let results: SearchEntry[] = [];
  let active = -1;

  function setActive(i: number): void {
    active = i;
    const options = list!.querySelectorAll<HTMLLIElement>('[role="option"]');
    options.forEach((o, j) => o.setAttribute('aria-selected', String(j === i)));
    const current = options[i];
    if (current) {
      input!.setAttribute('aria-activedescendant', current.id);
      current.scrollIntoView({ block: 'nearest' });
    } else input!.removeAttribute('aria-activedescendant');
  }

  function render(query: string): void {
    const q = query.trim();
    let heading = 'Start from here';
    if (q) {
      results = search(q, data!.entries, 7);
      heading = 'Matching pages';
    } else if (fromPath && bestMatch(fromPath, data!.entries)) {
      results = search(fromPath, data!.entries, 6);
      heading = 'Closest to the address you followed';
    } else {
      results = data!.starters;
    }
    if (label) label.textContent = heading;
    if (count) count.textContent = q ? `${results.length} ${results.length === 1 ? 'page' : 'pages'}` : '';

    const nodes = results.map((r, i) => {
      const li = document.createElement('li');
      li.className = 'wt__result';
      li.id = `wt-opt-${i}`;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      const a = document.createElement('a');
      a.className = 'wt__result-link';
      a.href = r.path;
      a.tabIndex = -1;
      const g = document.createElement('span');
      g.className = 'wt__result-group';
      g.textContent = r.group;
      const t = document.createElement('span');
      t.className = 'wt__result-title';
      t.append(highlighted(r.title, q || fromPath));
      const b = document.createElement('span');
      b.className = 'wt__result-body';
      b.textContent = r.body ?? r.path;
      a.append(g, t, b);
      li.append(a);
      li.addEventListener('pointermove', () => {
        if (active !== i) setActive(i);
      });
      return li;
    });
    if (!nodes.length) {
      const li = document.createElement('li');
      li.className = 'wt__empty';
      li.setAttribute('role', 'option');
      li.setAttribute('aria-disabled', 'true');
      li.textContent = 'No page matches that. Try a service, a city or a topic, or use the site map below.';
      nodes.push(li);
    }
    list!.replaceChildren(...nodes);
    setActive(q && results.length ? 0 : -1);
  }

  input.addEventListener('input', () => render(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!results.length) return;
      e.preventDefault();
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setActive(active < 0 ? (step > 0 ? 0 : results.length - 1) : (active + step + results.length) % results.length);
    } else if (e.key === 'Escape' && input.value) {
      e.preventDefault();
      input.value = '';
      render('');
    }
  });
  form.addEventListener('submit', (e) => {
    const target = results[active >= 0 ? active : 0];
    if (!target) return; // nothing matched: fall back to the article search
    e.preventDefault();
    window.location.assign(target.path);
  });

  render('');
}
