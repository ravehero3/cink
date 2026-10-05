import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { sendPaymentSuccessEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

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

    const order = await withRetry(() => prisma.order.findUnique({
      where: { orderNumber: order_number },
    }));

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

    await withRetry(() => prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: newPaymentStatus,
        status: newOrderStatus,
        paymentId: paymentId || order.paymentId,
        gopayData: body,
        updatedAt: new Date(),
      },
    }));

    // Send payment success email when payment is confirmed
    if (state === 'PAID') {
      try {
        const items = (order.items as any[]) || [];
        await sendPaymentSuccessEmail({
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          items: items.map((item: any) => ({
            name: item.name,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
            slug: item.slug,
          })),
          totalPrice: Number(order.totalPrice),
          shippingMethod: order.shippingMethod,
          zasilkovnaName: order.zasilkovnaName || undefined,
        });
        try {
          const { enrollInTrigger, cancelTriggerEnrollments } = await import('@/lib/journeys');
          await cancelTriggerEnrollments('CART_ABANDONED', order.customerEmail);
          await cancelTriggerEnrollments('ORDER_CREATED', order.customerEmail);
          await enrollInTrigger('ORDER_PAID', order.customerEmail, {
            orderNumber: order.orderNumber,
            items,
            totalPrice: Number(order.totalPrice),
          }, order.customerName);
        } catch (journeyError) {
          console.error('Failed to enroll post-purchase journey:', journeyError);
        }
        console.log(`Payment success email sent for order ${order.orderNumber}`);
      } catch (emailError) {
        console.error('Failed to send payment success email:', emailError);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('GoPay webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
