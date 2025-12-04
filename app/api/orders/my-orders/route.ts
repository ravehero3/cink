import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, withRetry } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Musíte být přihlášeni' },
        { status: 401 }
      );
    }

    const orders = await withRetry(() => prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        totalPrice: true,
        status: true,
        paymentStatus: true,
        items: true,
        shippingMethod: true,
        zasilkovnaName: true,
        trackingNumber: true,
      },
    }));

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Došlo k chybě při načítání objednávek' },
      { status: 500 }
    );
  }
}
