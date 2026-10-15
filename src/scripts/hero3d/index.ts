/**
 * Boots every [data-hero3d] hero after the page has painted. three.js and the scene module
 * load as separate chunks, so the words (the LCP) never wait on WebGL. Without WebGL the
 * hero keeps its CSS backdrop and nothing breaks.
 */
const scenes = import.meta.glob<{ default: import('./engine').SceneFactory }>('./scenes/*.ts');

function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

async function start(root: HTMLElement): Promise<void> {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-hero3d-canvas]');
  const name = root.dataset.hero3d ?? '';
  const load = scenes[`./scenes/${name}.ts`];
  if (!canvas || !load) return;
  const [{ Hero3D }, scene] = await Promise.all([import('./engine'), load()]);
  const hero = new Hero3D(root, canvas, scene.default, `${name}:${root.dataset.hero3dSeed ?? ''}`);
  const toggle = root.querySelector<HTMLButtonElement>('[data-hero3d-pause]');
  toggle?.addEventListener('click', () => {
    const paused = toggle.getAttribute('aria-pressed') !== 'true';
    toggle.setAttribute('aria-pressed', String(paused));
    hero.setPaused(paused);
  });
}

export function initHero3d(): void {
  const roots = document.querySelectorAll<HTMLElement>('[data-hero3d]');
  if (!roots.length) return;
  if (!webglAvailable()) {
    roots.forEach((r) => (r.dataset.hero3dFallback = 'true'));
    return;
  }
  const go = () => roots.forEach((r) => void start(r).catch((err: unknown) => {
    r.dataset.hero3dFallback = 'true';
    console.error('Hero scene failed to start', err);
  }));
  const idle = () => ('requestIdleCallback' in window ? window.requestIdleCallback(go, { timeout: 1200 }) : setTimeout(go, 200));
  if (document.readyState === 'complete') idle();
  else window.addEventListener('load', idle, { once: true });
}
