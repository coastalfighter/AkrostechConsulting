/**
 * Blueprint board interaction: hovering or focusing a marker fills the readout; practice chips
 * dim the markers that do not match. The filter is shared with the blueprint grid on the page
 * through a `work:filter` event on the document, so both always show the same practice.
 */
export interface WorkFilterDetail {
  slug: string;
  source: string;
}

export default function initBoard(root: HTMLElement): void {
  const markers = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-board-item]'));
  const chips = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-board-filter]'));
  const status = root.querySelector<HTMLElement>('[data-board-status]');
  const out = (k: string) => root.querySelector<HTMLElement>(`[data-r="${k}"]`);
  const fields = { title: out('title'), practice: out('practice'), format: out('format'), team: out('team'), duration: out('duration') };
  const link = root.querySelector<HTMLAnchorElement>('[data-r="link"]');
  if (!markers.length) return;

  let filter = 'all';

  function show(marker: HTMLAnchorElement): void {
    markers.forEach((m) => m.classList.toggle('is-active', m === marker));
    (Object.keys(fields) as (keyof typeof fields)[]).forEach((k) => {
      const el = fields[k];
      if (el) el.textContent = marker.dataset[k] ?? '';
    });
    if (link) link.href = marker.href;
  }

  function apply(slug: string): void {
    filter = slug;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.boardFilter === slug)));
    let shown = 0;
    let firstMatch: HTMLAnchorElement | null = null;
    for (const m of markers) {
      const on = slug === 'all' || m.dataset.service === slug;
      m.classList.toggle('is-dim', !on);
      if (on) {
        shown++;
        firstMatch ??= m;
      }
    }
    const active = markers.find((m) => m.classList.contains('is-active'));
    if (firstMatch && (!active || active.classList.contains('is-dim'))) show(firstMatch);
    if (status) {
      const name = chips.find((c) => c.dataset.boardFilter === slug)?.textContent?.trim() ?? '';
      status.textContent =
        slug === 'all'
          ? 'Hover or focus a square to read the blueprint. Each square opens it.'
          : `${shown} ${name.toLowerCase()} blueprint${shown === 1 ? '' : 's'} highlighted. The rest are dimmed.`;
    }
  }

  markers.forEach((m) => {
    m.addEventListener('pointerenter', () => show(m));
    m.addEventListener('focus', () => show(m));
  });

  chips.forEach((c) =>
    c.addEventListener('click', () => {
      const slug = c.dataset.boardFilter ?? 'all';
      apply(slug);
      document.dispatchEvent(new CustomEvent<WorkFilterDetail>('work:filter', { detail: { slug, source: 'board' } }));
    }),
  );

  document.addEventListener('work:filter', (e) => {
    const detail = (e as CustomEvent<WorkFilterDetail>).detail;
    if (detail.source === 'board' || detail.slug === filter) return;
    apply(detail.slug);
  });

  const initial = new URL(location.href).searchParams.get('service');
  if (initial && chips.some((c) => c.dataset.boardFilter === initial)) apply(initial);
}
