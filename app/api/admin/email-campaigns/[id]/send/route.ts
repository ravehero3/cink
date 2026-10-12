import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

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

    // Get campaign
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Get recipient emails based on target audience
    let recipients: { email: string }[] = [];

    if (campaign.targetAudience === 'all') {
      recipients = await prisma.newsletterSubscriber.findMany({
        select: { email: true },
      });
    } else if (campaign.targetAudience === 'abandoned') {
      // No abandonedCart field in schema - fall back to newsletter subscribers
      recipients = await prisma.newsletterSubscriber.findMany({
        select: { email: true },
      });
    } else if (campaign.targetAudience === 'vip') {
      // No VIP role in schema - target users with newsletterSubscribed flag
      recipients = await prisma.user.findMany({
        where: { newsletterSubscribed: true },
        select: { email: true },
      });
    }

    if (recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients found' }, { status: 400 });
    }

    // Update campaign status
    if (scheduled && scheduledFor) {
      await prisma.emailCampaign.update({
        where: { id: campaignId },
        data: {
          status: 'scheduled',
          scheduledFor: new Date(scheduledFor),
        },
      });
    } else {
      // Send immediately
      await Promise.all(
        recipients.map((r) =>
          fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'kampane@ufosport.cz',
              to: r.email,
              subject: campaign.subject,
              html,
            }),
          })
        )
      );

      await prisma.emailCampaign.update({
        where: { id: campaignId },
        data: {
          status: 'sent',
          sentAt: new Date(),
          sentCount: recipients.length,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('send campaign error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
