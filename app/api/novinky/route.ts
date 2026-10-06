import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const novinkysProducts = await prisma.novinkysProduct.findMany({
      orderBy: { order: 'asc' },
      include: {
        product: true,
      },
    })

    return NextResponse.json({ products: novinkysProducts })
  } catch (error) {
    console.error('Error fetching novinky:', error)
    return NextResponse.json({ products: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, order } = body

    const novinkysProduct = await prisma.novinkysProduct.create({
      data: {
        productId,
        order: order || 0,
      },
      include: {
        product: true,
      },
    })

    return NextResponse.json({ novinkysProduct })
  } catch (error) {
    console.error('Error creating novinky product:', error)
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}
