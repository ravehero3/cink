import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { prisma } from '@/lib/prisma';
import { InvoiceDocument } from '@/lib/generate-invoice';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Objednávka nebyla nalezena' },
        { status: 404 }
      );
    }

    const items = order.items as any[];
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = 79;

    const invoiceData = {
      orderNumber: order.orderNumber,
      orderDate: new Date(order.createdAt).toLocaleDateString('cs-CZ'),
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      shippingMethod: order.shippingMethod,
      zasilkovnaName: order.zasilkovnaName || undefined,
      items: items.map(item => ({
        name: item.name,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal,
      shipping: shippingCost,
      total: Number(order.totalPrice),
      paymentStatus: order.paymentStatus,
    };

    const pdfBuffer = await renderToBuffer(
      InvoiceDocument({ data: invoiceData })
    );

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="faktura-${order.orderNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { error: 'Došlo k chybě při generování faktury' },
      { status: 500 }
    );
  }
}
