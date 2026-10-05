const WEBSITE_URL = process.env.NEXTAUTH_URL || 'https://www.ufosport.cz';
const LOGO_URL = `${WEBSITE_URL}/logo.png`;

export { WEBSITE_URL, LOGO_URL };

export const FONT_STACK = "'Inter', Arial, Helvetica, sans-serif";
export const HEADING_STACK = "'Inter', Arial, Helvetica, sans-serif";

export function toAbsoluteUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${WEBSITE_URL}${url}`;
  return `${WEBSITE_URL}/${url}`;
}

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
  image?: string;
  slug?: string;
}

export const DEFAULT_PRODUCT_PHOTOS = [
  'https://ilnuafwmrjyn1hfl.public.blob.vercel-storage.com/1765565438929-reborn.jpg',
  'https://ilnuafwmrjyn1hfl.public.blob.vercel-storage.com/1776168620867-ahoj2.jpg',
  'https://res.cloudinary.com/dju6l748w/image/upload/v1767878842/kkk_vs7qti.jpg',
  'https://res.cloudinary.com/dju6l748w/image/upload/v1767878837/KERAMIKA_TRAY_bnxd83.jpg',
];

export function itemsTable(items: CatalogItem[]) {
  const rows = items.map((item) => {
    const itemHref = item.slug ? `${WEBSITE_URL}/produkt/${item.slug}` : undefined;
    const nameContent = itemHref
      ? `<a href="${itemHref}" target="_blank" style="color:#000000;text-decoration:underline;"><span style="font-weight:600;">${item.name}</span></a>`
      : `<span style="font-weight:600;">${item.name}</span>`;

    const imgTag = item.image
      ? itemHref
        ? `<a href="${itemHref}" target="_blank" style="display:block;border:0;line-height:0;"><img src="${toAbsoluteUrl(item.image)}" width="48" height="48" alt="${item.name}" style="display:block;width:48px;height:48px;object-fit:cover;border:1px solid #000000;" /></a>`
        : `<img src="${toAbsoluteUrl(item.image)}" width="48" height="48" alt="${item.name}" style="display:block;width:48px;height:48px;object-fit:cover;border:1px solid #000000;" />`
      : '';

    return `
      <tr>
        <td valign="top" style="padding:0 12px 12px 0;font-size:15px;line-height:20px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              ${imgTag ? `<td valign="middle" style="padding-right:12px;">${imgTag}</td>` : ''}
              <td valign="middle" style="font-size:15px;line-height:20px;">
                ${nameContent}${item.size ? ` · ${item.size}` : ''} · ${item.quantity}×
              </td>
            </tr>
          </table>
        </td>
        <td align="right" valign="middle" style="padding:0 0 12px;font-size:15px;line-height:20px;font-weight:600;white-space:nowrap;">
          ${item.price.toLocaleString('cs-CZ')} Kč
        </td>
      </tr>
    `;
  }).join('');

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">${rows}</table>`;
}

export function sectionDivider() {
  return `<tr><td height="1" bgcolor="#000000" style="height:1px;line-height:1px;font-size:1px;background:#000000;padding:0;">&nbsp;</td></tr>`;
}

export interface LinkedProduct {
  id?: string;
  name?: string;
  slug: string;
  image: string;
  price?: number | string;
}

export interface EmailTemplateCustomization {
  hiddenSections?: string[];
  heroProduct?: LinkedProduct | null;
  gridProducts?: LinkedProduct[];
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
    href?: string;
    productSlug?: string;
  };
  infoHtml: string;
  photoGrid?: string[];
  photoGridItems?: Array<{
    src: string;
    href?: string;
    alt?: string;
    productSlug?: string;
  }>;
  actionText: string;
  actionButton: {
    label: string;
    href: string;
  };
  showBrowseAll?: boolean;
  marketing?: boolean;
  unsubscribeUrl?: string;
  webVersionUrl?: string;
  customization?: EmailTemplateCustomization;
  adminMode?: boolean;
}

export function buildEmailHtml(params: EmailTemplateParams): string {
  const {
    subject,
    preheader,
    header2Title,
    header2Subtitle,
    infoHtml,
    actionText,
    actionButton,
    showBrowseAll = true,
    marketing = false,
    unsubscribeUrl,
    webVersionUrl,
    customization,
    adminMode = false,
  } = params;

  const hiddenSections = new Set(customization?.hiddenSections || []);

  // Determine Hero image source, link and dimensions
  let heroImageSrc = params.heroImage?.src || DEFAULT_PRODUCT_PHOTOS[0];
  let heroImageHref = params.heroImage?.href || '';
  let heroImageAlt = params.heroImage?.alt || 'Hlavní obrázek';
  const heroImageHeight = params.heroImage?.height || 600;

  if (customization?.heroProduct) {
    heroImageSrc = toAbsoluteUrl(customization.heroProduct.image);
    heroImageHref = `${WEBSITE_URL}/produkt/${customization.heroProduct.slug}`;
    heroImageAlt = customization.heroProduct.name || heroImageAlt;
  } else if (params.heroImage?.productSlug) {
    heroImageHref = `${WEBSITE_URL}/produkt/${params.heroImage.productSlug}`;
  }

  heroImageSrc = toAbsoluteUrl(heroImageSrc);

  // Determine 2x2 Grid items (4 cells)
  const cleanedPhotos = (params.photoGrid || []).filter(Boolean);
  const fallbackPhotos = [...cleanedPhotos, ...DEFAULT_PRODUCT_PHOTOS];

  const gridCells = [0, 1, 2, 3].map((idx) => {
    if (customization?.gridProducts && customization.gridProducts[idx]) {
      const p = customization.gridProducts[idx];
      return {
        src: toAbsoluteUrl(p.image),
        href: `${WEBSITE_URL}/produkt/${p.slug}`,
        alt: p.name || `Produkt ${idx + 1}`,
      };
    }
    if (params.photoGridItems && params.photoGridItems[idx]) {
      const item = params.photoGridItems[idx];
      return {
        src: toAbsoluteUrl(item.src),
        href: item.href || (item.productSlug ? `${WEBSITE_URL}/produkt/${item.productSlug}` : `${WEBSITE_URL}/produkty`),
        alt: item.alt || `Produkt ${idx + 1}`,
      };
    }
    const photo = fallbackPhotos[idx] || DEFAULT_PRODUCT_PHOTOS[idx % DEFAULT_PRODUCT_PHOTOS.length];
    return {
      src: toAbsoluteUrl(photo),
      href: `${WEBSITE_URL}/produkty`,
      alt: `Produkt ${idx + 1}`,
    };
  });

  // Admin interactive helpers
  const renderDeleteBtn = (sectionId: string, label = 'Odstranit tuto sekci z e-mailu') => {
    if (!adminMode) return '';
    return `<button class="section-delete-btn" type="button" title="${label}" onclick="window.parent.postMessage({type:'DELETE_SECTION',sectionId:'${sectionId}'},'*')">✕</button>`;
  };

  // Build modular sections list
  interface SectionDef {
    id: string;
    html: string;
  }

  const sections: SectionDef[] = [];

  // Section 1 - header 1 (72px)
  if (!hiddenSections.has('header1')) {
    sections.push({
      id: 'header1',
      html: `
        <tr>
          <td height="72" align="center" valign="middle" style="height:72px;padding:0 20px;font-size:15px;line-height:20px;position:relative;">
            ${renderDeleteBtn('header1')}
            <a href="${WEBSITE_URL}" style="text-decoration:none;color:#000000;display:block;">
              <span style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:24px;line-height:72px;font-weight:700;letter-spacing:3px;color:#000000;">UFO SPORT</span>
            </a>
          </td>
        </tr>
      `,
    });
  }

  // Section 2 - header 2 (136px)
  if (!hiddenSections.has('header2')) {
    sections.push({
      id: 'header2',
      html: `
        <tr>
          <td class="pad-h2" height="136" align="center" valign="middle" style="height:136px;padding:0 40px;font-size:15px;line-height:20px;position:relative;">
            ${renderDeleteBtn('header2')}
            <div style="font-size:15px;line-height:20px;font-weight:700;text-transform:uppercase;margin:0 0 12px;">${header2Title}</div>
            <div style="font-size:15px;line-height:20px;font-weight:400;margin:0 auto;max-width:460px;">${header2Subtitle}</div>
          </td>
        </tr>
      `,
    });
  }

  // Section 3 - Hero image (600x600 or 600x750)
  if (!hiddenSections.has('heroImage')) {
    let heroContent = `<img class="fluid" src="${heroImageSrc}" width="600" height="${heroImageHeight}" alt="${heroImageAlt}" style="display:block;width:600px;height:${heroImageHeight}px;border:0;">`;
    if (heroImageHref && !adminMode) {
      heroContent = `<a href="${heroImageHref}" target="_blank" style="display:block;text-decoration:none;border:0;line-height:0;">${heroContent}</a>`;
    }

    sections.push({
      id: 'heroImage',
      html: `
        <tr>
          <td style="padding:0;font-size:0;line-height:0;position:relative;">
            ${
              adminMode
                ? `<div class="photo-container" style="position:relative;display:block;width:600px;height:${heroImageHeight}px;overflow:hidden;line-height:0;font-size:0;">
                    ${renderDeleteBtn('heroImage')}
                    <button class="photo-overlay-btn" type="button" title="Vybrat produkt pro hlavní fotku" onclick="window.parent.postMessage({type:'OPEN_PRODUCT_PICKER',target:'hero',slotIndex:0},'*')">+</button>
                    <span class="photo-overlay-badge">+ ZMĚNIT PRODUKT</span>
                    ${heroContent}
                  </div>`
                : heroContent
            }
          </td>
        </tr>
      `,
    });
  }

  // Section 4 - Info (234px)
  if (!hiddenSections.has('info')) {
    sections.push({
      id: 'info',
      html: `
        <tr>
          <td class="pad-info" height="234" align="left" valign="middle" style="height:234px;padding:0 80px;font-size:15px;line-height:20px;position:relative;">
            ${renderDeleteBtn('info')}
            ${infoHtml}
          </td>
        </tr>
      `,
    });
  }

  // Section 5 - Photo grid 2x2 (4 rectangles, 300x375)
  if (!hiddenSections.has('photoGrid')) {
    const renderCell = (idx: number, width: number) => {
      const cell = gridCells[idx];
      const img = `<img class="fluid" src="${cell.src}" width="${width}" height="375" alt="${cell.alt}" style="display:block;width:${width}px;height:375px;border:0;">`;
      if (adminMode) {
        return `
          <div class="photo-container" style="position:relative;display:block;width:${width}px;height:375px;overflow:hidden;line-height:0;font-size:0;">
            <button class="photo-overlay-btn photo-cell-btn" type="button" title="Vybrat produkt pro pozici #${idx + 1}" onclick="window.parent.postMessage({type:'OPEN_PRODUCT_PICKER',target:'grid',slotIndex:${idx}},'*')">+</button>
            <span class="photo-cell-badge">+ #${idx + 1}</span>
            ${img}
          </div>
        `;
      }
      return `<a href="${cell.href}" target="_blank" style="display:block;text-decoration:none;border:0;line-height:0;">${img}</a>`;
    };

    sections.push({
      id: 'photoGrid',
      html: `
        <tr>
          <td style="padding:0;font-size:0;line-height:0;position:relative;">
            ${adminMode ? renderDeleteBtn('photoGrid', 'Odstranit celou 2x2 mřížku produktů') : ''}
            <table class="grid" role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;">
              <tr>
                <td class="gcell" width="299" style="width:299px;padding:0;font-size:0;line-height:0;">${renderCell(0, 299)}</td>
                <td width="1" bgcolor="#000000" style="width:1px;background:#000000;font-size:0;line-height:0;">&nbsp;</td>
                <td class="gcell" width="300" style="width:300px;padding:0;font-size:0;line-height:0;">${renderCell(1, 300)}</td>
              </tr>
              <tr><td colspan="3" height="1" bgcolor="#000000" style="height:1px;background:#000000;font-size:1px;line-height:1px;">&nbsp;</td></tr>
              <tr>
                <td class="gcell" width="299" style="width:299px;padding:0;font-size:0;line-height:0;">${renderCell(2, 299)}</td>
                <td width="1" bgcolor="#000000" style="width:1px;background:#000000;font-size:0;line-height:0;">&nbsp;</td>
                <td class="gcell" width="300" style="width:300px;padding:0;font-size:0;line-height:0;">${renderCell(3, 300)}</td>
              </tr>
            </table>
          </td>
        </tr>
      `,
    });
  }

  // Section 6 - Action text + button (234px)
  if (!hiddenSections.has('actionButton')) {
    sections.push({
      id: 'actionButton',
      html: `
        <tr>
          <td class="pad-info" height="234" align="center" valign="middle" style="height:234px;padding:0 40px;font-size:15px;line-height:20px;position:relative;">
            ${renderDeleteBtn('actionButton')}
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
      `,
    });
  }

  // Section 7 - ZOBRAZIT VŠE button (136px)
  if (showBrowseAll && !hiddenSections.has('browseAll')) {
    sections.push({
      id: 'browseAll',
      html: `
        <tr>
          <td class="" height="136" align="center" valign="middle" style="height:136px;padding:0 20px;font-size:15px;line-height:20px;position:relative;">
            ${renderDeleteBtn('browseAll')}
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;border-collapse:separate;">
              <tr>
                <td align="center" width="240" bgcolor="#000000" style="width:240px;background:#000000;border-radius:2px;">
                  <a href="${WEBSITE_URL}/produkty" style="display:block;height:44px;line-height:44px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;letter-spacing:1px;color:#ffffff;text-decoration:none;text-transform:uppercase;background:#000000;border-radius:2px;">ZOBRAZIT VŠE</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `,
    });
  }

  // Section 8 - Footer 1 (188px)
  if (!hiddenSections.has('footerLinks')) {
    sections.push({
      id: 'footerLinks',
      html: `
        <tr>
          <td height="188" style="height:188px;padding:0;position:relative;">
            ${renderDeleteBtn('footerLinks')}
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
      `,
    });
  }

  // Section 9 - Footer 2 (270px)
  if (!hiddenSections.has('footerSocial')) {
    sections.push({
      id: 'footerSocial',
      html: `
        <tr>
          <td class="pad-foot" height="270" align="center" valign="middle" style="height:270px;padding:0 40px;font-family:'Inter',Arial,Helvetica,sans-serif;position:relative;">
            ${renderDeleteBtn('footerSocial')}
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
      `,
    });
  }

  // Join modular sections with single black divider lines
  const bodyContent = sections.map((s) => s.html).join(sectionDivider());

  // Injected CSS for admin interactive mode
  const adminStyles = adminMode
    ? `
      /* Admin interactive styles */
      .section-delete-btn {
        position: absolute;
        top: 8px;
        left: 8px;
        width: 24px;
        height: 24px;
        background: #000000;
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.8);
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-family: 'Inter', Arial, sans-serif;
        font-size: 13px;
        font-weight: 700;
        line-height: 1;
        opacity: 0;
        transition: opacity 0.15s ease, background 0.15s ease, transform 0.15s ease;
        z-index: 100;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      }
      tr:hover .section-delete-btn,
      td:hover .section-delete-btn,
      .photo-container:hover .section-delete-btn {
        opacity: 0.85;
      }
      .section-delete-btn:hover {
        opacity: 1 !important;
        background: #dc2626 !important;
        border-color: #dc2626 !important;
        transform: scale(1.1);
      }
      .photo-container {
        cursor: pointer;
      }
      .photo-overlay-btn {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 48px;
        height: 48px;
        background: rgba(0, 0, 0, 0.88);
        color: #ffffff;
        border: 2px solid #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-family: 'Inter', Arial, sans-serif;
        font-size: 26px;
        font-weight: 300;
        line-height: 1;
        opacity: 0;
        transition: opacity 0.2s ease, transform 0.2s ease, background 0.2s ease;
        z-index: 90;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      }
      .photo-cell-btn {
        width: 40px;
        height: 40px;
        font-size: 22px;
      }
      .photo-container:hover .photo-overlay-btn {
        opacity: 0.95;
      }
      .photo-overlay-btn:hover {
        opacity: 1 !important;
        background: #000000 !important;
        transform: translate(-50%, -50%) scale(1.15);
      }
      .photo-overlay-badge {
        position: absolute;
        bottom: 16px;
        left: 50%;
        transform: translateX(-50%);
        background: #000000;
        color: #ffffff;
        font-family: 'Inter', Arial, sans-serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1px;
        padding: 5px 12px;
        border: 1px solid #ffffff;
        opacity: 0;
        transition: opacity 0.2s ease;
        pointer-events: none;
        white-space: nowrap;
        z-index: 91;
      }
      .photo-container:hover .photo-overlay-badge {
        opacity: 0.95;
      }
      .photo-cell-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        background: #000000;
        color: #ffffff;
        font-family: 'Inter', Arial, sans-serif;
        font-size: 10px;
        font-weight: 700;
        padding: 2px 6px;
        border: 1px solid #ffffff;
        opacity: 0;
        transition: opacity 0.2s ease;
        pointer-events: none;
        z-index: 91;
      }
      .photo-container:hover .photo-cell-badge {
        opacity: 0.9;
      }
    `
    : '';

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
  ${adminStyles}
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
    ${bodyContent}
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
