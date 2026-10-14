/**
 * Header state (solid ground once scrolled, hides on scroll down, returns on scroll up),
 * the reading-progress bar where CSS scroll timelines are unsupported, and the two-city clock.
 */
const clockFormat = (timeZone: string) => new Intl.DateTimeFormat('en-US', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

function initClock(): void {
  const us = document.querySelector<HTMLElement>('[data-clock-us]');
  const india = document.querySelector<HTMLElement>('[data-clock-in]');
  if (!us || !india) return;
  const fUs = clockFormat('America/New_York');
  const fIn = clockFormat('Asia/Kolkata');
  const tick = () => {
    const now = new Date();
    us.textContent = fUs.format(now);
    india.textContent = fIn.format(now);
  };
  tick();
  // Align to the next minute boundary, then tick every minute.
  window.setTimeout(() => {
    tick();
    window.setInterval(tick, 60_000);
  }, 60_000 - (Date.now() % 60_000));
}

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
      header.classList.toggle('is-scrolled', y > 8);
      const goingDown = y > lastY + 4;
      const goingUp = y < lastY - 4;
      if (goingDown && y > 400 && !header.contains(document.activeElement)) header.classList.add('is-hidden');
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
  initClock();
}

/** Services disclosure menu in the desktop header: click to open, Esc or outside click to close. */
export function initServicesMenu(): void {
  const trigger = document.querySelector<HTMLButtonElement>('[data-services-trigger]');
  const panel = document.querySelector<HTMLElement>('[data-services-panel]');
  if (!trigger || !panel) return;
  const set = (open: boolean) => {
    trigger.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
  };
  trigger.addEventListener('click', () => set(trigger.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) {
      set(false);
      trigger.focus();
    }
  });
  document.addEventListener('click', (e) => {
    const t = e.target as Node | null;
    if (!panel.hidden && t && !panel.contains(t) && !trigger.contains(t)) set(false);
  });
  panel.addEventListener('focusout', (e) => {
    const next = e.relatedTarget as Node | null;
    if (next && !panel.contains(next) && next !== trigger) set(false);
  });
}
