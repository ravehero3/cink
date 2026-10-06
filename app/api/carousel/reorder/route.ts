import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.email === 'spravce.eshopu@ufosport.cz'
    if (!session || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { slides } = body

    if (!Array.isArray(slides)) {
      return NextResponse.json({ error: 'Invalid slides array' }, { status: 400 })
    }

    // Update all slides with new order
    for (const slide of slides) {
      await prisma.carouselSlide.update({
        where: { id: slide.id },
        data: { order: slide.order },
      })
    }

    return NextResponse.json({ success: true, updatedCount: slides.length })
  } catch (error) {
    console.error('Reorder error:', error)
    return NextResponse.json(
      { error: 'Failed to reorder slides' },
      { status: 500 }
    )
  }
}
