import { NextRequest, NextResponse } from 'next/server';
import { validatePromoCode } from '@/lib/promo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, orderAmount, email } = body;

    if (!code) {
      return NextResponse.json({ error: 'Promo kód je povinný' }, { status: 400 });
    }

    if (!orderAmount || orderAmount <= 0) {
      return NextResponse.json({ error: 'Neplatná částka objednávky' }, { status: 400 });
    }

    const result = await validatePromoCode(code, orderAmount, email);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(
      {
        valid: true,
        discountAmount: result.discountAmount,
        discountType: result.discountType,
        discountValue: result.discountValue,
        message: `Sleva ${result.discountAmount} Kč byla použita`,
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
