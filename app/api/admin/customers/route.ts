import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const role = searchParams.get('role') || 'all';

    const users = await prisma.user.findMany({
      where: role === 'all' ? {} : { role: role as any },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        newsletterSubscribed: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            createdAt: true,
            totalPrice: true,
          },
        },
      },
      orderBy: sortBy === 'name' ? { name: 'asc' } : 
               sortBy === 'totalSpent' ? { orders: { _count: 'desc' } } :
               { createdAt: 'desc' },
    });

    const customers = users.map((user: any) => ({
      id: user.id,
      email: user.email,
      name: user.name || '',
      phone: user.phone || '',
      role: user.role,
      newsletterSubscribed: user.newsletterSubscribed,
      totalOrders: user.orders.length,
      totalSpent: user.orders.reduce((sum: number, order: any) => sum + Number(order.totalPrice), 0),
      createdAt: user.createdAt,
      lastOrderDate: user.orders.length > 0 ? user.orders[0].createdAt : null,
    }));

    return NextResponse.json(customers);
  } catch (error) {
    console.error('GET /api/admin/customers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
