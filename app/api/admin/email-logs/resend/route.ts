import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { renderEmail, SAMPLE_VARS, type EmailType } from '@/lib/email-catalog';

export const dynamic = 'force-dynamic';

function enforceBlackBackground(html: string): string {
  return html
    .replace(/background:\s*#ffffff/gi, 'background:#000000')
    .replace(/background-color:\s*#ffffff/gi, 'background-color:#000000')
    .replace(/bgcolor="#ffffff"/gi, 'bgcolor="#000000"')
    .replace(/background:\s*white/gi, 'background:#000000')
    .replace(/background-color:\s*white/gi, 'background-color:#000000');
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY is not configured.' }, { status: 500 });
  }

  try {
    const { logId, overrideEmail } = await request.json();
    if (!logId) {
      return NextResponse.json({ error: 'Missing logId' }, { status: 400 });
    }

    const log = await prisma.emailLog.findUnique({ where: { id: logId } });
    if (!log) {
      return NextResponse.json({ error: 'Email log not found' }, { status: 404 });
    }

    const targetEmail = (overrideEmail || log.toEmail).trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      return NextResponse.json({ error: 'Neplatná cílová e-mailová adresa' }, { status: 400 });
    }

    const rawHtml = log.html || renderEmail((log.type as EmailType) || 'ORDER_CONFIRMATION', SAMPLE_VARS).html;
    const finalHtml = enforceBlackBackground(rawHtml);

    const resend = new Resend(apiKey);
    const subject = log.subject;

    const result = await resend.emails.send({
      from: 'UFO Sport <noreply@ufosport.cz>',
      to: targetEmail,
      subject,
      html: finalHtml,
    });

    if ((result as { error?: { message?: string } }).error) {
      const errorMsg = (result as { error: { message?: string } }).error.message || 'Resend error';
      await prisma.emailLog.create({
        data: {
          toEmail: targetEmail,
          type: log.type,
          subject: `(Přeposláno) ${subject}`,
          html: finalHtml,
          status: 'failed',
          error: errorMsg,
          journeyId: log.journeyId,
        },
      });
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }

    const newLog = await prisma.emailLog.create({
      data: {
        toEmail: targetEmail,
        type: log.type,
        subject: `(Přeposláno) ${subject}`,
        html: finalHtml,
        status: 'sent',
        journeyId: log.journeyId,
      },
    });

    return NextResponse.json({
      success: true,
      message: `E-mail byl úspěšně přeposlán na adresu ${targetEmail}.`,
      newLogId: newLog.id,
    });
  } catch (error) {
    console.error('Resend email error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Nepodařilo se přeposlat e-mail.' },
      { status: 500 }
    );
  }
}
