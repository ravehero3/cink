import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * Seed endpoint - creates default email journeys if they don't exist
 * Only creates journeys that don't already exist
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const DEFAULT_JOURNEYS = [
      {
        key: 'order_paid',
        name: 'Potvrzení zaplacení',
        description: 'Automatické emaily po zaplacení objednávky',
        trigger: 'ORDER_PAID',
        isActive: true,
        steps: [
          { position: 1, delayHours: 0, emailType: 'ORDER_CONFIRMATION', generatePromo: false, promoDiscountValue: 0, promoValidDays: 0, skipIfPurchased: false, skipIfPaid: false },
          { position: 2, delayHours: 48, emailType: 'FOLLOW_UP', generatePromo: true, promoDiscountValue: 15, promoValidDays: 7, skipIfPurchased: false, skipIfPaid: false },
          { position: 3, delayHours: 168, emailType: 'FEEDBACK_REQUEST', generatePromo: false, promoDiscountValue: 0, promoValidDays: 0, skipIfPurchased: false, skipIfPaid: false },
        ],
      },
      {
        key: 'cart_abandoned',
        name: 'Opuštěný košík',
        description: 'Připomenutí o zanechaných produktech',
        trigger: 'CART_ABANDONED',
        isActive: true,
        steps: [
          { position: 1, delayHours: 2, emailType: 'CART_REMINDER', generatePromo: true, promoDiscountValue: 10, promoValidDays: 3, skipIfPurchased: true, skipIfPaid: false },
          { position: 2, delayHours: 24, emailType: 'CART_REMINDER_2', generatePromo: true, promoDiscountValue: 15, promoValidDays: 2, skipIfPurchased: true, skipIfPaid: false },
          { position: 3, delayHours: 72, emailType: 'CART_FINAL', generatePromo: false, promoDiscountValue: 0, promoValidDays: 0, skipIfPurchased: true, skipIfPaid: false },
        ],
      },
      {
        key: 'newsletter_signup',
        name: 'Přihlášení k newsletteru',
        description: 'Vítací emaily pro nové přihlášené',
        trigger: 'NEWSLETTER_SIGNUP',
        isActive: true,
        steps: [
          { position: 1, delayHours: 0, emailType: 'WELCOME_NEWSLETTER', generatePromo: true, promoDiscountValue: 20, promoValidDays: 7, skipIfPurchased: false, skipIfPaid: false },
          { position: 2, delayHours: 168, emailType: 'NEWSLETTER_CONTENT', generatePromo: false, promoDiscountValue: 0, promoValidDays: 0, skipIfPurchased: false, skipIfPaid: false },
        ],
      },
      {
        key: 'account_created',
        name: 'Nový účet',
        description: 'Emaily pro nově vytvořené účty',
        trigger: 'ACCOUNT_CREATED',
        isActive: true,
        steps: [
          { position: 1, delayHours: 0, emailType: 'WELCOME_ACCOUNT', generatePromo: true, promoDiscountValue: 25, promoValidDays: 14, skipIfPurchased: false, skipIfPaid: false },
          { position: 2, delayHours: 336, emailType: 'ACCOUNT_OFFER', generatePromo: false, promoDiscountValue: 0, promoValidDays: 0, skipIfPurchased: false, skipIfPaid: false },
        ],
      },
      {
        key: 'order_shipped',
        name: 'Objednávka odeslána',
        description: 'Notifikace a follow-up po odeslání',
        trigger: 'ORDER_SHIPPED',
        isActive: true,
        steps: [
          { position: 1, delayHours: 0, emailType: 'SHIPMENT_NOTIFICATION', generatePromo: false, promoDiscountValue: 0, promoValidDays: 0, skipIfPurchased: false, skipIfPaid: false },
          { position: 2, delayHours: 336, emailType: 'DELIVERY_FOLLOW_UP', generatePromo: true, promoDiscountValue: 10, promoValidDays: 7, skipIfPurchased: false, skipIfPaid: false },
        ],
      },
      {
        key: 'winback',
        name: 'Neaktivní zákazník',
        description: 'Win-back kampaň pro neaktivní zákazníky',
        trigger: 'WINBACK',
        isActive: false,
        steps: [
          { position: 1, delayHours: 0, emailType: 'WINBACK_OFFER', generatePromo: true, promoDiscountValue: 30, promoValidDays: 14, skipIfPurchased: false, skipIfPaid: false },
          { position: 2, delayHours: 168, emailType: 'WINBACK_FINAL', generatePromo: false, promoDiscountValue: 0, promoValidDays: 0, skipIfPurchased: false, skipIfPaid: false },
        ],
      },
      {
        key: 'order_created',
        name: 'Objednávka vytvořena',
        description: 'Emaily pro nezaplacené objednávky',
        trigger: 'ORDER_CREATED',
        isActive: true,
        steps: [
          { position: 1, delayHours: 0, emailType: 'PAYMENT_REMINDER', generatePromo: false, promoDiscountValue: 0, promoValidDays: 0, skipIfPurchased: false, skipIfPaid: false },
          { position: 2, delayHours: 24, emailType: 'PAYMENT_REMINDER_2', generatePromo: true, promoDiscountValue: 5, promoValidDays: 3, skipIfPurchased: false, skipIfPaid: false },
        ],
      },
    ];

    const results: any[] = [];

    for (const journeyData of DEFAULT_JOURNEYS) {
      const existing = await prisma.emailJourney.findUnique({
        where: { key: journeyData.key },
      });

      if (!existing) {
        const journey = await prisma.emailJourney.create({
          data: {
            key: journeyData.key,
            name: journeyData.name,
            description: journeyData.description,
            trigger: journeyData.trigger,
            isActive: journeyData.isActive,
            steps: { create: journeyData.steps },
          },
          include: { steps: true, _count: { select: { enrollments: true } } },
        });
        results.push({ created: journey.key, name: journey.name });
      } else {
        results.push({ skipped: existing.key, name: existing.name });
      }
    }

    return NextResponse.json({ success: true, message: 'Journey seeding completed', results });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message || 'Seed failed' }, { status: 500 });
  }
}
