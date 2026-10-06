import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToOracleVPS } from '@/lib/oracle-vps'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

function generateFilename(originalName: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  const base = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 50)
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return `carousel-${base}-${unique}.${ext}`
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file || !ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP' },
        { status: 400 }
      )
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    const filename = generateFilename(file.name)
    const buffer = Buffer.from(await file.arrayBuffer())

    let url: string
    let vpsPath: string | null = null
    let storageType = 'LOCAL'

    // Try Oracle VPS upload in background, but always save locally first
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'carousel')
    await mkdir(uploadsDir, { recursive: true })
    const filepath = join(uploadsDir, filename)
    await writeFile(filepath, buffer)
    url = `/uploads/carousel/${filename}`

    // Try to also upload to Oracle VPS in background (non-blocking)
    try {
      const vpsResult = await uploadToOracleVPS(buffer, filename)
      vpsPath = vpsResult.vpsPath
      storageType = 'ORACLE_VPS'
      url = vpsResult.url // Use VPS URL if successful
    } catch (vpsError) {
      console.warn('VPS upload failed, using local storage:', vpsError)
      // Continue with local URL
    }

    // Get the last carousel slide
    const lastSlide = await prisma.carouselSlide.findFirst({
      orderBy: { order: 'desc' },
    })
    const nextOrder = (lastSlide?.order ?? -1) + 1

    // Create carousel slide with protection enabled
    const slide = await prisma.carouselSlide.create({
      data: {
        image: url,
        link: '',
        order: nextOrder,
        isProtected: true,
        storageType,
        oracleVpsPath: vpsPath,
      },
    })

    return NextResponse.json({ slide })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
