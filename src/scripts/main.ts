/**
 * Site-wide behaviour that must be ready immediately. Kept small; the motion layer
 * (GSAP, Lenis, cursor) and the 3D hero load afterwards as separate chunks.
 */
import { initTheme } from './theme';
import { initMenu } from './menu';
import { initHeader } from './header';
import { initMedia } from './media';
import { initRipple } from './ripple';
import { initFavicon } from './favicon';

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

/** WebGL hero only where it will run smoothly and the visitor has not asked to save data. */
function wantsWebGL(): boolean {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData) return false;
  if ((nav.hardwareConcurrency ?? 8) < 4) return false;
  if ((nav.deviceMemory ?? 8) < 2) return false;
  return true;
}

function hiddenUntilFoundFallback(): void {
  if ('onbeforematch' in HTMLElement.prototype) return;
  document.querySelectorAll<HTMLElement>('[hidden="until-found"]').forEach((el) => {
    el.removeAttribute('hidden');
    const controller = document.querySelector(`[aria-controls="${el.id}"]`);
    controller?.setAttribute('aria-expanded', 'true');
  });
}

function boot(): void {
  initTheme();
  initMenu();
  initHeader();
  initMedia();
  initRipple();
  hiddenUntilFoundFallback();

  if (!reduceMotion()) {
    import('./motion')
      .then((m) => m.initMotion())
      .catch((err: unknown) => {
        document.documentElement.classList.remove('motion-ready');
        console.error('Motion layer failed to load', err);
      });
  }

  const hero = document.querySelector<HTMLElement>('[data-hero-3d]');
  if (hero && wantsWebGL()) {
    const load = () => idle(() => void import('./hero3d').then((m) => m.initHero3d(hero)).catch(() => hero.classList.add('is-fallback')));
    // Phones wait for the first interaction so WebGL never competes with first paint;
    // until then the identical SVG globe is shown.
    const start = matchMedia('(max-width: 767px)').matches
      ? () => {
          const go = () => {
            ['scroll', 'pointerdown', 'keydown'].forEach((t) => window.removeEventListener(t, go));
            load();
          };
          ['scroll', 'pointerdown', 'keydown'].forEach((t) => window.addEventListener(t, go, { once: true, passive: true }));
        }
      : load;
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
  }

  idle(initFavicon, 3000);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
