/**
 * Privacy data-flow hero: select a node to light the path an enquiry takes to reach it, dim
 * everything else and show that node's panel. Arrow keys move between nodes in reading order.
 */
export default function initFlow(root: HTMLElement): void {
  const nodes = [...root.querySelectorAll<HTMLButtonElement>('[data-node]')];
  const links = root.querySelectorAll<HTMLElement>('[data-link]');
  const panels = root.querySelectorAll<HTMLElement>('[data-panel]');
  if (!nodes.length) return;

  let paths: Record<string, string[]> = {};
  try {
    const parsed: unknown = JSON.parse(root.dataset.paths ?? '{}');
    if (parsed && typeof parsed === 'object') paths = parsed as Record<string, string[]>;
  } catch {
    return;
  }

  function select(id: string, focus = false): void {
    const path = new Set(paths[id] ?? [id]);
    root.dataset.sel = id;
    nodes.forEach((n) => {
      const nid = n.dataset.node ?? '';
      n.classList.toggle('is-lit', path.has(nid));
      n.classList.toggle('is-sel', nid === id);
      n.setAttribute('aria-pressed', String(nid === id));
      if (focus && nid === id) n.focus();
    });
    links.forEach((l) => l.classList.toggle('is-lit', path.has(l.dataset.link ?? '') && path.has(l.dataset.from ?? '')));
    panels.forEach((p) => p.classList.toggle('is-active', p.dataset.panel === id));
  }

  // Reading order: the chain left to right, then the third parties.
  const order = nodes.map((n) => n.dataset.node ?? '');
  nodes.forEach((n, i) => {
    n.addEventListener('click', () => select(n.dataset.node ?? ''));
    n.addEventListener('keydown', (e) => {
      const next: Record<string, number> = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: order.length - 1 };
      const to = next[e.key];
      if (to === undefined) return;
      e.preventDefault();
      const id = order[(to + order.length) % order.length];
      if (id) select(id, true);
    });
  });

  select(root.dataset.sel ?? 'form');
}
