#!/usr/bin/env node
/**
 * Interaktivní pomocník pro přidání nové fotky.
 * Po spuštění:
 *   1. zeptá se na cestu k JPEG souboru,
 *   2. zjistí rozměry,
 *   3. zeptá se na metadata (název, popis, kategorie, alt, featured),
 *   4. zkopíruje soubor do photos/originals/,
 *   5. přidá záznam do src/data/photos.json,
 *   6. spustí optimalizaci.
 *
 * Použití: npm run add-photo
 */

import { readFile, writeFile, copyFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
import { stdin as input, stdout as output } from 'node:process';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ORIGINALS = path.join(ROOT, 'photos', 'originals');
const JSON_PATH = path.join(ROOT, 'src', 'data', 'photos.json');
const CATS_PATH = path.join(ROOT, 'src', 'data', 'categories.ts');

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

async function getCategories() {
  const src = await readFile(CATS_PATH, 'utf-8');
  return [...src.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]);
}

async function main() {
  const rl = readline.createInterface({ input, output });
  const ask = (q, def) => rl.question(`${q}${def ? ` [${def}]` : ''}: `).then((a) => a.trim() || def || '');

  console.log('\n  Přidat novou fotku\n  ─────────────────────────────\n');

  const sourcePath = await ask('Cesta ke zdrojovému JPEG souboru');
  if (!existsSync(sourcePath)) {
    console.error(`Soubor neexistuje: ${sourcePath}`);
    rl.close();
    process.exit(1);
  }

  const meta = await sharp(sourcePath).metadata();
  console.log(`   ↳ ${meta.width}×${meta.height}px\n`);

  const title = await ask('Název fotky');
  const id = slugify(await ask('ID (slug, unikátní)', slugify(title)));

  const cats = await getCategories();
  console.log(`   Dostupné kategorie: ${cats.join(', ')}`);
  const category = await ask('Kategorie', cats[0]);

  const description = await ask('Popis (nepovinné)');
  const alt = await ask('Alt text (pro přístupnost)');
  const featured = (await ask('Featured? (y/n)', 'n')).toLowerCase().startsWith('y');
  const date = await ask('Datum', new Date().toISOString().slice(0, 10));

  if (!existsSync(ORIGINALS)) await mkdir(ORIGINALS, { recursive: true });

  const ext = path.extname(sourcePath);
  const targetPath = path.join(ORIGINALS, `${id}${ext}`);
  await copyFile(sourcePath, targetPath);
  console.log(`\n  ✓ Soubor zkopírován: ${targetPath}`);

  // Načti JSON, přidej novou položku
  const photos = JSON.parse(await readFile(JSON_PATH, 'utf-8'));
  const maxOrder = photos.reduce((m, p) => Math.max(m, p.order || 0), 0);

  photos.push({
    id,
    title,
    description,
    category,
    src: id,
    alt,
    width: meta.width,
    height: meta.height,
    date,
    featured,
    order: maxOrder + 1,
  });

  await writeFile(JSON_PATH, JSON.stringify(photos, null, 2));
  console.log(`  ✓ Záznam přidán do photos.json`);

  rl.close();
  console.log('\n  Spouštím optimalizaci...\n');

  const { spawn } = await import('node:child_process');
  spawn('node', [path.join(__dirname, 'optimize.mjs')], {
    stdio: 'inherit',
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
