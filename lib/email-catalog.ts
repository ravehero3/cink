import {
  buildEmailHtml,
  emailButton,
  heading,
  kicker,
  bodyText,
  mutedText,
  infoBox,
  promoBlock,
  itemsTable,
  sectionDivider,
  WEBSITE_URL,
  FONT_STACK,
  HEADING_STACK,
  toAbsoluteUrl,
  type CatalogItem,
  type EmailTemplateParams,
  type EmailTemplateCustomization,
  type LinkedProduct,
} from './email-layout';

export type { EmailTemplateCustomization, LinkedProduct };

export type EmailType =
  | 'ORDER_CONFIRMATION'
  | 'PAYMENT_SUCCESS'
  | 'SHIPPING_NOTIFICATION'
  | 'NEWSLETTER_WELCOME'
  | 'PASSWORD_RESET'
  | 'ABANDONED_CART'
  | 'ADMIN_ORDER_NOTIFICATION'
  | 'POST_PURCHASE_DISCOUNT'
  | 'REVIEW_REQUEST'
  | 'WINBACK'
  | 'CART_REMINDER_DISCOUNT'
  | 'NEWSLETTER_COLLECTION'
  | 'NEWSLETTER_FIRST_ORDER'
  | 'ACCOUNT_WELCOME'
  | 'PAYMENT_REMINDER'
  | 'CROSS_SELL';

export const EMAIL_CATALOG: {
  id: EmailType;
  label: string;
  description: string;
  trigger: string;
  triggerDetail: string;
  category: 'transactional' | 'journey';
  marketing: boolean;
}[] = [
  {
    id: 'ORDER_CONFIRMATION',
    label: 'Potvrzení objednávky',
    description: 'Odesílá se zákazníkovi ihned po vytvoření objednávky.',
    trigger: 'Automaticky',
    triggerDetail: 'Po odeslání objednávky',
    category: 'transactional',
    marketing: false,
  },
  {
    id: 'PAYMENT_SUCCESS',
    label: 'Platba přijata',
    description: 'Odesílá se po úspěšném potvrzení platby přes GoPay.',
    trigger: 'Automaticky',
    triggerDetail: 'Po potvrzení platby (GoPay)',
    category: 'transactional',
    marketing: false,
  },
  {
    id: 'SHIPPING_NOTIFICATION',
    label: 'Zásilka na cestě',
    description: 'Odesílá se při změně stavu objednávky na „Odesláno“.',
    trigger: 'Manuálně',
    triggerDetail: 'Změnou stavu objednávky',
    category: 'transactional',
    marketing: false,
  },
  {
    id: 'NEWSLETTER_WELCOME',
    label: 'Uvítací newsletter',
    description: 'Odesílá se při přihlášení k odběru novinek.',
    trigger: 'Automaticky',
    triggerDetail: 'Při přihlášení k newsletteru',
    category: 'transactional',
    marketing: true,
  },
  {
    id: 'PASSWORD_RESET',
    label: 'Obnovení hesla',
    description: 'Odesílá se při žádosti o reset hesla.',
    trigger: 'Automaticky',
    triggerDetail: 'Při žádosti o reset hesla',
    category: 'transactional',
    marketing: false,
  },
  {
    id: 'ADMIN_ORDER_NOTIFICATION',
    label: 'Notifikace adminu',
    description: 'Interní zpráva o nové objednávce.',
    trigger: 'Automaticky',
    triggerDetail: 'Po odeslání objednávky',
    category: 'transactional',
    marketing: false,
  },
  {
    id: 'ABANDONED_CART',
    label: 'Zapomenutý košík',
    description: 'První připomínka nedokončené objednávky.',
    trigger: 'Cesta',
    triggerDetail: 'Cca 2 hodiny po nečinnosti v košíku',
    category: 'journey',
    marketing: true,
  },
  {
    id: 'CART_REMINDER_DISCOUNT',
    label: 'Košík se slevou',
    description: 'Druhá připomínka košíku s osobním slevovým kódem.',
    trigger: 'Cesta',
    triggerDetail: 'Cca 24 hodin po první připomínce',
    category: 'journey',
    marketing: true,
  },
  {
    id: 'POST_PURCHASE_DISCOUNT',
    label: 'Sleva po nákupu',
    description: 'Poděkování za nákup a osobní slevový kód na další objednávku.',
    trigger: 'Cesta',
    triggerDetail: '2 dny po zaplacené objednávce',
    category: 'journey',
    marketing: true,
  },
  {
    id: 'REVIEW_REQUEST',
    label: 'Žádost o recenzi',
    description: 'Prosba o zpětnou vazbu po doručení.',
    trigger: 'Cesta',
    triggerDetail: '7 dní po odeslání zásilky',
    category: 'journey',
    marketing: true,
  },
  {
    id: 'WINBACK',
    label: 'Návrat ke značce',
    description: 'Sleva pro zákazníky, kteří dlouho nenakoupili.',
    trigger: 'Cesta',
    triggerDetail: '60 dní od poslední objednávky',
    category: 'journey',
    marketing: true,
  },
  {
    id: 'NEWSLETTER_COLLECTION',
    label: 'Představení kolekce',
    description: 'Druhý e-mail v newsletterové cestě — kolekce a svět UFO.',
    trigger: 'Cesta',
    triggerDetail: '3 dny po přihlášení k newsletteru',
    category: 'journey',
    marketing: true,
  },
  {
    id: 'NEWSLETTER_FIRST_ORDER',
    label: 'Sleva na první nákup',
    description: 'Osobní kód pro odběratele bez dokončené objednávky.',
    trigger: 'Cesta',
    triggerDetail: '7 dní po přihlášení, pokud ještě nenakoupili',
    category: 'journey',
    marketing: true,
  },
  {
    id: 'ACCOUNT_WELCOME',
    label: 'Vítejte v účtu',
    description: 'Potvrzení registrace zákaznického účtu.',
    trigger: 'Cesta',
    triggerDetail: 'Ihned po vytvoření účtu',
    category: 'journey',
    marketing: false,
  },
  {
    id: 'PAYMENT_REMINDER',
    label: 'Připomínka platby',
    description: 'Připomínka nedokončené platby u vytvořené objednávky.',
    trigger: 'Cesta',
    triggerDetail: '3 hodiny po objednávce, pokud není zaplaceno',
    category: 'journey',
    marketing: false,
  },
  {
    id: 'CROSS_SELL',
    label: 'Doplňte look',
    description: 'Návrh dalších kousků po nákupu.',
    trigger: 'Cesta',
    triggerDetail: '10 dní po zaplacené objednávce',
    category: 'journey',
    marketing: true,
  },
];

export interface EmailVars {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  orderNumber?: string;
  items?: CatalogItem[];
  totalPrice?: number;
  shippingMethod?: string;
  zasilkovnaName?: string;
  pplName?: string;
  shippingStreet?: string;
  shippingCity?: string;
  shippingZip?: string;
  trackingNumber?: string;
  paymentDate?: string;
  resetLink?: string;
  promoCode?: string;
  promoLabel?: string;
  promoValidUntil?: string;
  productImages?: string[];
  isTest?: boolean;
}

export const SAMPLE_ITEMS: CatalogItem[] = [
  {
    name: 'TRIKO REBORN',
    size: 'L',
    quantity: 1,
    price: 850,
    image: 'https://ilnuafwmrjyn1hfl.public.blob.vercel-storage.com/1765565438929-reborn.jpg',
    slug: 'triko-reborn',
  },
  {
    name: 'TRIKO "PINK ALIEN"',
    size: 'UNI',
    quantity: 2,
    price: 800,
    image: 'https://ilnuafwmrjyn1hfl.public.blob.vercel-storage.com/1776168620867-ahoj2.jpg',
    slug: 'triko-pink-alien-very-rare',
  },
];

export const SAMPLE_VARS: EmailVars = {
  customerName: 'Jan Novák',
  customerEmail: 'jan.novak@example.cz',
  customerPhone: '+420 777 123 456',
  orderNumber: 'UFO26001',
  items: SAMPLE_ITEMS,
  productImages: [
    'https://ilnuafwmrjyn1hfl.public.blob.vercel-storage.com/1765565438929-reborn.jpg',
    'https://ilnuafwmrjyn1hfl.public.blob.vercel-storage.com/1776168620867-ahoj2.jpg',
    'https://res.cloudinary.com/dju6l748w/image/upload/v1767878842/kkk_vs7qti.jpg',
    'https://res.cloudinary.com/dju6l748w/image/upload/v1767878837/KERAMIKA_TRAY_bnxd83.jpg',
  ],
  totalPrice: 1650,
  shippingMethod: 'zasilkovna',
  zasilkovnaName: 'Zásilkovna Praha 1 — Centrum',
  trackingNumber: 'Z 123 456 7890',
  paymentDate: '5. 10. 2026',
  resetLink: `${WEBSITE_URL}/obnovit-heslo?token=sample123`,
  promoCode: 'UFO10',
  promoLabel: 'Sleva 10 % na váš košík',
  promoValidUntil: '48 hodin',
};

function getShippingLocation(vars: EmailVars): string {
  if (vars.shippingMethod === 'zasilkovna' && vars.zasilkovnaName) {
    return vars.zasilkovnaName;
  }
  if (vars.shippingMethod === 'ppl_address' && vars.shippingStreet) {
    return `${vars.shippingStreet}, ${vars.shippingZip || ''} ${vars.shippingCity || ''}`.trim();
  }
  if (vars.shippingMethod === 'ppl_parcelshop' && vars.pplName) {
    return `PPL ParcelShop – ${vars.pplName}`;
  }
  return vars.zasilkovnaName || 'Zásilkovna Praha 1 — Centrum';
}

function getCarrierName(vars: EmailVars): string {
  if (vars.shippingMethod?.startsWith('ppl')) return 'PPL';
  return 'Zásilkovna';
}

function getProductPhotos(items: CatalogItem[], vars: EmailVars): { primary: string; grid: string[] } {
  const boughtPhotos = [
    ...(vars.productImages || []),
    ...items.map((i) => i.image).filter(Boolean),
  ].filter((img, idx, arr) => arr.indexOf(img) === idx) as string[];

  const defaultGrid = [
    'https://ilnuafwmrjyn1hfl.public.blob.vercel-storage.com/1765565438929-reborn.jpg',
    'https://ilnuafwmrjyn1hfl.public.blob.vercel-storage.com/1776168620867-ahoj2.jpg',
    'https://res.cloudinary.com/dju6l748w/image/upload/v1767878842/kkk_vs7qti.jpg',
    'https://res.cloudinary.com/dju6l748w/image/upload/v1767878837/KERAMIKA_TRAY_bnxd83.jpg',
  ];

  const primary = boughtPhotos[0] || defaultGrid[0];
  const grid = [
    ...boughtPhotos,
    ...defaultGrid,
  ].slice(0, 4);

  return { primary, grid };
}

function buildTemplateParams(type: EmailType, vars: EmailVars): EmailTemplateParams {
  const name = vars.customerName || 'Jan Novák';
  const items = vars.items?.length ? vars.items : SAMPLE_ITEMS;
  const order = vars.orderNumber || 'UFO26001';
  const totalRaw = vars.totalPrice ?? 1650;
  const total = totalRaw.toLocaleString('cs-CZ');
  const promo = vars.promoCode || 'UFO10';
  const shippingLocation = getShippingLocation(vars);
  const carrierName = getCarrierName(vars);
  const totalQuantity = items.reduce((acc, i) => acc + (i.quantity || 1), 0);

  const discountAmount = Math.round(totalRaw * 0.1).toLocaleString('cs-CZ');
  const finalTotal = Math.max(0, totalRaw - Math.round(totalRaw * 0.1)).toLocaleString('cs-CZ');

  const { primary: primaryBoughtPhoto, grid: boughtGridPhotos } = getProductPhotos(items, vars);

  switch (type) {
    case 'ORDER_CONFIRMATION':
      return {
        subject: `Děkujeme za objednávku ${order}`,
        preheader: 'Obdrželi jsme vaši objednávku. Nyní dokončete platbu.',
        header2Title: 'Děkujeme za objednávku',
        header2Subtitle:
          'Obdrželi jsme vaši objednávku a brzy ji zpracujeme. Nyní prosím dokončete platbu, abychom mohli zásilku expedovat.',
        heroImage: {
          src: primaryBoughtPhoto,
          height: 600,
          alt: items[0]?.name || 'Zakoupený produkt',
          productSlug: items[0]?.slug,
        },
        infoHtml: `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
            <tr><td valign="top" style="padding:0 12px 10px 0;font-size:15px;line-height:20px;">Číslo objednávky</td><td align="right" valign="top" style="padding:0 0 10px;font-size:15px;line-height:20px;font-weight:600;">${order}</td></tr>
            ${items
              .map(
                (item) => {
                  const itemHref = item.slug ? `${WEBSITE_URL}/produkt/${item.slug}` : undefined;
                  const imgTag = item.image
                    ? `<td valign="middle" style="padding-right:12px;">
                        ${itemHref ? `<a href="${itemHref}" target="_blank" style="display:block;border:0;line-height:0;">` : ''}
                        <img src="${toAbsoluteUrl(item.image)}" width="48" height="48" alt="${item.name}" style="display:block;width:48px;height:48px;object-fit:cover;border:1px solid #000000;" />
                        ${itemHref ? `</a>` : ''}
                      </td>`
                    : '';
                  const nameTag = itemHref
                    ? `<a href="${itemHref}" target="_blank" style="color:#000000;text-decoration:underline;"><span style="font-weight:600;">${item.name}</span></a>`
                    : `<span style="font-weight:600;">${item.name}</span>`;

                  return `
                    <tr>
                      <td valign="top" style="padding:0 12px 10px 0;font-size:15px;line-height:20px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            ${imgTag}
                            <td valign="middle" style="font-size:15px;line-height:20px;">
                              ${nameTag}${item.size ? ` · ${item.size}` : ''} · ${item.quantity}×
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td align="right" valign="middle" style="padding:0 0 10px;font-size:15px;line-height:20px;font-weight:600;white-space:nowrap;">
                        ${item.price.toLocaleString('cs-CZ')} Kč
                      </td>
                    </tr>
                  `;
                }
              )
              .join('')}
            <tr><td valign="top" style="padding:0 12px 10px 0;font-size:15px;line-height:20px;">Místo vyzvednutí</td><td align="right" valign="top" style="padding:0 0 10px;font-size:15px;line-height:20px;font-weight:600;">${shippingLocation}</td></tr>
            <tr><td valign="top" style="padding:0 12px 10px 0;font-size:15px;line-height:20px;">Celkem</td><td align="right" valign="top" style="padding:0 0 10px;font-size:15px;line-height:20px;font-weight:600;">${total} Kč</td></tr>
          </table>
        `,
        photoGrid: boughtGridPhotos,
        photoGridItems: boughtGridPhotos.map((photo, i) => ({
          src: photo,
          productSlug: items[i]?.slug,
          alt: items[i]?.name || `Produkt ${i + 1}`,
        })),
        actionText: 'Platbu dokončíte v detailu objednávky.',
        actionButton: {
          label: 'Sledovat objednávku',
          href: `${WEBSITE_URL}/objednavka/${order}`,
        },
        marketing: false,
      };

    case 'PAYMENT_SUCCESS':
      return {
        subject: `Platba za objednávku ${order} byla přijata`,
        preheader: 'Vaši platbu jsme úspěšně přijali.',
        header2Title: 'Platba přijata',
        header2Subtitle: 'Děkujeme, vaši platbu jsme úspěšně přijali. Zásilku brzy připravíme k odeslání.',
        heroImage: {
          src: primaryBoughtPhoto,
          height: 600,
          alt: items[0]?.name || 'Zakoupený produkt',
        },
        infoHtml: `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
            <tr><td valign="top" style="padding:0 12px 10px 0;font-size:15px;line-height:20px;">Číslo objednávky</td><td align="right" valign="top" style="padding:0 0 10px;font-size:15px;line-height:20px;font-weight:600;">${order}</td></tr>
            <tr><td valign="top" style="padding:0 12px 10px 0;font-size:15px;line-height:20px;">Datum platby</td><td align="right" valign="top" style="padding:0 0 10px;font-size:15px;line-height:20px;font-weight:600;">${vars.paymentDate || '5. 10. 2026'}</td></tr>
            <tr><td valign="top" style="padding:0 12px 10px 0;font-size:15px;line-height:20px;">Způsob platby</td><td align="right" valign="top" style="padding:0 0 10px;font-size:15px;line-height:20px;font-weight:600;">Platební karta</td></tr>
            <tr><td valign="top" style="padding:0 12px 10px 0;font-size:15px;line-height:20px;">Místo vyzvednutí</td><td align="right" valign="top" style="padding:0 0 10px;font-size:15px;line-height:20px;font-weight:600;">${shippingLocation}</td></tr>
            <tr><td valign="top" style="padding:0 12px 10px 0;font-size:15px;line-height:20px;">Zaplaceno</td><td align="right" valign="top" style="padding:0 0 10px;font-size:15px;line-height:20px;font-weight:600;">${total} Kč</td></tr>
          </table>
        `,
        photoGrid: boughtGridPhotos,
        actionText: 'Stav objednávky můžete kdykoli sledovat online.',
        actionButton: {
          label: 'Sledovat objednávku',
          href: `${WEBSITE_URL}/objednavka/${order}`,
        },
        marketing: false,
      };

    case 'SHIPPING_NOTIFICATION':
      return {
        subject: `Vaše zásilka ${order} je na cestě`,
        preheader: 'Objednávka byla předána dopravci.',
        header2Title: 'Zásilka na cestě',
        header2Subtitle: `Vaše objednávka ${order} byla předána dopravci a je na cestě k vám.`,
        heroImage: {
          src: primaryBoughtPhoto,
          height: 600,
          alt: items[0]?.name || 'Zakoupený produkt',
        },
        infoHtml: `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
            <tr><td valign="top" style="padding:0 12px 10px 0;font-size:15px;line-height:20px;">Číslo objednávky</td><td align="right" valign="top" style="padding:0 0 10px;font-size:15px;line-height:20px;font-weight:600;">${order}</td></tr>
            <tr><td valign="top" style="padding:0 12px 10px 0;font-size:15px;line-height:20px;">Číslo zásilky</td><td align="right" valign="top" style="padding:0 0 10px;font-size:15px;line-height:20px;font-weight:600;">${vars.trackingNumber || 'Z 123 456 7890'}</td></tr>
            <tr><td valign="top" style="padding:0 12px 10px 0;font-size:15px;line-height:20px;">Dopravce</td><td align="right" valign="top" style="padding:0 0 10px;font-size:15px;line-height:20px;font-weight:600;">${carrierName}</td></tr>
            <tr><td valign="top" style="padding:0 12px 10px 0;font-size:15px;line-height:20px;">Místo vyzvednutí</td><td align="right" valign="top" style="padding:0 0 10px;font-size:15px;line-height:20px;font-weight:600;">${shippingLocation}</td></tr>
            <tr><td valign="top" style="padding:0 12px 10px 0;font-size:15px;line-height:20px;">Počet kusů</td><td align="right" valign="top" style="padding:0 0 10px;font-size:15px;line-height:20px;font-weight:600;">${totalQuantity}</td></tr>
          </table>
        `,
        photoGrid: boughtGridPhotos,
        actionText: 'Průběh doručení uvidíte ve sledování zásilky.',
        actionButton: {
          label: 'Sledovat zásilku',
          href: vars.trackingNumber
            ? `https://tracking.packeta.com/cs/?id=${vars.trackingNumber}`
            : `${WEBSITE_URL}/sledovani-objednavky`,
        },
        marketing: false,
      };

    case 'NEWSLETTER_WELCOME':
      return {
        subject: 'Novinky pro vás',
        preheader: 'Děkujeme za přihlášení k odběru našeho newsletteru.',
        header2Title: 'Novinky pro vás',
        header2Subtitle: 'Děkujeme za přihlášení k odběru našeho newsletteru.',
        heroImage: {
          src: 'https://placehold.co/600x750/f2f2f2/000000.png?text=Hlavn%C3%AD%20obr%C3%A1zek%20600x750',
          height: 750,
          alt: 'Hlavní obrázek 600x750',
        },
        infoHtml: `
          <p style="margin:0 0 14px;">Jako první se dozvíte novinky ze světa UFO SPORT, exkluzivní nabídky a nejnovější kolekce. Vytvořte si účet a získejte:</p>
          <ul style="margin:0;padding:0 0 0 24px;list-style:disc;">
            <li style="margin:0;">Předčasný přístup k výprodejům</li>
            <li style="margin:0;">Rychlý nákup s uloženými údaji</li>
            <li style="margin:0;">Přehled objednávek a vrácení</li>
            <li style="margin:0;">Uložené oblíbené položky</li>
            <li style="margin:0;">Program přeprodeje UFO SPORT</li>
          </ul>
        `,
        actionText: 'Vytvořte si účet a využívejte všechny výhody.',
        actionButton: {
          label: 'Vytvořit účet',
          href: `${WEBSITE_URL}/registrace`,
        },
        marketing: true,
      };

    case 'PASSWORD_RESET':
      return {
        subject: 'Obnovení hesla',
        preheader: 'Nastavte si nové heslo ke svému účtu.',
        header2Title: 'Obnovení hesla',
        header2Subtitle: 'Obdrželi jsme žádost o obnovení hesla k vašemu účtu.',
        heroImage: {
          src: 'https://placehold.co/600x600/f2f2f2/000000.png?text=Hlavn%C3%AD%20obr%C3%A1zek%20600x600',
          height: 600,
          alt: 'Hlavní obrázek 600x600',
        },
        infoHtml: `
          <p style="margin:0 0 14px;">Klikněte na tlačítko níže a nastavte si nové heslo. Odkaz je platný 1 hodinu.</p>
          <p style="margin:0 0 0px;">Pokud jste o obnovení hesla nežádali, tento e-mail ignorujte. Vaše heslo zůstane beze změny.</p>
        `,
        actionText: 'Z bezpečnostních důvodů odkaz nikomu nepřeposílejte.',
        actionButton: {
          label: 'Nastavit nové heslo',
          href: vars.resetLink || `${WEBSITE_URL}/obnovit-heslo`,
        },
        marketing: false,
      };

    case 'ADMIN_ORDER_NOTIFICATION':
      return {
        subject: `[UFO SPORT] Nová objednávka ${order}`,
        preheader: 'Zákazník vytvořil novou objednávku.',
        header2Title: 'Nová objednávka',
        header2Subtitle: `Zákazník právě vytvořil objednávku ${order}.`,
        heroImage: {
          src: primaryBoughtPhoto,
          height: 600,
          alt: items[0]?.name || 'Zakoupený produkt',
        },
        infoHtml: `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
            <tr><td valign="top" style="padding:0 12px 8px 0;font-size:15px;line-height:20px;">Zákazník</td><td align="right" valign="top" style="padding:0 0 8px;font-size:15px;line-height:20px;font-weight:600;">${name}</td></tr>
            <tr><td valign="top" style="padding:0 12px 8px 0;font-size:15px;line-height:20px;">E-mail</td><td align="right" valign="top" style="padding:0 0 8px;font-size:15px;line-height:20px;font-weight:600;">${vars.customerEmail || 'jan.novak@example.cz'}</td></tr>
            <tr><td valign="top" style="padding:0 12px 8px 0;font-size:15px;line-height:20px;">Stav platby</td><td align="right" valign="top" style="padding:0 0 8px;font-size:15px;line-height:20px;font-weight:600;">Čeká na platbu</td></tr>
            <tr><td valign="top" style="padding:0 12px 8px 0;font-size:15px;line-height:20px;">Doprava</td><td align="right" valign="top" style="padding:0 0 8px;font-size:15px;line-height:20px;font-weight:600;">${carrierName}</td></tr>
            <tr><td valign="top" style="padding:0 12px 8px 0;font-size:15px;line-height:20px;">Celkem</td><td align="right" valign="top" style="padding:0 0 8px;font-size:15px;line-height:20px;font-weight:600;">${total} Kč</td></tr>
            <tr><td valign="top" style="padding:0 12px 8px 0;font-size:15px;line-height:20px;">Vytvořeno</td><td align="right" valign="top" style="padding:0 0 8px;font-size:15px;line-height:20px;font-weight:600;">${vars.paymentDate || '5. 10. 2026, 18:04'}</td></tr>
          </table>
        `,
        photoGrid: boughtGridPhotos,
        actionText: 'Objednávku zpracujte v administraci.',
        actionButton: {
          label: 'Otevřít v administraci',
          href: `${WEBSITE_URL}/admin/objednavky/${order}`,
        },
        marketing: false,
      };

    case 'ABANDONED_CART':
      return {
        subject: 'Zapomněli jste něco v košíku?',
        preheader: 'Vaše položky na vás stále čekají.',
        header2Title: 'Zapomněli jste něco v košíku?',
        header2Subtitle: 'Vaše položky na vás stále čekají. Dokončete nákup, dokud je vaše velikost skladem.',
        heroImage: {
          src: primaryBoughtPhoto,
          height: 750,
          alt: items[0]?.name || 'Produkt v košíku',
        },
        infoHtml: `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
            ${items
              .map(
                (item) =>
                  `<tr>
                    <td valign="top" style="padding:0 12px 10px 0;font-size:15px;line-height:20px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          ${
                            item.image
                              ? `<td valign="middle" style="padding-right:12px;">
                                  <img src="${item.image}" width="48" height="48" alt="${item.name}" style="display:block;width:48px;height:48px;object-fit:cover;border:1px solid #000000;" />
                                </td>`
                              : ''
                          }
                          <td valign="middle" style="font-size:15px;line-height:20px;">
                            <span style="font-weight:600;">${item.name}</span>${item.size ? ` · ${item.size}` : ''} · ${item.quantity}×
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td align="right" valign="middle" style="padding:0 0 10px;font-size:15px;line-height:20px;font-weight:600;white-space:nowrap;">
                      ${item.price.toLocaleString('cs-CZ')} Kč
                    </td>
                  </tr>`
              )
              .join('')}
            <tr><td valign="top" style="padding:0 12px 10px 0;font-size:15px;line-height:20px;">Celkem</td><td align="right" valign="top" style="padding:0 0 10px;font-size:15px;line-height:20px;font-weight:600;">${total} Kč</td></tr>
          </table>
        `,
        photoGrid: boughtGridPhotos,
        actionText: 'Váš košík je uložený a čeká na dokončení.',
        actionButton: {
          label: 'Vrátit se do košíku',
          href: `${WEBSITE_URL}/kosik`,
        },
        marketing: true,
      };

    case 'CART_REMINDER_DISCOUNT':
      return {
        subject: 'Sleva 10 % na váš košík',
        preheader: 'Připravili jsme pro vás slevu na položky v košíku.',
        header2Title: 'Sleva na váš košík',
        header2Subtitle: 'Připravili jsme pro vás 10 % slevu na položky ve vašem košíku.',
        heroImage: {
          src: primaryBoughtPhoto,
          height: 600,
          alt: items[0]?.name || 'Položky v košíku',
        },
        infoHtml: `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
            <tr><td valign="top" style="padding:0 12px 8px 0;font-size:15px;line-height:20px;">Slevový kód</td><td align="right" valign="top" style="padding:0 0 8px;font-size:15px;line-height:20px;font-weight:600;">${promo}</td></tr>
            <tr><td valign="top" style="padding:0 12px 8px 0;font-size:15px;line-height:20px;">Původní cena</td><td align="right" valign="top" style="padding:0 0 8px;font-size:15px;line-height:20px;font-weight:600;">${total} Kč</td></tr>
            <tr><td valign="top" style="padding:0 12px 8px 0;font-size:15px;line-height:20px;">Sleva 10 %</td><td align="right" valign="top" style="padding:0 0 8px;font-size:15px;line-height:20px;font-weight:600;">−${discountAmount} Kč</td></tr>
            <tr><td valign="top" style="padding:0 12px 8px 0;font-size:15px;line-height:20px;">K úhradě</td><td align="right" valign="top" style="padding:0 0 8px;font-size:15px;line-height:20px;font-weight:600;">${finalTotal} Kč</td></tr>
            <tr><td valign="top" style="padding:0 12px 8px 0;font-size:15px;line-height:20px;">Platnost kódu</td><td align="right" valign="top" style="padding:0 0 8px;font-size:15px;line-height:20px;font-weight:600;">${vars.promoValidUntil || '48 hodin'}</td></tr>
          </table>
        `,
        photoGrid: boughtGridPhotos,
        actionText: 'Kód uplatníte v košíku před dokončením objednávky.',
        actionButton: {
          label: 'Uplatnit slevu',
          href: `${WEBSITE_URL}/kosik?kod=${promo}`,
        },
        marketing: true,
      };

    case 'POST_PURCHASE_DISCOUNT':
      return {
        subject: 'Děkujeme za nákup – máme pro vás slevu',
        preheader: 'Sleva 15 % na vaši další objednávku.',
        header2Title: 'Děkujeme za nákup',
        header2Subtitle: 'Jako poděkování pro vás máme slevu na další objednávku.',
        heroImage: {
          src: 'https://placehold.co/600x750/f2f2f2/000000.png?text=Hlavn%C3%AD%20obr%C3%A1zek%20600x750',
          height: 750,
          alt: 'Hlavní obrázek 600x750',
        },
        infoHtml: `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
            <tr><td valign="top" style="padding:0 12px 8px 0;font-size:15px;line-height:20px;">Slevový kód</td><td align="right" valign="top" style="padding:0 0 8px;font-size:15px;line-height:20px;font-weight:600;">${promo}</td></tr>
            <tr><td valign="top" style="padding:0 12px 8px 0;font-size:15px;line-height:20px;">Sleva</td><td align="right" valign="top" style="padding:0 0 8px;font-size:15px;line-height:20px;font-weight:600;">15 % na další nákup</td></tr>
            <tr><td valign="top" style="padding:0 12px 8px 0;font-size:15px;line-height:20px;">Platnost</td><td align="right" valign="top" style="padding:0 0 8px;font-size:15px;line-height:20px;font-weight:600;">30 dní</td></tr>
            <tr><td valign="top" style="padding:0 12px 8px 0;font-size:15px;line-height:20px;">Použití</td><td align="right" valign="top" style="padding:0 0 8px;font-size:15px;line-height:20px;font-weight:600;">Jednorázově</td></tr>
          </table>
        `,
        actionText: 'Kód uplatníte v košíku při příštím nákupu.',
        actionButton: {
          label: 'Nakupovat',
          href: `${WEBSITE_URL}/produkty`,
        },
        marketing: true,
      };

    case 'REVIEW_REQUEST':
      return {
        subject: 'Jak se vám líbí vaše UFO SPORT produkty?',
        preheader: 'Podělte se o svůj názor na nákup.',
        header2Title: 'Jak se vám líbí?',
        header2Subtitle: 'Vaše zásilka už by měla být u vás. Podělte se o svůj názor na nákup.',
        heroImage: {
          src: 'https://placehold.co/600x600/f2f2f2/000000.png?text=Hlavn%C3%AD%20obr%C3%A1zek%20600x600',
          height: 600,
          alt: 'Hlavní obrázek 600x600',
        },
        infoHtml: `
          <p style="margin:0 0 14px;">Vaše recenze pomáhá ostatním vybrat správnou velikost i produkt. Zabere to jen chvilku.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
            ${items
              .map(
                (item) =>
                  `<tr><td valign="top" style="padding:0 12px 8px 0;font-size:15px;line-height:20px;">${item.name}</td><td align="right" valign="top" style="padding:0 0 8px;font-size:15px;line-height:20px;font-weight:600;">${item.size || 'UNI'}</td></tr>`
              )
              .join('')}
          </table>
        `,
        actionText: 'Napište nám, co si o produktech myslíte.',
        actionButton: {
          label: 'Napsat recenzi',
          href: `${WEBSITE_URL}/recenze/${order}`,
        },
        marketing: true,
      };

    case 'WINBACK':
      return {
        subject: 'Dlouho jsme se neviděli',
        preheader: 'Podívejte se, co je nového ve světě UFO SPORT.',
        header2Title: 'Dlouho jsme se neviděli',
        header2Subtitle: 'Podívejte se, co je nového ve světě UFO SPORT.',
        heroImage: {
          src: 'https://placehold.co/600x750/f2f2f2/000000.png?text=Hlavn%C3%AD%20obr%C3%A1zek%20600x750',
          height: 750,
          alt: 'Hlavní obrázek 600x750',
        },
        infoHtml: `
          <p style="margin:0 0 14px;">Od vaší poslední návštěvy jsme přidali nové produkty a kolekce. Vyberte si své oblíbené kousky dřív, než se vyprodají.</p>
          <p style="margin:0 0 0px;">Těšíme se na vás.</p>
        `,
        actionText: 'Objevte nejnovější kolekci UFO SPORT.',
        actionButton: {
          label: 'Objevit novinky',
          href: `${WEBSITE_URL}/novinky`,
        },
        marketing: true,
      };

    case 'ACCOUNT_WELCOME':
      return {
        subject: 'Vítejte v UFO SPORT',
        preheader: 'Váš zákaznický účet byl úspěšně vytvořen.',
        header2Title: 'Vítejte v účtu',
        header2Subtitle: 'Váš zákaznický účet UFO SPORT byl úspěšně vytvořen.',
        heroImage: {
          src: 'https://placehold.co/600x600/f2f2f2/000000.png?text=Hlavn%C3%AD%20obr%C3%A1zek%20600x600',
          height: 600,
          alt: 'Hlavní obrázek 600x600',
        },
        infoHtml: `
          <p style="margin:0 0 14px;">Vítejte v UFO SPORT. Ve svém účtu můžete sledovat objednávky, ukládat oblíbené kousky a spravovat své doručovací údaje.</p>
          <ul style="margin:0;padding:0 0 0 24px;list-style:disc;">
            <li style="margin:0;">Přehled objednávek a faktur</li>
            <li style="margin:0;">Rychlejší objednávání s uloženou adresou</li>
            <li style="margin:0;">Historie všech vašich nákupů</li>
          </ul>
        `,
        actionText: 'Přejděte do svého zákaznického účtu.',
        actionButton: {
          label: 'Přejít do účtu',
          href: `${WEBSITE_URL}/muj-ucet`,
        },
        marketing: false,
      };

    case 'PAYMENT_REMINDER':
      return {
        subject: `Připomínka platby pro objednávku ${order}`,
        preheader: 'Dokončete platbu své objednávky.',
        header2Title: 'Připomínka platby',
        header2Subtitle: `Objednávka ${order} stále čeká na úhradu. Jakmile platbu přijmeme, zásilku obratem vyexpedujeme.`,
        heroImage: {
          src: 'https://placehold.co/600x600/f2f2f2/000000.png?text=Hlavn%C3%AD%20obr%C3%A1zek%20600x600',
          height: 600,
          alt: 'Hlavní obrázek 600x600',
        },
        infoHtml: `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
            <tr><td valign="top" style="padding:0 12px 8px 0;font-size:15px;line-height:20px;">Číslo objednávky</td><td align="right" valign="top" style="padding:0 0 8px;font-size:15px;line-height:20px;font-weight:600;">${order}</td></tr>
            <tr><td valign="top" style="padding:0 12px 8px 0;font-size:15px;line-height:20px;">Částka k úhradě</td><td align="right" valign="top" style="padding:0 0 8px;font-size:15px;line-height:20px;font-weight:600;">${total} Kč</td></tr>
            <tr><td valign="top" style="padding:0 12px 8px 0;font-size:15px;line-height:20px;">Způsob platby</td><td align="right" valign="top" style="padding:0 0 8px;font-size:15px;line-height:20px;font-weight:600;">Platební karta / Převod</td></tr>
          </table>
        `,
        actionText: 'Platbu dokončíte online v detailu objednávky.',
        actionButton: {
          label: 'Zaplatit objednávku',
          href: `${WEBSITE_URL}/objednavka/${order}`,
        },
        marketing: false,
      };

    case 'CROSS_SELL':
      return {
        subject: 'Doplňte svůj look — UFO SPORT',
        preheader: 'Vybrali jsme pro vás kousky, které ladí s vaším stylem.',
        header2Title: 'Doplňte svůj look',
        header2Subtitle: `Kousky, které skvěle doplní vaši nedávnou objednávku ${order}.`,
        heroImage: {
          src: 'https://placehold.co/600x750/f2f2f2/000000.png?text=Hlavn%C3%AD%20obr%C3%A1zek%20600x750',
          height: 750,
          alt: 'Hlavní obrázek 600x750',
        },
        infoHtml: `
          <p style="margin:0 0 14px;">Díky za nákup ${order}. Pokud chcete outfit dotáhnout, mrkněte na zbytek kolekce — trika, ponožky a vrstvy, které drží celek pohromadě.</p>
        `,
        actionText: 'Prohlédněte si doporučené kousky.',
        actionButton: {
          label: 'Prohlédnout produkty',
          href: `${WEBSITE_URL}/produkty`,
        },
        marketing: true,
      };

    case 'NEWSLETTER_COLLECTION':
      return {
        subject: 'Nová kolekce UFO SPORT',
        preheader: 'Prozkoumejte nejnovější kousky z naší dílny.',
        header2Title: 'Představení kolekce',
        header2Subtitle: 'Novinky v kolekci a svět UFO SPORT.',
        heroImage: {
          src: 'https://placehold.co/600x750/f2f2f2/000000.png?text=Hlavn%C3%AD%20obr%C3%A1zek%20600x750',
          height: 750,
          alt: 'Hlavní obrázek 600x750',
        },
        infoHtml: `
          <p style="margin:0 0 14px;">Přinášíme nové střihy, materiály a funkční detaily. Prohlédněte si celou novou řadu dřív, než se vyprodá.</p>
        `,
        actionText: 'Objevte novou kolekci na e-shopu.',
        actionButton: {
          label: 'Prozkoumat kolekci',
          href: `${WEBSITE_URL}/kolekce`,
        },
        marketing: true,
      };

    case 'NEWSLETTER_FIRST_ORDER':
      return {
        subject: 'Sleva na první nákup — UFO SPORT',
        preheader: 'Osobní slevový kód na vaši první objednávku.',
        header2Title: 'Sleva na první nákup',
        header2Subtitle: 'Připravili jsme pro vás slevový kód na první objednávku.',
        heroImage: {
          src: 'https://placehold.co/600x750/f2f2f2/000000.png?text=Hlavn%C3%AD%20obr%C3%A1zek%20600x750',
          height: 750,
          alt: 'Hlavní obrázek 600x750',
        },
        infoHtml: `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
            <tr><td valign="top" style="padding:0 12px 8px 0;font-size:15px;line-height:20px;">Slevový kód</td><td align="right" valign="top" style="padding:0 0 8px;font-size:15px;line-height:20px;font-weight:600;">${promo}</td></tr>
            <tr><td valign="top" style="padding:0 12px 8px 0;font-size:15px;line-height:20px;">Sleva</td><td align="right" valign="top" style="padding:0 0 8px;font-size:15px;line-height:20px;font-weight:600;">10 % na první nákup</td></tr>
            <tr><td valign="top" style="padding:0 12px 8px 0;font-size:15px;line-height:20px;">Platnost</td><td align="right" valign="top" style="padding:0 0 8px;font-size:15px;line-height:20px;font-weight:600;">14 dní</td></tr>
          </table>
        `,
        actionText: 'Uplatněte svůj slevový kód v košíku.',
        actionButton: {
          label: 'Využít slevu',
          href: `${WEBSITE_URL}/produkty?kod=${promo}`,
        },
        marketing: true,
      };
  }
}

export function renderEmail(
  type: EmailType,
  vars: EmailVars = {},
  unsubscribeUrl?: string,
  options?: {
    customization?: EmailTemplateCustomization;
    adminMode?: boolean;
  }
) {
  const params = buildTemplateParams(type, vars);
  if (unsubscribeUrl) {
    params.unsubscribeUrl = unsubscribeUrl;
  }
  if (options?.customization) {
    params.customization = options.customization;
  }
  if (options?.adminMode !== undefined) {
    params.adminMode = options.adminMode;
  }
  const html = buildEmailHtml(params);
  const finalSubject = vars.isTest ? `[TEST] ${params.subject}` : params.subject;
  const isMarketing = EMAIL_CATALOG.find((e) => e.id === type)?.marketing ?? false;
  return { subject: finalSubject, html, marketing: isMarketing };
}

// Export buildTemplateParams for direct usage or testing
export { buildTemplateParams };
