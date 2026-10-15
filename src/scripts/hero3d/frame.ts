/**
 * Framing for heroes with content under the words (the `after` slot). On wide screens the
 * stage spans the whole section, including that content, so an object centred on the stage
 * would sit low and run under it. This keeps the object centred on the free band above the
 * `after` content and scales it to fit that band. Without `after` content it does nothing.
 */
import type * as THREE from 'three';

export interface Framer {
  /** Re-measure (cheap; throttled to a few times a second) and apply to the camera and object. */
  update(t: number): void;
}

export function framer(canvas: HTMLCanvasElement, camera: THREE.PerspectiveCamera, object: THREE.Object3D, fill = 1.45): Framer {
  const section = canvas.closest<HTMLElement>('[data-hero3d]');
  let last = -Infinity;
  let w = 0;
  let h = 0;
  const apply = () => {
    const after = section?.querySelector<HTMLElement>('.h3d__after');
    const wrap = section?.querySelector<HTMLElement>('.h3d__wrap');
    const r = canvas.getBoundingClientRect();
    if (!after || !wrap || r.height < 2) return;
    const bottom = Math.min(r.bottom, after.getBoundingClientRect().top);
    const top = Math.max(r.top, wrap.getBoundingClientRect().top);
    const band = bottom - top;
    if (band >= r.height - 1 || band < 40) {
      camera.position.set(0, 0, camera.position.z);
      object.scale.setScalar(1);
      return;
    }
    const scale = Math.min(1, (fill * band) / r.height);
    const centre = (top + bottom) / 2 - (r.top + r.height / 2);
    const visible = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360);
    camera.position.y = (centre / r.height) * visible;
    // The engine shifts the object right only when the whole stage is landscape. A tall stage
    // (long `after` content) can still have a landscape band; shift it here in that case.
    const shift = Number(section?.dataset.hero3dShift ?? 0);
    const engineShifted = r.width >= 900 && r.width / r.height > 1.1;
    const bandWide = r.width >= 900 && r.width / band > 1.1;
    camera.position.x = !engineShifted && bandWide ? -((shift * r.width) / r.height) * visible : 0;
    object.scale.setScalar(scale);
  };
  return {
    update(t) {
      if (canvas.clientWidth !== w || canvas.clientHeight !== h || t - last > 0.5) {
        w = canvas.clientWidth;
        h = canvas.clientHeight;
        last = t;
        apply();
      }
    },
  };
}
