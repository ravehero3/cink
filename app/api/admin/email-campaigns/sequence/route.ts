import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { steps } = await req.json();
    if (!Array.isArray(steps)) {
      return NextResponse.json({ error: 'Steps must be an array' }, { status: 400 });
    }

    // Update each campaign step's position and delayHours
    await Promise.all(
      steps.map((step, idx) => {
        if (!step.id) return Promise.resolve();
        return prisma.emailCampaign.update({
          where: { id: step.id },
          data: {
            position: idx,
            delayHours: Number(step.delayHours ?? 0),
          },
        });
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/admin/email-campaigns/sequence error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
