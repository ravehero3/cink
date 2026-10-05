import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToOracleVPS } from '@/lib/oracle-vps'

export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB for videos
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
    const storage = (formData.get('storage') as string) || 'LOCAL' // LOCAL | ORACLE_VPS

    if (!file) {
      return NextResponse.json({ error: 'Žádný soubor nebyl odeslán.' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `Soubor je příliš velký (max ${MAX_FILE_SIZE / 1024 / 1024}MB).` }, { status: 400 })
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Nepodporovaný formát souboru. Povoleny jsou: JPEG, PNG, WebP, GIF, MP4, WebM, MOV.' },
        { status: 400 }
      )
    }

    const mediaType = isVideo ? 'VIDEO' : 'IMAGE'
    const filename = generateFilename(file.name)
    const ext = filename.split('.').pop() || null
    const buffer = Buffer.from(await file.arrayBuffer())

    let url: string
    let vpsPath: string | null = null
    let storageType = 'LOCAL'

    // For videos, prefer Oracle VPS; for images, use local storage
    if (isVideo && storage === 'ORACLE_VPS') {
      try {
        const vpsResult = await uploadToOracleVPS(buffer, filename)
        url = vpsResult.url
        vpsPath = vpsResult.vpsPath
        storageType = 'ORACLE_VPS'
      } catch (vpsError) {
        console.warn('VPS upload failed, falling back to local:', vpsError)
        // Fall back to local storage with warning
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'videos')
        await mkdir(uploadsDir, { recursive: true })
        const filepath = join(uploadsDir, filename)
        await writeFile(filepath, buffer)
        url = `/uploads/videos/${filename}`
        storageType = 'LOCAL'
      }
    } else {
      // Local storage (default for images and if VPS not available)
      const uploadsDir = join(process.cwd(), 'public', 'uploads', isImage ? 'images' : 'videos')
      await mkdir(uploadsDir, { recursive: true })
      const filepath = join(uploadsDir, filename)
      await writeFile(filepath, buffer)
      url = `/uploads/${isImage ? 'images' : 'videos'}/${filename}`
    }

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
        storageType,
        oracleVpsPath: vpsPath,
        isProtected: isVideo, // Automatically protect videos from accidental deletion
      },
    })

    return NextResponse.json({ 
      success: true, 
      media,
      storageInfo: {
        type: storageType,
        message: storageType === 'ORACLE_VPS' 
          ? '✓ Video se bezpečně ukládá na Oracle VPS' 
          : 'Video je uloženo lokálně'
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Nahrání souboru selhalo.', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
