import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendCatalogEmail } from '@/lib/email';
import { EMAIL_CATALOG, SAMPLE_VARS, type EmailType } from '@/lib/email-catalog';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: 'RESEND_API_KEY není nakonfigurován. Přidejte ho do prostředí jako tajný klíč.' },
      { status: 500 }
    );
  }

  let body: { email: string; type: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Neplatná data.' }, { status: 400 });
  }

  const { email, type } = body;
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Zadejte platnou e-mailovou adresu.' }, { status: 400 });
  }

  const known = EMAIL_CATALOG.some((item) => item.id === type);
  if (!known) {
    return NextResponse.json({ error: 'Vyberte typ e-mailu.' }, { status: 400 });
  }

  const result = await sendCatalogEmail({
    type: type as EmailType,
    to: email,
    vars: SAMPLE_VARS,
    isTest: true,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: typeof result.error === 'string' ? result.error : 'Nepodařilo se odeslat testovací e-mail.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
