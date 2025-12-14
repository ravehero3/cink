import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getGopayAccessToken(gopayBaseUrl: string): Promise<string | null> {
  const auth = Buffer.from(`${process.env.GOPAY_CLIENT_ID}:${process.env.GOPAY_CLIENT_SECRET}`).toString('base64');
  
  try {
    const tokenResponse = await fetch(`${gopayBaseUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&scope=payment-all',
    });

    if (!tokenResponse.ok) {
      console.error('GoPay OAuth error:', await tokenResponse.text());
      return null;
    }

    const tokenData = await tokenResponse.json();
    return tokenData.access_token || null;
  } catch (error) {
    console.error('Failed to get GoPay access token:', error);
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!order) {
      return NextResponse.json({ error: 'Objednávka nenalezena' }, { status: 404 });
    }

    if (!order.paymentId) {
      return NextResponse.json(
        { error: 'Objednávka nemá přiřazené ID platby v GoPay' },
        { status: 400 }
      );
    }

    if (!process.env.GOPAY_CLIENT_ID || !process.env.GOPAY_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'GoPay není nakonfigurováno' },
        { status: 500 }
      );
    }

    const isProduction = process.env.GOPAY_ENVIRONMENT === 'production';
    const gopayBaseUrl = isProduction
      ? 'https://gate.gopay.cz/api'
      : 'https://gw.sandbox.gopay.com/api';

    const accessToken = await getGopayAccessToken(gopayBaseUrl);
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Nepodařilo se autorizovat u GoPay' },
        { status: 500 }
      );
    }

    const statusResponse = await fetch(`${gopayBaseUrl}/payments/payment/${order.paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error('GoPay status check failed:', statusResponse.status, errorText);
      return NextResponse.json(
        { error: 'Nepodařilo se získat status platby z GoPay' },
        { status: 500 }
      );
    }

    const paymentData = await statusResponse.json();
    const gopayState = paymentData.state;

    let newPaymentStatus = order.paymentStatus;
    let newOrderStatus = order.status;

    switch (gopayState) {
      case 'PAID':
        newPaymentStatus = 'PAID';
        if (order.status === 'PENDING') {
          newOrderStatus = 'PAID';
        }
        break;
      case 'CANCELED':
      case 'TIMEOUTED':
        newPaymentStatus = 'FAILED';
        if (order.status === 'PENDING') {
          newOrderStatus = 'CANCELLED';
        }
        break;
      case 'REFUNDED':
        newPaymentStatus = 'REFUNDED';
        break;
      case 'CREATED':
      case 'PAYMENT_METHOD_CHOSEN':
        newPaymentStatus = 'PENDING';
        break;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        paymentStatus: newPaymentStatus,
        status: newOrderStatus,
        gopayData: paymentData,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      gopayState,
      paymentStatus: updatedOrder.paymentStatus,
      orderStatus: updatedOrder.status,
      message: `Status platby aktualizován: ${gopayState}`,
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      { error: 'Došlo k chybě při kontrole stavu platby' },
      { status: 500 }
    );
  }
}
