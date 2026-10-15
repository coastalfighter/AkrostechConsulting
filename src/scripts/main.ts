/**
 * Site-wide behaviour that must be ready immediately: theme, menu, header. The motion layer
 * (Lenis, reveals) and each page's interactive instruments load afterwards as separate chunks;
 * the hero's generative field starts immediately.
 */
import { initTheme } from './theme';
import { initMenu } from './menu';
import { initHeader, initServicesMenu } from './header';
import { initFields } from './field';
import { initHero3d } from './hero3d';

declare global {
  interface Window {
    __akMotion?: boolean;
  }
}

const reduceMotion = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches;

function idle(fn: () => void, timeout = 1200): void {
  if ('requestIdleCallback' in window) window.requestIdleCallback(fn, { timeout });
  else setTimeout(fn, 200);
}

/** Interactive instruments (in page bodies): one module per instrument in ./instruments, named by data-instrument. */
const instruments = import.meta.glob<{ default: (root: HTMLElement) => void }>('./instruments/*.ts');

/** Instruments sit below the fold, so each module loads as its section nears the viewport. */
function initInstruments(): void {
  const start = (root: HTMLElement) => {
    const key = root.dataset.instrument ?? '';
    const load = instruments[`./instruments/${key}.ts`];
    if (!load) return;
    load()
      .then((m) => {
        m.default(root);
        root.dataset.instrumentReady = 'true';
      })
      .catch((err: unknown) => console.error(`Instrument "${key}" failed to load`, err));
  };
  const roots = document.querySelectorAll<HTMLElement>('[data-instrument]');
  if (!('IntersectionObserver' in window)) {
    roots.forEach(start);
    return;
  }
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        start(e.target as HTMLElement);
      }),
    { rootMargin: '600px 0px' },
  );
  roots.forEach((r) => io.observe(r));
}

function boot(): void {
  initTheme();
  initMenu();
  initHeader();
  initServicesMenu();
  initFields();
  initHero3d();
  initInstruments();

  if (!reduceMotion()) {
    const loadMotion = () =>
      idle(
        () =>
          void import('./motion')
            .then((m) => m.initMotion())
            .catch((err: unknown) => {
              document.documentElement.classList.remove('motion-ready');
              console.error('Motion layer failed to load', err);
            }),
        400,
      );
    if (document.readyState === 'complete') loadMotion();
    else window.addEventListener('load', loadMotion, { once: true });
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
