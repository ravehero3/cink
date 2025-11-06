import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id: paymentId, state, order_number } = body;

    if (!order_number || !state) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: order_number },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    let newPaymentStatus = order.paymentStatus;
    let newOrderStatus = order.status;

    switch (state) {
      case 'PAID':
        newPaymentStatus = 'PAID';
        newOrderStatus = 'PAID';
        break;
      case 'CANCELED':
      case 'TIMEOUTED':
        newPaymentStatus = 'FAILED';
        newOrderStatus = 'CANCELLED';
        break;
      case 'REFUNDED':
        newPaymentStatus = 'REFUNDED';
        break;
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: newPaymentStatus,
        status: newOrderStatus,
        paymentId: paymentId || order.paymentId,
        gopayData: body,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('GoPay webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
