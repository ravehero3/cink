import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { prisma } from '@/lib/prisma'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string | null
    const description = formData.get('description') as string | null
    const tags = formData.get('tags') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'ufosport',
          resource_type: 'auto',
          tags: tags ? tags.split(',').map(t => t.trim()) : [],
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    const mediaType = result.resource_type === 'video' ? 'VIDEO' : 'IMAGE'

    const media = await prisma.media.create({
      data: {
        filename: result.public_id,
        originalName: file.name,
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: mediaType,
        format: result.format,
        size: result.bytes,
        width: result.width || null,
        height: result.height || null,
        duration: result.duration || null,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        category: category || null,
        description: description || null,
      },
    })

    return NextResponse.json({
      success: true,
      media,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
