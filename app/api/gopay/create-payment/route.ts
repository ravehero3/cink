import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderNumber, amount, customerName, customerEmail, customerPhone, items } = body;

    if (!process.env.GOPAY_GOID || !process.env.GOPAY_CLIENT_ID || !process.env.GOPAY_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'GoPay not configured. Please set environment variables.' },
        { status: 500 }
      );
    }

    const host = request.headers.get('host') || '';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = process.env.NEXTAUTH_URL || `${protocol}://${host}`;
    const isProduction = process.env.GOPAY_ENVIRONMENT === 'production';
    const gopayBaseUrl = isProduction 
      ? 'https://gate.gopay.cz/api'
      : 'https://gw.sandbox.gopay.com/api';

    const auth = Buffer.from(`${process.env.GOPAY_CLIENT_ID}:${process.env.GOPAY_CLIENT_SECRET}`).toString('base64');

    const tokenResponse = await fetch(`${gopayBaseUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&scope=payment-all',
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get GoPay access token');
    }

    const { access_token } = await tokenResponse.json();

    const [firstName, ...lastNameParts] = customerName.split(' ');
    const lastName = lastNameParts.join(' ') || firstName;

    const paymentData = {
      payer: {
        contact: {
          first_name: firstName,
          last_name: lastName,
          email: customerEmail,
          phone_number: customerPhone,
        },
      },
      target: {
        type: 'ACCOUNT',
        goid: parseInt(process.env.GOPAY_GOID),
      },
      amount: Math.round(amount * 100),
      currency: 'CZK',
      order_number: orderNumber,
      order_description: `Objednávka ${orderNumber}`,
      items: items.map((item: any) => ({
        type: 'ITEM',
        name: `${item.name} (${item.size})`,
        amount: Math.round(item.price * 100),
        count: item.quantity,
      })),
      callback: {
        return_url: `${baseUrl}/potvrzeni/${orderNumber}`,
        notification_url: `${baseUrl}/api/gopay/webhook`,
      },
      lang: 'CS',
    };

    const paymentResponse = await fetch(`${gopayBaseUrl}/payments/payment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!paymentResponse.ok) {
      const errorData = await paymentResponse.json();
      console.error('GoPay payment creation error - Status:', paymentResponse.status);
      console.error('GoPay payment creation error - Response:', JSON.stringify(errorData, null, 2));
      console.error('GoPay payment creation error - Request data was:', JSON.stringify(paymentData, null, 2));
      throw new Error(`GoPay error (${paymentResponse.status}): ${JSON.stringify(errorData)}`);
    }

    const payment = await paymentResponse.json();

    return NextResponse.json({
      paymentId: payment.id,
      gatewayUrl: payment.gw_url,
    });
  } catch (error) {
    console.error('GoPay create payment error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment. Please try again.' },
      { status: 500 }
    );
  }
}
