import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB for data URLs

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

    if (file.size > MAX_SIZE) {
      console.log('File too large:', file.size)
      return NextResponse.json({ error: `File too large (max ${MAX_SIZE / 1024 / 1024}MB)` }, { status: 400 })
    }

    // Convert file to base64 data URL
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`
    
    console.log('Converted to data URL, size:', dataUrl.length)

    // Get the last carousel slide
    const lastSlide = await prisma.carouselSlide.findFirst({
      orderBy: { order: 'desc' },
    })
    const nextOrder = (lastSlide?.order ?? -1) + 1

    // Create carousel slide with data URL (stored in database)
    const slide = await prisma.carouselSlide.create({
      data: {
        image: dataUrl,
        link: '',
        order: nextOrder,
        isProtected: true,
        storageType: 'DATABASE',
        oracleVpsPath: null,
      },
    })

    console.log('Created slide:', { id: slide.id, storageType: 'DATABASE' })
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
