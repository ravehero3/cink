import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

function enforceBlackBackground(html: string): string {
  return html
    .replace(/background:\s*#ffffff/gi, 'background:#000000')
    .replace(/background-color:\s*#ffffff/gi, 'background-color:#000000')
    .replace(/bgcolor="#ffffff"/gi, 'bgcolor="#000000"')
    .replace(/background:\s*white/gi, 'background:#000000')
    .replace(/background-color:\s*white/gi, 'background-color:#000000');
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { scheduled, scheduledFor, html } = await req.json();
    const campaignId = params.id;

    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Get recipient emails based on target audience group
    let recipients: { email: string }[] = [];

    if (campaign.targetAudience === 'customers') {
      recipients = await prisma.newsletterSubscriber.findMany({
        where: { group: 'customers' },
        select: { email: true },
      });
    } else if (campaign.targetAudience === 'free') {
      recipients = await prisma.newsletterSubscriber.findMany({
        where: { group: 'free' },
        select: { email: true },
      });
    } else if (campaign.targetAudience === 'all') {
      recipients = await prisma.newsletterSubscriber.findMany({
        select: { email: true },
      });
    } else if (campaign.recipientEmails && campaign.recipientEmails.length > 0) {
      recipients = campaign.recipientEmails.map((e) => ({ email: e }));
    } else {
      recipients = await prisma.newsletterSubscriber.findMany({
        select: { email: true },
      });
    }

    if (recipients.length === 0) {
      return NextResponse.json({ error: 'Nenalezeni žádní příjemci v této skupině.' }, { status: 400 });
    }

    // Update campaign status if scheduled
    if (scheduled && scheduledFor) {
      await prisma.emailCampaign.update({
        where: { id: campaignId },
        data: {
          status: 'scheduled',
          scheduledFor: new Date(scheduledFor),
        },
      });
      return NextResponse.json({ success: true, scheduled: true });
    }

    // Render HTML if not passed directly
    let finalHtml = html;
    if (!finalHtml) {
      const { buildEmailHtml, WEBSITE_URL } = await import('@/lib/email-layout');
      finalHtml = buildEmailHtml({
        subject: campaign.subject,
        preheader: '',
        header2Title: campaign.subject,
        header2Subtitle: '',
        infoHtml: `<p style="margin:0 0 16px 0;font-size:15px;line-height:20px;color:#ffffff;font-family:'Inter',Arial,sans-serif;">${campaign.content || ''}</p>`,
        actionText: '',
        actionButton: { label: 'PŘEJÍT DO OBCHODU', href: WEBSITE_URL },
        showBrowseAll: true,
        customization: (campaign.customization as any) || undefined,
        marketing: true,
      });
    }
    finalHtml = enforceBlackBackground(finalHtml);

    // Send in batches of 20 to avoid rate limits
    const BATCH_SIZE = 20;
    let sentCount = 0;

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const chunk = recipients.slice(i, i + BATCH_SIZE);
      await Promise.allSettled(
        chunk.map((r) =>
          fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'UFO Sport <noreply@ufosport.cz>',
              to: r.email,
              subject: campaign.subject,
              html: finalHtml,
            }),
          })
        )
      );
      sentCount += chunk.length;
    }

    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: {
        status: 'sent',
        sentAt: new Date(),
        sentCount,
      },
    });

    return NextResponse.json({ success: true, sentCount });
  } catch (error) {
    console.error('send campaign error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
