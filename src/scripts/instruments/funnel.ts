/**
 * Hiring-funnel model: the hires slider and the five pass-through steppers recompute every stage
 * live. The arithmetic lives in lib/funnel (tested).
 */
import { HIRES, RATE, clampRate, planFunnel } from '@/lib/funnel';

export default function initFunnel(root: HTMLElement): void {
  const slider = root.querySelector<HTMLInputElement>('[data-hires]');
  const hiresOut = root.querySelector<HTMLElement>('[data-out="hires"]');
  const bars = Array.from(root.querySelectorAll<HTMLElement>('[data-bar]'));
  const countOuts = Array.from(root.querySelectorAll<HTMLElement>('[data-count-out]'));
  const rateOuts = Array.from(root.querySelectorAll<HTMLElement>('[data-rate-out]'));
  const steps = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-step]'));
  const reset = root.querySelector<HTMLButtonElement>('[data-reset]');
  const sum = (k: string) => root.querySelector<HTMLElement>(`[data-sum="${k}"]`);
  if (!slider || !bars.length) return;

  const defaults = (root.dataset.defaults ?? '').split(',').map(Number).filter((n) => Number.isFinite(n) && n > 0);
  let rates = [...defaults];
  let hires = Number(slider.value) || HIRES.default;

  function render(): void {
    const counts = planFunnel(hires, rates);
    const max = Math.max(1, counts[0] ?? 1);
    if (hiresOut) hiresOut.textContent = String(hires);
    slider!.setAttribute('aria-valuetext', `${hires} ${hires === 1 ? 'hire' : 'hires'}`);
    bars.forEach((bar) => {
      const i = Number(bar.dataset.bar);
      bar.style.setProperty('--w', String(Math.max(0.006, (counts[i] ?? 0) / max)));
    });
    countOuts.forEach((el) => {
      el.textContent = String(counts[Number(el.dataset.countOut)] ?? 0);
    });
    rateOuts.forEach((el) => {
      el.textContent = `${rates[Number(el.dataset.rateOut)] ?? 0}%`;
    });
    steps.forEach((b) => {
      const v = rates[Number(b.dataset.rate)] ?? 0;
      b.setAttribute('aria-disabled', String(b.dataset.step === '-1' ? v <= RATE.min : v >= RATE.max));
    });
    const recruiter = sum('recruiter');
    const meet = sum('meet');
    const offers = sum('offers');
    if (recruiter) recruiter.textContent = String(counts[0] ?? 0);
    if (meet) meet.textContent = String(counts[3] ?? 0);
    if (offers) offers.textContent = String(counts[4] ?? 0);
    if (reset) reset.setAttribute('aria-disabled', String(rates.every((r, i) => r === defaults[i])));
  }

  slider.addEventListener('input', () => {
    hires = Math.min(HIRES.max, Math.max(HIRES.min, Number(slider.value) || HIRES.default));
    render();
  });

  steps.forEach((button) => {
    button.addEventListener('click', () => {
      if (button.getAttribute('aria-disabled') === 'true') return;
      const i = Number(button.dataset.rate);
      const dir = Number(button.dataset.step);
      rates[i] = clampRate((rates[i] ?? 50) + dir * RATE.step);
      render();
    });
  });

  reset?.addEventListener('click', () => {
    if (reset.getAttribute('aria-disabled') === 'true') return;
    rates = [...defaults];
    render();
  });

  render();
}
