import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Send email
    try {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Obnovení hesla - UFO Sport',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Obnovení hesla</h2>
            <p>Obdrželi jsme požadavek na obnovení vašeho hesla.</p>
            <p>Klikněte na odkaz níže pro obnovení hesla (odkaz je platný 1 hodinu):</p>
            <a href="${resetLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Obnovit heslo</a>
            <p>Pokud jste tento požadavek nepodali, ignorujte tento e-mail.</p>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">
              © UFO Sport - ufosport.cz
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      throw new Error(`Email send failed: ${emailError}`);
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
