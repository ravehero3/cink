import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const slides = await prisma.carouselSlide.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ slides })
  } catch (error) {
    console.error('Error fetching carousel slides:', error)
    return NextResponse.json({ slides: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { order } = body

    const slide = await prisma.carouselSlide.create({
      data: {
        image: '',
        link: '',
        order: order || 0,
        isProtected: false,
      },
    })

    return NextResponse.json({ slide })
  } catch (error) {
    console.error('Error creating carousel slide:', error)
    return NextResponse.json({ error: 'Failed to create slide' }, { status: 500 })
  }
}
