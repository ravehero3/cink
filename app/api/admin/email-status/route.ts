import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hasApiKey = !!process.env.RESEND_API_KEY;
  const fromEmail = 'noreply@ufosport.cz';
  const websiteUrl = process.env.NEXTAUTH_URL || 'https://www.ufosport.cz';

  return NextResponse.json({
    hasApiKey,
    fromEmail,
    websiteUrl,
    configured: hasApiKey,
  });
}
