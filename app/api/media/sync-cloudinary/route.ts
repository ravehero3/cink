import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const { folder = '' } = await request.json().catch(() => ({}))

    let allResources: any[] = []
    let nextCursor: string | undefined = undefined

    do {
      const result: any = await cloudinary.api.resources({
        type: 'upload',
        resource_type: 'image',
        prefix: folder || 'ufosport',
        max_results: 500,
        next_cursor: nextCursor,
      })

      allResources = allResources.concat(result.resources)
      nextCursor = result.next_cursor
    } while (nextCursor)

    nextCursor = undefined

    do {
      const result: any = await cloudinary.api.resources({
        type: 'upload',
        resource_type: 'video',
        prefix: folder || 'ufosport',
        max_results: 500,
        next_cursor: nextCursor,
      })

      allResources = allResources.concat(result.resources)
      nextCursor = result.next_cursor
    } while (nextCursor)

    let imported = 0
    let skipped = 0
    let errors: string[] = []

    for (const resource of allResources) {
      try {
        const existingMedia = await prisma.media.findFirst({
          where: { publicId: resource.public_id }
        })

        if (existingMedia) {
          skipped++
          continue
        }

        const resourceType = resource.resource_type === 'video' ? 'VIDEO' : 'IMAGE'
        const filename = resource.public_id.split('/').pop() || resource.public_id

        await prisma.media.create({
          data: {
            filename: filename,
            originalName: filename,
            url: resource.secure_url,
            publicId: resource.public_id,
            resourceType: resourceType,
            format: resource.format,
            size: resource.bytes || 0,
            width: resource.width || null,
            height: resource.height || null,
            duration: resource.duration || null,
            tags: resource.tags || [],
            category: null,
            description: null,
          },
        })

        imported++
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        errors.push(`Failed to import ${resource.public_id}: ${errorMsg}`)
      }
    }

    return NextResponse.json({
      success: true,
      total: allResources.length,
      imported,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Sync Cloudinary error:', error)
    return NextResponse.json(
      { error: 'Failed to sync from Cloudinary', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    let allResources: any[] = []
    let nextCursor: string | undefined = undefined

    do {
      const result: any = await cloudinary.api.resources({
        type: 'upload',
        resource_type: 'image',
        max_results: 500,
        next_cursor: nextCursor,
      })

      allResources = allResources.concat(result.resources)
      nextCursor = result.next_cursor
    } while (nextCursor)

    nextCursor = undefined

    do {
      const result: any = await cloudinary.api.resources({
        type: 'upload',
        resource_type: 'video',
        max_results: 500,
        next_cursor: nextCursor,
      })

      allResources = allResources.concat(result.resources)
      nextCursor = result.next_cursor
    } while (nextCursor)

    const existingPublicIds = await prisma.media.findMany({
      select: { publicId: true }
    })
    const existingIds = new Set(existingPublicIds.map(m => m.publicId))

    const notImported = allResources.filter(r => !existingIds.has(r.public_id))

    return NextResponse.json({
      cloudinaryTotal: allResources.length,
      alreadyImported: existingIds.size,
      notYetImported: notImported.length,
      resources: notImported.map(r => ({
        publicId: r.public_id,
        url: r.secure_url,
        type: r.resource_type,
        format: r.format,
      })),
    })
  } catch (error) {
    console.error('Check Cloudinary error:', error)
    return NextResponse.json(
      { error: 'Failed to check Cloudinary', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
