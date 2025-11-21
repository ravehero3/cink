import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nemáte oprávnění k aktualizaci promo kódu' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxUses,
      validFrom,
      validUntil,
      isActive,
    } = body;

    const existingPromoCode = await prisma.promoCode.findUnique({
      where: { id: params.id },
    });

    if (!existingPromoCode) {
      return NextResponse.json(
        { error: 'Promo kód nebyl nalezen' },
        { status: 404 }
      );
    }

    if (discountType && !['PERCENTAGE', 'FIXED'].includes(discountType)) {
      return NextResponse.json(
        { error: 'Neplatný typ slevy' },
        { status: 400 }
      );
    }

    if (discountValue !== undefined && discountValue <= 0) {
      return NextResponse.json(
        { error: 'Hodnota slevy musí být větší než 0' },
        { status: 400 }
      );
    }

    if (discountType === 'PERCENTAGE' && discountValue > 100) {
      return NextResponse.json(
        { error: 'Procentuální sleva nesmí být větší než 100%' },
        { status: 400 }
      );
    }

    if (code && code !== existingPromoCode.code) {
      const codeExists = await prisma.promoCode.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: 'Promo kód s tímto názvem již existuje' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (code) updateData.code = code.toUpperCase();
    if (discountType) updateData.discountType = discountType;
    if (discountValue !== undefined) updateData.discountValue = Number(discountValue);
    if (minOrderAmount !== undefined) updateData.minOrderAmount = minOrderAmount ? Number(minOrderAmount) : null;
    if (maxUses !== undefined) updateData.maxUses = maxUses ? Number(maxUses) : null;
    if (validFrom) updateData.validFrom = new Date(validFrom);
    if (validUntil) updateData.validUntil = new Date(validUntil);
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedPromoCode = await prisma.promoCode.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(
      {
        success: true,
        promoCode: updatedPromoCode,
        message: 'Promo kód byl úspěšně aktualizován',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating promo code:', error);
    return NextResponse.json(
      { error: 'Došlo k chybě při aktualizaci promo kódu' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nemáte oprávnění k odstranění promo kódu' },
        { status: 403 }
      );
    }

    const promoCode = await prisma.promoCode.findUnique({
      where: { id: params.id },
    });

    if (!promoCode) {
      return NextResponse.json(
        { error: 'Promo kód nebyl nalezen' },
        { status: 404 }
      );
    }

    await prisma.promoCode.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Promo kód byl úspěšně odstraněn',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting promo code:', error);
    return NextResponse.json(
      { error: 'Došlo k chybě při odstraňování promo kódu' },
      { status: 500 }
    );
  }
}
