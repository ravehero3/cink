import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, orderAmount } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Promo kód je povinný' },
        { status: 400 }
      );
    }

    if (!orderAmount || orderAmount <= 0) {
      return NextResponse.json(
        { error: 'Neplatná částka objednávky' },
        { status: 400 }
      );
    }

    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promoCode) {
      return NextResponse.json(
        { error: 'Promo kód nebyl nalezen' },
        { status: 404 }
      );
    }

    if (!promoCode.isActive) {
      return NextResponse.json(
        { error: 'Tento promo kód není aktivní' },
        { status: 400 }
      );
    }

    const now = new Date();
    if (now < promoCode.validFrom) {
      return NextResponse.json(
        { error: 'Tento promo kód ještě není platný' },
        { status: 400 }
      );
    }

    if (now > promoCode.validUntil) {
      return NextResponse.json(
        { error: 'Platnost tohoto promo kódu vypršela' },
        { status: 400 }
      );
    }

    if (promoCode.maxUses && promoCode.currentUses >= promoCode.maxUses) {
      return NextResponse.json(
        { error: 'Tento promo kód již byl využit maximální počet krát' },
        { status: 400 }
      );
    }

    if (promoCode.minOrderAmount && orderAmount < Number(promoCode.minOrderAmount)) {
      return NextResponse.json(
        { error: `Minimální částka objednávky pro tento kód je ${promoCode.minOrderAmount} Kč` },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (promoCode.discountType === 'PERCENTAGE') {
      discountAmount = Math.round(orderAmount * (Number(promoCode.discountValue) / 100));
    } else if (promoCode.discountType === 'FIXED') {
      discountAmount = Number(promoCode.discountValue);
    }

    return NextResponse.json(
      {
        valid: true,
        discountAmount,
        discountType: promoCode.discountType,
        discountValue: Number(promoCode.discountValue),
        message: `Sleva ${discountAmount} Kč byla použita`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error validating promo code:', error);
    return NextResponse.json(
      { error: 'Došlo k chybě při ověřování promo kódu' },
      { status: 500 }
    );
  }
}
