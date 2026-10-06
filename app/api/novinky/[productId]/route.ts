import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId } = params

    await prisma.novinkysProduct.delete({
      where: { productId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting novinky product:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
