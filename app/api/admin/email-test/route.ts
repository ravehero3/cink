import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const WEBSITE_URL = process.env.NEXTAUTH_URL || 'https://www.ufosport.cz';
const LOGO_URL = `${WEBSITE_URL}/logo.png`;

const FROM_EMAIL = 'UFO Sport <noreply@ufosport.cz>';

const buttonStyle = `display:inline-block;background-color:#1d1d1f;color:#ffffff;padding:16px 40px;text-decoration:none;font-size:14px;font-weight:500;letter-spacing:-0.01em;border-radius:980px;`;

const emailWrapper = (content: string) => `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UFO Sport</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f5f5f7;">
    <tr>
      <td align="center" style="padding:48px 24px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:#ffffff;">
          <tr>
            <td style="padding:40px 48px 32px 48px;text-align:center;">
              <a href="${WEBSITE_URL}" style="display:inline-block;">
                <img src="${WEBSITE_URL}/logo.png" alt="UFO Sport" width="72" height="72" style="display:block;margin:0 auto;max-width:72px;height:auto;" />
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 48px 48px 48px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:32px 48px;background-color:#fafafa;border-top:1px solid #f0f0f0;text-align:center;">
              <p style="margin:0 0 8px 0;font-size:12px;color:#86868b;">Toto je testovaci e-mail z administrace UFO Sport.</p>
              <p style="margin:0;font-size:11px;color:#86868b;">&copy; ${new Date().getFullYear()} UFO Sport. Vsechna prava vyhrazena.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const EMAIL_LABELS: Record<string, string> = {
  ORDER_CONFIRMATION: 'Potvrzeni objednavky',
  PAYMENT_SUCCESS: 'Platba prijata',
  SHIPPING_NOTIFICATION: 'Zasilka na ceste',
  NEWSLETTER_WELCOME: 'Vitejte v newsletteru',
  PASSWORD_RESET: 'Obnoveni hesla',
  ABANDONED_CART: 'Zapomnety kosik',
  ADMIN_ORDER_NOTIFICATION: 'Notifikace adminu',
};

const SAMPLE_ITEMS_HTML = `
  <tr><td style="padding:16px 0;border-bottom:1px solid #f0f0f0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
      <td><p style="margin:0 0 4px 0;font-size:15px;font-weight:500;color:#1d1d1f;">UFO Oversized T-Shirt</p><p style="margin:0;font-size:13px;color:#86868b;">Velikost: L — Pocet: 1</p></td>
      <td style="text-align:right;"><p style="margin:0;font-size:15px;font-weight:500;color:#1d1d1f;">850 Kc</p></td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:16px 0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
      <td><p style="margin:0 0 4px 0;font-size:15px;font-weight:500;color:#1d1d1f;">UFO Sport Socks</p><p style="margin:0;font-size:13px;color:#86868b;">Velikost: UNI — Pocet: 2</p></td>
      <td style="text-align:right;"><p style="margin:0;font-size:15px;font-weight:500;color:#1d1d1f;">800 Kc</p></td>
    </tr></table>
  </td></tr>
`;

function getTestEmailContent(type: string): { subject: string; html: string } {
  const label = EMAIL_LABELS[type] || type;
  const banner = `<div style="background-color:#f5f5f7;border-radius:8px;padding:12px 16px;margin-bottom:24px;text-align:center;"><p style="margin:0;font-size:12px;color:#86868b;font-weight:500;">TESTOVACI E-MAIL — ${label.toUpperCase()}</p></div>`;

  switch (type) {
    case 'ORDER_CONFIRMATION':
      return {
        subject: `[TEST] Potvrzeni objednavky UFO26001 — UFO Sport`,
        html: emailWrapper(banner + `
          <div style="text-align:center;margin-bottom:40px;">
            <h1 style="margin:0 0 12px 0;font-size:28px;font-weight:600;color:#1d1d1f;letter-spacing:-0.02em;">Dekujeme za objednavku</h1>
            <p style="margin:0;font-size:17px;color:#86868b;">Obdrzeli jsme vasi objednavku a brzy ji zpracujeme.</p>
          </div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:32px;background-color:#f5f5f7;border-radius:12px;">
            <tr><td style="padding:24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
                <td><p style="margin:0 0 4px 0;font-size:13px;color:#86868b;">Cislo objednavky</p><p style="margin:0;font-size:17px;font-weight:600;color:#1d1d1f;">UFO26001</p></td>
                <td style="text-align:right;"><a href="${WEBSITE_URL}/sledovani-objednavky" style="font-size:13px;color:#1d1d1f;text-decoration:none;font-weight:500;">Sledovat &rarr;</a></td>
              </tr></table>
            </td></tr>
          </table>
          <div style="margin-bottom:32px;">
            <p style="margin:0 0 16px 0;font-size:13px;font-weight:600;color:#1d1d1f;text-transform:uppercase;letter-spacing:0.05em;">Vase polozky</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${SAMPLE_ITEMS_HTML}</table>
          </div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:32px;border-top:1px solid #f0f0f0;">
            <tr><td style="padding:20px 0 0 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
                <td><p style="margin:0;font-size:17px;font-weight:600;color:#1d1d1f;">Celkem</p></td>
                <td style="text-align:right;"><p style="margin:0;font-size:20px;font-weight:600;color:#1d1d1f;">1 650 Kc</p></td>
              </tr></table>
            </td></tr>
          </table>
          <div style="text-align:center;padding:24px 0;background-color:#f5f5f7;border-radius:12px;margin-bottom:24px;">
            <a href="${WEBSITE_URL}/sledovani-objednavky" style="${buttonStyle}">Sledovat objednavku</a>
          </div>
          <p style="margin:0;font-size:13px;color:#86868b;text-align:center;">Mate otazky? Napiste na <a href="mailto:info@ufosport.cz" style="color:#1d1d1f;text-decoration:none;">info@ufosport.cz</a></p>
        `),
      };

    case 'PAYMENT_SUCCESS':
      return {
        subject: `[TEST] Platba prijata — UFO26001 — UFO Sport`,
        html: emailWrapper(banner + `
          <div style="text-align:center;margin-bottom:40px;">
            <div style="display:inline-block;width:56px;height:56px;background-color:#1d1d1f;border-radius:50%;margin-bottom:20px;line-height:56px;"><span style="font-size:24px;color:#fff;">&#10003;</span></div>
            <h1 style="margin:0 0 12px 0;font-size:28px;font-weight:600;color:#1d1d1f;">Platba prijata</h1>
            <p style="margin:0;font-size:17px;color:#86868b;">Dekujeme, Jan Novak. Vase platba byla uspesne zpracovana.</p>
          </div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:32px;background-color:#f5f5f7;border-radius:12px;">
            <tr><td style="padding:28px;text-align:center;">
              <p style="margin:0 0 4px 0;font-size:13px;color:#86868b;">Cislo objednavky</p>
              <p style="margin:0 0 16px 0;font-size:20px;font-weight:600;color:#1d1d1f;">UFO26001</p>
              <p style="margin:0 0 4px 0;font-size:13px;color:#86868b;">Celkova castka</p>
              <p style="margin:0;font-size:28px;font-weight:600;color:#1d1d1f;">1 650 Kc</p>
            </td></tr>
          </table>
          <div style="text-align:center;padding:24px;background-color:#f5f5f7;border-radius:12px;">
            <p style="margin:0 0 20px 0;font-size:14px;color:#86868b;line-height:1.5;">Vasi objednavku nyni pripravujeme k odeslani.</p>
            <a href="${WEBSITE_URL}/sledovani-objednavky" style="${buttonStyle}">Sledovat objednavku</a>
          </div>
        `),
      };

    case 'SHIPPING_NOTIFICATION':
      return {
        subject: `[TEST] Objednavka UFO26001 byla odeslana — UFO Sport`,
        html: emailWrapper(banner + `
          <div style="text-align:center;margin-bottom:40px;">
            <div style="display:inline-block;width:56px;height:56px;background-color:#1d1d1f;border-radius:50%;margin-bottom:20px;line-height:56px;"><span style="font-size:24px;color:#fff;">&#10003;</span></div>
            <h1 style="margin:0 0 12px 0;font-size:28px;font-weight:600;color:#1d1d1f;">Vase objednavka je na ceste</h1>
            <p style="margin:0;font-size:17px;color:#86868b;">Objednavka <strong style="color:#1d1d1f;">UFO26001</strong> byla odeslana.</p>
          </div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;background-color:#f5f5f7;border-radius:12px;">
            <tr><td style="padding:24px;text-align:center;">
              <p style="margin:0 0 8px 0;font-size:13px;color:#86868b;">Sledovaci cislo</p>
              <p style="margin:0;font-size:20px;font-weight:600;color:#1d1d1f;font-family:'Courier New',monospace;">CZ123456789</p>
            </td></tr>
          </table>
          <div style="text-align:center;padding:24px;background-color:#f5f5f7;border-radius:12px;">
            <p style="margin:0 0 20px 0;font-size:14px;color:#86868b;">Ocekavana doba doruceni: 1-3 pracovni dny</p>
            <a href="${WEBSITE_URL}/sledovani-objednavky" style="${buttonStyle}">Sledovat zasilku</a>
          </div>
        `),
      };

    case 'NEWSLETTER_WELCOME':
      return {
        subject: `[TEST] Vitejte v UFO Sport`,
        html: emailWrapper(banner + `
          <div style="text-align:center;margin-bottom:40px;">
            <h1 style="margin:0 0 12px 0;font-size:28px;font-weight:600;color:#1d1d1f;">Vitejte v UFO Sport</h1>
            <p style="margin:0;font-size:17px;color:#86868b;">Dekujeme za prihlaseni k odberu novinek.</p>
          </div>
          <p style="margin:0 0 24px 0;font-size:15px;color:#1d1d1f;text-align:center;line-height:1.6;">Od ted budete jako prvni vedet o novinkach, exkluzivnich slevach a limitovanych edicich.</p>
          <div style="text-align:center;margin-bottom:32px;">
            <a href="${WEBSITE_URL}" style="${buttonStyle}">Prozkoumat kolekci</a>
          </div>
        `),
      };

    case 'PASSWORD_RESET':
      return {
        subject: `[TEST] Obnoveni hesla — UFO Sport`,
        html: emailWrapper(banner + `
          <div style="text-align:center;margin-bottom:40px;">
            <h1 style="margin:0 0 12px 0;font-size:28px;font-weight:600;color:#1d1d1f;">Obnoveni hesla</h1>
            <p style="margin:0;font-size:17px;color:#86868b;">Obdrzeli jsme zadost o obnoveni vaseho hesla.</p>
          </div>
          <div style="text-align:center;padding:32px;background-color:#f5f5f7;border-radius:12px;margin-bottom:32px;">
            <p style="margin:0 0 24px 0;font-size:15px;color:#1d1d1f;">Kliknete na tlacitko nize pro nastaveni noveho hesla.</p>
            <a href="${WEBSITE_URL}" style="${buttonStyle}">Obnovit heslo</a>
            <p style="margin:24px 0 0 0;font-size:13px;color:#86868b;">Odkaz je platny po dobu 1 hodiny.</p>
          </div>
        `),
      };

    case 'ABANDONED_CART':
      return {
        subject: `[TEST] Zapomneli jste neco v kosiku? — UFO Sport`,
        html: emailWrapper(banner + `
          <div style="text-align:center;margin-bottom:40px;">
            <h1 style="margin:0 0 12px 0;font-size:28px;font-weight:600;color:#1d1d1f;">Zapomneli jste neco v kosiku?</h1>
            <p style="margin:0;font-size:17px;color:#86868b;">Vase vybrane kousky na vas stale cekaji.</p>
          </div>
          <div style="margin-bottom:32px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${SAMPLE_ITEMS_HTML}</table>
          </div>
          <div style="text-align:center;padding:24px 0;background-color:#f5f5f7;border-radius:12px;">
            <a href="${WEBSITE_URL}/kosik" style="${buttonStyle}">Vratit se do kosiku</a>
          </div>
        `),
      };

    case 'ADMIN_ORDER_NOTIFICATION':
      return {
        subject: `[TEST] Nova objednavka UFO26001 — 1 650 Kc`,
        html: emailWrapper(banner + `
          <div style="margin-bottom:32px;">
            <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:600;color:#1d1d1f;">Nova objednavka: UFO26001</h1>
            <p style="margin:0;font-size:14px;color:#86868b;">Testovaci datum</p>
          </div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;background-color:#f5f5f7;border-radius:12px;">
            <tr><td style="padding:24px;">
              <p style="margin:0 0 12px 0;font-size:11px;font-weight:600;color:#86868b;text-transform:uppercase;letter-spacing:0.08em;">Zakaznik</p>
              <p style="margin:0 0 4px 0;font-size:16px;font-weight:600;color:#1d1d1f;">Jan Novak</p>
              <p style="margin:0 0 4px 0;font-size:14px;color:#1d1d1f;">jan.novak@email.cz</p>
              <p style="margin:0;font-size:14px;color:#1d1d1f;">+420 777 123 456</p>
            </td></tr>
          </table>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${SAMPLE_ITEMS_HTML}</table>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;border-top:2px solid #1d1d1f;border-bottom:2px solid #1d1d1f;padding:16px 0;">
            <tr>
              <td><p style="margin:0;font-size:16px;font-weight:700;color:#1d1d1f;">CELKEM</p></td>
              <td style="text-align:right;"><p style="margin:0;font-size:20px;font-weight:700;color:#1d1d1f;">1 650 Kc</p></td>
            </tr>
          </table>
          <div style="text-align:center;padding:16px;background-color:#1d1d1f;border-radius:8px;margin-top:24px;">
            <a href="${WEBSITE_URL}/admin/objednavky" style="font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">Zobrazit v adminu &rarr;</a>
          </div>
        `),
      };

    default:
      return {
        subject: `[TEST] Testovaci e-mail — UFO Sport`,
        html: emailWrapper(banner + `<p style="text-align:center;color:#86868b;">Neznamy typ e-mailu.</p>`),
      };
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!RESEND_API_KEY) {
    return NextResponse.json(
      { error: 'RESEND_API_KEY neni nakonfigurovan. Pridejte ho do prostredi jako tajny klic.' },
      { status: 500 }
    );
  }

  let body: { email: string; type: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Neplatna data.' }, { status: 400 });
  }

  const { email, type } = body;

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Zadejte platnou e-mailovou adresu.' }, { status: 400 });
  }

  if (!type) {
    return NextResponse.json({ error: 'Vyberte typ e-mailu.' }, { status: 400 });
  }

  const { subject, html } = getTestEmailContent(type);

  try {
    const resend = new Resend(RESEND_API_KEY);
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject,
      html,
    });

    if (result.error) {
      console.error('Resend error sending test email:', result.error);
      return NextResponse.json(
        { error: `Chyba Resend: ${result.error.message}` },
        { status: 500 }
      );
    }

    console.log('Test email sent successfully:', result);
    return NextResponse.json({ success: true, messageId: result.data?.id });
  } catch (error: any) {
    console.error('Failed to send test email:', error);
    return NextResponse.json(
      { error: error?.message || 'Nepodarilo se odeslat testovaci e-mail.' },
      { status: 500 }
    );
  }
}
