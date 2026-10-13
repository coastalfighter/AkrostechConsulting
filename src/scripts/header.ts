/**
 * Header state: glass background once scrolled, hides on scroll down, returns on scroll up.
 * Also drives the progress bar where CSS scroll timelines are unsupported.
 */
export function initHeader(): void {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const bar = document.querySelector<HTMLElement>('[data-progress]');
  const cssProgress = CSS.supports('animation-timeline: scroll()') && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    if (header) {
      header.classList.toggle('is-scrolled', y > 24);
      const goingDown = y > lastY + 4;
      const goingUp = y < lastY - 4;
      if (goingDown && y > 320 && !header.contains(document.activeElement)) header.classList.add('is-hidden');
      else if (goingUp || y < 120) header.classList.remove('is-hidden');
    }
    if (bar && !cssProgress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.scale = `${max > 0 ? Math.min(1, y / max) : 0} 1`;
    }
    lastY = y;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  header?.addEventListener('focusin', () => header.classList.remove('is-hidden'));
  update();
}
