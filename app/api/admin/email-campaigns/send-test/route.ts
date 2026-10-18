import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

function enforceBlackBackground(html: string): string {
  return html
    .replace(/background:\s*#ffffff/gi, 'background:#000000')
    .replace(/background-color:\s*#ffffff/gi, 'background-color:#000000')
    .replace(/bgcolor="#ffffff"/gi, 'bgcolor="#000000"')
    .replace(/background:\s*white/gi, 'background:#000000')
    .replace(/background-color:\s*white/gi, 'background-color:#000000');
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testEmail, html, subject } = await req.json();

    if (!testEmail || !html) {
      return NextResponse.json({ error: 'Missing email or html' }, { status: 400 });
    }

    const finalHtml = enforceBlackBackground(html);

    // Send test email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'UFO Sport <noreply@ufosport.cz>',
        to: testEmail,
        subject: subject || 'Testovací e-mail UFO SPORT',
        html: finalHtml,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.emailLog.create({
        data: {
          toEmail: testEmail,
          type: 'CAMPAIGN_TEST',
          subject: subject || 'Testovací e-mail UFO SPORT',
          html: finalHtml,
          status: 'sent',
        },
      });
    } catch (logErr) {
      console.error('Failed to log test campaign email:', logErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('send-test error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
