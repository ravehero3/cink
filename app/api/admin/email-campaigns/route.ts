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
    const group = searchParams.get('group') || searchParams.get('targetAudience');

    const where = group ? { targetAudience: group } : {};

    const campaigns = await prisma.emailCampaign.findMany({
      where,
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('GET /api/admin/email-campaigns error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Auto-calculate next position for this audience if not provided
    let position = data.position;
    if (position === undefined || position === null) {
      const highest = await prisma.emailCampaign.findFirst({
        where: { targetAudience: data.targetAudience || 'all' },
        orderBy: { position: 'desc' },
        select: { position: true },
      });
      position = highest ? highest.position + 1 : 0;
    }

    const campaign = await prisma.emailCampaign.create({
      data: {
        name: data.name || 'Nový e-mail v sekvenci',
        subject: data.subject || 'Novinka od UFO SPORT',
        content: data.content || '',
        targetAudience: data.targetAudience || 'all',
        position: Number(position) || 0,
        delayHours: Number(data.delayHours) || 0,
        customization: data.customization ?? null,
        recipientEmails: data.recipientEmails || [],
        status: data.status || 'draft',
      },
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('POST /api/admin/email-campaigns error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
