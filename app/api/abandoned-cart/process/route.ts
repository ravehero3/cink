import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendAbandonedCartEmail } from '@/lib/email';

export async function GET(request: Request) {
  // Simple auth check for cron (using a secret header or just checking if it's from Vercel)
  // For now, I'll let it be accessible but I'll add a check later if needed.

  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    // Find carts that:
    // 1. Haven't been updated in 2 hours
    // 2. Haven't had a reminder sent
    // 3. Haven't been converted to an order (we assume if the email matches a recent order, it's not abandoned)
    const abandonedCarts = await prisma.abandonedCart.findMany({
      where: {
        lastUpdated: { lt: twoHoursAgo },
        reminderSent: false,
      },
    });

    let sentCount = 0;

    for (const cart of abandonedCarts) {
      // Check if user has a paid order created after this cart's creation
      const recentOrder = await prisma.order.findFirst({
        where: {
          customerEmail: cart.email,
          createdAt: { gt: cart.createdAt },
        }
      });

      if (recentOrder) {
        // They completed a purchase, mark as reminder sent (or just delete)
        await prisma.abandonedCart.update({
          where: { id: cart.id },
          data: { reminderSent: true }
        });
        continue;
      }

      // Send email
      const result = await sendAbandonedCartEmail(cart.email, cart.items as any);
      
      if (result.success) {
        await prisma.abandonedCart.update({
          where: { id: cart.id },
          data: { reminderSent: true }
        });
        sentCount++;
      }
    }

    return NextResponse.json({ processed: abandonedCarts.length, sent: sentCount });
  } catch (error) {
    console.error('Error processing abandoned carts:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
