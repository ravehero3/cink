import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const getBaseUrl = () => {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.REPLIT_DEV_DOMAIN) return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  return 'http://localhost:5000';
};

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'E-mail je povinný' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      return NextResponse.json(
        { message: 'Pokud e-mail existuje v našem systému, obdržíte odkaz pro obnovení hesla.' },
        { status: 200 }
      );
    }

    // Generate reset token (32 random bytes, hex encoded)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Save token to database
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Create reset link
    const resetLink = `${getBaseUrl()}/obnovit-heslo?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Send password reset email
    console.log('🔵 FORGOT PASSWORD - Sending to:', email);
    console.log('🔵 FORGOT PASSWORD - Reset link:', resetLink);
    
    try {
      const result = await sendPasswordResetEmail(email, resetLink);
      if (result.success) {
        console.log('✅ Password reset email sent successfully');
      } else {
        console.error('🔴 Failed to send password reset email:', result.error);
      }
    } catch (emailError) {
      console.error('🔴 FORGOT PASSWORD EMAIL ERROR:', emailError);
    }

    return NextResponse.json(
      { message: 'Pokud e-mail existuje v našem systému, obdržíte odkaz pro obnovení hesla.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Došlo k chybě. Zkuste to prosím znovu.' },
      { status: 500 }
    );
  }
}
