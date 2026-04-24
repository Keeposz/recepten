import { randomBytes } from 'node:crypto'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './public/uploads'
const MAX_WIDTH = 1600
const JPEG_QUALITY = 82

export function uploadDir(): string {
  return UPLOAD_DIR
}

export async function saveImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Alleen afbeeldingen zijn toegestaan.')
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const resized = await sharp(buffer)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: JPEG_QUALITY })
    .toBuffer()

  const filename = `${randomBytes(12).toString('hex')}.webp`
  await mkdir(UPLOAD_DIR, { recursive: true })
  await writeFile(join(UPLOAD_DIR, filename), resized)
  return filename
}

export async function deleteImage(filename: string | null | undefined): Promise<void> {
  if (!filename) return
  const path = join(UPLOAD_DIR, filename)
  try {
    await unlink(path)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err
  }
}

export { imageUrl } from './image-url'
