import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { deleteFromOracleVPS } from '@/lib/oracle-vps'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.email === 'spravce.eshopu@ufosport.cz'
    if (!session || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { image, link } = body

    const slide = await prisma.carouselSlide.findUnique({
      where: { id },
    })

    if (!slide) {
      return NextResponse.json({ error: 'Slide not found' }, { status: 404 })
    }

    // Update the slide
    const updated = await prisma.carouselSlide.update({
      where: { id },
      data: {
        ...(image && { image }),
        ...(link !== undefined && { link }),
      },
    })

    return NextResponse.json({ slide: updated })
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json(
      { error: 'Failed to update slide' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.email === 'spravce.eshopu@ufosport.cz'
    if (!session || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const slide = await prisma.carouselSlide.findUnique({
      where: { id },
    })

    if (!slide) {
      return NextResponse.json({ error: 'Slide not found' }, { status: 404 })
    }

    // Prevent deletion of protected slides
    if (slide.isProtected) {
      return NextResponse.json(
        { error: 'This slide is protected and cannot be deleted' },
        { status: 403 }
      )
    }

    // Delete from VPS if applicable
    if (slide.storageType === 'ORACLE_VPS' && slide.oracleVpsPath) {
      try {
        await deleteFromOracleVPS(slide.oracleVpsPath)
      } catch (err) {
        console.error('Failed to delete from VPS:', err)
      }
    }

    await prisma.carouselSlide.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete slide' },
      { status: 500 }
    )
  }
}
