/**
 * Motion layer. Loaded only when the visitor has not asked for reduced motion.
 *
 * Declarative hooks (all optional, all progressive enhancement):
 *   [data-reveal]               rise + fade once on enter ("clip" | "fade" variants)
 *   [data-reveal-group]         children with [data-reveal] stagger in order
 *   [data-split="lines|words"]  masked text-split reveal for headlines
 *   [data-wipe]                 clip-path image wipe, inner image settles from 1.15 scale
 *   [data-parallax="0.2"]       scroll parallax, value = depth (negative moves up)
 *   [data-count]                count up to its own final text on enter
 *   [data-hscroll]              pinned horizontal scroll showcase (desktop)
 *   [data-perspective]          perspective tilt that flattens as it scrolls into view
 *   [data-timeline]             scroll-driven process line with active steps
 *   [data-magnetic]             magnetic pull toward the pointer
 *   [data-tilt]                 3D card tilt with glare on hover
 *   [data-cursor-label="View"]  custom cursor shows a label over the element
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
let lenis: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenis;
}

/* ---------------------------------------------------------- smooth scroll */

function initSmoothScroll(): void {
  lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)), wheelMultiplier: 1, touchMultiplier: 1.4 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // In-page anchors glide; focus moves to the target for keyboard and screen-reader users.
  document.addEventListener('click', (e) => {
    const a = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    const target = document.querySelector<HTMLElement>(a.getAttribute('href')!);
    if (!target) return;
    e.preventDefault();
    lenis?.scrollTo(target, { offset: -80, duration: 1.2 });
    history.pushState(null, '', a.getAttribute('href'));
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  document.addEventListener('menu:toggle', (e) => ((e as CustomEvent<boolean>).detail ? lenis?.stop() : lenis?.start()));
  if (document.documentElement.classList.contains('is-preloading')) {
    lenis.stop();
    setTimeout(() => lenis?.start(), 1700);
  }
}

/* -------------------------------------------------------------- reveals */

function initReveals(): void {
  document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
    group.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${Math.min(i, 8) * 75}ms`);
    });
  });

  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: (els) => els.forEach((el) => el.classList.add('is-revealed')),
  });
}

function initSplits(): void {
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    const type = el.dataset.split === 'words' ? 'words' : 'lines';
    // Splitting is visual only; the original text stays the accessible name.
    el.setAttribute('aria-label', el.textContent?.trim() ?? '');
    SplitText.create(el, {
      type: type === 'words' ? 'words,lines' : 'lines',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      aria: 'hidden',
      onSplit(self) {
        const targets = type === 'words' ? self.words : self.lines;
        el.classList.add('is-split');
        return gsap.from(targets, {
          yPercent: 110,
          duration: 1.05,
          ease: 'expo.out',
          stagger: type === 'words' ? 0.035 : 0.09,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      },
    });
  });
}

function initWipes(): void {
  document.querySelectorAll<HTMLElement>('[data-wipe]').forEach((el) => {
    const from = el.dataset.wipe === 'up' ? 'inset(100% 0% 0% 0%)' : 'inset(0% 100% 0% 0%)';
    const img = el.querySelector('img, canvas, svg');
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    tl.fromTo(el, { clipPath: from }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' });
    if (img) tl.fromTo(img, { scale: 1.18 }, { scale: 1, duration: 1.6, ease: 'expo.out' }, 0.1);
  });
}

function initParallax(): void {
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const depth = Number(el.dataset.parallax) || 0.15;
    gsap.fromTo(
      el,
      { yPercent: -depth * 50 },
      {
        yPercent: depth * 50,
        ease: 'none',
        scrollTrigger: { trigger: el.closest('section') ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  });
}

function initCounters(): void {
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const final = el.textContent?.trim() ?? '';
    const match = final.match(/^(\D*)([\d,.]+)(.*)$/);
    if (!match) return;
    const [, prefix = '', num = '0', suffix = ''] = match;
    const target = Number(num.replace(/,/g, ''));
    const decimals = (num.split('.')[1] ?? '').length;
    const state = { v: 0 };
    el.setAttribute('aria-label', final);
    const render = () => {
      el.textContent = `${prefix}${state.v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
    };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        render();
        gsap.to(state, { v: target, duration: 1.8, ease: 'power3.out', onUpdate: render, onComplete: () => (el.textContent = final) });
      },
    });
  });
}

function initHorizontal(mm: gsap.MatchMedia): void {
  mm.add('(min-width: 1024px)', () => {
    document.querySelectorAll<HTMLElement>('[data-hscroll]').forEach((section) => {
      const track = section.querySelector<HTMLElement>('[data-hscroll-track]');
      if (!track) return;
      const distance = () => Math.max(0, track.scrollWidth - track.clientWidth);
      gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => section.style.setProperty('--hscroll-progress', self.progress.toFixed(3)),
        },
      });
    });
  });
}

function initPerspective(): void {
  document.querySelectorAll<HTMLElement>('[data-perspective]').forEach((el) => {
    gsap.fromTo(
      el,
      { rotateX: 16, scale: 0.9, transformPerspective: 1400, transformOrigin: '50% 100%' },
      { rotateX: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 35%', scrub: true } },
    );
  });
}

function initTimelines(): void {
  document.querySelectorAll<HTMLElement>('[data-timeline]').forEach((tl) => {
    const line = tl.querySelector<HTMLElement>('[data-timeline-line]');
    const steps = tl.querySelectorAll<HTMLElement>('[data-timeline-step]');
    if (line) {
      gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: tl, start: 'top 60%', end: 'bottom 60%', scrub: true } });
    }
    steps.forEach((step) => {
      ScrollTrigger.create({
        trigger: step,
        start: 'top 62%',
        end: 'bottom 38%',
        onToggle: (self) => step.classList.toggle('is-active', self.isActive),
        onEnter: () => step.classList.add('is-past'),
      });
    });
  });
}

/* ---------------------------------------------------------- interaction */

function initMagnetic(): void {
  if (!finePointer) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const strength = Number(el.dataset.magnetic) || 0.35;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    });
    el.addEventListener('pointerleave', () => {
      xTo(0);
      yTo(0);
    });
  });
}

function initTilt(): void {
  if (!finePointer) return;
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    const max = Number(el.dataset.tilt) || 8;
    gsap.set(el, { transformPerspective: 1100 });
    const rx = gsap.quickTo(el, 'rotateX', { duration: 0.5, ease: 'power3.out' });
    const ry = gsap.quickTo(el, 'rotateY', { duration: 0.5, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      ry((px - 0.5) * max * 2);
      rx((0.5 - py) * max * 2);
      el.style.setProperty('--glare-x', `${px * 100}%`);
      el.style.setProperty('--glare-y', `${py * 100}%`);
    });
    el.addEventListener('pointerleave', () => {
      rx(0);
      ry(0);
    });
  });
}

function initCursor(): void {
  const cursor = document.querySelector<HTMLElement>('[data-cursor]');
  if (!cursor || !finePointer) return;
  const root = document.documentElement;
  root.classList.add('has-cursor');
  const dot = cursor.querySelector<HTMLElement>('.cursor__dot')!;
  const ring = cursor.querySelector<HTMLElement>('.cursor__ring')!;
  const label = cursor.querySelector<HTMLElement>('[data-cursor-label]')!;
  const dx = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'none' });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'none' });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' });

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    root.classList.remove('cursor-hidden');
    dx(e.clientX);
    dy(e.clientY);
    rx(e.clientX);
    ry(e.clientY);
  });
  document.addEventListener('pointerleave', () => root.classList.add('cursor-hidden'));
  window.addEventListener('pointerdown', () => root.classList.add('cursor-down'));
  window.addEventListener('pointerup', () => root.classList.remove('cursor-down'));

  document.addEventListener('pointerover', (e) => {
    const target = (e.target as Element | null)?.closest<HTMLElement>('a, button, [data-cursor-label], summary, label, select');
    const text = target?.closest<HTMLElement>('[data-cursor-label]')?.dataset.cursorLabel;
    root.classList.toggle('cursor-hover', Boolean(target) && !text);
    root.classList.toggle('cursor-label', Boolean(text));
    label.textContent = text ?? '';
  });
}

function initMarqueeVelocity(): void {
  const marquees = document.querySelectorAll<HTMLElement>('[data-marquee]');
  if (!marquees.length || !lenis) return;
  const skewTo = [...marquees].map((m) => gsap.quickTo(m, 'skewX', { duration: 0.4, ease: 'power3.out' }));
  lenis.on('scroll', ({ velocity }: { velocity: number }) => {
    const skew = gsap.utils.clamp(-6, 6, velocity * -0.35);
    skewTo.forEach((fn) => fn(skew));
  });
}

function initHeroExit(): void {
  document.querySelectorAll<HTMLElement>('[data-hero-exit]').forEach((el) => {
    gsap.to(el, {
      yPercent: -18,
      opacity: 0.15,
      ease: 'none',
      scrollTrigger: { trigger: el.closest('section') ?? el, start: 'top top', end: 'bottom top', scrub: true },
    });
  });
}

/* ----------------------------------------------------------------- boot */

export function initMotion(): void {
  window.__akMotion = true;
  const mm = gsap.matchMedia();
  initSmoothScroll();
  initReveals();
  initSplits();
  initWipes();
  initParallax();
  initCounters();
  initHorizontal(mm);
  initPerspective();
  initTimelines();
  initMagnetic();
  initTilt();
  initCursor();
  initMarqueeVelocity();
  initHeroExit();

  // Re-measure once fonts and late images have settled.
  void document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  document.dispatchEvent(new CustomEvent('motion:ready'));
}
