import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { createPacketaClient, PacketaAPIError } from '@/lib/packeta-api';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.shippingMethod !== 'zasilkovna' || !order.zasilkovnaId) {
      return NextResponse.json(
        { error: 'Order is not using Zásilkovna delivery' },
        { status: 400 }
      );
    }

    if (order.packetaPacketId) {
      return NextResponse.json(
        { error: 'Packeta packet already created' },
        { status: 400 }
      );
    }

    try {
      const packetaClient = createPacketaClient();

      const items = Array.isArray(order.items) ? order.items : [];
      const totalWeight = items.reduce((sum: number, item: any) => {
        return sum + ((item.quantity || 1) * 0.5);
      }, 0);

      const packet = await packetaClient.createPacket({
        number: order.orderNumber,
        name: order.customerName,
        surname: '',
        email: order.customerEmail,
        phone: order.customerPhone,
        addressId: order.zasilkovnaId,
        value: Number(order.totalPrice),
        weight: Math.max(totalWeight, 0.5),
        eshop: 'UFOSport',
      });

      await prisma.order.update({
        where: { id: order.id },
        data: {
          packetaPacketId: packet.id,
          trackingNumber: packet.barcode,
          packetaError: null,
        },
      });

      return NextResponse.json({
        success: true,
        packetId: packet.id,
        barcode: packet.barcode,
      });
    } catch (error) {
      console.error('Failed to create Packeta packet:', error);

      let errorMessage = 'Unknown error';
      if (error instanceof PacketaAPIError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      await prisma.order.update({
        where: { id: order.id },
        data: {
          packetaError: errorMessage,
        },
      });

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in create packet route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
