import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rules = await prisma.pricingRule.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error('GET /api/admin/pricing-rules error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    
    const rule = await prisma.pricingRule.create({
      data: {
        name: data.name,
        ruleType: data.ruleType,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minQuantity: data.minQuantity || null,
        minOrderAmount: data.minOrderAmount || null,
        validFrom: new Date(data.validFrom),
        validUntil: new Date(data.validUntil),
        isActive: true,
      },
    });

    return NextResponse.json(rule);
  } catch (error) {
    console.error('POST /api/admin/pricing-rules error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
