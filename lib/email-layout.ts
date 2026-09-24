const WEBSITE_URL = process.env.NEXTAUTH_URL || 'https://www.ufosport.cz';
const LOGO_URL = `${WEBSITE_URL}/logo.png`;

export { WEBSITE_URL, LOGO_URL };

/** Email-safe stacks with Latin Extended (Czech: ěščřžýáíéůú). Arial is the Outlook fallback. */
export const FONT_STACK = "Roboto, Arial, Helvetica, sans-serif";
export const HEADING_STACK = "'Roboto Condensed', 'Arial Narrow', Arial, Helvetica, sans-serif";

export const buttonStyle = `
  display: inline-block;
  background-color: #000000;
  color: #ffffff;
  padding: 12px 24px;
  text-decoration: none;
  font-size: 12px;
  font-weight: 500;
  font-family: ${HEADING_STACK};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid #000000;
  border-radius: 0;
  line-height: 1.4;
`.replace(/\s+/g, ' ').trim();

export function emailButton(href: string, label: string) {
  return `<a href="${href}" style="${buttonStyle}">${label}</a>`;
}

export function kicker(text: string) {
  return `<p style="margin:0 0 8px 0;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#666666;font-family:${HEADING_STACK};">${text}</p>`;
}

export function heading(text: string) {
  return `<h1 style="margin:0 0 16px 0;font-size:22px;line-height:1.2;font-weight:700;letter-spacing:0.03em;text-transform:uppercase;color:#000000;font-family:${HEADING_STACK};font-stretch:condensed;">${text}</h1>`;
}

export function bodyText(text: string, extra = '') {
  return `<p style="margin:0 0 16px 0;font-size:14px;line-height:21px;color:#000000;font-family:${FONT_STACK};${extra}">${text}</p>`;
}

export function mutedText(text: string) {
  return `<p style="margin:0;font-size:12px;line-height:18px;letter-spacing:0.04em;color:#666666;font-family:${FONT_STACK};">${text}</p>`;
}

export function infoBox(inner: string) {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px 0;border:1px solid #000000;">
    <tr><td style="padding:20px;">${inner}</td></tr>
  </table>`;
}

export function promoBlock(code: string, label: string, until?: string) {
  return infoBox(`
    ${kicker('Váš slevový kód')}
    <p style="margin:0 0 8px 0;font-size:28px;line-height:1.2;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#000000;font-family:${HEADING_STACK};">${code}</p>
    <p style="margin:0;font-size:12px;line-height:18px;letter-spacing:0.04em;text-transform:uppercase;color:#666666;font-family:${FONT_STACK};">
      ${label}${until ? ` · Platnost do ${until}` : ''}
    </p>
  `);
}

export interface CatalogItem {
  name: string;
  size?: string;
  quantity: number;
  price: number;
}

export function itemsTable(items: CatalogItem[]) {
  const rows = items.map((item, index) => `
    <tr>
      <td style="padding:16px 0;${index < items.length - 1 ? 'border-bottom:1px solid #000000;' : ''}">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="vertical-align:top;">
              <p style="margin:0 0 4px 0;font-size:13px;font-weight:700;letter-spacing:0.03em;text-transform:uppercase;color:#000000;font-family:${HEADING_STACK};">${item.name}</p>
              ${item.size ? `<p style="margin:0;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#666666;font-family:${FONT_STACK};">Velikost: ${item.size}</p>` : ''}
              <p style="margin:4px 0 0 0;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#666666;font-family:${FONT_STACK};">Počet: ${item.quantity}</p>
            </td>
            <td style="vertical-align:top;text-align:right;width:110px;">
              <p style="margin:0;font-size:13px;font-weight:500;color:#000000;font-family:${FONT_STACK};">${item.price.toLocaleString('cs-CZ')} Kč</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px 0;">${rows}</table>`;
}

export function emailWrapper(content: string, unsubscribeUrl?: string) {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>UFO Sport</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&amp;family=Roboto+Condensed:wght@700&amp;display=swap" rel="stylesheet">
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Roboto+Condensed:wght@700&display=swap');
    body, table, td, p, a, li { font-family: ${FONT_STACK} !important; }
    h1, h2, h3 { font-family: ${HEADING_STACK} !important; }
  </style>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, p, a, li, h1, h2, h3 { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#ffffff;color:#000000;font-family:${FONT_STACK};-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #000000;">
          <tr>
            <td style="padding:28px 32px;text-align:center;border-bottom:1px solid #000000;">
              <a href="${WEBSITE_URL}" style="display:inline-block;text-decoration:none;">
                <img src="${LOGO_URL}" alt="UFO Sport" width="56" height="56" style="display:block;margin:0 auto 12px auto;max-width:56px;height:auto;border:0;" />
                <span style="display:block;font-size:13px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#000000;font-family:${HEADING_STACK};">UFO Sport</span>
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #000000;">
              <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#000000;font-family:${HEADING_STACK};text-align:center;">UFO Sport</p>
              <p style="margin:0 0 16px 0;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#666666;font-family:${FONT_STACK};text-align:center;line-height:18px;">Sportovní oblečení pro každý den</p>
              <p style="margin:0 0 16px 0;text-align:center;">
                <a href="${WEBSITE_URL}" style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#000000;text-decoration:none;font-family:${FONT_STACK};">www.ufosport.cz</a>
              </p>
              <p style="margin:0;text-align:center;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#666666;font-family:${FONT_STACK};">
                <a href="${WEBSITE_URL}/produkty" style="color:#666666;text-decoration:none;">Produkty</a>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                <a href="${WEBSITE_URL}/sledovani-objednavky" style="color:#666666;text-decoration:none;">Sledování objednávky</a>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                <a href="${WEBSITE_URL}/faq" style="color:#666666;text-decoration:none;">Pomoc</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 28px 32px;text-align:center;">
              <p style="margin:0;font-size:11px;line-height:18px;color:#666666;font-family:${FONT_STACK};">
                Tento e-mail byl odeslán automaticky z adresy noreply@ufosport.cz.
              </p>
              <p style="margin:8px 0 0 0;font-size:11px;color:#666666;font-family:${FONT_STACK};">
                © ${year} UFO Sport. Všechna práva vyhrazena.
              </p>
              ${unsubscribeUrl ? `<p style="margin:8px 0 0 0;font-size:11px;font-family:${FONT_STACK};"><a href="${unsubscribeUrl}" style="color:#666666;text-decoration:underline;">Odhlásit odběr novinek</a></p>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
