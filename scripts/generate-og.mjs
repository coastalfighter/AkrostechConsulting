#!/usr/bin/env node
/**
 * Generates the Open Graph cards and app icons in the Akrostech identity.
 *
 *   npm run og
 *
 * Card: near-black plate, the lime M-wave mark and wordmark, the page title set in Archivo
 * ExtraBold capitals, and the page's stock photograph on the right columns, joined by a lime rule.
 *
 * Output
 *   public/og/*.png                                   1200×630 social cards
 *   public/logo.png, apple-touch-icon.png, icon-192.png, icon-512.png
 *
 * Text is converted to vector paths with opentype.js, so output does not depend on installed fonts.
 */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import opentype from 'opentype.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OG_DIR = join(root, 'public/og');
const PHOTO_DIR = join(root, 'src/assets/photos');
const FONT_DIR = join(root, 'node_modules/@fontsource/archivo/files');

const C = { ground: '#0b0c0a', plate: '#13150f', ink: '#f4f5ef', ink2: '#b5b9ab', lime: '#c9ff4a' };
const W = 1200;
const H = 630;
const M = 64;
const PHOTO_X = 760;

const MARK_PATHS = `<path d="M213 1110 L 438 538 A 104 104 0 0 1 641 591 L 489 990 A 106 106 0 0 0 694 1050 L 873 586 Q 940 432 1004 468 A 104 104 0 0 1 1104 611 L 1001 876"/><path d="M1220 876 L 1349 550"/>`;
const mark = (x, y, scale, color = C.lime) =>
  `<g transform="translate(${x} ${y}) scale(${scale}) translate(-150 -400)" fill="none" stroke="${color}" stroke-width="102" stroke-linecap="round" stroke-linejoin="round">${MARK_PATHS}</g>`;

let fonts;
async function loadFonts() {
  const load = async (w) => opentype.parse((await readFile(join(FONT_DIR, `archivo-latin-${w}-normal.woff`))).buffer);
  fonts = { 600: await load(600), 800: await load(800) };
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

function measure(font, text, size, tracking) {
  let w = 0;
  for (const ch of text) w += (font.charToGlyph(ch).advanceWidth / font.unitsPerEm) * size + tracking * size;
  return w;
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

function wrap(font, text, size, maxWidth, tracking) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const test = line ? `${line} ${word}` : word;
    if (measure(font, test, size, tracking) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function cardSvg({ title, kicker }) {
  const font = fonts[800];
  const tracking = -0.01;
  const maxWidth = PHOTO_X - M * 2;
  const upper = title.toUpperCase();
  let size = 64;
  let lines = wrap(font, upper, size, maxWidth, tracking);
  while ((lines.length > 4 || lines.some((l) => measure(font, l, size, tracking) > maxWidth)) && size > 34) {
    size -= 2;
    lines = wrap(font, upper, size, maxWidth, tracking);
  }
  const lead = size * 1.0;
  const bottom = H - M - 8;
  const top = bottom - lead * (lines.length - 1);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
  svg += `<rect width="${PHOTO_X}" height="${H}" fill="${C.ground}"/>`;
  // Construction lines: the manual's grid.
  for (let i = 1; i < 6; i++) svg += `<rect x="${M + ((PHOTO_X - M * 2) / 6) * i}" y="0" width="1" height="${H}" fill="${C.ink}" opacity="0.05"/>`;
  svg += mark(M, M - 4, 0.042);
  svg += textPath(fonts[800], 'Akrostech', M + 66, M + 22, 26, C.ink, -0.01);
  svg += textPath(fonts[600], 'CONSULTING', M + 67, M + 40, 11, C.ink2, 0.3);
  if (kicker) svg += textPath(fonts[600], kicker.toUpperCase(), M, top - size - 18, 18, C.lime, 0.08);
  lines.forEach((line, i) => (svg += textPath(font, line, M, top + lead * i, size, C.ink, tracking)));
  svg += `<rect x="${PHOTO_X}" y="0" width="8" height="${H}" fill="${C.lime}"/>`;
  svg += '</svg>';
  return svg;
}

async function renderCard(name, spec) {
  const photo = await sharp(join(PHOTO_DIR, `${spec.photo}.jpg`))
    .resize(W - PHOTO_X, H, { fit: 'cover', position: 'attention' })
    .modulate({ brightness: 0.92 })
    .toBuffer();
  const buf = await sharp({ create: { width: W, height: H, channels: 3, background: C.ground } })
    .composite([
      { input: photo, left: PHOTO_X, top: 0 },
      { input: Buffer.from(cardSvg(spec)), left: 0, top: 0 },
    ])
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();
  await writeFile(join(OG_DIR, `${name}.png`), buf);
}

function iconSvg(size, { padding = 0.16 } = {}) {
  const inner = size * (1 - padding * 2);
  const scale = inner / 1270;
  const y = (size - 800 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="${C.ground}"/>${mark(size * padding, y, scale)}</svg>`;
}

async function renderIcons() {
  const pub = join(root, 'public');
  const png = (size, opts) => sharp(Buffer.from(iconSvg(size, opts))).png().toBuffer();
  await writeFile(join(pub, 'logo.png'), await png(512));
  await writeFile(join(pub, 'icon-512.png'), await png(512, { padding: 0.22 }));
  await writeFile(join(pub, 'icon-192.png'), await png(192, { padding: 0.22 }));
  await writeFile(join(pub, 'apple-touch-icon.png'), await png(180, { padding: 0.2 }));
}

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

/** Mirrors src/data/photos.ts (kept in plain JS so this script runs without a TS loader for .astro types). */
const pools = {
  va: ['phone-laptop', 'two-women-laptop', 'desk-window', 'pair-at-laptop'],
  rpo: ['talking-hands', 'meeting-room', 'team-table', 'standup'],
  accounting: ['tax-forms', 'desk-overhead', 'pair-at-laptop', 'workspace-cafe'],
  legal: ['contract-signing', 'lady-justice', 'office-hallway', 'meeting-presentation'],
  web: ['code-laptop', 'code-desk', 'developers', 'sticky-notes'],
};
const photoFor = (art, variant = 0) => pools[art][variant % pools[art].length];

async function main() {
  await mkdir(OG_DIR, { recursive: true });
  await loadFonts();

  const { services } = await import('../src/data/services.ts');
  const { work } = await import('../src/data/work.ts');
  const { locations } = await import('../src/data/locations.ts');
  const posts = await blogPosts();

  const cards = [
    ['default', { title: 'Offshore talent. Onshore quality.', kicker: 'Akrostech Consulting', photo: 'team-laptops' }],
    ['home', { title: 'Offshore talent. Onshore quality.', kicker: 'Your team in India, on U.S. hours', photo: 'team-laptops' }],
    ['about', { title: 'Offshore teams held to an onshore standard.', kicker: 'About Akrostech', photo: 'meeting-presentation' }],
    ['services', { title: 'Five practices. One standard.', kicker: 'Services', photo: 'pair-at-laptop' }],
    ['work', { title: 'How we staff and run engagements.', kicker: 'Work', photo: 'sticky-notes' }],
    ['blog', { title: 'Guides for outsourcing, hiring and the web.', kicker: 'Insights', photo: 'desk-window' }],
    ['contact', { title: 'Book a 30-minute discovery call.', kicker: 'Contact', photo: 'handshake' }],
    ['locations', { title: 'Wilmington, Philadelphia and New York.', kicker: 'Service areas', photo: 'office-hallway' }],
    ['legal', { title: 'Privacy and terms.', kicker: 'Akrostech Consulting', photo: 'contract-signing' }],
  ];
  for (const s of services) cards.push([`service-${s.slug}`, { title: s.headline.join(' '), kicker: s.name, photo: photoFor(s.art, 0) }]);
  for (const w of work) cards.push([`work-${w.slug}`, { title: w.title, kicker: 'Engagement blueprint', photo: photoFor(w.art, w.variant) }]);
  for (const l of locations) cards.push([`location-${l.slug}`, { title: l.headline.join(' '), kicker: `${l.city}, ${l.region}`, photo: l.isHeadquarters ? 'office-lounge' : 'open-office' }]);
  for (const p of posts) cards.push([`blog-${p.slug}`, { title: p.title, kicker: p.category, photo: photoFor(p.art, p.variant) }]);

  await Promise.all(cards.map(([name, spec]) => renderCard(name, spec)));
  await renderIcons();
  console.log(`og: ${cards.length} cards, icons`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
