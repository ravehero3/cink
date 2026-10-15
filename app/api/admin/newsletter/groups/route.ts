import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const counts = await prisma.newsletterSubscriber.groupBy({
      by: ['group'],
      _count: { id: true },
    });

    const result = counts.map((c) => ({
      group: c.group,
      count: c._count.id,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching newsletter subscriber groups:', error);
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
  }
}
