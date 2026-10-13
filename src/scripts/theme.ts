/**
 * Two-state colour-scheme toggle (system ↔ override), following the platform guidance:
 * the stored value is only written when it differs from the system preference, and the
 * <meta name="color-scheme"> drives the cascade through `light-dark()`.
 */
const KEY = 'color-scheme';
type Scheme = 'light' | 'dark';

const meta = (): HTMLMetaElement | null => document.querySelector('meta[name="color-scheme"]');
const systemScheme = (): Scheme => (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

function stored(): Scheme | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

export function renderedScheme(): Scheme {
  return stored() ?? systemScheme();
}

function apply(value: Scheme | null): void {
  const m = meta();
  if (m) m.content = value ?? 'light dark';
  document.dispatchEvent(new CustomEvent('themechange', { detail: renderedScheme() }));
}

function setScheme(target: Scheme): void {
  try {
    if (target === systemScheme()) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, target);
  } catch {
    /* storage blocked: still apply for this page */
  }
  apply(target === systemScheme() ? null : target);
}

export function initTheme(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const target: Scheme = renderedScheme() === 'dark' ? 'light' : 'dark';
      const swap = () => setScheme(target);
      const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
      if (doc.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const r = button.getBoundingClientRect();
        const root = document.documentElement;
        root.style.setProperty('--vt-x', `${r.left + r.width / 2}px`);
        root.style.setProperty('--vt-y', `${r.top + r.height / 2}px`);
        root.dataset.themeSwitch = 'true';
        const vt = doc.startViewTransition(swap) as { finished?: Promise<void> };
        void vt.finished?.finally(() => delete document.documentElement.dataset.themeSwitch);
      } else swap();
    });
  });

  window.addEventListener('storage', (e) => {
    if (e.key === KEY) apply(stored());
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => apply(stored()));
}
