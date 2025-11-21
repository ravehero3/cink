import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createPacketaClient, PacketaAPIError } from '@/lib/packeta-api';

async function generateOrderNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const datePrefix = `UFO${year}${month}${day}`;

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const todayOrdersCount = await prisma.order.count({
    where: {
      orderNumber: {
        startsWith: datePrefix,
      },
      createdAt: {
        gte: todayStart,
        lt: todayEnd,
      },
    },
  });

  const sequentialNumber = (todayOrdersCount + 1).toString().padStart(3, '0');
  return `${datePrefix}${sequentialNumber}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

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

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Košík je prázdný' },
        { status: 400 }
      );
    }

    if (!customerEmail || !customerName || !customerPhone) {
      return NextResponse.json(
        { error: 'Vyplňte prosím všechny povinné údaje' },
        { status: 400 }
      );
    }

    if (shippingMethod === 'zasilkovna' && !zasilkovnaId) {
      return NextResponse.json(
        { error: 'Vyberte prosím výdejní místo Zásilkovny' },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (promoCode) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: promoCode.toUpperCase() },
      });

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

              await prisma.promoCode.update({
                where: { code: promoCode.toUpperCase() },
                data: { currentUses: promo.currentUses + 1 },
              });
            }
          }
        }
      }
    }

    const orderNumber = await generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session?.user?.id || null,
        customerEmail,
        customerName,
        customerPhone,
        items,
        totalPrice: Number(totalPrice),
        shippingMethod,
        zasilkovnaId: zasilkovnaId || null,
        zasilkovnaName: zasilkovnaName || null,
        status: 'PENDING',
        paymentStatus: 'PENDING',
      },
    });

    let packetaPacketId: string | null = null;

    if (shippingMethod === 'zasilkovna' && zasilkovnaId) {
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

        await prisma.order.update({
          where: { id: order.id },
          data: {
            packetaPacketId: packet.id,
            trackingNumber: packet.barcode,
            packetaError: null,
          },
        });

        console.log(`Created Packeta packet ${packet.id} for order ${orderNumber}`);
      } catch (error) {
        console.error('Failed to create Packeta packet:', error);
        
        let errorMessage = 'Unknown error';
        if (error instanceof PacketaAPIError) {
          errorMessage = error.message;
          console.error('Packeta API Error details:', error.detail);
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        await prisma.order.update({
          where: { id: order.id },
          data: {
            packetaError: errorMessage,
          },
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        packetaPacketId,
        message: 'Objednávka byla úspěšně vytvořena',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Došlo k chybě při vytváření objednávky' },
      { status: 500 }
    );
  }
}
