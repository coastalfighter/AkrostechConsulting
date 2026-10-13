/** Blur-up: each [data-media] shows its tiny placeholder until the real image has decoded. */
export function initMedia(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-media][data-loaded="false"]').forEach((wrap) => {
    const img = wrap.querySelector('img');
    if (!img) return;
    const done = () => {
      wrap.dataset.loaded = 'true';
    };
    if (img.complete && img.naturalWidth > 0) {
      done();
      return;
    }
    img.addEventListener('load', () => void img.decode().catch(() => undefined).finally(done), { once: true });
    img.addEventListener('error', done, { once: true });
  });
}
