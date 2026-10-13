/** Full-screen mobile menu on a native <dialog>: focus trap, Esc and top-layer come for free. */
export function initMenu(): void {
  const dialog = document.querySelector<HTMLDialogElement>('[data-menu]');
  const openers = document.querySelectorAll<HTMLButtonElement>('[data-menu-open]');
  if (!dialog) return;

  const setExpanded = (open: boolean) => openers.forEach((b) => b.setAttribute('aria-expanded', String(open)));
  setExpanded(false);

  const open = () => {
    dialog.showModal();
    document.documentElement.classList.add('menu-open');
    document.dispatchEvent(new CustomEvent('menu:toggle', { detail: true }));
    setExpanded(true);
  };
  const close = () => dialog.close();

  openers.forEach((b) => b.addEventListener('click', open));
  dialog.querySelectorAll('[data-menu-close]').forEach((b) => b.addEventListener('click', close));
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('menu-open');
    document.dispatchEvent(new CustomEvent('menu:toggle', { detail: false }));
    setExpanded(false);
    openers[0]?.focus();
  });
  // Navigating to a same-page anchor should close the menu.
  dialog.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
  // Close when the viewport grows past the mobile breakpoint.
  matchMedia('(min-width: 1024px)').addEventListener('change', (e) => {
    if (e.matches && dialog.open) close();
  });
}
