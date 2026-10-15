/**
 * Boots every [data-hero3d] hero after the page has painted. three.js and the scene module
 * load as separate chunks, so the words (the LCP) never wait on WebGL. Without WebGL the
 * hero keeps its CSS backdrop and nothing breaks.
 */
const scenes = import.meta.glob<{ default: import('./engine').SceneFactory }>('./scenes/*.ts');

/**
 * Whether the device can draw WebGL on a GPU. `failIfMajorPerformanceCaveat` makes browsers
 * refuse a context that would run on a software rasteriser (SwiftShader, llvmpipe: virtual
 * machines, blocklisted GPUs, headless browsers). Those visitors keep the CSS backdrop rather
 * than a scene that would block the page for seconds while the CPU draws it.
 */
function gpuWebgl(): boolean {
  try {
    const c = document.createElement('canvas');
    const opts: WebGLContextAttributes = { failIfMajorPerformanceCaveat: true };
    const gl = (c.getContext('webgl2', opts) ?? c.getContext('webgl', opts)) as WebGLRenderingContext | null;
    if (!gl) return false;
    // Some browsers still hand out a software context; ask the driver what it is.
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const name = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(name);
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
  // `?hero3d=live` draws the scene even on software WebGL (for automated visual checks).
  const force = new URLSearchParams(location.search).has('hero3d');
  const go = () => {
    if (!force && !gpuWebgl()) {
      roots.forEach((r) => (r.dataset.hero3dFallback = 'true'));
      return;
    }
    roots.forEach((r) =>
      void start(r).catch((err: unknown) => {
        r.dataset.hero3dFallback = 'true';
        console.error('Hero scene failed to start', err);
      }),
    );
  };
  const idle = () => ('requestIdleCallback' in window ? window.requestIdleCallback(go, { timeout: 1200 }) : setTimeout(go, 200));
  if (document.readyState === 'complete') idle();
  else window.addEventListener('load', idle, { once: true });
}
