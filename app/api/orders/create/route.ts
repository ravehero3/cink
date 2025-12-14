import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, withRetry } from '@/lib/prisma';
import { createPacketaClient, PacketaAPIError } from '@/lib/packeta-api';
import { sendOrderConfirmationEmail } from '@/lib/email';

function generateErrorId(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function logError(errorId: string, message: string, data?: any): void {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [${errorId}] ${message}`, data !== undefined ? JSON.stringify(data, null, 2) : '');
}

function logInfo(message: string, data?: any): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [ORDER-CREATE] ${message}`, data !== undefined ? JSON.stringify(data, null, 2) : '');
}

async function generateOrderNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const yearPrefix = `UFO${year}`;

  const yearStart = new Date(now.getFullYear(), 0, 1);

  logInfo('Generating order number', { yearPrefix, yearStart });

  const yearOrdersCount = await withRetry(() => prisma.order.count({
    where: {
      orderNumber: {
        startsWith: yearPrefix,
      },
      createdAt: {
        gte: yearStart,
      },
    },
  }));

  const sequentialNumber = (yearOrdersCount + 1).toString().padStart(3, '0');
  const orderNumber = `${yearPrefix}${sequentialNumber}`;
  logInfo('Order number generated', { orderNumber, yearOrdersCount });
  return orderNumber;
}

export async function POST(request: NextRequest) {
  const errorId = generateErrorId();
  
  try {
    logInfo('Order creation started', { errorId });
    
    // Step 1: Parse request body
    let body: any;
    try {
      body = await request.json();
      logInfo('Request body parsed', { 
        hasItems: !!body?.items,
        itemCount: body?.items?.length || 0,
        hasEmail: !!body?.customerEmail,
        hasName: !!body?.customerName,
        hasPhone: !!body?.customerPhone,
        shippingMethod: body?.shippingMethod,
        totalPrice: body?.totalPrice,
        totalPriceType: typeof body?.totalPrice
      });
    } catch (parseError) {
      logError(errorId, 'Failed to parse request body', parseError);
      return NextResponse.json(
        { error: 'Neplatná data objednávky', errorId },
        { status: 400 }
      );
    }
    
    // Step 2: Get session (optional - user can checkout without login)
    let session;
    try {
      session = await getServerSession(authOptions);
      logInfo('Session retrieved', { userId: session?.user?.id || 'anonymous' });
    } catch (sessionError) {
      logError(errorId, 'Failed to get session (non-critical)', sessionError);
      session = null;
    }

    const {
      items,
      customerEmail,
      customerName,
      customerPhone,
      shippingMethod,
      zasilkovnaId,
      zasilkovnaName,
      promoCode,
      totalPrice,
    } = body;

    // Step 3: Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      logError(errorId, 'Validation failed: empty cart', { items });
      return NextResponse.json(
        { error: 'Košík je prázdný', errorId },
        { status: 400 }
      );
    }

    // Validate each item has required fields
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.productId || !item.name || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
        logError(errorId, `Validation failed: invalid item at index ${i}`, { item });
        return NextResponse.json(
          { error: 'Neplatná data produktu v košíku', errorId },
          { status: 400 }
        );
      }
    }

    if (!customerEmail || typeof customerEmail !== 'string' || !customerEmail.includes('@')) {
      logError(errorId, 'Validation failed: invalid email', { customerEmail });
      return NextResponse.json(
        { error: 'Vyplňte prosím platný e-mail', errorId },
        { status: 400 }
      );
    }

    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      logError(errorId, 'Validation failed: invalid name', { customerName });
      return NextResponse.json(
        { error: 'Vyplňte prosím platné jméno', errorId },
        { status: 400 }
      );
    }

    if (!customerPhone || typeof customerPhone !== 'string' || customerPhone.length < 9) {
      logError(errorId, 'Validation failed: invalid phone', { customerPhone });
      return NextResponse.json(
        { error: 'Vyplňte prosím platné telefonní číslo', errorId },
        { status: 400 }
      );
    }

    if (shippingMethod === 'zasilkovna' && !zasilkovnaId) {
      logError(errorId, 'Validation failed: missing zasilkovna', { shippingMethod, zasilkovnaId });
      return NextResponse.json(
        { error: 'Vyberte prosím výdejní místo Zásilkovny', errorId },
        { status: 400 }
      );
    }

    // Step 4: Validate and sanitize totalPrice
    const numericTotalPrice = Number(totalPrice);
    if (isNaN(numericTotalPrice) || numericTotalPrice <= 0) {
      logError(errorId, 'Validation failed: invalid totalPrice', { 
        totalPrice, 
        numericTotalPrice, 
        type: typeof totalPrice 
      });
      return NextResponse.json(
        { error: 'Neplatná celková cena. Zkuste obnovit stránku a opakovat objednávku.', errorId },
        { status: 400 }
      );
    }
    
    logInfo('Validation passed', { numericTotalPrice });

    // Step 5: Process promo code (optional)
    let discountAmount = 0;
    if (promoCode) {
      logInfo('Processing promo code', { promoCode });
      try {
        const promo = await withRetry(() => prisma.promoCode.findUnique({
          where: { code: promoCode.toUpperCase() },
        }));

        if (promo && promo.isActive) {
          const now = new Date();
          if (now >= promo.validFrom && now <= promo.validUntil) {
            if (!promo.maxUses || promo.currentUses < promo.maxUses) {
              const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
              
              if (!promo.minOrderAmount || subtotal >= Number(promo.minOrderAmount)) {
                if (promo.discountType === 'PERCENTAGE') {
                  discountAmount = Math.round(subtotal * (Number(promo.discountValue) / 100));
                } else {
                  discountAmount = Number(promo.discountValue);
                }

                await withRetry(() => prisma.promoCode.update({
                  where: { code: promoCode.toUpperCase() },
                  data: { currentUses: promo.currentUses + 1 },
                }));
                logInfo('Promo code applied', { discountAmount });
              }
            }
          }
        } else {
          logInfo('Promo code not found or inactive', { promoCode });
        }
      } catch (promoError) {
        logError(errorId, 'Failed to process promo code (non-critical)', promoError);
      }
    }

    // Step 6: Generate order number
    logInfo('Generating order number...');
    let orderNumber: string;
    try {
      orderNumber = await generateOrderNumber();
    } catch (orderNumError) {
      logError(errorId, 'Failed to generate order number', orderNumError);
      return NextResponse.json(
        { error: 'Chyba při generování čísla objednávky. Zkuste to prosím znovu.', errorId },
        { status: 500 }
      );
    }

    // Step 7: Create order in database
    logInfo('Creating order in database', { orderNumber, numericTotalPrice });
    let order;
    try {
      order = await withRetry(() => prisma.order.create({
        data: {
          orderNumber,
          userId: session?.user?.id || null,
          customerEmail,
          customerName,
          customerPhone,
          items,
          totalPrice: numericTotalPrice,
          shippingMethod,
          zasilkovnaId: zasilkovnaId || null,
          zasilkovnaName: zasilkovnaName || null,
          status: 'PENDING',
          paymentStatus: 'PENDING',
        },
      }));
      logInfo('Order created successfully', { orderId: order.id, orderNumber: order.orderNumber });
    } catch (dbError: any) {
      logError(errorId, 'Database error creating order', {
        message: dbError?.message,
        code: dbError?.code,
        meta: dbError?.meta,
        stack: dbError?.stack
      });
      
      // Provide more specific error messages based on error type
      let userMessage = 'Chyba databáze při vytváření objednávky. Zkuste to prosím znovu.';
      if (dbError?.code === 'P2002') {
        userMessage = 'Objednávka s tímto číslem již existuje. Zkuste to prosím znovu.';
      } else if (dbError?.code === 'P1001' || dbError?.code === 'P1002') {
        userMessage = 'Nepodařilo se připojit k databázi. Zkuste to prosím později.';
      }
      
      return NextResponse.json(
        { error: userMessage, errorId },
        { status: 500 }
      );
    }

    // Step 8: Create Packeta shipment (if using Zásilkovna)
    let packetaPacketId: string | null = null;

    if (shippingMethod === 'zasilkovna' && zasilkovnaId) {
      logInfo('Creating Packeta shipment', { zasilkovnaId, orderNumber });
      try {
        const packetaClient = createPacketaClient();
        
        const totalWeight = items.reduce((sum: number, item: any) => {
          return sum + (item.quantity * 0.5);
        }, 0);

        const packet = await packetaClient.createPacket({
          number: orderNumber,
          name: customerName,
          surname: '',
          email: customerEmail,
          phone: customerPhone,
          addressId: zasilkovnaId,
          value: Number(totalPrice),
          weight: Math.max(totalWeight, 0.5),
          eshop: 'UFOSport',
        });

        packetaPacketId = packet.id;

        await withRetry(() => prisma.order.update({
          where: { id: order.id },
          data: {
            packetaPacketId: packet.id,
            trackingNumber: packet.barcode,
            packetaError: null,
          },
        }));

        logInfo('Packeta packet created', { packetId: packet.id, barcode: packet.barcode });
      } catch (error) {
        let userFriendlyMessage = 'Chyba při komunikaci se Zásilkovnou. Zkuste to prosím znovu.';
        
        if (error instanceof PacketaAPIError) {
          userFriendlyMessage = error.userFriendlyMessage;
          logError(errorId, 'Packeta API error (non-critical)', { 
            technicalMessage: error.message, 
            errorCode: error.errorCode,
            userFriendlyMessage: error.userFriendlyMessage,
            detail: error.detail 
          });
        } else if (error instanceof Error) {
          if (error.message.includes('Packeta API password not configured')) {
            userFriendlyMessage = 'Zásilkovna API heslo není správně nakonfigurováno. Kontaktujte podporu.';
          }
          logError(errorId, 'Packeta error (non-critical)', { message: error.message });
        }

        try {
          await withRetry(() => prisma.order.update({
            where: { id: order.id },
            data: {
              packetaError: userFriendlyMessage,
            },
          }));
        } catch (updateError) {
          logError(errorId, 'Failed to update order with Packeta error', updateError);
        }
      }
    }

    // Step 9: Send order confirmation email
    logInfo('Sending order confirmation email', { customerEmail, orderNumber });
    try {
      await sendOrderConfirmationEmail({
        orderNumber: order.orderNumber,
        customerName,
        customerEmail,
        items: items.map((item: any) => ({
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
        })),
        totalPrice: Number(totalPrice),
        shippingMethod,
        zasilkovnaName: zasilkovnaName || undefined,
      });
      logInfo('Order confirmation email sent', { orderNumber });
    } catch (emailError) {
      logError(errorId, 'Failed to send order confirmation email (non-critical)', emailError);
    }

    // Step 10: Return success response
    logInfo('Order creation completed successfully', { 
      orderId: order.id, 
      orderNumber: order.orderNumber,
      packetaPacketId 
    });

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        securityToken: order.securityToken,
        packetaPacketId,
        message: 'Objednávka byla úspěšně vytvořena',
      },
      { status: 201 }
    );
  } catch (error: any) {
    // Catch-all error handler for unexpected errors
    logError(errorId, 'Unexpected error in order creation', {
      type: error?.constructor?.name,
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack
    });
    
    return NextResponse.json(
      { 
        error: 'Došlo k neočekávané chybě při vytváření objednávky. Zkuste to prosím znovu.',
        errorId
      },
      { status: 500 }
    );
  }
}
