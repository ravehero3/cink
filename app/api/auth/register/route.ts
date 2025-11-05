import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { email, password, name, phone, civility, newsletterSubscribed } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-mail a heslo jsou povinné' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Uživatel s tímto e-mailem již existuje' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        phone: phone || null,
        civility: civility || null,
        newsletterSubscribed: newsletterSubscribed || false,
      },
    });

    if (newsletterSubscribed && civility) {
      await prisma.newsletterSubscriber.upsert({
        where: { email },
        update: { civility },
        create: { email, civility },
      });
    }

    return NextResponse.json(
      { message: 'Registrace byla úspěšná', userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Došlo k chybě při registraci' },
      { status: 500 }
    );
  }
}
