import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, withRetry } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    const order = await withRetry(() => prisma.order.findUnique({
      where: { orderNumber: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    }));

    if (!order) {
      return NextResponse.json(
        { error: 'Objednávka nebyla nalezena' },
        { status: 404 }
      );
    }

    const isAdmin = session?.user?.role === 'ADMIN';
    const isOwner = session?.user && order.userId === session.user.id;
    const hasValidToken = token && token === order.securityToken;

    if (!isAdmin && !isOwner && !hasValidToken) {
      return NextResponse.json(
        { error: 'Nemáte oprávnění k zobrazení této objednávky' },
        { status: 403 }
      );
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Došlo k chybě při načítání objednávky' },
      { status: 500 }
    );
  }
}
