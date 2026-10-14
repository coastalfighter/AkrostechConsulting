/**
 * Page-builder hero: switch blocks on and off; the wireframe re-flows (transform only), the
 * weight bar and LCP needle move, and the readouts count to their new values. The estimate
 * model is shared with the server render (lib/pagebuilder).
 */
import { BASE, KB_SCALE, LCP_SCALE, bandLabel, blocks, estimate, formatKb, layout, type BlockId } from '@/lib/pagebuilder';

const reduce = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function initBuilder(root: HTMLElement): void {
  const toggles = root.querySelectorAll<HTMLButtonElement>('[data-block]');
  const out = (k: string) => root.querySelector<HTMLElement>(`[data-out="${k}"]`);
  const band = root.querySelector<HTMLElement>('[data-band]');
  const needle = root.querySelector<HTMLElement>('[data-needle]');
  if (!toggles.length) return;

  const ids = new Set<string>(blocks.map((b) => b.id));
  const isBlock = (v: string | undefined): v is BlockId => v !== undefined && ids.has(v);
  const on = new Set<BlockId>((root.dataset.on ?? '').split(' ').filter(isBlock));

  // Current displayed numbers, tweened toward their targets.
  const shown = { kb: estimate(on).kb, lcp: estimate(on).lcp, requests: estimate(on).requests };
  let raf = 0;

  function tween(target: { kb: number; lcp: number; requests: number }): void {
    cancelAnimationFrame(raf);
    const from = { ...shown };
    const kbEl = out('kb');
    const lcpEl = out('lcp');
    const reqEl = out('requests');
    const paint = () => {
      if (kbEl) kbEl.textContent = formatKb(shown.kb);
      if (lcpEl) lcpEl.textContent = shown.lcp.toFixed(1);
      if (reqEl) reqEl.textContent = String(Math.round(shown.requests));
    };
    if (reduce()) {
      Object.assign(shown, target);
      paint();
      return;
    }
    const t0 = performance.now();
    const dur = 280;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      shown.kb = from.kb + (target.kb - from.kb) * e;
      shown.lcp = from.lcp + (target.lcp - from.lcp) * e;
      shown.requests = from.requests + (target.requests - from.requests) * e;
      paint();
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }

  function render(changed?: BlockId): void {
    const est = estimate(on);
    const lay = layout(on);
    root.style.setProperty('--h', String(lay.height));

    // Wireframe blocks: position and visibility.
    root.querySelectorAll<HTMLElement>('[data-blk]').forEach((el) => {
      const id = el.dataset.blk;
      if (!id) return;
      const y = lay.y[id as BlockId | 'footer'];
      if (y !== undefined) el.style.setProperty('--y', String(y));
      if (isBlock(id)) {
        const active = on.has(id);
        el.classList.toggle('is-on', active);
        if (active && id === changed) {
          el.classList.remove('is-new');
          void el.offsetWidth; // restart the flash
          el.classList.add('is-new');
        }
      }
    });
    root.dataset.tracking = on.has('tracking') ? 'on' : 'off';
    root.dataset.chat = on.has('chat') ? 'on' : 'off';
    root.dataset.video = on.has('video') ? 'on' : 'off';

    // Weight bar: each segment starts where the previous switched-on one ended.
    let offset = BASE.kb;
    for (const b of blocks) {
      const seg = root.querySelector<HTMLElement>(`[data-seg="${b.id}"]`);
      if (!seg) continue;
      seg.style.setProperty('--x', (offset / KB_SCALE).toFixed(4));
      seg.classList.toggle('is-on', on.has(b.id));
      if (on.has(b.id)) offset += b.kb;
    }

    needle?.style.setProperty('--p', Math.min(1, est.lcp / LCP_SCALE).toFixed(4));
    if (band) {
      band.classList.remove('is-good', 'is-ni', 'is-poor');
      band.classList.add(`is-${est.band}`);
      band.classList.toggle('lime', est.band === 'good');
    }
    const bandEl = out('band');
    const note = out('note');
    const count = out('count');
    const summary = out('summary');
    if (bandEl) bandEl.textContent = bandLabel[est.band];
    if (note) note.textContent = est.heaviest?.note ?? 'Just the page shell: navigation, footer, fonts and styles.';
    if (count) count.textContent = String(on.size);
    if (summary)
      summary.textContent = `Page weight ${formatKb(est.kb)}, ${est.requests} requests, estimated LCP ${est.lcp.toFixed(1)} seconds: ${bandLabel[est.band]}.`;

    toggles.forEach((t) => {
      const id = t.dataset.block;
      if (isBlock(id)) t.setAttribute('aria-pressed', String(on.has(id)));
    });
    tween({ kb: est.kb, lcp: est.lcp, requests: est.requests });
  }

  toggles.forEach((t) => {
    t.addEventListener('click', () => {
      const id = t.dataset.block;
      if (!isBlock(id)) return;
      if (on.has(id)) {
        on.delete(id);
        // A background video lives in the hero: removing the hero removes the video.
        if (id === 'hero') on.delete('video');
      } else {
        on.add(id);
        if (id === 'video') on.add('hero');
      }
      render(id);
    });
  });

  render();
}
