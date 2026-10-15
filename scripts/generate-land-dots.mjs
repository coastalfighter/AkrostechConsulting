#!/usr/bin/env node
/**
 * Builds the dotted-globe land mask used by the homepage and contact hero scenes.
 *
 *   node scripts/generate-land-dots.mjs
 *
 * Samples a Fibonacci sphere and keeps the points that fall on land (Natural Earth 1:110m via
 * the world-atlas package), writing them as compact [lat×10, lon×10] integer pairs.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { feature } from 'topojson-client';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const topo = JSON.parse(await readFile(join(root, 'node_modules/world-atlas/land-110m.json'), 'utf8'));
const land = feature(topo, topo.objects.land);

/** Ray-casting point-in-ring in lon/lat degrees. */
function inRing(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function inPolygon(lon, lat, poly) {
  if (!inRing(lon, lat, poly[0])) return false;
  for (let h = 1; h < poly.length; h++) if (inRing(lon, lat, poly[h])) return false;
  return true;
}
const polygons = [];
for (const f of land.features) {
  const g = f.geometry;
  if (g.type === 'Polygon') polygons.push(g.coordinates);
  else if (g.type === 'MultiPolygon') polygons.push(...g.coordinates);
}
const isLand = (lon, lat) => polygons.some((p) => inPolygon(lon, lat, p));

const N = 26000;
const golden = Math.PI * (3 - Math.sqrt(5));
const out = [];
for (let i = 0; i < N; i++) {
  const y = 1 - (i / (N - 1)) * 2;
  const theta = golden * i;
  const lat = (Math.asin(y) * 180) / Math.PI;
  const lon = ((((theta * 180) / Math.PI) % 360) + 540) % 360 - 180;
  if (lat < -58) continue; // skip Antarctica: it crowds the bottom of the globe
  if (isLand(lon, lat)) out.push(Math.round(lat * 10), Math.round(lon * 10));
}
await writeFile(join(root, 'src/scripts/hero3d/land.json'), JSON.stringify(out));
console.log(`land dots: ${out.length / 2}`);
