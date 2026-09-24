import {
  emailWrapper,
  emailButton,
  heading,
  kicker,
  bodyText,
  mutedText,
  infoBox,
  promoBlock,
  itemsTable,
  WEBSITE_URL,
  FONT_STACK,
  HEADING_STACK,
  type CatalogItem,
} from './email-layout';

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
  {
    id: 'ADMIN_ORDER_NOTIFICATION',
    label: 'Notifikace adminu',
    description: 'Interní zpráva o nové objednávce.',
    trigger: 'Automaticky',
    triggerDetail: 'Po odeslání objednávky',
    category: 'transactional',
    marketing: false,
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
  resetLink?: string;
  promoCode?: string;
  promoLabel?: string;
  promoValidUntil?: string;
  isTest?: boolean;
}

export const SAMPLE_ITEMS: CatalogItem[] = [
  { name: 'UFO Oversized T-Shirt', size: 'L', quantity: 1, price: 850 },
  { name: 'UFO Sport Socks', size: 'UNI', quantity: 2, price: 800 },
];

export const SAMPLE_VARS: EmailVars = {
  customerName: 'Jan Novák',
  customerEmail: 'jan.novak@email.cz',
  customerPhone: '+420 777 123 456',
  orderNumber: 'UFO26001',
  items: SAMPLE_ITEMS,
  totalPrice: 1650,
  shippingMethod: 'zasilkovna',
  zasilkovnaName: 'Zásilkovna Praha 1 — Centrum',
  trackingNumber: 'CZ123456789',
  resetLink: `${WEBSITE_URL}/obnovit-heslo`,
  promoCode: 'UFO10JAN',
  promoLabel: 'Sleva 10 % na další nákup',
  promoValidUntil: '8. 10. 2026',
};

function shippingHtml(vars: EmailVars) {
  if (vars.shippingMethod === 'zasilkovna' && vars.zasilkovnaName) {
    return `<p style="margin:0;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:#666666;font-family:${FONT_STACK};">Místo vyzvednutí (Zásilkovna)</p>
      <p style="margin:4px 0 0 0;font-size:13px;color:#000000;font-family:${FONT_STACK};">${vars.zasilkovnaName}</p>`;
  }
  if (vars.shippingMethod === 'ppl_address' && vars.shippingStreet) {
    return `<p style="margin:0;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:#666666;font-family:${FONT_STACK};">Doručovací adresa (PPL)</p>
      <p style="margin:4px 0 0 0;font-size:13px;color:#000000;font-family:${FONT_STACK};">${vars.shippingStreet}<br>${vars.shippingZip} ${vars.shippingCity}</p>`;
  }
  if (vars.shippingMethod === 'ppl_parcelshop' && vars.pplName) {
    return `<p style="margin:0;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:#666666;font-family:${FONT_STACK};">Výdejní místo (PPL ParcelShop)</p>
      <p style="margin:4px 0 0 0;font-size:13px;color:#000000;font-family:${FONT_STACK};">${vars.pplName}</p>`;
  }
  return '';
}

function testBanner() {
  return infoBox(`<p style="margin:0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;text-align:center;font-family:${FONT_STACK};">Testovací e-mail z administrace</p>`);
}

function contentFor(type: EmailType, vars: EmailVars): { subject: string; inner: string; marketing: boolean } {
  const name = vars.customerName || 'zákazníku';
  const items = vars.items?.length ? vars.items : SAMPLE_ITEMS;
  const order = vars.orderNumber || 'UFO26001';
  const total = (vars.totalPrice ?? 1650).toLocaleString('cs-CZ');
  const promo = vars.promoCode || 'UFO10JAN';
  const promoLabel = vars.promoLabel || 'Sleva 10 % na další nákup';

  switch (type) {
    case 'ORDER_CONFIRMATION':
      return {
        subject: `Potvrzení objednávky ${order} — UFO Sport`,
        marketing: false,
        inner: `
          ${kicker('Objednávka')}
          ${heading('Děkujeme za objednávku')}
          ${bodyText('Obdrželi jsme vaši objednávku a brzy ji zpracujeme. Nyní prosím dokončete platbu, abychom mohli zásilku expedovat.')}
          ${infoBox(`
            <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#666666;font-family:${FONT_STACK};">Číslo objednávky</p>
            <p style="margin:0;font-size:16px;font-weight:700;letter-spacing:0.04em;color:#000000;font-family:${FONT_STACK};">${order}</p>
          `)}
          ${kicker('Vaše položky')}
          ${itemsTable(items)}
          ${shippingHtml(vars) ? infoBox(shippingHtml(vars)) : ''}
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px 0;border-top:1px solid #000000;border-bottom:1px solid #000000;">
            <tr>
              <td style="padding:16px 0;">
                <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;font-family:${FONT_STACK};">Celkem</p>
              </td>
              <td style="padding:16px 0;text-align:right;">
                <p style="margin:0;font-size:16px;font-weight:700;font-family:${FONT_STACK};">${total} Kč</p>
              </td>
            </tr>
          </table>
          <div style="text-align:center;margin:0 0 24px 0;">${emailButton(`${WEBSITE_URL}/sledovani-objednavky`, 'Sledovat objednávku')}</div>
          ${mutedText('Máte otázky? Napište na <a href="mailto:info@ufosport.cz" style="color:#000000;">info@ufosport.cz</a>.')}
        `,
      };

    case 'PAYMENT_SUCCESS':
      return {
        subject: `Platba přijata — ${order} — UFO Sport`,
        marketing: false,
        inner: `
          ${kicker('Platba')}
          ${heading('Platba přijata')}
          ${bodyText(`Děkujeme, ${name}. Vaše platba byla úspěšně zpracována.`)}
          ${infoBox(`
            <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#666666;font-family:${FONT_STACK};">Číslo objednávky</p>
            <p style="margin:0 0 16px 0;font-size:16px;font-weight:700;font-family:${FONT_STACK};">${order}</p>
            <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#666666;font-family:${FONT_STACK};">Celková částka</p>
            <p style="margin:0;font-size:22px;font-weight:700;font-family:${FONT_STACK};">${total} Kč</p>
          `)}
          ${kicker('Souhrn objednávky')}
          ${itemsTable(items)}
          ${bodyText('Vaši objednávku nyní připravujeme k odeslání. Jakmile ji předáme dopravci, dáme vám vědět.')}
          <div style="text-align:center;">${emailButton(`${WEBSITE_URL}/sledovani-objednavky`, 'Sledovat objednávku')}</div>
        `,
      };

    case 'SHIPPING_NOTIFICATION':
      return {
        subject: `Objednávka ${order} byla odeslána — UFO Sport`,
        marketing: false,
        inner: `
          ${kicker('Doprava')}
          ${heading('Vaše objednávka je na cestě')}
          ${bodyText(`Objednávka <strong>${order}</strong> byla odeslána.`)}
          ${vars.trackingNumber ? infoBox(`
            <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#666666;font-family:${FONT_STACK};">Sledovací číslo</p>
            <p style="margin:0;font-size:16px;font-weight:700;letter-spacing:0.06em;font-family:${FONT_STACK};">${vars.trackingNumber}</p>
          `) : ''}
          ${shippingHtml(vars) ? infoBox(`${shippingHtml(vars)}<p style="margin:12px 0 0 0;font-size:13px;line-height:20px;color:#000000;font-family:${FONT_STACK};">Jakmile bude balík připraven k vyzvednutí, obdržíte SMS nebo e-mail od dopravce.</p>`) : ''}
          ${infoBox(`<p style="margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;text-align:center;font-family:${FONT_STACK};">Očekávaná doba doručení · 1–3 pracovní dny</p>`)}
          <div style="text-align:center;margin-bottom:16px;">${emailButton(`${WEBSITE_URL}/sledovani-objednavky`, 'Sledovat zásilku')}</div>
          ${mutedText('Děkujeme za nákup u UFO Sport.')}
        `,
      };

    case 'NEWSLETTER_WELCOME':
      return {
        subject: 'Vítejte v UFO Sport',
        marketing: true,
        inner: `
          ${kicker('Newsletter')}
          ${heading('Vítejte v UFO Sport')}
          ${bodyText('Děkujeme za přihlášení k odběru novinek. Od teď budete jako první vědět o všem novém.')}
          ${infoBox(`
            <p style="margin:0 0 12px 0;font-size:13px;letter-spacing:0.04em;text-transform:uppercase;font-family:${FONT_STACK};">Novinky v kolekci</p>
            <p style="margin:0 0 16px 0;font-size:13px;color:#666666;font-family:${FONT_STACK};">Budete první, kdo uvidí nové produkty.</p>
            <p style="margin:0 0 12px 0;font-size:13px;letter-spacing:0.04em;text-transform:uppercase;font-family:${FONT_STACK};">Exkluzivní slevy</p>
            <p style="margin:0 0 16px 0;font-size:13px;color:#666666;font-family:${FONT_STACK};">Speciální nabídky jen pro odběratele.</p>
            <p style="margin:0 0 12px 0;font-size:13px;letter-spacing:0.04em;text-transform:uppercase;font-family:${FONT_STACK};">Limitované edice</p>
            <p style="margin:0;font-size:13px;color:#666666;font-family:${FONT_STACK};">Přístup k limitovaným kolekcím.</p>
          `)}
          <div style="text-align:center;margin-bottom:16px;">${emailButton(WEBSITE_URL, 'Prozkoumat kolekci')}</div>
          ${mutedText('Pokud jste se k odběru nepřihlásili vy, můžete tento e-mail ignorovat.')}
        `,
      };

    case 'PASSWORD_RESET':
      return {
        subject: 'Obnovení hesla — UFO Sport',
        marketing: false,
        inner: `
          ${kicker('Účet')}
          ${heading('Obnovení hesla')}
          ${bodyText('Obdrželi jsme žádost o obnovení vašeho hesla. Klikněte na tlačítko níže pro nastavení nového hesla.')}
          <div style="text-align:center;margin:0 0 24px 0;">${emailButton(vars.resetLink || WEBSITE_URL, 'Obnovit heslo')}</div>
          ${infoBox(`<p style="margin:0 0 8px 0;font-size:13px;font-weight:500;font-family:${FONT_STACK};">Nežádali jste o změnu hesla?</p>
            <p style="margin:0;font-size:13px;line-height:20px;color:#666666;font-family:${FONT_STACK};">Pokud jste o obnovení hesla nežádali, tento e-mail prosím ignorujte. Vaše heslo zůstane nezměněno. Odkaz je platný 1 hodinu.</p>`)}
        `,
      };

    case 'ABANDONED_CART':
      return {
        subject: 'Zapomněli jste něco v košíku? — UFO Sport',
        marketing: true,
        inner: `
          ${kicker('Košík')}
          ${heading('Zapomněli jste něco v košíku?')}
          ${bodyText('Vaše vybrané kousky na vás stále čekají. Dokončete objednávku dříve, než se vyprodají.')}
          ${itemsTable(items)}
          <div style="text-align:center;margin:0 0 16px 0;">${emailButton(`${WEBSITE_URL}/kosik`, 'Vrátit se do košíku')}</div>
          ${mutedText('Pokud jste již objednávku dokončili, ignorujte prosím tento e-mail.')}
        `,
      };

    case 'CART_REMINDER_DISCOUNT':
      return {
        subject: 'Váš košík + sleva 10 % — UFO Sport',
        marketing: true,
        inner: `
          ${kicker('Košík')}
          ${heading('Ještě to stihnete')}
          ${bodyText('Položky v košíku na vás pořád čekají. Přidáváme osobní slevový kód — při placení ho zadejte v pokladně.')}
          ${promoBlock(promo, promoLabel, vars.promoValidUntil)}
          ${itemsTable(items)}
          <div style="text-align:center;">${emailButton(`${WEBSITE_URL}/kosik`, 'Dokončit nákup')}</div>
        `,
      };

    case 'POST_PURCHASE_DISCOUNT':
      return {
        subject: 'Děkujeme za nákup — sleva na další kousek',
        marketing: true,
        inner: `
          ${kicker('Poděkování')}
          ${heading('Děkujeme, že jste s námi')}
          ${bodyText(`Ahoj ${name}, doufáme, že se vám objednávka ${order} líbí. Na další nákup máte osobní slevový kód.`)}
          ${promoBlock(promo, promoLabel, vars.promoValidUntil)}
          <div style="text-align:center;">${emailButton(`${WEBSITE_URL}/produkty`, 'Nakoupit se slevou')}</div>
        `,
      };

    case 'REVIEW_REQUEST':
      return {
        subject: 'Jak se vám líbí váš nákup? — UFO Sport',
        marketing: true,
        inner: `
          ${kicker('Zpětná vazba')}
          ${heading('Jak sedí vaše UFO?')}
          ${bodyText(`Objednávka ${order} by už měla být u vás. Budeme rádi za krátkou zpětnou vazbu — pomáhá nám dělat oblečení ještě lépe.`)}
          ${itemsTable(items)}
          <div style="text-align:center;margin:0 0 16px 0;">${emailButton(`${WEBSITE_URL}/faq`, 'Napsat nám')}</div>
          ${mutedText('Stačí odpovědět na tento e-mail nebo napsat na info@ufosport.cz.')}
        `,
      };

    case 'WINBACK':
      return {
        subject: 'Chybíte nám — sleva 15 % uvnitř',
        marketing: true,
        inner: `
          ${kicker('Zpět ke značce')}
          ${heading('Nová kolekce na vás čeká')}
          ${bodyText(`Ahoj ${name}, je to už chvíle, co jste u nás nakoupili. Připravili jsme pro vás osobní slevu na cokoliv z aktuální kolekce.`)}
          ${promoBlock(promo, promoLabel, vars.promoValidUntil)}
          <div style="text-align:center;">${emailButton(`${WEBSITE_URL}/produkty`, 'Prohlédnout kolekci')}</div>
        `,
      };

    case 'NEWSLETTER_COLLECTION':
      return {
        subject: 'Kolekce UFO Sport — co nosit teď',
        marketing: true,
        inner: `
          ${kicker('Kolekce')}
          ${heading('Oblečení pro pohyb i město')}
          ${bodyText('UFO Sport stavíme jako čistý, funkční šatník. Oversized střihy, precizní materiály, nic navíc.')}
          ${infoBox(`
            <p style="margin:0 0 8px 0;font-size:13px;letter-spacing:0.04em;text-transform:uppercase;font-family:${FONT_STACK};">Trika a vrstvy</p>
            <p style="margin:0 0 16px 0;font-size:13px;color:#666666;font-family:${FONT_STACK};">Základ, který obstojí v tréninku i ve městě.</p>
            <p style="margin:0 0 8px 0;font-size:13px;letter-spacing:0.04em;text-transform:uppercase;font-family:${FONT_STACK};">Doplňky</p>
            <p style="margin:0;font-size:13px;color:#666666;font-family:${FONT_STACK};">Ponožky a detaily, které drží celek pohromadě.</p>
          `)}
          <div style="text-align:center;">${emailButton(`${WEBSITE_URL}/produkty`, 'Zobrazit produkty')}</div>
        `,
      };

    case 'NEWSLETTER_FIRST_ORDER':
      return {
        subject: 'Sleva 10 % na první nákup — UFO Sport',
        marketing: true,
        inner: `
          ${kicker('První nákup')}
          ${heading('Začněte se slevou')}
          ${bodyText('Ještě jste u nás nenakoupili — tady je osobní kód na první objednávku. Platí na celý sortiment.')}
          ${promoBlock(promo, promoLabel, vars.promoValidUntil)}
          <div style="text-align:center;">${emailButton(`${WEBSITE_URL}/produkty`, 'Vybrat kousek')}</div>
        `,
      };

    case 'ACCOUNT_WELCOME':
      return {
        subject: 'Váš účet UFO Sport je připraven',
        marketing: false,
        inner: `
          ${kicker('Účet')}
          ${heading('Vítejte, účet je aktivní')}
          ${bodyText(`Ahoj ${name}, registrace proběhla v pořádku. V účtu najdete objednávky, uložené produkty a správu údajů.`)}
          <div style="text-align:center;margin:0 0 16px 0;">${emailButton(`${WEBSITE_URL}/ucet`, 'Přejít do účtu')}</div>
          ${mutedText('Nakupovat můžete i bez přihlášení — účet jen usnadní příště.')}
        `,
      };

    case 'PAYMENT_REMINDER':
      return {
        subject: `Objednávka ${order} čeká na platbu — UFO Sport`,
        marketing: false,
        inner: `
          ${kicker('Platba')}
          ${heading('Objednávka čeká na platbu')}
          ${bodyText(`Ahoj ${name}, objednávka ${order} je připravená — stačí dokončit platbu, abychom ji mohli expedovat.`)}
          ${infoBox(`
            <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#666666;font-family:${FONT_STACK};">Číslo objednávky</p>
            <p style="margin:0 0 16px 0;font-size:16px;font-weight:700;font-family:${HEADING_STACK};">${order}</p>
            <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#666666;font-family:${FONT_STACK};">Částka</p>
            <p style="margin:0;font-size:22px;font-weight:700;font-family:${HEADING_STACK};">${total} Kč</p>
          `)}
          ${itemsTable(items)}
          <div style="text-align:center;margin:0 0 16px 0;">${emailButton(`${WEBSITE_URL}/sledovani-objednavky`, 'Dokončit platbu')}</div>
          ${mutedText('Pokud jste už zaplatili, tento e-mail ignorujte.')}
        `,
      };

    case 'CROSS_SELL':
      return {
        subject: 'Doplňte look — UFO Sport',
        marketing: true,
        inner: `
          ${kicker('Kolekce')}
          ${heading('Další kousky k vašemu looku')}
          ${bodyText(`Ahoj ${name}, díky za nákup ${order}. Pokud chcete look uzavřít, mrkněte na zbytek kolekce — trika, ponožky a vrstvy, které drží celek.`)}
          <div style="text-align:center;">${emailButton(`${WEBSITE_URL}/produkty`, 'Prohlédnout produkty')}</div>
        `,
      };

    case 'ADMIN_ORDER_NOTIFICATION': {
      let shippingLabel = '—';
      if (vars.shippingMethod === 'zasilkovna') shippingLabel = `Zásilkovna${vars.zasilkovnaName ? ` – ${vars.zasilkovnaName}` : ''}`;
      else if (vars.shippingMethod === 'ppl_address') shippingLabel = `PPL – ${vars.shippingStreet}, ${vars.shippingZip} ${vars.shippingCity}`;
      else if (vars.shippingMethod === 'ppl_parcelshop') shippingLabel = `PPL ParcelShop – ${vars.pplName}`;
      return {
        subject: `[UFO Sport] Nová objednávka ${order} – ${total} Kč`,
        marketing: false,
        inner: `
          ${kicker('Admin')}
          ${heading(`Nová objednávka ${order}`)}
          ${infoBox(`
            <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#666666;font-family:${FONT_STACK};">Zákazník</p>
            <p style="margin:0 0 4px 0;font-size:14px;font-weight:700;font-family:${FONT_STACK};">${name}</p>
            <p style="margin:0 0 4px 0;font-size:13px;font-family:${FONT_STACK};">${vars.customerEmail || ''}</p>
            ${vars.customerPhone ? `<p style="margin:0;font-size:13px;font-family:${FONT_STACK};">${vars.customerPhone}</p>` : ''}
          `)}
          ${kicker('Položky')}
          ${itemsTable(items)}
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px 0;border-top:1px solid #000000;border-bottom:1px solid #000000;">
            <tr>
              <td style="padding:16px 0;"><p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;font-family:${FONT_STACK};">Celkem</p></td>
              <td style="padding:16px 0;text-align:right;"><p style="margin:0;font-size:16px;font-weight:700;font-family:${FONT_STACK};">${total} Kč</p></td>
            </tr>
          </table>
          ${infoBox(`<p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#666666;font-family:${FONT_STACK};">Doprava</p>
            <p style="margin:0;font-size:13px;font-family:${FONT_STACK};">${shippingLabel}</p>`)}
          <div style="text-align:center;">${emailButton(`${WEBSITE_URL}/admin/objednavky`, 'Zobrazit v adminu')}</div>
        `,
      };
    }
  }
}

export function renderEmail(type: EmailType, vars: EmailVars = {}, unsubscribeUrl?: string) {
  const { subject, inner, marketing } = contentFor(type, vars);
  const banner = vars.isTest ? testBanner() : '';
  const html = emailWrapper(banner + inner, marketing ? unsubscribeUrl : undefined);
  const finalSubject = vars.isTest ? `[TEST] ${subject}` : subject;
  return { subject: finalSubject, html, marketing };
}
