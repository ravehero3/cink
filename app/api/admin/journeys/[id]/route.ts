import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') return null;
  return session;
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const journey = await prisma.emailJourney.findUnique({
    where: { id: params.id },
    include: {
      steps: { orderBy: { position: 'asc' } },
      enrollments: { orderBy: { createdAt: 'desc' }, take: 50 },
    },
  });

  if (!journey) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(journey);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const data: Record<string, unknown> = {};
  if (typeof body.name === 'string') data.name = body.name;
  if (typeof body.description === 'string') data.description = body.description;
  if (typeof body.isActive === 'boolean') data.isActive = body.isActive;
  if (typeof body.trigger === 'string') data.trigger = body.trigger;

  if (Array.isArray(body.steps)) {
    await prisma.emailJourneyStep.deleteMany({ where: { journeyId: params.id } });
    await prisma.emailJourneyStep.createMany({
      data: body.steps.map((step: Record<string, unknown>, index: number) => ({
        journeyId: params.id,
        position: (step.position as number) ?? index,
        delayHours: Number(step.delayHours ?? 0),
        emailType: String(step.emailType),
        generatePromo: Boolean(step.generatePromo),
        promoDiscountType: String(step.promoDiscountType || 'PERCENTAGE'),
        promoDiscountValue: Number(step.promoDiscountValue ?? 10),
        promoValidDays: Number(step.promoValidDays ?? 14),
        promoMaxUses: Number(step.promoMaxUses ?? 1),
        skipIfPurchased: Boolean(step.skipIfPurchased),
        skipIfPaid: Boolean(step.skipIfPaid),
      })),
    });
  }

  const journey = await prisma.emailJourney.update({
    where: { id: params.id },
    data,
    include: { steps: { orderBy: { position: 'asc' } } },
  });

  return NextResponse.json(journey);
}
