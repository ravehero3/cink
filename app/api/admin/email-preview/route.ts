import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { renderEmail, EMAIL_CATALOG, SAMPLE_VARS, type EmailType } from '@/lib/email-catalog';
import type { EmailTemplateCustomization } from '@/lib/email-layout';

// Removed: enforceWhiteBackground function - emails now display with their proper white backgrounds
// Previously this function was forcing all white backgrounds to black in preview
function enforceWhiteBackground(html: string): string {
  // Keep HTML as-is - trust the email-layout.ts template which now uses white backgrounds
  return html;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const logId = searchParams.get('logId');
  const campaignId = searchParams.get('campaignId');
  const adminInteractive = searchParams.get('adminInteractive') === '1';

  if (logId) {
    const log = await prisma.emailLog.findUnique({ where: { id: logId } });
    if (!log) return new NextResponse('Not found', { status: 404 });
    const rawHtml = log.html || renderEmail((log.type as EmailType) || 'ORDER_CONFIRMATION', SAMPLE_VARS).html;
    return new NextResponse(enforceWhiteBackground(rawHtml), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  if (campaignId) {
    const campaign = await prisma.emailCampaign.findUnique({ where: { id: campaignId } });
    if (!campaign) return new NextResponse('Not found', { status: 404 });
    const { buildEmailHtml, WEBSITE_URL } = await import('@/lib/email-layout');
    const rawHtml = buildEmailHtml({
      subject: campaign.subject || 'UFO SPORT',
      preheader: '',
      header2Title: campaign.subject || 'UFO SPORT',
      header2Subtitle: '',
      infoHtml: `<p style="margin:0 0 16px 0;font-size:15px;line-height:20px;color:#ffffff;font-family:'Inter',Arial,sans-serif;">${campaign.content || ''}</p>`,
      actionText: '',
      actionButton: { label: 'PŘEJÍT DO OBCHODU', href: WEBSITE_URL },
      showBrowseAll: true,
      marketing: true,
      customization: (campaign.customization as any) || undefined,
      adminMode: adminInteractive,
    });
    return new NextResponse(enforceWhiteBackground(rawHtml), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const type = (searchParams.get('type') || 'ORDER_CONFIRMATION') as EmailType;
  const known = EMAIL_CATALOG.some((item) => item.id === type);
  const resolvedType = known ? type : 'ORDER_CONFIRMATION';

  // Load custom template settings from database
  let customization: EmailTemplateCustomization | undefined;
  try {
    const templateConfig = await prisma.emailTemplate.findUnique({
      where: { type: resolvedType },
    });
    if (templateConfig?.variables) {
      customization = templateConfig.variables as EmailTemplateCustomization;
    }
  } catch (err) {
    console.error('Error loading template config for preview:', err);
  }

  const rawHtml = renderEmail(resolvedType, SAMPLE_VARS, undefined, {
    customization,
    adminMode: adminInteractive,
  }).html;

  return new NextResponse(enforceWhiteBackground(rawHtml), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, customization, adminMode, subject, content, campaignPreview } = body;

    if (campaignPreview) {
      const { buildEmailHtml, WEBSITE_URL } = await import('@/lib/email-layout');
      const rawHtml = buildEmailHtml({
        subject: subject || 'UFO SPORT',
        preheader: '',
        header2Title: subject || 'UFO SPORT',
        header2Subtitle: '',
        infoHtml: `<p style="margin:0 0 16px 0;font-size:15px;line-height:20px;color:#ffffff;font-family:'Inter',Arial,sans-serif;">${content || ''}</p>`,
        actionText: '',
        actionButton: { label: 'PŘEJÍT DO OBCHODU', href: WEBSITE_URL },
        showBrowseAll: true,
        marketing: true,
        customization,
        adminMode: adminMode !== false,
      });
      return new NextResponse(enforceWhiteBackground(rawHtml), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    if (type) {
      const known = EMAIL_CATALOG.some((item) => item.id === type);
      const resolvedType = (known ? type : 'ORDER_CONFIRMATION') as EmailType;
      const rawHtml = renderEmail(resolvedType, SAMPLE_VARS, undefined, {
        customization,
        adminMode: adminMode !== false,
      }).html;

      return new NextResponse(enforceWhiteBackground(rawHtml), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    if (body.infoHtml !== undefined || body.header2Title !== undefined) {
      const { buildEmailHtml, WEBSITE_URL } = await import('@/lib/email-layout');
      const rawHtml = buildEmailHtml({
        subject: body.subject || 'UFO SPORT',
        preheader: body.preheader || '',
        header2Title: body.header2Title || '',
        header2Subtitle: body.header2Subtitle || '',
        infoHtml: body.infoHtml || '',
        actionText: body.actionText || '',
        actionButton: body.actionButton || { label: 'PŘEJÍT DO OBCHODU', href: WEBSITE_URL },
        showBrowseAll: body.showBrowseAll !== false,
        marketing: Boolean(body.marketing),
        customization: body.customization,
      });
      return new NextResponse(enforceWhiteBackground(rawHtml), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    const { bodyText } = await import('@/lib/email-layout');
    const inner = bodyText(content || 'Zde bude obsah e-mailu...');
    const { html } = renderEmail('NEWSLETTER_WELCOME', { ...SAMPLE_VARS, isTest: true }, undefined);

    const customHtml = html.replace(
      /<td class="pad-info"[\s\S]*?<\/td>/,
      `<td class="pad-info" height="234" align="left" valign="middle" style="height:234px;padding:0 80px;font-size:15px;line-height:20px;background:#000000;color:#ffffff;">${inner}</td>`
    );

    return new NextResponse(enforceWhiteBackground(customHtml), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    return new NextResponse('Internal server error', { status: 500 });
  }
}
