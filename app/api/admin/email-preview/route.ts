import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { renderEmail, EMAIL_CATALOG, SAMPLE_VARS, type EmailType } from '@/lib/email-catalog';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const logId = searchParams.get('logId');

  if (logId) {
    const log = await prisma.emailLog.findUnique({ where: { id: logId } });
    if (!log) return new NextResponse('Not found', { status: 404 });
    const html = log.html || renderEmail((log.type as EmailType) || 'ORDER_CONFIRMATION', SAMPLE_VARS).html;
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const type = (searchParams.get('type') || 'ORDER_CONFIRMATION') as EmailType;
  const known = EMAIL_CATALOG.some((item) => item.id === type);
  const html = renderEmail(known ? type : 'ORDER_CONFIRMATION', SAMPLE_VARS).html;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
