/**
 * Animated favicon. The mark's lit bar becomes a small 24-hour band whose lit cell tracks the
 * current hour, and it pulses gently while the tab is visible. Static under reduced motion.
 */
const SIZE = 64;

function draw(ctx: CanvasRenderingContext2D, frame: number, hour: number): void {
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = '#3f5a2a';
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.strokeStyle = '#f0ece3';
  ctx.lineWidth = 7;
  ctx.lineJoin = 'miter';
  ctx.beginPath();
  ctx.moveTo(16, 46);
  ctx.lineTo(32, 11);
  ctx.lineTo(48, 46);
  ctx.stroke();
  // 24-cell band along the bottom, lit window follows the hour.
  const cell = 64 / 24;
  for (let i = 0; i < 24; i++) {
    const lit = (i - hour + 24) % 24 < 8;
    const pulse = lit && i === (hour + (frame % 8)) % 24;
    ctx.fillStyle = pulse ? '#ffffff' : lit ? '#a2ba7c' : '#2f4220';
    ctx.fillRect(i * cell, 54, cell - 0.6, 10);
  }
}

export function initFavicon(): void {
  const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) return;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const icon = document.createElement('link');
  icon.rel = 'icon';
  icon.type = 'image/png';
  const original = link.href;
  let frame = 0;
  let timer: number | undefined;

  const render = () => {
    draw(ctx, frame++, new Date().getHours());
    icon.href = canvas.toDataURL('image/png');
  };

  const start = () => {
    if (timer) return;
    link.remove();
    document.head.append(icon);
    render();
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) timer = window.setInterval(render, 900);
  };
  const stop = () => {
    window.clearInterval(timer);
    timer = undefined;
  };

  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  window.addEventListener('pagehide', () => {
    stop();
    icon.remove();
    link.href = original;
    document.head.append(link);
  });
  start();
}
