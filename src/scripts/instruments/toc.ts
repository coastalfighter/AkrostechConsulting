/**
 * Reading outline: marks the section in view (IntersectionObserver on the article's h2s),
 * fills the lime track and bar by words read rather than pixels scrolled, and counts down the
 * minutes left. On narrow screens the outline collapses into a sticky bar with a toggle.
 */

const pad = (n: number): string => String(n).padStart(2, '0');

export default function initOutline(root: HTMLElement): void {
  const body = document.querySelector<HTMLElement>('[data-article-body]');
  const items = [...root.querySelectorAll<HTMLElement>('[data-section]')];
  const left = root.querySelector<HTMLElement>('[data-left]');
  const pos = root.querySelector<HTMLElement>('[data-pos]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-toggle]');
  const currentName = root.querySelector<HTMLElement>('[data-current-name]');
  if (!body || !items.length) return;

  const wpm = Number(root.dataset.wpm ?? 230);
  const totalWords = Number(root.dataset.words ?? 0);
  const introWords = Number(root.dataset.intro ?? 0);
  const sections = items
    .map((item) => ({
      item,
      link: item.querySelector<HTMLAnchorElement>('a'),
      heading: document.getElementById(item.dataset.section ?? ''),
      words: Number(item.dataset.words ?? 0),
      start: Number(item.dataset.start ?? 0),
      name: item.querySelector('.ol__text')?.textContent ?? '',
    }))
    .filter((s): s is typeof s & { heading: HTMLElement } => s.heading !== null);
  if (!sections.length) return;
  const defaultName = currentName?.textContent ?? '';

  let current = -2;
  let lastLeft = -1;

  const docTop = (el: Element): number => el.getBoundingClientRect().top + window.scrollY;

  function update(): void {
    const anchor = window.scrollY + window.innerHeight * 0.3;
    const bodyTop = docTop(body!);
    const bodyEnd = bodyTop + body!.offsetHeight;
    const tops = sections.map((s) => docTop(s.heading));

    // Which segment holds the anchor line: -1 is the introduction before the first heading.
    let index = -1;
    tops.forEach((t, i) => {
      if (anchor >= t - 2) index = i;
    });
    const segStart = index < 0 ? bodyTop : (tops[index] ?? bodyTop);
    const segEnd = index < 0 ? (tops[0] ?? bodyEnd) : (tops[index + 1] ?? bodyEnd);
    const segWords = index < 0 ? introWords : (sections[index]?.words ?? 0);
    const wordsBefore = index < 0 ? 0 : (sections[index]?.start ?? 0);
    const frac = Math.min(1, Math.max(0, (anchor - segStart) / Math.max(1, segEnd - segStart)));
    const read = anchor >= bodyEnd ? totalWords : wordsBefore + frac * segWords;
    const p = totalWords > 0 ? Math.min(1, read / totalWords) : 0;
    root.style.setProperty('--p', p.toFixed(4));

    const minutesLeft = Math.max(0, Math.ceil((totalWords - read) / wpm - 0.05));
    if (minutesLeft !== lastLeft && left) {
      left.textContent = String(minutesLeft);
      lastLeft = minutesLeft;
    }

    sections.forEach((s, i) => s.item.style.setProperty('--sp', i === index ? frac.toFixed(3) : '0'));

    if (index !== current) {
      current = index;
      sections.forEach((s, i) => {
        s.item.classList.toggle('is-current', i === index);
        s.item.classList.toggle('is-read', i < index);
        if (i === index) s.link?.setAttribute('aria-current', 'location');
        else s.link?.removeAttribute('aria-current');
      });
      if (pos) pos.textContent = pad(Math.max(0, index + 1));
      if (currentName) currentName.textContent = index >= 0 ? (sections[index]?.name ?? defaultName) : defaultName;
    }
  }

  let ticking = false;
  const schedule = (): void => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      update();
    });
  };

  // Section changes arrive through the observer; the fill follows the scroll between them.
  const io = new IntersectionObserver(schedule, { rootMargin: '-30% 0px -65% 0px' });
  sections.forEach((s) => io.observe(s.heading));
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });

  // Narrow screens: collapse to the readout bar with a toggle.
  const narrow = matchMedia('(max-width: 63.99rem)');
  const setOpen = (open: boolean): void => {
    toggle?.setAttribute('aria-expanded', String(open));
    if (open) delete root.dataset.collapsed;
    else root.dataset.collapsed = '';
  };
  const applyMode = (): void => {
    if (!toggle) return;
    toggle.hidden = !narrow.matches;
    setOpen(!narrow.matches);
  };
  toggle?.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  narrow.addEventListener('change', applyMode);
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && narrow.matches && toggle?.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
  sections.forEach((s) =>
    s.link?.addEventListener('click', () => {
      if (narrow.matches) setOpen(false);
    }),
  );

  applyMode();
  update();
}
