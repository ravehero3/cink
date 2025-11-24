import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Neplatný formát požadavku' },
        { status: 400 }
      );
    }

    const { email, password, name, phone, civility, newsletterSubscribed } = body;

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

    if (newsletterSubscribed) {
      await prisma.newsletterSubscriber.upsert({
        where: { email },
        update: {},
        create: { email },
      });
    }

    return NextResponse.json(
      { message: 'Registrace byla úspěšná', userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Neznámá chyba';
    console.error('Registration error:', error);
    console.error('Error message:', errorMessage);
    return NextResponse.json(
      { error: 'Došlo k chybě při registraci: ' + errorMessage },
      { status: 500 }
    );
  }
}
