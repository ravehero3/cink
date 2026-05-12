import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { code, discountValue, durationMin } = await request.json();

    if (!code || !discountValue) {
      return new NextResponse('Invalid data', { status: 400 });
    }

    const validUntil = new Date(Date.now() + durationMin * 60 * 1000);

    // Create a temporary promo code
    await prisma.promoCode.create({
      data: {
        code,
        discountType: 'PERCENTAGE',
        discountValue,
        validFrom: new Date(),
        validUntil,
        isActive: true,
        maxUses: 1, // Only usable once by this user
        minOrderAmount: 0,
      },
    });

    return new NextResponse('OK');
  } catch (error) {
    console.error('Error creating temporary promo code:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
