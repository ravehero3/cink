import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { code, discountValue, durationMin } = await request.json();

    if (!code || !discountValue) {
      return new NextResponse('Invalid data', { status: 400 });
    }

    const validUntil = new Date(Date.now() + durationMin * 60 * 1000);

    await prisma.promoCode.upsert({
      where: { code },
      update: {
        discountValue,
        validFrom: new Date(),
        validUntil,
        isActive: true,
        maxUses: 1,
        usedCount: 0,
        minOrderAmount: 0,
      },
      create: {
        code,
        discountType: 'PERCENTAGE',
        discountValue,
        validFrom: new Date(),
        validUntil,
        isActive: true,
        maxUses: 1,
        minOrderAmount: 0,
      },
    });

    return new NextResponse('OK');
  } catch (error) {
    console.error('Error creating temporary promo code:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
