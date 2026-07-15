import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE = 100 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

function generateFilename(originalName: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() || 'bin'
  const base = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 50)
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return `${base}-${unique}.${ext}`
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Přístup odepřen.' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string | null
    const description = formData.get('description') as string | null
    const tags = formData.get('tags') as string | null

    if (!file) {
      return NextResponse.json({ error: 'Žádný soubor nebyl odeslán.' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Soubor je příliš velký (max 100 MB).' }, { status: 400 })
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Nepodporovaný formát souboru. Povoleny jsou: JPEG, PNG, WebP, GIF, MP4, WebM, MOV.' },
        { status: 400 }
      )
    }

    // Save to public/uploads directory (served statically by Next.js)
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'images')
    await mkdir(uploadsDir, { recursive: true })

    const filename = generateFilename(file.name)
    const filepath = join(uploadsDir, filename)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filepath, buffer)

    const url = `/uploads/images/${filename}`
    const mediaType = isVideo ? 'VIDEO' : 'IMAGE'

    const ext = filename.split('.').pop() || null

    const media = await prisma.media.create({
      data: {
        filename,
        originalName: file.name,
        url,
        publicId: filename,
        resourceType: mediaType,
        format: ext,
        size: file.size,
        width: null,
        height: null,
        duration: null,
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        category: category || null,
        description: description || null,
      },
    })

    return NextResponse.json({ success: true, media })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Nahrání souboru selhalo.', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
