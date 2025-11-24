import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'E-mail je povinný' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Neplatný formát e-mailu' },
        { status: 400 }
      );
    }

    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingSubscriber) {
      return NextResponse.json(
        { message: 'Tento e-mail je již přihlášen k odběru newsletteru' },
        { status: 200 }
      );
    }

    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email: email.toLowerCase(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Úspěšně jste se přihlásili k odběru newsletteru',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return NextResponse.json(
      { error: 'Došlo k chybě při přihlášení k newsletteru' },
      { status: 500 }
    );
  }
}
