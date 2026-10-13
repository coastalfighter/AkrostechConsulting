#!/usr/bin/env node
/**
 * Downloads the site's stock photography from Unsplash (Unsplash License: free for commercial
 * use, no attribution required; we still record the source of every file).
 *
 *   node scripts/fetch-photos.mjs
 *
 * Files land in src/assets/photos/ as high-resolution JPEGs; Astro's <Picture> produces the
 * AVIF/WebP srcsets. credits.json records each file's source URL and licence.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'src/assets/photos');

/** name → Unsplash photo id, with a one-line description used for alt text review. */
export const PHOTOS = {
  'team-laptops': ['1522202176988-66273c2fd55f', 'Colleagues working together on laptops at a shared table'],
  'team-highfive': ['1600880292203-757bb62b4baf', 'Two colleagues high-fiving across a desk'],
  'two-women-laptop': ['1551836022-d5d88e9218df', 'Two professionals discussing work at a laptop in a brick-walled office'],
  'meeting-presentation': ['1556761175-5973dc0f32e7', 'A team meeting around a presenter in a loft office'],
  'sticky-notes': ['1552664730-d307ca884978', 'A team planning work with sticky notes on a glass wall'],
  'pair-at-laptop': ['1600267175161-cfaa711b4a81', 'Two colleagues reviewing work together on a laptop'],
  'phone-laptop': ['1563986768609-322da13575f3', 'Hands on a phone beside an open laptop'],
  'desk-window': ['1497215728101-856f4ea42174', 'A laptop on a bright office desk by the window'],
  'handshake': ['1600880292089-90a7e086ee0c', 'Colleagues joining hands over a desk'],
  'tax-forms': ['1554224155-6726b3ff858f', 'Tax forms, a calculator and receipts on a desk'],
  'desk-overhead': ['1519389950473-47ba0277781c', 'An overhead view of a team’s desks with laptops and notebooks'],
  'contract-signing': ['1450101499163-c8848c66ca85', 'A hand signing a document with a fountain pen'],
  'lady-justice': ['1589829545856-d10d557cf95f', 'A statue of Lady Justice holding scales'],
  'code-laptop': ['1517694712202-14dd9538aa97', 'Code on a laptop screen beside a plant and a mug'],
  'code-desk': ['1498050108023-c5249f4df085', 'A laptop showing code on a white desk'],
  'developers': ['1531482615713-2afd69097998', 'Developers working together at a screen'],
  'open-office': ['1504384308090-c894fdcc538d', 'A large open-plan office with rows of desks'],
  'workspace-cafe': ['1568992687947-868a62a9f521', 'People working in a busy shared workspace'],
  'meeting-room': ['1542744173-8e7e53415bb0', 'A team meeting in a conference room with laptops'],
  'office-hallway': ['1497366216548-37526070297c', 'A quiet modern office corridor'],
  'office-lounge': ['1524758631624-e2822e304c36', 'A light-filled office lounge'],
  'talking-hands': ['1517245386807-bb43f82c33c4', 'Two people talking across a laptop on a desk'],
  'team-table': ['1521737604893-d14cc237f11d', 'A team working at a table in a bright office'],
  'standup': ['1557804506-669a67965ba0', 'A team gathered round a whiteboard in a loft office'],
};

await mkdir(OUT, { recursive: true });
const credits = {};
for (const [name, [id, description]] of Object.entries(PHOTOS)) {
  const url = `https://images.unsplash.com/photo-${id}?w=2400&q=82&fm=jpg&fit=max`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  await writeFile(join(OUT, `${name}.jpg`), Buffer.from(await res.arrayBuffer()));
  credits[name] = { source: `https://unsplash.com/photos/${id}`, file: url.split('?')[0], licence: 'Unsplash License (https://unsplash.com/license)', description };
  console.log('✓', name);
}
await writeFile(join(OUT, 'credits.json'), `${JSON.stringify(credits, null, 2)}\n`);
