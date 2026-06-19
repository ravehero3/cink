import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const WEBSITE_URL = process.env.NEXTAUTH_URL || 'https://www.ufosport.cz';
const LOGO_URL = `${WEBSITE_URL}/logo.png`;

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
                <img src="${LOGO_URL}" alt="UFO Sport" width="72" height="72" style="display:block;margin:0 auto;max-width:72px;height:auto;" />
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 48px 48px 48px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:32px 48px;background-color:#fafafa;border-top:1px solid #f0f0f0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="text-align:center;">
                    <p style="margin:0 0 12px 0;font-size:13px;font-weight:500;color:#1d1d1f;letter-spacing:-0.01em;">UFO Sport</p>
                    <p style="margin:0 0 16px 0;font-size:12px;color:#86868b;line-height:1.5;">Sportovni obleceni pro kazdy den</p>
                    <p style="margin:0 0 8px 0;"><a href="${WEBSITE_URL}" style="font-size:12px;color:#1d1d1f;text-decoration:none;">www.ufosport.cz</a></p>
                    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:16px auto 0 auto;">
                      <tr>
                        <td style="padding:0 8px;"><a href="${WEBSITE_URL}" style="font-size:11px;color:#86868b;text-decoration:none;">Produkty</a></td>
                        <td style="color:#d2d2d7;font-size:11px;">|</td>
                        <td style="padding:0 8px;"><a href="${WEBSITE_URL}/sledovani-objednavky" style="font-size:11px;color:#86868b;text-decoration:none;">Sledovani objednavky</a></td>
                        <td style="color:#d2d2d7;font-size:11px;">|</td>
                        <td style="padding:0 8px;"><a href="${WEBSITE_URL}/faq" style="font-size:11px;color:#86868b;text-decoration:none;">Pomoc</a></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 48px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#86868b;line-height:1.6;">Tento e-mail byl odeslan automaticky z adresy noreply@ufosport.cz.</p>
              <p style="margin:8px 0 0 0;font-size:11px;color:#86868b;">&copy; ${new Date().getFullYear()} UFO Sport. Vsechna prava vyhrazena.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const SAMPLE_ITEMS_HTML = `
  <tr>
    <td style="padding:20px 0;border-bottom:1px solid #f0f0f0;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td style="vertical-align:top;">
            <p style="margin:0 0 4px 0;font-size:15px;font-weight:500;color:#1d1d1f;line-height:1.4;">UFO Oversized T-Shirt</p>
            <p style="margin:0;font-size:13px;color:#86868b;">Velikost: L</p>
            <p style="margin:4px 0 0 0;font-size:13px;color:#86868b;">Pocet: 1</p>
          </td>
          <td style="vertical-align:top;text-align:right;width:100px;">
            <p style="margin:0;font-size:15px;font-weight:500;color:#1d1d1f;">850 Kc</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:20px 0;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td style="vertical-align:top;">
            <p style="margin:0 0 4px 0;font-size:15px;font-weight:500;color:#1d1d1f;line-height:1.4;">UFO Sport Socks</p>
            <p style="margin:0;font-size:13px;color:#86868b;">Velikost: UNI</p>
            <p style="margin:4px 0 0 0;font-size:13px;color:#86868b;">Pocet: 2</p>
          </td>
          <td style="vertical-align:top;text-align:right;width:100px;">
            <p style="margin:0;font-size:15px;font-weight:500;color:#1d1d1f;">800 Kc</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
`;

function getPreviewHtml(type: string): string {
  switch (type) {
    case 'ORDER_CONFIRMATION':
      return emailWrapper(`
        <div style="text-align:center;margin-bottom:40px;">
          <h1 style="margin:0 0 12px 0;font-size:28px;font-weight:600;color:#1d1d1f;letter-spacing:-0.02em;line-height:1.2;">Dekujeme za objednavku</h1>
          <p style="margin:0;font-size:17px;color:#86868b;line-height:1.5;">Obdrzeli jsme vasi objednavku a brzy ji zpracujeme.</p>
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:32px;background-color:#f5f5f7;border-radius:12px;">
          <tr>
            <td style="padding:24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <p style="margin:0 0 4px 0;font-size:13px;color:#86868b;">Cislo objednavky</p>
                    <p style="margin:0;font-size:17px;font-weight:600;color:#1d1d1f;letter-spacing:-0.01em;">UFO26001</p>
                  </td>
                  <td style="text-align:right;">
                    <a href="#" style="font-size:13px;color:#1d1d1f;text-decoration:none;font-weight:500;">Sledovat &rarr;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <div style="margin-bottom:32px;">
          <p style="margin:0 0 16px 0;font-size:13px;font-weight:600;color:#1d1d1f;text-transform:uppercase;letter-spacing:0.05em;">Vase polozky</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${SAMPLE_ITEMS_HTML}</table>
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:32px;border-top:1px solid #f0f0f0;">
          <tr>
            <td style="padding:16px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td><p style="margin:0;font-size:13px;color:#86868b;">Misto vyzvednuti (Zasilkovna)</p></td>
                  <td style="text-align:right;"><p style="margin:0;font-size:13px;color:#1d1d1f;">Zasilkovna Praha 1 - Centrum</p></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 0 0 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td><p style="margin:0;font-size:17px;font-weight:600;color:#1d1d1f;">Celkem</p></td>
                  <td style="text-align:right;"><p style="margin:0;font-size:20px;font-weight:600;color:#1d1d1f;">1 650 Kc</p></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <div style="text-align:center;padding:24px 0;background-color:#f5f5f7;border-radius:12px;margin-bottom:24px;">
          <p style="margin:0 0 16px 0;font-size:15px;color:#1d1d1f;line-height:1.5;">Nyni prosim dokoncete platbu pro expedici objednavky.</p>
          <a href="#" style="${buttonStyle}">Sledovat objednavku</a>
        </div>
        <p style="margin:0;font-size:13px;color:#86868b;text-align:center;line-height:1.6;">Mate otazky? Kontaktujte nas na <a href="mailto:info@ufosport.cz" style="color:#1d1d1f;text-decoration:none;">info@ufosport.cz</a></p>
      `);

    case 'PAYMENT_SUCCESS':
      return emailWrapper(`
        <div style="text-align:center;margin-bottom:40px;">
          <div style="display:inline-block;width:56px;height:56px;background-color:#1d1d1f;border-radius:50%;margin-bottom:20px;line-height:56px;">
            <span style="font-size:24px;color:#ffffff;">&#10003;</span>
          </div>
          <h1 style="margin:0 0 12px 0;font-size:28px;font-weight:600;color:#1d1d1f;letter-spacing:-0.02em;line-height:1.2;">Platba prijata</h1>
          <p style="margin:0;font-size:17px;color:#86868b;line-height:1.5;">Dekujeme, Jan Novak. Vase platba byla uspesne zpracovana.</p>
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:32px;background-color:#f5f5f7;border-radius:12px;">
          <tr>
            <td style="padding:28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="text-align:center;padding-bottom:16px;border-bottom:1px solid #e5e5e5;">
                    <p style="margin:0 0 4px 0;font-size:13px;color:#86868b;">Cislo objednavky</p>
                    <p style="margin:0;font-size:20px;font-weight:600;color:#1d1d1f;letter-spacing:-0.01em;">UFO26001</p>
                  </td>
                </tr>
                <tr>
                  <td style="text-align:center;padding-top:16px;">
                    <p style="margin:0 0 4px 0;font-size:13px;color:#86868b;">Celkova castka</p>
                    <p style="margin:0;font-size:28px;font-weight:600;color:#1d1d1f;letter-spacing:-0.02em;">1 650 Kc</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <div style="margin-bottom:32px;">
          <p style="margin:0 0 16px 0;font-size:13px;font-weight:600;color:#1d1d1f;text-transform:uppercase;letter-spacing:0.05em;">Souhrn objednavky</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${SAMPLE_ITEMS_HTML}</table>
        </div>
        <div style="text-align:center;padding:24px;background-color:#f5f5f7;border-radius:12px;margin-bottom:24px;">
          <p style="margin:0 0 8px 0;font-size:15px;font-weight:500;color:#1d1d1f;">Co bude dal?</p>
          <p style="margin:0 0 20px 0;font-size:14px;color:#86868b;line-height:1.5;">Vasi objednavku nyni pripravujeme k odeslani.<br>Jakmile ji predame prepravci, dame vam vedet.</p>
          <a href="#" style="${buttonStyle}">Sledovat objednavku</a>
        </div>
      `);

    case 'SHIPPING_NOTIFICATION':
      return emailWrapper(`
        <div style="text-align:center;margin-bottom:40px;">
          <div style="display:inline-block;width:56px;height:56px;background-color:#1d1d1f;border-radius:50%;margin-bottom:20px;line-height:56px;">
            <span style="font-size:24px;color:#ffffff;">&#10003;</span>
          </div>
          <h1 style="margin:0 0 12px 0;font-size:28px;font-weight:600;color:#1d1d1f;letter-spacing:-0.02em;line-height:1.2;">Vase objednavka je na ceste</h1>
          <p style="margin:0;font-size:17px;color:#86868b;line-height:1.5;">Objednavka <strong style="color:#1d1d1f;">UFO26001</strong> byla odeslana.</p>
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;background-color:#f5f5f7;border-radius:12px;">
          <tr>
            <td style="padding:24px;text-align:center;">
              <p style="margin:0 0 8px 0;font-size:13px;color:#86868b;">Sledovaci cislo</p>
              <p style="margin:0;font-size:20px;font-weight:600;color:#1d1d1f;letter-spacing:0.02em;font-family:'Courier New',monospace;">CZ123456789</p>
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;background-color:#f5f5f7;border-radius:12px;">
          <tr>
            <td style="padding:24px;">
              <p style="margin:0 0 8px 0;font-size:13px;color:#86868b;">Misto vyzvednuti</p>
              <p style="margin:0 0 12px 0;font-size:17px;font-weight:500;color:#1d1d1f;">Zasilkovna Praha 1 - Centrum</p>
              <p style="margin:0;font-size:13px;color:#86868b;line-height:1.5;">Jakmile bude balik pripraven k vyzvednuti, obdrzite SMS nebo e-mail od Zasilkovny.</p>
            </td>
          </tr>
        </table>
        <div style="text-align:center;padding:24px;background-color:#f5f5f7;border-radius:12px;margin-bottom:24px;">
          <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 20px auto;">
            <tr>
              <td style="padding:0 16px;text-align:center;">
                <p style="margin:0 0 4px 0;font-size:24px;font-weight:600;color:#1d1d1f;">1-3</p>
                <p style="margin:0;font-size:12px;color:#86868b;">pracovni dny</p>
              </td>
            </tr>
          </table>
          <p style="margin:0 0 20px 0;font-size:14px;color:#86868b;line-height:1.5;">Ocekavana doba doruceni</p>
          <a href="#" style="${buttonStyle}">Sledovat zasilku</a>
        </div>
        <p style="margin:0;font-size:13px;color:#86868b;text-align:center;line-height:1.6;">Dekujeme za nakup u UFO Sport!</p>
      `);

    case 'NEWSLETTER_WELCOME':
      return emailWrapper(`
        <div style="text-align:center;margin-bottom:40px;">
          <h1 style="margin:0 0 12px 0;font-size:28px;font-weight:600;color:#1d1d1f;letter-spacing:-0.02em;line-height:1.2;">Vitejte v UFO Sport</h1>
          <p style="margin:0;font-size:17px;color:#86868b;line-height:1.5;">Dekujeme za prihlaseni k odberu novinek.</p>
        </div>
        <div style="margin-bottom:40px;">
          <p style="margin:0 0 24px 0;font-size:15px;color:#1d1d1f;text-align:center;line-height:1.6;">Od ted budete jako prvni vedet o vsem novem.</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding:20px 0;border-bottom:1px solid #f0f0f0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="width:40px;vertical-align:top;">
                      <div style="width:32px;height:32px;background-color:#f5f5f7;border-radius:8px;text-align:center;line-height:32px;font-size:16px;">*</div>
                    </td>
                    <td style="vertical-align:top;padding-left:12px;">
                      <p style="margin:0 0 4px 0;font-size:15px;font-weight:500;color:#1d1d1f;">Novinky v kolekci</p>
                      <p style="margin:0;font-size:13px;color:#86868b;">Budete prvni, kdo uvidi nove produkty.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="width:40px;vertical-align:top;">
                      <div style="width:32px;height:32px;background-color:#f5f5f7;border-radius:8px;text-align:center;line-height:32px;font-size:16px;">%</div>
                    </td>
                    <td style="vertical-align:top;padding-left:12px;">
                      <p style="margin:0 0 4px 0;font-size:15px;font-weight:500;color:#1d1d1f;">Exkluzivni slevy</p>
                      <p style="margin:0;font-size:13px;color:#86868b;">Specialni nabidky jen pro odberatele.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
        <div style="text-align:center;margin-bottom:32px;">
          <a href="${WEBSITE_URL}" style="${buttonStyle}">Prozkoumat kolekci</a>
        </div>
        <p style="margin:0;font-size:12px;color:#86868b;text-align:center;line-height:1.6;">Pokud jste se k odberu neprihlasili vy, muzete tento e-mail ignorovat.</p>
      `);

    case 'PASSWORD_RESET':
      return emailWrapper(`
        <div style="text-align:center;margin-bottom:40px;">
          <h1 style="margin:0 0 12px 0;font-size:28px;font-weight:600;color:#1d1d1f;letter-spacing:-0.02em;line-height:1.2;">Obnoveni hesla</h1>
          <p style="margin:0;font-size:17px;color:#86868b;line-height:1.5;">Obdrzeli jsme zadost o obnoveni vaseho hesla.</p>
        </div>
        <div style="text-align:center;padding:32px;background-color:#f5f5f7;border-radius:12px;margin-bottom:32px;">
          <p style="margin:0 0 24px 0;font-size:15px;color:#1d1d1f;line-height:1.6;">Kliknete na tlacitko nize pro nastaveni noveho hesla.</p>
          <a href="#" style="${buttonStyle}">Obnovit heslo</a>
          <p style="margin:24px 0 0 0;font-size:13px;color:#86868b;">Odkaz je platny po dobu 1 hodiny.</p>
        </div>
        <div style="padding:20px;border:1px solid #f0f0f0;border-radius:12px;margin-bottom:24px;">
          <p style="margin:0 0 8px 0;font-size:13px;font-weight:500;color:#1d1d1f;">Nezadali jste o zmenu hesla?</p>
          <p style="margin:0;font-size:13px;color:#86868b;line-height:1.5;">Pokud jste o obnoveni hesla nezadali, tento e-mail prosim ignorujte. Vase heslo zustane nezmeneno.</p>
        </div>
      `);

    case 'ABANDONED_CART':
      return emailWrapper(`
        <div style="text-align:center;margin-bottom:40px;">
          <h1 style="margin:0 0 12px 0;font-size:28px;font-weight:600;color:#1d1d1f;letter-spacing:-0.02em;line-height:1.2;">Zapomneli jste neco v kosiku?</h1>
          <p style="margin:0;font-size:17px;color:#86868b;line-height:1.5;">Vase vybrane kousky na vas stale cekaji.</p>
        </div>
        <div style="margin-bottom:32px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${SAMPLE_ITEMS_HTML}</table>
        </div>
        <div style="text-align:center;padding:24px 0;background-color:#f5f5f7;border-radius:12px;margin-bottom:24px;">
          <a href="${WEBSITE_URL}/kosik" style="${buttonStyle}">Vratit se do kosiku</a>
        </div>
        <p style="margin:0;font-size:13px;color:#86868b;text-align:center;line-height:1.6;">Pokud jste jiz objednavku dokoncili, ignorujte prosim tento e-mail.</p>
      `);

    case 'ADMIN_ORDER_NOTIFICATION':
      return emailWrapper(`
        <div style="margin-bottom:32px;">
          <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:600;color:#1d1d1f;letter-spacing:-0.02em;">Nova objednavka: UFO26001</h1>
          <p style="margin:0;font-size:14px;color:#86868b;">1. ledna 2026 v 12:00</p>
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;background-color:#f5f5f7;border-radius:12px;">
          <tr>
            <td style="padding:24px;">
              <p style="margin:0 0 12px 0;font-size:11px;font-weight:600;color:#86868b;text-transform:uppercase;letter-spacing:0.08em;">Zakaznik</p>
              <p style="margin:0 0 4px 0;font-size:16px;font-weight:600;color:#1d1d1f;">Jan Novak</p>
              <p style="margin:0 0 4px 0;font-size:14px;color:#1d1d1f;">jan.novak@email.cz</p>
              <p style="margin:0;font-size:14px;color:#1d1d1f;">+420 777 123 456</p>
            </td>
          </tr>
        </table>
        <div style="margin-bottom:24px;">
          <p style="margin:0 0 12px 0;font-size:11px;font-weight:600;color:#86868b;text-transform:uppercase;letter-spacing:0.08em;">Polozky</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${SAMPLE_ITEMS_HTML}</table>
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;border-top:2px solid #1d1d1f;border-bottom:2px solid #1d1d1f;padding:16px 0;">
          <tr>
            <td><p style="margin:0;font-size:16px;font-weight:700;color:#1d1d1f;">CELKEM</p></td>
            <td style="text-align:right;"><p style="margin:0;font-size:20px;font-weight:700;color:#1d1d1f;">1 650 Kc</p></td>
          </tr>
        </table>
        <div style="text-align:center;padding:16px;background-color:#1d1d1f;border-radius:8px;">
          <a href="${WEBSITE_URL}/admin/objednavky" style="font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.02em;">Zobrazit v adminu &rarr;</a>
        </div>
      `);

    default:
      return emailWrapper(`<p style="color:#86868b;text-align:center;">Neznamy typ e-mailu.</p>`);
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'ORDER_CONFIRMATION';

  const html = getPreviewHtml(type);

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
