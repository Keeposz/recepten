import { readFile } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'

import { NextResponse } from 'next/server'

import { uploadDir } from '@/lib/images'

const MIME: Record<string, string> = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
}

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ filename: string }> },
) {
  const { filename } = await ctx.params
  const safeName = basename(filename)
  if (safeName !== filename || safeName.startsWith('.')) {
    return new NextResponse('Not found', { status: 404 })
  }

  const ext = extname(safeName).toLowerCase()
  const contentType = MIME[ext]
  if (!contentType) return new NextResponse('Not found', { status: 404 })

  try {
    const data = await readFile(join(uploadDir(), safeName))
    return new NextResponse(new Uint8Array(data), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=604800, immutable',
      },
    })
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return new NextResponse('Not found', { status: 404 })
    }
    throw err
  }
}
