import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { action, productIds, updates } = data;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: 'No products selected' }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'updatePrice':
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { price: updates.price },
        });
        break;

      case 'updateCategory':
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { category: updates.category },
        });
        break;

      case 'updateVisibility':
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { isVisible: updates.isVisible },
        });
        break;

      case 'updateStock':
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { totalStock: updates.totalStock },
        });
        break;

      case 'updateLowStockThreshold':
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { lowStockThreshold: updates.lowStockThreshold },
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `${result.count} produktů bylo aktualizováno`,
      count: result.count,
    });
  } catch (error) {
    console.error('Error in bulk operations:', error);
    return NextResponse.json({ error: 'Failed to process bulk operation' }, { status: 500 });
  }
}
