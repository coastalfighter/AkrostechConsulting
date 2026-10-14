/**
 * Boots every [data-field] hero graphic: canvas + scene + pause control.
 */
import { Field } from './engine';
import { sceneFor } from './scenes';

const hash = (s: string): number => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);

export function initFields(): void {
  document.querySelectorAll<HTMLElement>('[data-field]').forEach((root) => {
    const canvas = root.querySelector<HTMLCanvasElement>('canvas');
    if (!canvas) return;
    const name = root.dataset.field ?? 'wave';
    try {
      const field = new Field(root, canvas, sceneFor(name), Math.abs(hash(`${name}:${root.dataset.fieldSeed ?? ''}`)));
      root.dataset.fieldReady = 'true';
      const toggle = root.querySelector<HTMLButtonElement>('[data-field-pause]');
      toggle?.addEventListener('click', () => {
        const paused = toggle.getAttribute('aria-pressed') !== 'true';
        toggle.setAttribute('aria-pressed', String(paused));
        field.setPaused(paused);
      });
    } catch (err) {
      console.error('Field could not start', err);
    }
  });
}
