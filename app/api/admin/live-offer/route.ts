import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const offer = await prisma.liveOffer.findFirst();
    return NextResponse.json(offer || { isActive: false });
  } catch (error) {
    console.error('Error fetching live offer:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const offer = await prisma.liveOffer.findFirst();

    let result;
    if (offer) {
      result = await prisma.liveOffer.update({
        where: { id: offer.id },
        data: body,
      });
    } else {
      result = await prisma.liveOffer.create({
        data: body,
      });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating live offer:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
