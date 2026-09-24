import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const take = Math.min(Number(searchParams.get('take') || 80), 200);
  const q = (searchParams.get('q') || '').trim();
  const type = searchParams.get('type') || '';

  const logs = await prisma.emailLog.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(q
        ? {
            OR: [
              { toEmail: { contains: q, mode: 'insensitive' } },
              { subject: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { sentAt: 'desc' },
    take,
    select: {
      id: true,
      toEmail: true,
      type: true,
      subject: true,
      status: true,
      error: true,
      journeyId: true,
      sentAt: true,
    },
  });

  return NextResponse.json(logs);
}
