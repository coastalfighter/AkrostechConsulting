#!/usr/bin/env node
/**
 * Generates the site's artwork and Open Graph images.
 *
 *   npm run art
 *
 * Every picture shares one visual idea: the 24-hour band. A strip of 24 cells is one client day;
 * the lit cells are the India shift that mirrors it. Each service adds its own flat motif
 * (inbox rows, a candidate funnel, a balancing ledger, stacked documents, a browser layout).
 *
 * Output
 *   src/assets/art/*.webp         high-resolution sources; Astro converts them to AVIF/WebP srcsets
 *   src/assets/art/manifest.json  blur-up placeholders (tiny WebP data URIs) and dominant colours
 *   public/og/*.png               1200×630 social cards with the page title set in Space Grotesk
 *   public/logo.png, public/apple-touch-icon.png, public/icon-192.png, public/icon-512.png
 *
 * Text is converted to vector paths with opentype.js, so the output does not depend on fonts
 * installed on the machine that runs the script.
 */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import opentype from 'opentype.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ART_DIR = join(root, 'src/assets/art');
const OG_DIR = join(root, 'public/og');
const FONT_DIR = join(root, 'node_modules/@fontsource/space-grotesk/files');

const C = {
  sand50: '#f8f6f1', sand100: '#f0ece3', sand200: '#e7e1d4', sand300: '#ddd6c6', sand400: '#cbc1ab', sand500: '#aea38a', sand700: '#6c6553',
  moss100: '#e0e8d2', moss200: '#c3d3a9', moss300: '#a2ba7c', moss400: '#819f55', moss500: '#66833f', moss600: '#4f6238', moss700: '#3f5a2a', moss800: '#2f4220', moss900: '#212e17', moss950: '#131b0d',
  char800: '#2a2a26', char900: '#1d1d1a', char700: '#393933', char500: '#5f5f57',
};

/** Palette per motif: ground, shape, ink (quiet), lit accent, band off-cell. */
const PALETTES = {
  va: { ground: C.moss700, shape: C.sand200, quiet: C.moss500, lit: C.moss300, off: C.moss600, sun: C.moss300 },
  rpo: { ground: C.sand400, shape: C.char800, quiet: C.sand500, lit: C.moss600, off: C.sand300, sun: C.sand200 },
  accounting: { ground: C.char900, shape: C.sand300, quiet: C.char700, lit: C.moss300, off: C.char700, sun: C.moss400 },
  legal: { ground: C.sand200, shape: C.moss800, quiet: C.sand400, lit: C.moss500, off: C.sand300, sun: C.moss200 },
  web: { ground: C.moss900, shape: C.moss200, quiet: C.moss800, lit: C.sand100, off: C.moss800, sun: C.moss600 },
};

// Deterministic PRNG so every run produces identical files (stable diffs, stable caching).
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}
const hash = (str) => [...str].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);

/* ------------------------------------------------------------------ motifs */
// Each returns SVG markup drawn inside a box (x, y, w, h).

function band({ x, y, w, h, lit, palette, start = 8, length = 9 }) {
  const gap = w * 0.006;
  const cell = (w - gap * 23) / 24;
  let out = '';
  for (let i = 0; i < 24; i++) {
    const on = (i - start + 24) % 24 < length;
    out += `<rect x="${(x + i * (cell + gap)).toFixed(1)}" y="${y}" width="${cell.toFixed(1)}" height="${h}" fill="${on ? lit : palette.off}"/>`;
  }
  return out;
}

function motifInbox(b, p, r) {
  const rows = 7;
  const rowH = b.h / (rows * 1.6);
  let out = '';
  for (let i = 0; i < rows; i++) {
    const y = b.y + i * rowH * 1.6;
    const len = b.w * (0.45 + r() * 0.5);
    const done = i % 3 !== 1;
    const dot = rowH * 0.42;
    out += `<circle cx="${b.x + dot}" cy="${y + rowH / 2}" r="${dot}" fill="${done ? p.lit : p.quiet}"/>`;
    if (done) {
      const cx = b.x + dot, cy = y + rowH / 2, s = dot * 0.55;
      out += `<path d="M${cx - s} ${cy} l${s * 0.7} ${s * 0.7} l${s * 1.3} -${s * 1.4}" fill="none" stroke="${p.ground}" stroke-width="${s * 0.45}" stroke-linecap="square"/>`;
    }
    out += `<rect x="${b.x + dot * 3}" y="${y + rowH * 0.12}" width="${len}" height="${rowH * 0.76}" fill="${done ? p.shape : p.quiet}"/>`;
  }
  return out;
}

function motifFunnel(b, p, r) {
  const cols = [9, 7, 5, 3, 1];
  let out = '';
  const colW = b.w / cols.length;
  cols.forEach((n, ci) => {
    const rad = Math.min(colW * 0.16, b.h / 22);
    const total = n * rad * 3;
    const top = b.y + (b.h - total) / 2;
    for (let i = 0; i < n; i++) {
      const lit = ci === cols.length - 1 || (ci >= 2 && r() > 0.55);
      out += `<circle cx="${b.x + ci * colW + colW / 2}" cy="${top + i * rad * 3 + rad * 1.5}" r="${rad}" fill="${lit ? p.lit : p.shape}"/>`;
    }
  });
  return out;
}

function motifLedger(b, p, r) {
  let out = '';
  const colW = b.w * 0.34;
  const beamY = b.y + b.h * 0.08;
  out += `<rect x="${b.x}" y="${beamY}" width="${b.w}" height="${b.h * 0.035}" fill="${p.shape}"/>`;
  out += `<rect x="${b.x + b.w / 2 - b.w * 0.012}" y="${beamY}" width="${b.w * 0.024}" height="${b.h * 0.9}" fill="${p.quiet}"/>`;
  [0, 1].forEach((side) => {
    const x = b.x + (side ? b.w - colW : 0);
    let y = beamY + b.h * 0.08;
    const end = b.y + b.h;
    while (y < end - 10) {
      const hh = Math.min(end - y, b.h * (0.06 + r() * 0.12));
      out += `<rect x="${x}" y="${y}" width="${colW}" height="${hh - b.h * 0.018}" fill="${side ? p.lit : p.shape}"/>`;
      y += hh;
    }
  });
  return out;
}

function motifDocuments(b, p, r) {
  let out = '';
  const pw = b.w * 0.62, ph = b.h * 0.82;
  for (let i = 0; i < 4; i++) {
    const x = b.x + i * b.w * 0.11;
    const y = b.y + (3 - i) * b.h * 0.05;
    const rot = (r() - 0.5) * 6;
    const front = i === 3;
    out += `<g transform="rotate(${rot.toFixed(2)} ${x + pw / 2} ${y + ph / 2})">`;
    out += `<rect x="${x}" y="${y}" width="${pw}" height="${ph}" fill="${front ? C.sand50 : p.quiet}"/>`;
    if (front) {
      for (let l = 0; l < 9; l++) {
        const ly = y + ph * 0.12 + l * ph * 0.085;
        const lw = pw * (l === 4 || l === 5 ? 0.78 : 0.55 + r() * 0.28);
        const hl = l === 4 || l === 5;
        if (hl) out += `<rect x="${x + pw * 0.08}" y="${ly - ph * 0.012}" width="${pw * 0.84}" height="${ph * 0.05}" fill="${p.lit}" opacity="0.55"/>`;
        out += `<rect x="${x + pw * 0.1}" y="${ly}" width="${lw}" height="${ph * 0.024}" fill="${p.shape}"/>`;
      }
    }
    out += '</g>';
  }
  return out;
}

function motifBrowser(b, p, r) {
  let out = '';
  const bar = b.h * 0.09;
  out += `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="${p.quiet}"/>`;
  out += `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${bar}" fill="${p.shape}"/>`;
  for (let i = 0; i < 3; i++) out += `<circle cx="${b.x + bar * (0.6 + i * 0.55)}" cy="${b.y + bar / 2}" r="${bar * 0.16}" fill="${p.ground}"/>`;
  const pad = b.w * 0.07;
  const inner = { x: b.x + pad, y: b.y + bar + pad * 0.8, w: b.w - pad * 2 };
  out += `<rect x="${inner.x}" y="${inner.y}" width="${inner.w * 0.62}" height="${b.h * 0.07}" fill="${p.lit}"/>`;
  out += `<rect x="${inner.x}" y="${inner.y + b.h * 0.11}" width="${inner.w * 0.44}" height="${b.h * 0.07}" fill="${p.lit}"/>`;
  out += `<rect x="${inner.x}" y="${inner.y + b.h * 0.25}" width="${inner.w * 0.2}" height="${b.h * 0.055}" fill="${p.shape}"/>`;
  const cardY = inner.y + b.h * 0.42;
  const cw = (inner.w - pad) / 3;
  for (let i = 0; i < 3; i++) {
    out += `<rect x="${inner.x + i * (cw + pad / 2)}" y="${cardY}" width="${cw}" height="${b.h * (0.28 + r() * 0.06)}" fill="${p.ground}"/>`;
  }
  // pointer
  const px = b.x + b.w * 0.74, py = b.y + b.h * 0.62, s = b.w * 0.06;
  out += `<path d="M${px} ${py} l0 ${s * 1.5} l${s * 0.42} -${s * 0.38} l${s * 0.32} ${s * 0.62} l${s * 0.22} -${s * 0.12} l-${s * 0.3} -${s * 0.6} l${s * 0.58} 0 z" fill="${p.lit}" stroke="${p.ground}" stroke-width="${s * 0.08}"/>`;
  return out;
}

const MOTIFS = { va: motifInbox, rpo: motifFunnel, accounting: motifLedger, legal: motifDocuments, web: motifBrowser };

/* ------------------------------------------------------------- composition */

function artSvg({ key, variant, w, h }) {
  const p = PALETTES[key];
  const r = rng(hash(`${key}-${variant}`) + variant * 977);
  const portrait = h > w;
  const m = Math.min(w, h) * 0.08;
  const sunR = Math.min(w, h) * (0.32 + r() * 0.12);
  const corners = [[w - sunR * 0.55, sunR * 0.55], [sunR * 0.4, h - sunR * 0.5], [w - sunR * 0.3, h - sunR * 0.4], [sunR * 0.6, sunR * 0.3]];
  const [sx, sy] = corners[variant % corners.length];

  const bandH = Math.min(w, h) * 0.045;
  const bandY = variant % 2 === 0 ? h - m - bandH : m;
  const start = 6 + Math.floor(r() * 8);
  const motifBox = portrait
    ? { x: m * 1.2, y: h * 0.24, w: w - m * 2.4, h: h * 0.5 }
    : { x: w * (variant % 2 ? 0.1 : 0.36), y: h * 0.2, w: w * 0.54, h: h * 0.58 };

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${p.ground}"/>
  <circle cx="${sx}" cy="${sy}" r="${sunR}" fill="${p.sun}" opacity="0.9"/>
  ${MOTIFS[key](motifBox, p, r)}
  ${band({ x: m, y: bandY, w: w - m * 2, h: bandH, lit: p.lit, palette: p, start, length: 8 + (variant % 2) })}
</svg>`;
}

async function renderArt(id, spec, manifest) {
  const svg = artSvg(spec);
  const file = join(ART_DIR, `${id}.webp`);
  // Grain is added live by the site-wide noise overlay, so sources stay flat and compress well.
  const buf = await sharp(Buffer.from(svg)).webp({ quality: 92, effort: 6, smartSubsample: true }).toBuffer();
  await writeFile(file, buf);
  const tiny = await sharp(buf).resize(24).webp({ quality: 40 }).toBuffer();
  const { dominant } = await sharp(buf).stats();
  manifest[id] = {
    lqip: `data:image/webp;base64,${tiny.toString('base64')}`,
    color: `rgb(${dominant.r} ${dominant.g} ${dominant.b})`,
    width: spec.w,
    height: spec.h,
  };
}

/* ------------------------------------------------------------------- type */

let fonts;
async function loadFonts() {
  const load = async (w) => opentype.parse((await readFile(join(FONT_DIR, `space-grotesk-latin-${w}-normal.woff`))).buffer);
  fonts = { 500: await load(500), 600: await load(600) };
}

function wrap(font, text, size, maxWidth, tracking = 0) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  const width = (t) => font.getAdvanceWidth(t, size) + tracking * size * t.length;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (width(test) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

// opentype.js 2.0's toPathData() can emit "NaN" for some coordinates, so serialise commands here.
const n = (v) => (Math.round(v * 100) / 100).toString();
function commandsToD(commands) {
  return commands
    .map((c) => {
      switch (c.type) {
        case 'M': case 'L': return `${c.type}${n(c.x)} ${n(c.y)}`;
        case 'Q': return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
        case 'C': return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
        case 'Z': return 'Z';
        default: return '';
      }
    })
    .join('');
}

function textPath(font, text, x, y, size, fill, tracking = 0) {
  let cursor = x;
  let d = '';
  for (const ch of text) {
    const glyph = font.charToGlyph(ch);
    d += commandsToD(glyph.getPath(cursor, y, size).commands);
    cursor += (glyph.advanceWidth / font.unitsPerEm) * size + tracking * size;
  }
  return `<path d="${d}" fill="${fill}"/>`;
}

function ogSvg({ title, kicker, key }) {
  const W = 1200, H = 630, M = 72;
  const p = PALETTES[key];
  const titleFont = fonts[600];
  const tracking = -0.035;
  let size = 76;
  let lines = wrap(titleFont, title, size, 700, tracking);
  while (lines.length > 3 && size > 48) {
    size -= 4;
    lines = wrap(titleFont, title, size, 700, tracking);
  }
  const lead = size * 1.02;
  const top = 250;
  const light = key === 'rpo' || key === 'legal';
  const ink = light ? C.char900 : C.sand100;
  const quiet = light ? C.char700 : C.moss200;
  const r = rng(hash(title));

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
  svg += `<rect width="${W}" height="${H}" fill="${p.ground}"/>`;
  svg += `<circle cx="${W - 120}" cy="110" r="240" fill="${p.sun}" opacity="0.85"/>`;
  svg += `<g opacity="0.95">${MOTIFS[key]({ x: 830, y: 220, w: 300, h: 290 }, p, r)}</g>`;
  svg += textPath(fonts[600], 'Akrostech', M, M + 22, 30, ink, -0.02);
  if (kicker) svg += textPath(fonts[500], kicker, M, top - 46, 26, quiet, -0.01);
  lines.forEach((line, i) => {
    svg += textPath(titleFont, line, M, top + lead * (i + 0.8), size, ink, tracking);
  });
  svg += band({ x: M, y: H - M - 18, w: W - M * 2, h: 18, lit: p.lit, palette: p, start: 9, length: 8 });
  svg += '</svg>';
  return svg;
}

async function renderOg(name, spec) {
  const buf = await sharp(Buffer.from(ogSvg(spec))).png({ compressionLevel: 9 }).toBuffer();
  await writeFile(join(OG_DIR, `${name}.png`), buf);
}

/* ------------------------------------------------------------- logo/icons */

function markSvg(size, { ground = C.moss700, ink = C.sand100, lit = C.moss300 } = {}) {
  // The mark: an "A" built from two strokes over a lit band cell, inside a square.
  const s = size;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="${ground}"/>
  <path d="M16 50 L32 13 L48 50" fill="none" stroke="${ink}" stroke-width="7" stroke-linejoin="miter"/>
  <rect x="21" y="36" width="22" height="6" fill="${lit}"/>
</svg>`;
}

async function renderIcons() {
  const pub = join(root, 'public');
  await writeFile(join(pub, 'logo.png'), await sharp(Buffer.from(markSvg(512))).png().toBuffer());
  await writeFile(join(pub, 'icon-512.png'), await sharp(Buffer.from(markSvg(512))).png().toBuffer());
  await writeFile(join(pub, 'icon-192.png'), await sharp(Buffer.from(markSvg(192))).png().toBuffer());
  await writeFile(join(pub, 'apple-touch-icon.png'), await sharp(Buffer.from(markSvg(180))).png().toBuffer());
  await writeFile(join(pub, 'favicon.svg'), markSvg(64).replace(/width="64" height="64" viewBox/, 'viewBox'));
}

/* -------------------------------------------------------------------- run */

async function blogPosts() {
  const dir = join(root, 'src/content/blog');
  if (!existsSync(dir)) return [];
  const files = (await readdir(dir)).filter((f) => f.endsWith('.md'));
  return Promise.all(
    files.map(async (f) => {
      const src = await readFile(join(dir, f), 'utf8');
      const fm = src.split('---')[1] ?? '';
      const get = (k) => (fm.match(new RegExp(`^${k}:\\s*["']?(.*?)["']?\\s*$`, 'm')) ?? [])[1] ?? '';
      return { slug: f.replace(/\.md$/, ''), title: get('title'), art: get('art') || 'web', variant: Number(get('artVariant')) || 0, category: get('category') };
    }),
  );
}

async function main() {
  await mkdir(ART_DIR, { recursive: true });
  await mkdir(OG_DIR, { recursive: true });
  await loadFonts();

  const { services } = await import('../src/data/services.ts');
  const { work } = await import('../src/data/work.ts');
  const { locations } = await import('../src/data/locations.ts');
  const { pages } = await import('../src/data/pages.ts');
  const posts = await blogPosts();

  const manifest = {};
  const ratios = [[1600, 2000], [2400, 1600], [1800, 1800], [1600, 2000], [2400, 1600], [1600, 2000], [1800, 1800], [2400, 1600]];

  const jobs = [];
  for (const s of services) {
    jobs.push(renderArt(`service-${s.slug}`, { key: s.art, variant: 1, w: 2400, h: 1500 }, manifest));
    jobs.push(renderArt(`service-${s.slug}-portrait`, { key: s.art, variant: 2, w: 1600, h: 2000 }, manifest));
  }
  for (const w of work) {
    const [wd, ht] = ratios[w.variant % ratios.length];
    jobs.push(renderArt(`work-${w.slug}`, { key: w.art, variant: w.variant, w: wd, h: ht }, manifest));
    jobs.push(renderArt(`work-${w.slug}-wide`, { key: w.art, variant: w.variant + 1, w: 2400, h: 1350 }, manifest));
  }
  for (const post of posts) {
    jobs.push(renderArt(`blog-${post.slug}`, { key: post.art, variant: post.variant, w: 2400, h: 1350 }, manifest));
  }
  ['va', 'rpo', 'accounting', 'legal', 'web'].forEach((key, i) => {
    jobs.push(renderArt(`about-${key}`, { key, variant: i + 3, w: 2400, h: 1350 }, manifest));
  });
  await Promise.all(jobs);

  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(join(ART_DIR, 'manifest.json'), `${JSON.stringify(sorted, null, 2)}\n`);

  // Open Graph cards
  const og = [
    ['default', { title: 'Your team in India. Working your U.S. hours.', kicker: 'Akrostech Consulting', key: 'va' }],
    ['home', { title: 'Your team in India. Working your U.S. hours.', kicker: 'Offshore talent, onshore quality', key: 'va' }],
    ['about', { title: 'Offshore teams held to an onshore standard.', kicker: 'About Akrostech', key: 'legal' }],
    ['services', { title: 'Five practices. One way of working.', kicker: 'Services', key: 'rpo' }],
    ['work', { title: 'How we staff and run engagements.', kicker: 'Work', key: 'accounting' }],
    ['blog', { title: 'Guides for outsourcing, hiring and the web.', kicker: 'Insights', key: 'web' }],
    ['contact', { title: 'Book a 30-minute discovery call.', kicker: 'Contact', key: 'va' }],
    ['locations', { title: 'Wilmington, Philadelphia and New York.', kicker: 'Service areas', key: 'rpo' }],
    ['legal', { title: 'Privacy and terms.', kicker: 'Akrostech Consulting', key: 'legal' }],
  ];
  for (const s of services) og.push([`service-${s.slug}`, { title: s.headline.join(' '), kicker: s.name, key: s.art }]);
  for (const w of work) og.push([`work-${w.slug}`, { title: w.title, kicker: 'Engagement blueprint', key: w.art }]);
  for (const l of locations) og.push([`location-${l.slug}`, { title: l.headline.join(' '), kicker: `${l.city}, ${l.region}`, key: l.isHeadquarters ? 'legal' : 'rpo' }]);
  for (const post of posts) og.push([`blog-${post.slug}`, { title: post.title, kicker: post.category, key: post.art }]);
  await Promise.all(og.map(([name, spec]) => renderOg(name, spec)));

  await renderIcons();
  void pages;
  console.log(`art: ${Object.keys(manifest).length} images, ${og.length} OG cards, icons`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
