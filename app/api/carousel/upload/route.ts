import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToOracleVPS } from '@/lib/oracle-vps'

const ADMIN_EMAILS = ['spravce.eshopu@ufosport.cz']
const isAdminUser = (session: any) => session?.user?.role === 'ADMIN' || ADMIN_EMAILS.includes(session?.user?.email)
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
    const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.email === 'spravce.eshopu@ufosport.cz'
    if (!session || !isAdmin) {
      console.log('Unauthorized - no session or not admin')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    console.log('Carousel upload request - file:', file?.name, 'size:', file?.size, 'type:', file?.type)

    if (!file || !ALLOWED_TYPES.includes(file.type)) {
      console.log('Invalid file type:', file?.type)
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP' },
        { status: 400 }
      )
    }

    if (file.size > 10 * 1024 * 1024) {
      console.log('File too large:', file.size)
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    const filename = generateFilename(file.name)
    console.log('Generated filename:', filename)
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
    console.log('Saved locally to:', url)

    // Try to also upload to Oracle VPS
    try {
      console.log('Attempting VPS upload...')
      const vpsResult = await uploadToOracleVPS(buffer, filename)
      vpsPath = vpsResult.vpsPath
      storageType = 'ORACLE_VPS'
      url = vpsResult.url // Use VPS URL if successful
      console.log('VPS upload successful:', { vpsPath, url })
    } catch (vpsError) {
      console.warn('VPS upload failed, using local storage:', vpsError instanceof Error ? vpsError.message : String(vpsError))
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

    console.log('Created slide:', { id: slide.id, storageType, url })
    return NextResponse.json({ slide })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Upload error:', msg, error)
    return NextResponse.json(
      { error: 'Upload failed: ' + msg },
      { status: 500 }
    )
  }
}
