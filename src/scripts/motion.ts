/**
 * Motion layer. Loaded after `load`, only when the visitor has not asked for reduced motion.
 * Everything here is progressive enhancement: without it, every element is already visible.
 *
 *   [data-reveal]         rise + fade once on enter; "clip" wipes a photo up, "rule" draws a hairline
 *   [data-reveal-group]   children with [data-reveal] stagger in document order
 *   [data-split]          headline lines rise from a mask (lines measured at runtime)
 *   [data-count]          counts up to its own final number on enter
 */
import Lenis from 'lenis';

let lenis: Lenis | null = null;

function onceVisible(selector: string, fn: (el: HTMLElement) => void, rootMargin = '0px 0px -8% 0px'): void {
  const els = document.querySelectorAll<HTMLElement>(selector);
  if (!els.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        fn(entry.target as HTMLElement);
      });
    },
    { rootMargin },
  );
  els.forEach((el) => io.observe(el));
}

function initSmoothScroll(): void {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  lenis = new Lenis({ duration: 1.05, easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)) });
  const raf = (time: number) => {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
  document.addEventListener('click', (e) => {
    const a = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    const href = a?.getAttribute('href');
    if (!a || !href || href === '#') return;
    const target = document.getElementById(decodeURIComponent(href.slice(1)));
    if (!target) return;
    e.preventDefault();
    lenis?.scrollTo(target, { offset: -88 });
    history.pushState(null, '', href);
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
  document.addEventListener('menu:toggle', (e) => ((e as CustomEvent<boolean>).detail ? lenis?.stop() : lenis?.start()));
  document.querySelectorAll('[data-lenis-prevent], dialog').forEach((el) => el.setAttribute('data-lenis-prevent', ''));
}

/** Wrap each rendered line of a heading in a mask. Keeps the text node order for screen readers. */
function splitLines(el: HTMLElement): void {
  if (el.dataset.splitDone) return;
  const text = el.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  if (!text || el.children.length > 0) return; // only plain-text headings
  const words = text.split(' ');
  el.innerHTML = words.map((w) => `<span class="split-w">${w}</span>`).join(' ');
  const lines: string[][] = [];
  let lastTop = Number.NaN;
  el.querySelectorAll<HTMLElement>('.split-w').forEach((w) => {
    const top = w.offsetTop;
    if (top !== lastTop) lines.push([]);
    lines[lines.length - 1]!.push(w.textContent ?? '');
    lastTop = top;
  });
  el.setAttribute('aria-label', text);
  el.innerHTML = lines
    .map((l, i) => `<span class="line-mask" aria-hidden="true"><span style="--l:${i}">${l.join(' ')}</span></span>`)
    .join('');
  el.dataset.splitDone = 'true';
}

function initReveals(): void {
  document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
    group.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el, i) => el.style.setProperty('--d', String(Math.min(i, 8))));
  });
  onceVisible('[data-reveal]', (el) => el.classList.add('is-in'));
  document.querySelectorAll<HTMLElement>('[data-split]').forEach(splitLines);
  onceVisible('[data-split]', (el) => requestAnimationFrame(() => el.classList.add('is-in')));
}

function initCounters(): void {
  const format = new Intl.NumberFormat('en-US');
  onceVisible('[data-count]', (el) => {
    const final = el.textContent ?? '';
    const match = final.match(/[\d,]+(\.\d+)?/);
    if (!match) return;
    const target = Number(match[0].replace(/,/g, ''));
    const decimals = match[1] ? match[1].length - 1 : 0;
    const start = performance.now();
    const duration = 1100;
    el.style.minWidth = `${el.getBoundingClientRect().width}px`;
    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 4;
      const value = (target * eased).toFixed(decimals);
      el.textContent = final.replace(match[0], decimals ? value : format.format(Number(value)));
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = final;
    };
    requestAnimationFrame(frame);
  });
}

export function initMotion(): void {
  window.__akMotion = true;
  initSmoothScroll();
  initReveals();
  initCounters();
}
