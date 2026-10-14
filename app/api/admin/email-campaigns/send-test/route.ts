import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testEmail, html } = await req.json();

    if (!testEmail || !html) {
      return NextResponse.json({ error: 'Missing email or html' }, { status: 400 });
    }

    // Ensure outbound test email has black background even if sent from a stale client cache
    const finalHtml = html
      .replace(/background:#ffffff/g, 'background:#000000')
      .replace(/background-color:#ffffff/g, 'background-color:#000000')
      .replace(/bgcolor="#ffffff"/g, 'bgcolor="#000000"');

    // Send test email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'kampane@ufosport.cz',
        to: testEmail,
        subject: 'Testovací e-mail UFO SPORT',
        html: finalHtml,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('send-test error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
