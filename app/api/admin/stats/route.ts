import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [totalOrders, pendingOrders, products, promoCodes, newsletter, orders, allProducts] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: {
          status: {
            in: ['PENDING', 'PAID', 'PROCESSING']
          }
        }
      }),
      prisma.product.count(),
      prisma.promoCode.count({
        where: { isActive: true }
      }),
      prisma.newsletterSubscriber.count(),
      prisma.order.findMany({
        where: {
          paymentStatus: 'PAID'
        },
        select: {
          totalPrice: true
        }
      }),
      prisma.product.findMany({
        select: {
          totalStock: true,
          lowStockThreshold: true
        }
      })
    ]);

    const totalRevenue = orders.reduce((sum: number, order: any) => sum + Number(order.totalPrice), 0);
    const lowStockProducts = allProducts.filter(
      (p: any) => p.totalStock <= p.lowStockThreshold
    ).length;

    return NextResponse.json({
      totalOrders,
      pendingOrders,
      totalRevenue,
      productsCount: products,
      promoCodesCount: promoCodes,
      newsletterCount: newsletter,
      lowStockProducts,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
