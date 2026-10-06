import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productIds } = body

    if (!Array.isArray(productIds)) {
      return NextResponse.json({ error: 'Invalid productIds' }, { status: 400 })
    }

    // Update order for each product
    const updates = productIds.map((productId: string, index: number) =>
      prisma.novinkysProduct.update({
        where: { productId },
        data: { order: index },
      })
    )

    await Promise.all(updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering novinky:', error)
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 })
  }
}
