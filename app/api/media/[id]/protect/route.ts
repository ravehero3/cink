import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, isProtected } = body

    if (!id) {
      return NextResponse.json({ error: 'Media ID required' }, { status: 400 })
    }

    const media = await prisma.media.update({
      where: { id },
      data: { isProtected },
    })

    return NextResponse.json({ success: true, media })
  } catch (error) {
    console.error('Update media protection error:', error)
    return NextResponse.json(
      { error: 'Failed to update media' },
      { status: 500 }
    )
  }
}
