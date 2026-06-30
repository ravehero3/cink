import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { makeTokenForEmail } from '@/lib/newsletter';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  const base = process.env.NEXTAUTH_URL || 'https://www.ufosport.cz';

  if (!email || !token || token !== makeTokenForEmail(email)) {
    return NextResponse.redirect(`${base}/odhlasit?chyba=1`);
  }

  try {
    await prisma.newsletterSubscriber.deleteMany({ where: { email: email.toLowerCase() } });
    await prisma.user.updateMany({
      where: { email: email.toLowerCase() },
      data: { newsletterSubscribed: false },
    });
  } catch {
    // Subscriber may not exist — still redirect to success
  }

  return NextResponse.redirect(`${base}/odhlasit`);
}
