import { NextRequest, NextResponse } from 'next/server';
import { validatePromoCode } from '@/lib/promo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, orderAmount, email, preview } = body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json({ error: 'Promo kód je povinný' }, { status: 400 });
    }

    const numericOrderAmount = Number(orderAmount);
    if (!numericOrderAmount || numericOrderAmount <= 0 || isNaN(numericOrderAmount)) {
      return NextResponse.json({ error: 'Neplatná částka objednávky' }, { status: 400 });
    }

    const result = await validatePromoCode(code, numericOrderAmount, email, {
      allowDeferredEmailCheck: Boolean(preview),
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(
      {
        valid: true,
        code: result.promo.code,
        discountAmount: result.discountAmount,
        discountType: result.discountType,
        discountValue: result.discountValue,
        requiresEmailVerification: result.requiresEmailVerification,
        message: result.requiresEmailVerification
          ? `Sleva ${result.discountAmount} Kč bude ověřena po zadání e-mailu v pokladně`
          : `Sleva ${result.discountAmount} Kč byla použita`,
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
