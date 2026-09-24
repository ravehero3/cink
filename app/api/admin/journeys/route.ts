import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { seedDefaultJourneys } from '@/lib/journeys';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await seedDefaultJourneys();

  const journeys = await prisma.emailJourney.findMany({
    include: {
      steps: { orderBy: { position: 'asc' } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  const stats = await prisma.emailJourneyEnrollment.groupBy({
    by: ['journeyId', 'status'],
    _count: { _all: true },
  });

  return NextResponse.json({ journeys, stats });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const journey = await prisma.emailJourney.create({
    data: {
      key: body.key || `journey-${Date.now()}`,
      name: body.name,
      description: body.description || '',
      trigger: body.trigger,
      isActive: body.isActive ?? true,
      steps: {
        create: (body.steps || []).map((step: Record<string, unknown>, index: number) => ({
          position: (step.position as number) ?? index,
          delayHours: (step.delayHours as number) ?? 0,
          emailType: step.emailType as string,
          generatePromo: Boolean(step.generatePromo),
          promoDiscountType: (step.promoDiscountType as string) || 'PERCENTAGE',
          promoDiscountValue: Number(step.promoDiscountValue ?? 10),
          promoValidDays: Number(step.promoValidDays ?? 14),
          promoMaxUses: Number(step.promoMaxUses ?? 1),
          skipIfPurchased: Boolean(step.skipIfPurchased),
          skipIfPaid: Boolean(step.skipIfPaid),
        })),
      },
    },
    include: { steps: { orderBy: { position: 'asc' } } },
  });

  return NextResponse.json(journey);
}
