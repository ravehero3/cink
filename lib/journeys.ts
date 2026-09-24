import { randomBytes } from 'crypto';
import { prisma } from './prisma';
import { sendCatalogEmail } from './email';
import type { EmailType } from './email-catalog';

export const JOURNEY_TRIGGERS = [
  { id: 'ORDER_PAID', label: 'Zaplacená objednávka' },
  { id: 'ORDER_CREATED', label: 'Vytvořená objednávka (nezaplacená)' },
  { id: 'CART_ABANDONED', label: 'Opuštěný košík' },
  { id: 'NEWSLETTER_SIGNUP', label: 'Přihlášení k newsletteru' },
  { id: 'ACCOUNT_CREATED', label: 'Nový účet' },
  { id: 'ORDER_SHIPPED', label: 'Objednávka odeslána' },
  { id: 'WINBACK', label: 'Neaktivní zákazník' },
] as const;

export type JourneyTrigger = (typeof JOURNEY_TRIGGERS)[number]['id'];

const DEFAULT_JOURNEYS = [
  {
    key: 'post-purchase',
    name: 'Po nákupu',
    description: 'Poděkování, osobní sleva na další nákup a později žádost o zpětnou vazbu.',
    trigger: 'ORDER_PAID',
    steps: [
      { position: 0, delayHours: 48, emailType: 'POST_PURCHASE_DISCOUNT', generatePromo: true, promoDiscountValue: 10, promoValidDays: 14, skipIfPurchased: false },
      { position: 1, delayHours: 192, emailType: 'CROSS_SELL', generatePromo: false, skipIfPurchased: false },
    ],
  },
  {
    key: 'abandoned-cart',
    name: 'Opuštěný košík',
    description: 'Připomínka košíku po 2 hodinách a sleva po 24 hodinách, pokud zákazník nedokončil nákup.',
    trigger: 'CART_ABANDONED',
    steps: [
      { position: 0, delayHours: 2, emailType: 'ABANDONED_CART', generatePromo: false, skipIfPurchased: true },
      { position: 1, delayHours: 22, emailType: 'CART_REMINDER_DISCOUNT', generatePromo: true, promoDiscountValue: 10, promoValidDays: 7, skipIfPurchased: true },
    ],
  },
  {
    key: 'newsletter-onboarding',
    name: 'Newsletter — první týden',
    description: 'Po uvítacím e-mailu následuje kolekce a sleva na první nákup, pokud ještě nenakoupili.',
    trigger: 'NEWSLETTER_SIGNUP',
    steps: [
      { position: 0, delayHours: 72, emailType: 'NEWSLETTER_COLLECTION', generatePromo: false, skipIfPurchased: false },
      { position: 1, delayHours: 96, emailType: 'NEWSLETTER_FIRST_ORDER', generatePromo: true, promoDiscountValue: 10, promoValidDays: 21, skipIfPurchased: true },
    ],
  },
  {
    key: 'account-welcome',
    name: 'Nový účet',
    description: 'Potvrzení registrace hned po vytvoření účtu.',
    trigger: 'ACCOUNT_CREATED',
    steps: [
      { position: 0, delayHours: 0, emailType: 'ACCOUNT_WELCOME', generatePromo: false, skipIfPurchased: false },
    ],
  },
  {
    key: 'after-shipping',
    name: 'Po odeslání',
    description: 'Žádost o recenzi týden po expedici.',
    trigger: 'ORDER_SHIPPED',
    steps: [
      { position: 0, delayHours: 168, emailType: 'REVIEW_REQUEST', generatePromo: false, skipIfPurchased: false },
    ],
  },
  {
    key: 'winback-60d',
    name: 'Návrat po 60 dnech',
    description: 'Sleva 15 % pro zákazníky bez nákupu 60 dní.',
    trigger: 'WINBACK',
    steps: [
      { position: 0, delayHours: 0, emailType: 'WINBACK', generatePromo: true, promoDiscountValue: 15, promoValidDays: 21, skipIfPurchased: true },
    ],
  },
  {
    key: 'payment-reminder',
    name: 'Připomínka platby',
    description: 'Pokud objednávka zůstane nezaplacená, pošleme připomínku po 3 hodinách.',
    trigger: 'ORDER_CREATED',
    steps: [
      { position: 0, delayHours: 3, emailType: 'PAYMENT_REMINDER', generatePromo: false, skipIfPurchased: false, skipIfPaid: true },
    ],
  },
];

function stepData(step: (typeof DEFAULT_JOURNEYS)[number]['steps'][number]) {
  return {
    position: step.position,
    delayHours: step.delayHours,
    emailType: step.emailType,
    generatePromo: step.generatePromo,
    promoDiscountType: 'PERCENTAGE',
    promoDiscountValue: step.promoDiscountValue ?? 10,
    promoValidDays: step.promoValidDays ?? 14,
    promoMaxUses: 1,
    skipIfPurchased: step.skipIfPurchased,
    skipIfPaid: Boolean((step as { skipIfPaid?: boolean }).skipIfPaid),
  };
}

export async function seedDefaultJourneys() {
  for (const journey of DEFAULT_JOURNEYS) {
    const existing = await prisma.emailJourney.findUnique({
      where: { key: journey.key },
      include: { steps: true },
    });
    if (!existing) {
      await prisma.emailJourney.create({
        data: {
          key: journey.key,
          name: journey.name,
          description: journey.description,
          trigger: journey.trigger,
          isActive: true,
          steps: { create: journey.steps.map(stepData) },
        },
      });
      continue;
    }

    for (const step of journey.steps) {
      const has = existing.steps.some((s) => s.emailType === step.emailType);
      if (has) continue;
      await prisma.emailJourneyStep.create({
        data: { journeyId: existing.id, ...stepData(step) },
      });
    }
  }
}

function hoursFromNow(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export async function enrollInTrigger(
  trigger: JourneyTrigger,
  email: string,
  context?: Record<string, unknown>,
  customerName?: string,
  resetIfActive = false
) {
  await seedDefaultJourneys();
  const journeys = await prisma.emailJourney.findMany({
    where: { trigger, isActive: true },
    include: { steps: { orderBy: { position: 'asc' } } },
  });

  for (const journey of journeys) {
    const first = journey.steps[0];
    if (!first) continue;

    const active = await prisma.emailJourneyEnrollment.findFirst({
      where: { journeyId: journey.id, email: email.toLowerCase(), status: 'ACTIVE' },
    });

    if (active && !resetIfActive) continue;

    if (active && resetIfActive) {
      await prisma.emailJourneyEnrollment.update({
        where: { id: active.id },
        data: {
          customerName: customerName || active.customerName,
          context: context || {},
          currentStep: 0,
          nextSendAt: hoursFromNow(first.delayHours),
          lastError: null,
        },
      });
      continue;
    }

    await prisma.emailJourneyEnrollment.create({
      data: {
        journeyId: journey.id,
        email: email.toLowerCase(),
        customerName: customerName || null,
        context: context || {},
        currentStep: 0,
        nextSendAt: hoursFromNow(first.delayHours),
        status: 'ACTIVE',
      },
    });
  }
}

export async function cancelTriggerEnrollments(trigger: JourneyTrigger, email: string) {
  const journeys = await prisma.emailJourney.findMany({ where: { trigger }, select: { id: true } });
  if (!journeys.length) return;
  await prisma.emailJourneyEnrollment.updateMany({
    where: {
      email: email.toLowerCase(),
      status: 'ACTIVE',
      journeyId: { in: journeys.map((j) => j.id) },
    },
    data: { status: 'CANCELLED' },
  });
}

export async function syncAbandonedCartJourney(email: string, items: unknown[], customerName?: string) {
  await enrollInTrigger('CART_ABANDONED', email, { items }, customerName, true);
}

async function hasRecentPaidOrder(email: string, since?: Date) {
  const order = await prisma.order.findFirst({
    where: {
      customerEmail: { equals: email, mode: 'insensitive' },
      paymentStatus: 'PAID',
      ...(since ? { createdAt: { gt: since } } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
  return !!order;
}

function randomCode(prefix: string) {
  return `${prefix}${randomBytes(3).toString('hex').toUpperCase()}`;
}

async function createJourneyPromo(options: {
  email: string;
  discountType: string;
  discountValue: number;
  validDays: number;
  maxUses: number;
}) {
  const validFrom = new Date();
  const validUntil = new Date(Date.now() + options.validDays * 24 * 60 * 60 * 1000);
  let code = randomCode('UFO');
  for (let i = 0; i < 8; i++) {
    const exists = await prisma.promoCode.findUnique({ where: { code } });
    if (!exists) break;
    code = randomCode('UFO');
  }

  return prisma.promoCode.create({
    data: {
      code,
      discountType: options.discountType || 'PERCENTAGE',
      discountValue: options.discountValue,
      maxUses: options.maxUses,
      currentUses: 0,
      validFrom,
      validUntil,
      isActive: true,
      source: 'journey',
      assignedEmail: options.email.toLowerCase(),
    },
  });
}

function formatDateCs(date: Date) {
  return date.toLocaleDateString('cs-CZ');
}

export async function processDueJourneys() {
  await seedDefaultJourneys();
  const now = new Date();
  const due = await prisma.emailJourneyEnrollment.findMany({
    where: { status: 'ACTIVE', nextSendAt: { lte: now } },
    include: {
      journey: { include: { steps: { orderBy: { position: 'asc' } } } },
    },
    take: 50,
  });

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const enrollment of due) {
    const step = enrollment.journey.steps.find((s) => s.position === enrollment.currentStep);
    if (!step) {
      await prisma.emailJourneyEnrollment.update({
        where: { id: enrollment.id },
        data: { status: 'COMPLETED' },
      });
      continue;
    }

    const context = (enrollment.context || {}) as Record<string, unknown>;

    if (step.skipIfPurchased && (await hasRecentPaidOrder(enrollment.email, enrollment.createdAt))) {
      skipped++;
      await prisma.emailJourneyEnrollment.update({
        where: { id: enrollment.id },
        data: { status: 'CANCELLED' },
      });
      continue;
    }

    if (step.skipIfPaid) {
      const orderNumber = typeof context.orderNumber === 'string' ? context.orderNumber : null;
      if (orderNumber) {
        const order = await prisma.order.findUnique({ where: { orderNumber } });
        if (!order || order.paymentStatus === 'PAID' || order.status === 'CANCELLED') {
          skipped++;
          await prisma.emailJourneyEnrollment.update({
            where: { id: enrollment.id },
            data: { status: 'CANCELLED' },
          });
          continue;
        }
      }
    }

    let promoCode: string | undefined;
    let promoLabel: string | undefined;
    let promoValidUntil: string | undefined;

    if (step.generatePromo) {
      const promo = await createJourneyPromo({
        email: enrollment.email,
        discountType: step.promoDiscountType,
        discountValue: Number(step.promoDiscountValue),
        validDays: step.promoValidDays,
        maxUses: step.promoMaxUses,
      });
      promoCode = promo.code;
      const value = Number(step.promoDiscountValue);
      promoLabel =
        step.promoDiscountType.toUpperCase() === 'FIXED'
          ? `Sleva ${value.toLocaleString('cs-CZ')} Kč`
          : `Sleva ${value} % na nákup`;
      promoValidUntil = formatDateCs(promo.validUntil);
    }

    const result = await sendCatalogEmail({
      type: step.emailType as EmailType,
      to: enrollment.email,
      journeyId: enrollment.journeyId,
      vars: {
        customerName: enrollment.customerName || undefined,
        customerEmail: enrollment.email,
        orderNumber: typeof context.orderNumber === 'string' ? context.orderNumber : undefined,
        items: Array.isArray(context.items) ? (context.items as { name: string; size?: string; quantity: number; price: number }[]) : undefined,
        totalPrice: typeof context.totalPrice === 'number' ? context.totalPrice : undefined,
        promoCode,
        promoLabel,
        promoValidUntil,
      },
    });

    if (!result.success) {
      failed++;
      await prisma.emailJourneyEnrollment.update({
        where: { id: enrollment.id },
        data: { lastError: String(result.error || 'send failed'), nextSendAt: hoursFromNow(1) },
      });
      continue;
    }

    sent++;
    const nextStep = enrollment.journey.steps.find((s) => s.position === enrollment.currentStep + 1);
    if (nextStep) {
      await prisma.emailJourneyEnrollment.update({
        where: { id: enrollment.id },
        data: {
          currentStep: enrollment.currentStep + 1,
          nextSendAt: hoursFromNow(nextStep.delayHours),
          lastError: null,
        },
      });
    } else {
      await prisma.emailJourneyEnrollment.update({
        where: { id: enrollment.id },
        data: { status: 'COMPLETED', lastError: null },
      });
    }
  }

  return { processed: due.length, sent, skipped, failed };
}

export async function enrollWinbackCandidates() {
  await seedDefaultJourneys();
  const cutoff = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const recentCutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: 'PAID',
      createdAt: { lte: cutoff, gte: recentCutoff },
    },
    select: { customerEmail: true, customerName: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const seen = new Set<string>();
  let enrolled = 0;
  for (const order of orders) {
    const email = order.customerEmail.toLowerCase();
    if (seen.has(email)) continue;
    seen.add(email);

    const later = await prisma.order.findFirst({
      where: {
        customerEmail: { equals: email, mode: 'insensitive' },
        paymentStatus: 'PAID',
        createdAt: { gt: cutoff },
      },
    });
    if (later) continue;

    await enrollInTrigger('WINBACK', email, { lastOrderAt: order.createdAt.toISOString() }, order.customerName);
    enrolled++;
  }
  return { enrolled };
}

export async function processAbandonedCartFallback() {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const carts = await prisma.abandonedCart.findMany({
    where: { lastUpdated: { lt: twoHoursAgo }, reminderSent: false },
  });

  for (const cart of carts) {
    const recentOrder = await prisma.order.findFirst({
      where: { customerEmail: cart.email, createdAt: { gt: cart.createdAt } },
    });
    if (recentOrder) {
      await prisma.abandonedCart.update({ where: { id: cart.id }, data: { reminderSent: true } });
      await cancelTriggerEnrollments('CART_ABANDONED', cart.email);
      continue;
    }
    await syncAbandonedCartJourney(cart.email, cart.items as unknown[]);
    await prisma.abandonedCart.update({ where: { id: cart.id }, data: { reminderSent: true } });
  }

  return { carts: carts.length };
}

function isCronAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization') || '';
  const header = request.headers.get('x-cron-secret') || '';
  const ua = request.headers.get('user-agent') || '';
  if (secret && (auth === `Bearer ${secret}` || header === secret)) return true;
  if (!secret && ua.toLowerCase().includes('vercel-cron')) return true;
  if (!secret && process.env.NODE_ENV !== 'production') return true;
  return false;
}

export { isCronAuthorized };
