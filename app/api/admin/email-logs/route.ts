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
  const id = searchParams.get('id');

  // Single log detail with HTML
  if (id) {
    const log = await prisma.emailLog.findUnique({
      where: { id },
    });
    if (!log) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(log);
  }

  const take = Math.min(Math.max(Number(searchParams.get('take') || 100), 1), 300);
  const skip = Math.max(Number(searchParams.get('skip') || 0), 0);
  const q = (searchParams.get('q') || '').trim();
  const type = (searchParams.get('type') || '').trim();
  const status = (searchParams.get('status') || '').trim();
  const toEmail = (searchParams.get('toEmail') || '').trim();
  const orderNumber = (searchParams.get('orderNumber') || '').trim();
  const withStats = searchParams.get('withStats') === '1';

  const whereConditions: any[] = [];

  if (type) {
    whereConditions.push({ type });
  }

  if (status && (status === 'sent' || status === 'failed')) {
    whereConditions.push({ status });
  }

  if (toEmail) {
    whereConditions.push({
      toEmail: { equals: toEmail, mode: 'insensitive' },
    });
  }

  if (orderNumber) {
    whereConditions.push({
      OR: [
        { subject: { contains: orderNumber, mode: 'insensitive' } },
        { html: { contains: orderNumber, mode: 'insensitive' } },
      ],
    });
  }

  if (q) {
    whereConditions.push({
      OR: [
        { toEmail: { contains: q, mode: 'insensitive' } },
        { subject: { contains: q, mode: 'insensitive' } },
        { html: { contains: q, mode: 'insensitive' } },
      ],
    });
  }

  const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

  const [logs, totalFiltered] = await Promise.all([
    prisma.emailLog.findMany({
      where,
      orderBy: { sentAt: 'desc' },
      skip,
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
    }),
    prisma.emailLog.count({ where }),
  ]);

  if (withStats) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [totalAll, sentTotal, failedTotal, todayTotal] = await Promise.all([
      prisma.emailLog.count(),
      prisma.emailLog.count({ where: { status: 'sent' } }),
      prisma.emailLog.count({ where: { status: 'failed' } }),
      prisma.emailLog.count({ where: { sentAt: { gte: oneDayAgo } } }),
    ]);

    return NextResponse.json({
      logs,
      total: totalFiltered,
      stats: {
        total: totalAll,
        sent: sentTotal,
        failed: failedTotal,
        today: todayTotal,
      },
    });
  }

  return NextResponse.json(logs);
}
