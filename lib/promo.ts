import { prisma, withRetry } from './prisma';

export interface ValidatePromoOptions {
  /** Allow previewing discount when customer hasn't entered an email yet (e.g. cart page) */
  allowDeferredEmailCheck?: boolean;
}

export async function validatePromoCode(
  code: string,
  orderAmount: number,
  customerEmail?: string,
  options?: ValidatePromoOptions
) {
  const cleanCode = code.trim().toUpperCase();
  const cleanEmail = customerEmail?.trim().toLowerCase() || '';

  if (!cleanCode) {
    return { ok: false as const, error: 'Promo kód je povinný', status: 400 };
  }

  const promoCode = await withRetry(() =>
    prisma.promoCode.findUnique({
      where: { code: cleanCode },
    })
  );

  if (!promoCode) {
    return { ok: false as const, error: 'Promo kód nebyl nalezen', status: 404 };
  }

  if (!promoCode.isActive) {
    return { ok: false as const, error: 'Tento promo kód není aktivní', status: 400 };
  }

  const now = new Date();
  if (now < promoCode.validFrom) {
    return { ok: false as const, error: 'Tento promo kód ještě není platný', status: 400 };
  }

  if (now > promoCode.validUntil) {
    return { ok: false as const, error: 'Platnost tohoto promo kódu vypršela', status: 400 };
  }

  if (promoCode.maxUses && promoCode.currentUses >= promoCode.maxUses) {
    return { ok: false as const, error: 'Tento promo kód již byl využit maximální počet krát', status: 400 };
  }

  if (promoCode.minOrderAmount && orderAmount < Number(promoCode.minOrderAmount)) {
    return {
      ok: false as const,
      error: `Minimální částka objednávky pro tento kód je ${promoCode.minOrderAmount} Kč`,
      status: 400,
    };
  }

  let requiresEmailVerification = false;
  if (promoCode.assignedEmail) {
    if (!cleanEmail) {
      if (options?.allowDeferredEmailCheck) {
        requiresEmailVerification = true;
      } else {
        return {
          ok: false as const,
          error: 'Tento kód je vázaný na konkrétní e-mail. Zadejte prosím e-mail v pokladně.',
          status: 400,
        };
      }
    } else if (promoCode.assignedEmail.trim().toLowerCase() !== cleanEmail) {
      return {
        ok: false as const,
        error: 'Tento slevový kód je určený jen pro váš e-mail z nabídky.',
        status: 400,
      };
    }
  }

  let discountAmount = 0;
  if (promoCode.discountType === 'PERCENTAGE' || promoCode.discountType === 'percentage') {
    discountAmount = Math.round(orderAmount * (Number(promoCode.discountValue) / 100));
  } else {
    discountAmount = Math.round(Number(promoCode.discountValue));
  }
  discountAmount = Math.min(Math.round(orderAmount), Math.max(0, discountAmount));

  return {
    ok: true as const,
    promo: promoCode,
    discountAmount,
    discountType: promoCode.discountType,
    discountValue: Number(promoCode.discountValue),
    requiresEmailVerification,
  };
}
