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

    const [totalOrders, pendingOrders, products, promoCodes, newsletter, orders] = await Promise.all([
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
      })
    ]);

    const totalRevenue = orders.reduce((sum: number, order: any) => sum + Number(order.totalPrice), 0);

    return NextResponse.json({
      totalOrders,
      pendingOrders,
      totalRevenue,
      productsCount: products,
      promoCodesCount: promoCodes,
      newsletterCount: newsletter,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
