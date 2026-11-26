import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma, withRetry } from '@/lib/prisma';

const SAFE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateRandomCode(): string {
  const bytes = randomBytes(6);
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += SAFE_CHARS[bytes[i] % SAFE_CHARS.length];
  }
  return `UFO${suffix}`;
}

async function allocateUniqueCode(preferredCode?: string): Promise<string> {
  const now = new Date();
  if (preferredCode) {
    const clean = preferredCode.trim().toUpperCase();
    if (/^[A-Z0-9_-]{4,24}$/.test(clean)) {
      const existing = await withRetry(() =>
        prisma.promoCode.findUnique({ where: { code: clean } })
      );
      if (!existing) {
        return clean;
      }
      // Only reuse if unused and already expired; never hijack an active/used code
      if (
        existing.currentUses === 0 &&
        !existing.assignedEmail &&
        existing.validUntil <= now
      ) {
        return clean;
      }
    }
  }

  for (let i = 0; i < 12; i++) {
    const candidate = generateRandomCode();
    const existing = await withRetry(() =>
      prisma.promoCode.findUnique({ where: { code: candidate } })
    );
    if (!existing) return candidate;
  }

  return `UFO${Date.now().toString(36).toUpperCase()}`;
}

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code')?.trim().toUpperCase();
    if (!code) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const promo = await withRetry(() =>
      prisma.promoCode.findUnique({ where: { code } })
    );

    if (!promo) {
      return NextResponse.json({ exists: false, valid: false });
    }

    const now = new Date();
    const isValid =
      promo.isActive &&
      promo.validFrom <= now &&
      promo.validUntil > now &&
      (!promo.maxUses || promo.currentUses < promo.maxUses);

    return NextResponse.json({
      exists: true,
      valid: isValid,
      used: Boolean(promo.maxUses && promo.currentUses >= promo.maxUses),
      validUntil: promo.validUntil.toISOString(),
      discountValue: Number(promo.discountValue),
    });
  } catch (error) {
    console.error('Error checking temporary promo code:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const discountValue = Number(body?.discountValue);
    const durationMin = Math.max(1, Math.min(10080, Number(body?.durationMin) || 45));
    const preferredCode = typeof body?.code === 'string' ? body.code : undefined;

    if (!discountValue || isNaN(discountValue) || discountValue <= 0 || discountValue > 100) {
      return NextResponse.json({ error: 'Invalid discount data' }, { status: 400 });
    }

    const code = await allocateUniqueCode(preferredCode);
    const now = new Date();
    const validUntil = new Date(now.getTime() + durationMin * 60 * 1000);

    const promo = await withRetry(() =>
      prisma.promoCode.upsert({
        where: { code },
        update: {
          discountType: 'PERCENTAGE',
          discountValue,
          validFrom: now,
          validUntil,
          isActive: true,
          maxUses: 1,
          currentUses: 0,
          minOrderAmount: 0,
          source: 'live-offer',
        },
        create: {
          code,
          discountType: 'PERCENTAGE',
          discountValue,
          validFrom: now,
          validUntil,
          isActive: true,
          maxUses: 1,
          currentUses: 0,
          minOrderAmount: 0,
          source: 'live-offer',
        },
      })
    );

    return NextResponse.json({
      ok: true,
      code: promo.code,
      validUntil: promo.validUntil.toISOString(),
      discountValue: Number(promo.discountValue),
    });
  } catch (error) {
    console.error('Error creating temporary promo code:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
