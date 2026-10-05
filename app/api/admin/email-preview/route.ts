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

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { subject, content } = await request.json();
    const { bodyText } = await import('@/lib/email-layout');
    const inner = bodyText(content || 'Zde bude obsah e-mailu...');
    const { html } = renderEmail('NEWSLETTER_WELCOME', { ...SAMPLE_VARS, isTest: true }, undefined);
    
    // We replace the info part of NEWSLETTER_WELCOME with our custom content
    const customHtml = html.replace(
      /<td class="pad-info"[\s\S]*?<\/td>/,
      `<td class="pad-info" height="234" align="left" valign="middle" style="height:234px;padding:0 80px;font-size:15px;line-height:20px;">${inner}</td>`
    );
    
    return new NextResponse(customHtml, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    return new NextResponse('Internal server error', { status: 500 });
  }
}
