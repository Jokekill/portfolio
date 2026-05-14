#!/usr/bin/env node
/**
 * Generuje optimalizované varianty obrázků z photos/originals/
 * do public/images/generated/.
 *
 * Pro každý zdrojový JPEG vytvoří:
 *   - {id}-480.jpg, {id}-960.jpg, {id}-1600.jpg, {id}-2400.jpg
 *   - {id}-480.webp, {id}-960.webp, {id}-1600.webp, {id}-2400.webp
 *
 * Soubory, které už existují a jsou novější než zdroj, se přeskočí.
 *
 * Použití: npm run optimize
 */

import { readdir, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const SRC_DIR = path.join(ROOT, 'photos', 'originals');
const OUT_DIR = path.join(ROOT, 'public', 'images', 'generated');

const WIDTHS = [480, 960, 1600, 2400];
const JPEG_QUALITY = 85;
const WEBP_QUALITY = 80;

const SUPPORTED = /\.(jpe?g|png)$/i;

const log = {
  info: (msg) => console.log(`  ${msg}`),
  ok: (msg) => console.log(`  \x1b[32m✓\x1b[0m ${msg}`),
  warn: (msg) => console.log(`  \x1b[33m⚠\x1b[0m ${msg}`),
  err: (msg) => console.error(`  \x1b[31m✗\x1b[0m ${msg}`),
};

async function ensureDir(dir) {
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
}

async function isOutdated(sourcePath, targetPath) {
  if (!existsSync(targetPath)) return true;
  const [src, tgt] = await Promise.all([stat(sourcePath), stat(targetPath)]);
  return src.mtimeMs > tgt.mtimeMs;
}

async function processImage(sourcePath, id) {
  const meta = await sharp(sourcePath).metadata();
  const sourceWidth = meta.width || 0;

  const tasks = [];

  for (const w of WIDTHS) {
    // Pokud je zdroj menší než cílová varianta, nezvětšuj — zachovej originální velikost
    const targetWidth = Math.min(w, sourceWidth);
    if (targetWidth === 0) continue;

    const jpgPath = path.join(OUT_DIR, `${id}-${w}.jpg`);
    const webpPath = path.join(OUT_DIR, `${id}-${w}.webp`);

    if (await isOutdated(sourcePath, jpgPath)) {
      tasks.push(
        sharp(sourcePath, { failOn: 'none' })
          .resize({ width: targetWidth, withoutEnlargement: true })
          .jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true })
          .toFile(jpgPath)
          .then(() => log.ok(`${path.basename(jpgPath)}`))
      );
    }

    if (await isOutdated(sourcePath, webpPath)) {
      tasks.push(
        sharp(sourcePath, { failOn: 'none' })
          .resize({ width: targetWidth, withoutEnlargement: true })
          .webp({ quality: WEBP_QUALITY })
          .toFile(webpPath)
          .then(() => log.ok(`${path.basename(webpPath)}`))
      );
    }
  }

  if (tasks.length === 0) {
    log.info(`${id}: aktuální, přeskočeno`);
  }
  await Promise.all(tasks);

  return { width: meta.width, height: meta.height };
}

async function main() {
  console.log('\n  Optimalizace fotografií\n  ─────────────────────────────\n');

  await ensureDir(OUT_DIR);

  if (!existsSync(SRC_DIR)) {
    log.warn(`Složka ${SRC_DIR} neexistuje. Není co optimalizovat.`);
    process.exit(0);
  }

  const files = (await readdir(SRC_DIR)).filter((f) => SUPPORTED.test(f));

  if (files.length === 0) {
    log.warn('Žádné zdrojové obrázky v photos/originals/');
    log.info('Pro vygenerování demo fotek spusť: npm run demo-photos\n');
    process.exit(0);
  }

  log.info(`Nalezeno ${files.length} zdrojových souborů`);
  console.log('');

  for (const file of files) {
    const id = path.parse(file).name;
    const srcPath = path.join(SRC_DIR, file);
    try {
      const { width, height } = await processImage(srcPath, id);
      if (width && height) {
        // Pro pohodlí: v konzoli ukaž rozměry pro photos.json
        log.info(`   ↳ ${id}: ${width}×${height}`);
      }
    } catch (err) {
      log.err(`${file}: ${err.message}`);
    }
  }

  console.log('\n  Hotovo. Výstup: public/images/generated/\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
