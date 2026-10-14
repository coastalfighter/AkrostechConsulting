/**
 * Corridor diagram: one stop selected at a time. Buttons on the map select a stop (roving
 * tabindex, arrow keys move along the line, Home/End jump to the ends); the lime reach line
 * runs from headquarters to the selected stop, and its readout panel is shown.
 */
export default function initCorridor(root: HTMLElement): void {
  const stops = [...root.querySelectorAll<HTMLButtonElement>('[data-stop]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[data-panel]')];
  if (!stops.length) return;

  function select(index: number, focus = false): void {
    const i = Math.max(0, Math.min(stops.length - 1, index));
    const slug = stops[i]?.dataset.stop;
    stops.forEach((b, j) => {
      b.setAttribute('aria-pressed', String(j === i));
      b.tabIndex = j === i ? 0 : -1;
    });
    panels.forEach((p) => (p.hidden = p.dataset.panel !== slug));
    root.style.setProperty('--reach', stops[i]?.dataset.reach ?? '0');
    if (focus) stops[i]?.focus();
  }

  const current = (): number => Math.max(0, stops.findIndex((b) => b.getAttribute('aria-pressed') === 'true'));

  stops.forEach((b, i) => {
    b.addEventListener('click', () => select(i));
    b.addEventListener('keydown', (e) => {
      // Stops run south to north: right/up go towards New York, left/down towards Wilmington.
      const next = e.key === 'ArrowRight' || e.key === 'ArrowUp';
      const prev = e.key === 'ArrowLeft' || e.key === 'ArrowDown';
      if (!next && !prev && e.key !== 'Home' && e.key !== 'End') return;
      e.preventDefault();
      const at = current();
      if (e.key === 'Home') select(0, true);
      else if (e.key === 'End') select(stops.length - 1, true);
      else select((at + (next ? 1 : -1) + stops.length) % stops.length, true);
    });
  });

  select(current());
}
