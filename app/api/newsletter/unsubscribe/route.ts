import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function makeToken(email: string) {
  const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret';
  return createHash('sha256').update(email.toLowerCase() + secret).digest('hex').slice(0, 32);
}

export function buildUnsubscribeUrl(email: string): string {
  const base = process.env.NEXTAUTH_URL || 'https://www.ufosport.cz';
  const token = makeToken(email);
  return `${base}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  const base = process.env.NEXTAUTH_URL || 'https://www.ufosport.cz';

  if (!email || !token || token !== makeToken(email)) {
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
