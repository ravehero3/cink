import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function generateErrorId(): string {
  return `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function logError(errorId: string, message: string, data?: any): void {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [${errorId}] ${message}`, data !== undefined ? JSON.stringify(data, null, 2) : '');
}

function logInfo(message: string, data?: any): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [GOPAY-PAYMENT] ${message}`, data !== undefined ? JSON.stringify(data, null, 2) : '');
}

export async function POST(request: NextRequest) {
  const errorId = generateErrorId();
  
  try {
    logInfo('GoPay payment creation started', { errorId });
    
    let body: any;
    try {
      body = await request.json();
      logInfo('Request body parsed', {
        orderNumber: body?.orderNumber,
        amount: body?.amount,
        amountType: typeof body?.amount,
        hasItems: !!body?.items,
        itemCount: body?.items?.length || 0
      });
    } catch (parseError) {
      logError(errorId, 'Failed to parse request body', parseError);
      return NextResponse.json(
        { error: 'Neplatná data platby', errorId },
        { status: 400 }
      );
    }
    
    const { orderNumber, amount, customerName, customerEmail, customerPhone, items } = body;

    // Validate required fields
    if (!orderNumber || typeof orderNumber !== 'string') {
      logError(errorId, 'Missing or invalid orderNumber', { orderNumber });
      return NextResponse.json(
        { error: 'Chybí číslo objednávky', errorId },
        { status: 400 }
      );
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      logError(errorId, 'Invalid amount', { amount, numericAmount });
      return NextResponse.json(
        { error: 'Neplatná částka platby', errorId },
        { status: 400 }
      );
    }

    if (!process.env.GOPAY_GOID || !process.env.GOPAY_CLIENT_ID || !process.env.GOPAY_CLIENT_SECRET) {
      logError(errorId, 'GoPay not configured', {
        hasGoId: !!process.env.GOPAY_GOID,
        hasClientId: !!process.env.GOPAY_CLIENT_ID,
        hasClientSecret: !!process.env.GOPAY_CLIENT_SECRET
      });
      return NextResponse.json(
        { error: 'Platební brána není nakonfigurována. Kontaktujte podporu.', errorId },
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

    logInfo('GoPay configuration', { 
      baseUrl, 
      isProduction, 
      gopayBaseUrl,
      goId: process.env.GOPAY_GOID?.substring(0, 4) + '...'
    });

    const auth = Buffer.from(`${process.env.GOPAY_CLIENT_ID}:${process.env.GOPAY_CLIENT_SECRET}`).toString('base64');

    // Step 1: Get OAuth token
    logInfo('Fetching GoPay OAuth token...');
    let tokenResponse;
    try {
      tokenResponse = await fetch(`${gopayBaseUrl}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials&scope=payment-all',
      });
    } catch (fetchError) {
      logError(errorId, 'Failed to fetch OAuth token (network error)', fetchError);
      return NextResponse.json(
        { error: 'Nepodařilo se připojit k platební bráně. Zkuste to prosím později.', errorId },
        { status: 500 }
      );
    }

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();
      logError(errorId, 'GoPay OAuth error', {
        status: tokenResponse.status,
        response: tokenError,
        environment: process.env.GOPAY_ENVIRONMENT,
        gopayUrl: gopayBaseUrl
      });
      return NextResponse.json(
        { error: 'Chyba autorizace platební brány. Zkuste to prosím později.', errorId },
        { status: 500 }
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;
    
    if (!access_token) {
      logError(errorId, 'No access token in response', { tokenData });
      return NextResponse.json(
        { error: 'Neplatná odpověď z platební brány.', errorId },
        { status: 500 }
      );
    }
    
    logInfo('OAuth token obtained successfully');

    // Step 2: Prepare payment data
    const [firstName, ...lastNameParts] = (customerName || '').split(' ');
    const lastName = lastNameParts.join(' ') || firstName || 'Customer';

    const paymentData = {
      payer: {
        contact: {
          first_name: firstName || 'Customer',
          last_name: lastName,
          email: customerEmail || '',
          phone_number: customerPhone || '',
        },
      },
      target: {
        type: 'ACCOUNT',
        goid: parseInt(process.env.GOPAY_GOID!),
      },
      amount: Math.round(numericAmount * 100),
      currency: 'CZK',
      order_number: orderNumber,
      order_description: `Objednávka ${orderNumber}`,
      items: (items || []).map((item: any) => ({
        type: 'ITEM',
        name: `${item.name || 'Produkt'}${item.size ? ` (${item.size})` : ''}`,
        amount: Math.round((Number(item.price) || 0) * 100),
        count: Number(item.quantity) || 1,
      })),
      callback: {
        return_url: `${baseUrl}/potvrzeni/${orderNumber}`,
        notification_url: `${baseUrl}/api/gopay/webhook`,
      },
      lang: 'CS',
    };

    logInfo('Creating GoPay payment', { 
      orderNumber, 
      amount: paymentData.amount,
      itemCount: paymentData.items.length,
      returnUrl: paymentData.callback.return_url
    });

    // Step 3: Create payment
    let paymentResponse;
    try {
      paymentResponse = await fetch(`${gopayBaseUrl}/payments/payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
    } catch (fetchError) {
      logError(errorId, 'Failed to create payment (network error)', fetchError);
      return NextResponse.json(
        { error: 'Nepodařilo se vytvořit platbu. Zkuste to prosím později.', errorId },
        { status: 500 }
      );
    }

    if (!paymentResponse.ok) {
      let errorData;
      try {
        errorData = await paymentResponse.json();
      } catch {
        errorData = await paymentResponse.text();
      }
      logError(errorId, 'GoPay payment creation failed', {
        status: paymentResponse.status,
        response: errorData,
        requestData: {
          orderNumber: paymentData.order_number,
          amount: paymentData.amount,
          itemCount: paymentData.items.length
        }
      });
      return NextResponse.json(
        { error: 'Nepodařilo se vytvořit platbu v platební bráně. Zkuste to prosím znovu.', errorId },
        { status: 500 }
      );
    }

    const payment = await paymentResponse.json();
    
    if (!payment.gw_url) {
      logError(errorId, 'No gateway URL in payment response', { payment });
      return NextResponse.json(
        { error: 'Neplatná odpověď z platební brány.', errorId },
        { status: 500 }
      );
    }

    logInfo('Payment created successfully', { 
      paymentId: payment.id, 
      gatewayUrl: payment.gw_url?.substring(0, 50) + '...'
    });

    try {
      await prisma.order.update({
        where: { orderNumber },
        data: { paymentId: String(payment.id) },
      });
      logInfo('Payment ID saved to order', { orderNumber, paymentId: payment.id });
    } catch (dbError) {
      logError(errorId, 'Failed to save payment ID to order (non-critical)', dbError);
    }

    return NextResponse.json({
      paymentId: payment.id,
      gatewayUrl: payment.gw_url,
    });
  } catch (error: any) {
    logError(errorId, 'Unexpected error in payment creation', {
      type: error?.constructor?.name,
      message: error?.message,
      stack: error?.stack
    });
    return NextResponse.json(
      { error: 'Došlo k neočekávané chybě. Zkuste to prosím znovu.', errorId },
      { status: 500 }
    );
  }
}
