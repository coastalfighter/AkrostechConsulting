/**
 * Theme switch. The brand world is dark (black ground, lime mark); the light theme is the
 * "printed manual" variant. The inline head script applies a stored choice before first paint;
 * this module wires the toggle and keeps tabs in sync.
 */
export type Theme = 'dark' | 'light';
const KEY = 'ak-theme';

export const currentTheme = (): Theme => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

function label(button: HTMLButtonElement, theme: Theme): void {
  button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
}

function apply(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'light') root.dataset.theme = 'light';
  else delete root.dataset.theme;
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f4f5ef' : '#0b0c0a');
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((b) => label(b, theme));
  document.dispatchEvent(new CustomEvent<Theme>('themechange', { detail: theme }));
}

function store(theme: Theme): void {
  try {
    if (theme === 'dark') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, theme);
  } catch {
    /* storage blocked: the switch still applies to this page */
  }
}

export function initTheme(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]');
  buttons.forEach((button) => {
    label(button, currentTheme());
    button.addEventListener('click', () => {
      const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
      store(next);
      const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
      if (doc.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) doc.startViewTransition(() => apply(next));
      else apply(next);
    });
  });
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) apply(e.newValue === 'light' ? 'light' : 'dark');
  });
}
