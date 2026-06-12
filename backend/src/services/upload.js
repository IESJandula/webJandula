import sharp from 'sharp';
import { createWriteStream, mkdirSync } from 'fs';
import { join, resolve } from 'path';

const UPLOADS_DIR = resolve(process.env.UPLOADS_DIR || './uploads');
const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3001';
const MAX_WIDTH = 1920;
const THUMB_WIDTH = 800;

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

function dateFolder() {
  const now = new Date();
  return `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export async function saveImage(buffer, originalName, subfolder = 'noticias') {
  const folder = join(UPLOADS_DIR, subfolder, dateFolder());
  ensureDir(folder);

  const slug = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const filename = `${slug}.webp`;
  const filepath = join(folder, filename);

  await sharp(buffer)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(filepath);

  // Ruta relativa para guardar en BD
  const relativePath = `/uploads/${subfolder}/${dateFolder()}/${filename}`;
  return {
    path: relativePath,
    url: `${PUBLIC_URL}${relativePath}`,
  };
}

export async function saveThumb(buffer, slug) {
  const folder = join(UPLOADS_DIR, 'thumbs', dateFolder());
  ensureDir(folder);

  const filename = `${slug}-thumb.webp`;
  const filepath = join(folder, filename);

  await sharp(buffer)
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .webp({ quality: 75 })
    .toFile(filepath);

  const relativePath = `/uploads/thumbs/${dateFolder()}/${filename}`;
  return `${PUBLIC_URL}${relativePath}`;
}
