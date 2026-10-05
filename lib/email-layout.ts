const WEBSITE_URL = process.env.NEXTAUTH_URL || 'https://www.ufosport.cz';
const LOGO_URL = `${WEBSITE_URL}/logo.png`;

export { WEBSITE_URL, LOGO_URL };

export const FONT_STACK = "'Inter', Arial, Helvetica, sans-serif";
export const HEADING_STACK = "'Inter', Arial, Helvetica, sans-serif";

export const buttonStyle = `
  display: inline-block;
  background-color: #000000;
  color: #ffffff;
  padding: 12px 24px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  font-family: ${FONT_STACK};
  letter-spacing: 1px;
  text-transform: uppercase;
  border-radius: 2px;
  line-height: 1.4;
`.replace(/\s+/g, ' ').trim();

export function emailButton(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;border-collapse:separate;">
    <tr>
      <td align="center" width="240" bgcolor="#000000" style="width:240px;background:#000000;border-radius:2px;">
        <a href="${href}" style="display:block;height:44px;line-height:44px;font-family:${FONT_STACK};font-size:14px;font-weight:600;letter-spacing:1px;color:#ffffff;text-decoration:none;text-transform:uppercase;background:#000000;border-radius:2px;">${label}</a>
      </td>
    </tr>
  </table>`;
}

export function kicker(text: string) {
  return `<p style="margin:0 0 8px 0;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#666666;font-family:${FONT_STACK};">${text}</p>`;
}

export function heading(text: string) {
  return `<h1 style="margin:0 0 12px 0;font-size:15px;line-height:20px;font-weight:700;text-transform:uppercase;color:#000000;font-family:${FONT_STACK};">${text}</h1>`;
}

export function bodyText(text: string, extra = '') {
  return `<p style="margin:0 0 16px 0;font-size:15px;line-height:20px;color:#000000;font-family:${FONT_STACK};${extra}">${text}</p>`;
}

export function mutedText(text: string) {
  return `<p style="margin:0;font-size:13px;line-height:18px;color:#555555;font-family:${FONT_STACK};">${text}</p>`;
}

export function infoBox(inner: string) {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px 0;border:1px solid #000000;">
    <tr><td style="padding:16px;">${inner}</td></tr>
  </table>`;
}

export function promoBlock(code: string, label: string, until?: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
    <tr><td valign="top" style="padding:0 12px 8px 0;font-size:15px;line-height:20px;">Slevový kód</td><td align="right" valign="top" style="padding:0 0 8px;font-size:15px;line-height:20px;font-weight:600;">${code}</td></tr>
    <tr><td valign="top" style="padding:0 12px 8px 0;font-size:15px;line-height:20px;">Nabídka</td><td align="right" valign="top" style="padding:0 0 8px;font-size:15px;line-height:20px;font-weight:600;">${label}</td></tr>
    ${until ? `<tr><td valign="top" style="padding:0 12px 8px 0;font-size:15px;line-height:20px;">Platnost</td><td align="right" valign="top" style="padding:0 0 8px;font-size:15px;line-height:20px;font-weight:600;">${until}</td></tr>` : ''}
  </table>`;
}

export interface CatalogItem {
  name: string;
  size?: string;
  quantity: number;
  price: number;
}

export function itemsTable(items: CatalogItem[]) {
  const rows = items.map((item) => `
    <tr>
      <td valign="top" style="padding:0 12px 8px 0;font-size:15px;line-height:20px;">
        ${item.name}${item.size ? ` · ${item.size}` : ''} · ${item.quantity}×
      </td>
      <td align="right" valign="top" style="padding:0 0 8px;font-size:15px;line-height:20px;font-weight:600;">
        ${item.price.toLocaleString('cs-CZ')} Kč
      </td>
    </tr>
  `).join('');

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">${rows}</table>`;
}

export function sectionDivider() {
  return `<tr><td height="1" bgcolor="#000000" style="height:1px;line-height:1px;font-size:1px;background:#000000;padding:0;">&nbsp;</td></tr>`;
}

export interface EmailTemplateParams {
  subject: string;
  preheader: string;
  header2Title: string;
  header2Subtitle: string;
  heroImage?: {
    src: string;
    height: number; // 600 (square) or 750 (portrait)
    alt?: string;
  };
  infoHtml: string;
  photoGrid?: string[];
  actionText: string;
  actionButton: {
    label: string;
    href: string;
  };
  showBrowseAll?: boolean;
  marketing?: boolean;
  unsubscribeUrl?: string;
  webVersionUrl?: string;
}

export function buildEmailHtml(params: EmailTemplateParams): string {
  const {
    subject,
    preheader,
    header2Title,
    header2Subtitle,
    heroImage = {
      src: 'https://placehold.co/600x600/f2f2f2/000000.png?text=Hlavn%C3%AD%20obr%C3%A1zek%20600x600',
      height: 600,
      alt: 'Hlavní obrázek',
    },
    infoHtml,
    photoGrid = [
      'https://placehold.co/299x375/f2f2f2/000000.png?text=Produkt%201',
      'https://placehold.co/300x375/f2f2f2/000000.png?text=Produkt%202',
      'https://placehold.co/299x375/f2f2f2/000000.png?text=Produkt%203',
      'https://placehold.co/300x375/f2f2f2/000000.png?text=Produkt%204',
    ],
    actionText,
    actionButton,
    showBrowseAll = true,
    marketing = false,
    unsubscribeUrl,
    webVersionUrl,
  } = params;

  return `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${subject}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  body { margin:0; padding:0; background:#ffffff; }
  table { border-collapse:collapse; }
  a { color:#000000; }
  @media (max-width:620px) {
    .wrap { width:100% !important; max-width:100% !important; }
    .pad-info { padding-left:24px !important; padding-right:24px !important; }
    .pad-h2 { padding-left:24px !important; padding-right:24px !important; }
    img.fluid { width:100% !important; height:auto !important; }
    table.grid { width:100% !important; }
    td.gcell { width:49.8% !important; }
    td.fcol { padding-left:24px !important; width:50% !important; }
    td.pad-foot { padding-left:24px !important; padding-right:24px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#ffffff;">
<!-- Subject: ${subject} -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:#ffffff;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;">
<tr><td align="center" style="padding:0;">

  <!-- Frame: 602px = 600px content + 1px black border each side -->
  <table role="presentation" class="wrap" width="602" cellpadding="0" cellspacing="0" border="0"
         style="width:602px;max-width:602px;border:1px solid #000000;border-collapse:separate;border-spacing:0;font-family:'Inter',Arial,Helvetica,sans-serif;color:#000000;">
    <!-- Section 1 - header 1 (72px) -->
    <tr>
      <td class="" height="72" align="center" valign="middle" style="height:72px;padding:0 20px;font-size:15px;line-height:20px;">
        <a href="${WEBSITE_URL}" style="text-decoration:none;color:#000000;display:block;">
          <span style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:24px;line-height:72px;font-weight:700;letter-spacing:3px;color:#000000;">UFO SPORT</span>
        </a>
      </td>
    </tr>
    <tr><td height="1" bgcolor="#000000" style="height:1px;line-height:1px;font-size:1px;background:#000000;padding:0;">&nbsp;</td></tr>
    <!-- Section 2 - header 2 (136px) -->
    <tr>
      <td class="pad-h2" height="136" align="center" valign="middle" style="height:136px;padding:0 40px;font-size:15px;line-height:20px;">
        <div style="font-size:15px;line-height:20px;font-weight:700;text-transform:uppercase;margin:0 0 12px;">${header2Title}</div>
        <div style="font-size:15px;line-height:20px;font-weight:400;margin:0 auto;max-width:460px;">${header2Subtitle}</div>
      </td>
    </tr>
    <tr><td height="1" bgcolor="#000000" style="height:1px;line-height:1px;font-size:1px;background:#000000;padding:0;">&nbsp;</td></tr>
    <!-- Section 3 - image (${heroImage.height === 600 ? 'square, 600x600' : 'portrait, 600x750'}) -->
    <tr>
      <td style="padding:0;font-size:0;line-height:0;">
        <img class="fluid" src="${heroImage.src}" width="600" height="${heroImage.height}" alt="${heroImage.alt || 'Hlavní obrázek'}" style="display:block;width:600px;height:${heroImage.height}px;border:0;">
      </td>
    </tr>
    <tr><td height="1" bgcolor="#000000" style="height:1px;line-height:1px;font-size:1px;background:#000000;padding:0;">&nbsp;</td></tr>
    <!-- Section 4 - info (234px) -->
    <tr>
      <td class="pad-info" height="234" align="left" valign="middle" style="height:234px;padding:0 80px;font-size:15px;line-height:20px;">
        ${infoHtml}
      </td>
    </tr>
    <tr><td height="1" bgcolor="#000000" style="height:1px;line-height:1px;font-size:1px;background:#000000;padding:0;">&nbsp;</td></tr>
    <!-- Section 5 - photo grid 2x2 (4 rectangles, 300x375) -->
    <tr>
      <td style="padding:0;font-size:0;line-height:0;">
        <table class="grid" role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;">
          <tr>
            <td class="gcell" width="299" style="width:299px;padding:0;font-size:0;line-height:0;"><img class="fluid" src="${photoGrid[0]}" width="299" height="375" alt="Produkt 1" style="display:block;width:299px;height:375px;border:0;"></td>
            <td width="1" bgcolor="#000000" style="width:1px;background:#000000;font-size:0;line-height:0;">&nbsp;</td>
            <td class="gcell" width="300" style="width:300px;padding:0;font-size:0;line-height:0;"><img class="fluid" src="${photoGrid[1]}" width="300" height="375" alt="Produkt 2" style="display:block;width:300px;height:375px;border:0;"></td>
          </tr>
          <tr><td colspan="3" height="1" bgcolor="#000000" style="height:1px;background:#000000;font-size:1px;line-height:1px;">&nbsp;</td></tr>
          <tr>
            <td class="gcell" width="299" style="width:299px;padding:0;font-size:0;line-height:0;"><img class="fluid" src="${photoGrid[2]}" width="299" height="375" alt="Produkt 3" style="display:block;width:299px;height:375px;border:0;"></td>
            <td width="1" bgcolor="#000000" style="width:1px;background:#000000;font-size:0;line-height:0;">&nbsp;</td>
            <td class="gcell" width="300" style="width:300px;padding:0;font-size:0;line-height:0;"><img class="fluid" src="${photoGrid[3]}" width="300" height="375" alt="Produkt 4" style="display:block;width:300px;height:375px;border:0;"></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td height="1" bgcolor="#000000" style="height:1px;line-height:1px;font-size:1px;background:#000000;padding:0;">&nbsp;</td></tr>
    <!-- Section 6 - text + black button (234px) -->
    <tr>
      <td class="pad-info" height="234" align="center" valign="middle" style="height:234px;padding:0 40px;font-size:15px;line-height:20px;">
        <p style="margin:0 0 0px;">${actionText}</p>
        <div style="height:24px;line-height:24px;font-size:0;">&nbsp;</div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;border-collapse:separate;">
          <tr>
            <td align="center" width="240" bgcolor="#000000" style="width:240px;background:#000000;border-radius:2px;">
              <a href="${actionButton.href}" style="display:block;height:44px;line-height:44px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;letter-spacing:1px;color:#ffffff;text-decoration:none;text-transform:uppercase;background:#000000;border-radius:2px;">${actionButton.label}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${showBrowseAll ? `
    <tr><td height="1" bgcolor="#000000" style="height:1px;line-height:1px;font-size:1px;background:#000000;padding:0;">&nbsp;</td></tr>
    <!-- Section 7 - ZOBRAZIT VŠE button (136px) -->
    <tr>
      <td class="" height="136" align="center" valign="middle" style="height:136px;padding:0 20px;font-size:15px;line-height:20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;border-collapse:separate;">
          <tr>
            <td align="center" width="240" bgcolor="#000000" style="width:240px;background:#000000;border-radius:2px;">
              <a href="${WEBSITE_URL}/produkty" style="display:block;height:44px;line-height:44px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;letter-spacing:1px;color:#ffffff;text-decoration:none;text-transform:uppercase;background:#000000;border-radius:2px;">ZOBRAZIT VŠE</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>` : ''}
    <tr><td height="1" bgcolor="#000000" style="height:1px;line-height:1px;font-size:1px;background:#000000;padding:0;">&nbsp;</td></tr>
    <!-- Footer 1 - two link columns (188px) -->
    <tr>
      <td height="188" style="height:188px;padding:0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;height:188px;">
          <tr>
            <td class="fcol" width="299" valign="top" style="width:299px;padding:36px 0 0 40px;font-family:'Inter',Arial,Helvetica,sans-serif;">
              <div style="margin:0 0 20px;font-size:15px;line-height:20px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;">Prozkoumat více</div>
              <div style="margin:0;font-size:15px;line-height:22px;text-transform:uppercase;"><a href="${WEBSITE_URL}/kolekce" style="color:#000000;text-decoration:none;">Kolekce</a></div>
              <div style="margin:0;font-size:15px;line-height:22px;text-transform:uppercase;"><a href="${WEBSITE_URL}/novinky" style="color:#000000;text-decoration:none;">Novinky</a></div>
              <div style="margin:0;font-size:15px;line-height:22px;text-transform:uppercase;"><a href="${WEBSITE_URL}/darky" style="color:#000000;text-decoration:none;">Najít dárek</a></div>
              <div style="margin:0;font-size:15px;line-height:22px;text-transform:uppercase;"><a href="${WEBSITE_URL}/darkove-poukazy" style="color:#000000;text-decoration:none;">Dárkové poukazy</a></div>
            </td>
            <td width="1" bgcolor="#000000" style="width:1px;background:#000000;font-size:0;line-height:0;">&nbsp;</td>
            <td class="fcol" width="300" valign="top" style="width:300px;padding:36px 0 0 40px;font-family:'Inter',Arial,Helvetica,sans-serif;">
              <div style="margin:0 0 20px;font-size:15px;line-height:20px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;">Naše služby</div>
              <div style="margin:0;font-size:15px;line-height:22px;text-transform:uppercase;"><a href="${WEBSITE_URL}/kontakt" style="color:#000000;text-decoration:none;">Kontakt</a></div>
              <div style="margin:0;font-size:15px;line-height:22px;text-transform:uppercase;"><a href="${WEBSITE_URL}/doprava-a-platba" style="color:#000000;text-decoration:none;">Doprava a platba</a></div>
              <div style="margin:0;font-size:15px;line-height:22px;text-transform:uppercase;"><a href="${WEBSITE_URL}/vraceni-zbozi" style="color:#000000;text-decoration:none;">Vrácení zboží</a></div>
              <div style="margin:0;font-size:15px;line-height:22px;text-transform:uppercase;"><a href="${WEBSITE_URL}/preprodej" style="color:#000000;text-decoration:none;">Program přeprodeje</a></div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td height="1" bgcolor="#000000" style="height:1px;line-height:1px;font-size:1px;background:#000000;padding:0;">&nbsp;</td></tr>
    <!-- Footer 2 - social icons + company details (270px) -->
    <tr>
      <td class="pad-foot" height="270" align="center" valign="middle" style="height:270px;padding:0 40px;font-family:'Inter',Arial,Helvetica,sans-serif;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 36px;">
          <tr>
            <td align="center" style="padding:0 18px;"><a href="https://www.instagram.com/ufosport"><img src="https://cdn.simpleicons.org/instagram/000000" width="24" height="24" alt="Instagram" style="display:block;width:24px;height:24px;border:0;"></a></td>
            <td align="center" style="padding:0 18px;"><a href="https://www.tiktok.com/@ufosport"><img src="https://cdn.simpleicons.org/tiktok/000000" width="24" height="24" alt="TikTok" style="display:block;width:24px;height:24px;border:0;"></a></td>
            <td align="center" style="padding:0 18px;"><a href="https://www.linkedin.com/company/ufosport"><img src="https://cdn.simpleicons.org/linkedin/000000" width="24" height="24" alt="LinkedIn" style="display:block;width:24px;height:24px;border:0;"></a></td>
            <td align="center" style="padding:0 18px;"><a href="https://www.youtube.com/@ufosport"><img src="https://cdn.simpleicons.org/youtube/000000" width="24" height="24" alt="YouTube" style="display:block;width:24px;height:24px;border:0;"></a></td>
            <td align="center" style="padding:0 18px;"><a href="https://www.facebook.com/ufosport"><img src="https://cdn.simpleicons.org/facebook/000000" width="24" height="24" alt="Facebook" style="display:block;width:24px;height:24px;border:0;"></a></td>
          </tr>
        </table>
        <div style="font-size:15px;line-height:20px;font-weight:400;text-align:center;">
          <div style="margin:0;">UFO SPORT</div>
          <div style="margin:0;"><a href="${WEBSITE_URL}/kontakt" style="color:#000000;text-decoration:underline;">Ulice 1, 110 00 Praha 1 – IČO 000 00 000</a></div>
          ${marketing ? `<div style="margin:16px 0 0;">Pokud již nechcete dostávat náš newsletter, můžete se odhlásit <a href="${unsubscribeUrl || `${WEBSITE_URL}/odhlasit-odber`}" style="color:#000000;text-decoration:underline;">zde</a>.</div>` : ''}
          <div style="${marketing ? 'margin:0px 0 0;' : 'margin:16px 0 0;'}">Více o <a href="${WEBSITE_URL}/ochrana-osobnich-udaju" style="color:#000000;text-decoration:underline;">zásadách ochrany osobních údajů</a>.</div>
          <div style="margin:0;">Zobrazit e-mail ve webovém prohlížeči: <a href="${webVersionUrl || `${WEBSITE_URL}/email/web`}" style="color:#000000;text-decoration:underline;">zde</a>.</div>
        </div>
      </td>
    </tr>
  </table>

</td></tr>
</table>
</body>
</html>`;
}

/** Legacy wrapper compatibility */
export function emailWrapper(content: string, unsubscribeUrl?: string) {
  return buildEmailHtml({
    subject: 'UFO SPORT',
    preheader: '',
    header2Title: 'UFO SPORT',
    header2Subtitle: '',
    infoHtml: content,
    actionText: '',
    actionButton: { label: 'Přejít do obchodu', href: WEBSITE_URL },
    marketing: Boolean(unsubscribeUrl),
    unsubscribeUrl,
  });
}
