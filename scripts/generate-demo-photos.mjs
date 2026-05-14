#!/usr/bin/env node
/**
 * Vygeneruje krásné gradientové placeholder JPEGy pro každou fotku v photos.json.
 * Slouží POUZE pro prototyp / vývoj. Nahraď svými reálnými fotkami v photos/originals/.
 *
 * Použití: npm run demo-photos
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'photos', 'originals');

const photos = JSON.parse(
  await (await import('node:fs/promises')).readFile(
    path.join(ROOT, 'src', 'data', 'photos.json'),
    'utf-8'
  )
);

// Tlumené editorial palety, ne přeplácané
const palettes = {
  krajina: [
    ['#1a2436', '#3d5468', '#7a8a98'],
    ['#2d3a2e', '#5a6b53', '#9aa68b'],
    ['#1f2a30', '#3e5260', '#7e8f9a'],
  ],
  cestovani: [
    ['#3b2a1f', '#7a5638', '#c4a572'],
    ['#2a2935', '#56546e', '#9c97b8'],
  ],
  portrety: [
    ['#1a1614', '#3a322e', '#6e615a'],
    ['#1c1816', '#473e38', '#857668'],
  ],
  street: [
    ['#0f1418', '#2a3540', '#5a6b7a'],
    ['#1a1a1a', '#3a3a3a', '#6e6e6e'],
  ],
  priroda: [
    ['#1f2a1e', '#3d5236', '#7e9268'],
    ['#2a2418', '#5a4a30', '#a08a5c'],
  ],
  udalosti: [
    ['#2a1f28', '#56384e', '#9a7088'],
    ['#1c1822', '#3e3450', '#7a6e8e'],
  ],
};

const pickPalette = (category, seed) => {
  const pool = palettes[category] || palettes.krajina;
  return pool[seed % pool.length];
};

async function generatePlaceholder(photo) {
  const [c1, c2, c3] = pickPalette(photo.category, photo.order || 0);
  const { width, height } = photo;

  // Postav SVG s plynulým gradientem + jemnou texturou
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${c1}" />
          <stop offset="60%" stop-color="${c2}" />
          <stop offset="100%" stop-color="${c3}" />
        </linearGradient>
        <radialGradient id="r" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stop-color="${c3}" stop-opacity="0.4" />
          <stop offset="100%" stop-color="${c1}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)" />
      <rect width="100%" height="100%" fill="url(#r)" />
      <text x="50%" y="50%"
            font-family="Georgia, serif"
            font-size="${Math.min(width, height) * 0.06}"
            font-style="italic"
            fill="${c3}"
            opacity="0.5"
            text-anchor="middle"
            dominant-baseline="middle">
        ${photo.title.replace(/&/g, '&amp;').replace(/</g, '&lt;')}
      </text>
      <text x="50%" y="${height / 2 + Math.min(width, height) * 0.05}"
            font-family="sans-serif"
            font-size="${Math.min(width, height) * 0.022}"
            letter-spacing="0.2em"
            fill="${c3}"
            opacity="0.3"
            text-anchor="middle">
        ${photo.id.toUpperCase()}
      </text>
    </svg>
  `;

  const outPath = path.join(OUT, `${photo.src}.jpg`);
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(outPath);

  console.log(`  ✓ ${photo.src}.jpg (${width}×${height})`);
}

async function main() {
  console.log('\n  Generuji demo placeholder fotky\n  ─────────────────────────────\n');

  if (!existsSync(OUT)) await mkdir(OUT, { recursive: true });

  for (const photo of photos) {
    await generatePlaceholder(photo);
  }

  console.log(`\n  Hotovo. Teď spusť: npm run optimize\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
