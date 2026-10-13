/**
 * Site-wide behaviour that must be ready immediately: theme, menu, header. The motion layer
 * (Lenis, reveals) and each page's interactive hero load afterwards as separate chunks.
 */
import { initTheme } from './theme';
import { initMenu } from './menu';
import { initHeader } from './header';

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

/** Interactive heroes: one module per page in ./heroes, named by the root's data-hero value. */
const heroes = import.meta.glob<{ default: (root: HTMLElement) => void }>('./heroes/*.ts');

function initHeroes(): void {
  document.querySelectorAll<HTMLElement>('[data-hero]').forEach((root) => {
    const key = root.dataset.hero ?? '';
    const load = heroes[`./heroes/${key}.ts`];
    if (!load) return;
    load()
      .then((m) => {
        m.default(root);
        root.dataset.heroReady = 'true';
      })
      .catch((err: unknown) => console.error(`Hero "${key}" failed to load`, err));
  });
}

function boot(): void {
  initTheme();
  initMenu();
  initHeader();
  initHeroes();

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
