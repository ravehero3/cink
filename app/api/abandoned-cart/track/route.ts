import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, items } = await request.json();

    if (!email || !items || items.length === 0) {
      return new NextResponse('Invalid data', { status: 400 });
    }

    // Upsert the abandoned cart for this email
    await prisma.abandonedCart.upsert({
      where: { email },
      update: {
        items,
        lastUpdated: new Date(),
        reminderSent: false, // Reset if they come back and add more
      },
      create: {
        email,
        items,
        reminderSent: false,
      },
    });

    return new NextResponse('OK');
  } catch (error) {
    console.error('Error tracking abandoned cart:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
