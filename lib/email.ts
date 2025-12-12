import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.warn('WARNING: RESEND_API_KEY is not set. Email sending will fail.');
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const FROM_EMAIL = 'UFO Sport <noreply@ufosport.cz>';
const WEBSITE_URL = process.env.NEXTAUTH_URL || 'https://www.ufosport.cz';

const LOGO_URL = `${process.env.NEXTAUTH_URL || 'https://www.ufosport.cz'}/logo.png`;

const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">
          <!-- Header with Logo -->
          <tr>
            <td style="text-align: center; padding-bottom: 32px; border-bottom: 2px solid #000000;">
              <img src="${LOGO_URL}" alt="UFO Sport" width="120" height="120" style="display: block; margin: 0 auto 16px auto; max-width: 120px; height: auto;" />
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 0.1em; color: #000000; text-transform: uppercase;">
                UFO SPORT
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 0;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid #e5e5e5; padding-top: 24px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #666666;">
                UFO Sport | Sportovni obleceni
              </p>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #666666;">
                <a href="${WEBSITE_URL}" style="color: #000000; text-decoration: underline;">www.ufosport.cz</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #999999;">
                Tento e-mail byl odeslan automaticky. Prosim neodpovidejte na nej.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const buttonStyle = `
  display: inline-block;
  background-color: #000000;
  color: #ffffff;
  padding: 14px 32px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 2px solid #000000;
`;

const secondaryButtonStyle = `
  display: inline-block;
  background-color: #ffffff;
  color: #000000;
  padding: 14px 32px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 2px solid #000000;
`;

interface OrderItem {
  name: string;
  size?: string;
  quantity: number;
  price: number;
}

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalPrice: number;
  shippingMethod?: string;
  zasilkovnaName?: string;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  if (!resend) {
    console.error('Cannot send order confirmation email: RESEND_API_KEY is not configured');
    return { success: false, error: 'Email service not configured' };
  }

  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
        <p style="margin: 0; font-size: 14px; color: #000000; font-weight: 500;">${item.name}</p>
        ${item.size ? `<p style="margin: 4px 0 0 0; font-size: 12px; color: #666666;">Velikost: ${item.size}</p>` : ''}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; text-align: center; width: 60px;">
        <p style="margin: 0; font-size: 14px; color: #666666;">${item.quantity}x</p>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; text-align: right; width: 100px;">
        <p style="margin: 0; font-size: 14px; color: #000000; font-weight: 500;">${item.price.toLocaleString('cs-CZ')} Kc</p>
      </td>
    </tr>
  `).join('');

  const shippingInfo = data.shippingMethod === 'zasilkovna' && data.zasilkovnaName
    ? `<p style="margin: 0; font-size: 14px; color: #666666;">Vydejna: ${data.zasilkovnaName}</p>`
    : '';

  const content = `
    <h2 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #000000; text-transform: uppercase; letter-spacing: 0.02em;">
      Dekujeme za vasi objednavku!
    </h2>
    
    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #333333;">
      Vazeny/a ${data.customerName},<br><br>
      Dekujeme za vasi objednavku. Nize naleznete prehled vasi objednavky.
    </p>
    
    <div style="background-color: #f8f8f8; padding: 20px; margin-bottom: 24px;">
      <p style="margin: 0 0 8px 0; font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 0.05em;">Cislo objednavky</p>
      <p style="margin: 0; font-size: 20px; font-weight: 700; color: #000000; letter-spacing: 0.02em;">${data.orderNumber}</p>
    </div>
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
      <tr>
        <td style="padding: 12px 0; border-bottom: 2px solid #000000;">
          <p style="margin: 0; font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 0.05em;">Produkt</p>
        </td>
        <td style="padding: 12px 0; border-bottom: 2px solid #000000; text-align: center; width: 60px;">
          <p style="margin: 0; font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 0.05em;">Ks</p>
        </td>
        <td style="padding: 12px 0; border-bottom: 2px solid #000000; text-align: right; width: 100px;">
          <p style="margin: 0; font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 0.05em;">Cena</p>
        </td>
      </tr>
      ${itemsHtml}
      <tr>
        <td colspan="2" style="padding: 16px 0 0 0;">
          <p style="margin: 0; font-size: 16px; font-weight: 700; color: #000000; text-transform: uppercase;">Celkem</p>
        </td>
        <td style="padding: 16px 0 0 0; text-align: right;">
          <p style="margin: 0; font-size: 18px; font-weight: 700; color: #000000;">${data.totalPrice.toLocaleString('cs-CZ')} Kc</p>
        </td>
      </tr>
    </table>
    
    ${shippingInfo ? `
    <div style="margin-bottom: 24px;">
      <p style="margin: 0 0 8px 0; font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 0.05em;">Zpusob doruceni</p>
      ${shippingInfo}
    </div>
    ` : ''}
    
    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #666666;">
      Nyni prosim dokoncete platbu. Po prijeti platby vam zasleme potvrzeni a informace o odeslani.
    </p>
    
    <div style="text-align: center;">
      <a href="${WEBSITE_URL}/sledovani-objednavky" style="${buttonStyle}">
        Sledovat objednavku
      </a>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Objednavka ${data.orderNumber} - UFO Sport`,
      html: emailWrapper(content),
    });
    console.log('Order confirmation email sent:', result);
    return { success: true, result };
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return { success: false, error };
  }
}

export async function sendPaymentSuccessEmail(data: OrderEmailData) {
  if (!resend) {
    console.error('Cannot send payment success email: RESEND_API_KEY is not configured');
    return { success: false, error: 'Email service not configured' };
  }

  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;">
        <p style="margin: 0; font-size: 14px; color: #000000;">${item.name}${item.size ? ` (${item.size})` : ''}</p>
      </td>
      <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; text-align: right;">
        <p style="margin: 0; font-size: 14px; color: #666666;">${item.quantity}x ${item.price.toLocaleString('cs-CZ')} Kc</p>
      </td>
    </tr>
  `).join('');

  const content = `
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; width: 64px; height: 64px; background-color: #000000; border-radius: 50%; margin-bottom: 16px;">
        <span style="font-size: 32px; line-height: 64px; color: #ffffff;">&#10003;</span>
      </div>
      <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #000000; text-transform: uppercase; letter-spacing: 0.02em;">
        Platba prijata!
      </h2>
    </div>
    
    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #333333; text-align: center;">
      Vazeny/a ${data.customerName},<br><br>
      Vase platba byla uspesne zpracovana. Dekujeme!
    </p>
    
    <div style="background-color: #f8f8f8; padding: 20px; margin-bottom: 24px; text-align: center;">
      <p style="margin: 0 0 8px 0; font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 0.05em;">Cislo objednavky</p>
      <p style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #000000; letter-spacing: 0.02em;">${data.orderNumber}</p>
      <p style="margin: 0 0 4px 0; font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 0.05em;">Celkova castka</p>
      <p style="margin: 0; font-size: 24px; font-weight: 700; color: #000000;">${data.totalPrice.toLocaleString('cs-CZ')} Kc</p>
    </div>
    
    <div style="margin-bottom: 24px;">
      <p style="margin: 0 0 12px 0; font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 0.05em;">Souhrn objednavky</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${itemsHtml}
      </table>
    </div>
    
    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #666666; text-align: center;">
      Vasi objednavku nyni zpracovavame a brzy vam zasleme informace o odeslani.
    </p>
    
    <div style="text-align: center;">
      <a href="${WEBSITE_URL}/sledovani-objednavky" style="${buttonStyle}">
        Sledovat objednavku
      </a>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Platba prijata - Objednavka ${data.orderNumber} - UFO Sport`,
      html: emailWrapper(content),
    });
    console.log('Payment success email sent:', result);
    return { success: true, result };
  } catch (error) {
    console.error('Failed to send payment success email:', error);
    return { success: false, error };
  }
}

interface ShippingEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  trackingNumber?: string;
  shippingMethod?: string;
  zasilkovnaName?: string;
}

export async function sendShippingNotificationEmail(data: ShippingEmailData) {
  if (!resend) {
    console.error('Cannot send shipping notification email: RESEND_API_KEY is not configured');
    return { success: false, error: 'Email service not configured' };
  }

  const trackingInfo = data.trackingNumber
    ? `
      <div style="background-color: #f8f8f8; padding: 20px; margin-bottom: 24px; text-align: center;">
        <p style="margin: 0 0 8px 0; font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 0.05em;">Sledovaci cislo</p>
        <p style="margin: 0; font-size: 20px; font-weight: 700; color: #000000; letter-spacing: 0.02em;">${data.trackingNumber}</p>
      </div>
    `
    : '';

  const pickupInfo = data.shippingMethod === 'zasilkovna' && data.zasilkovnaName
    ? `
      <div style="background-color: #f8f8f8; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px 0; font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 0.05em;">Vydejni misto</p>
        <p style="margin: 0; font-size: 16px; font-weight: 500; color: #000000;">${data.zasilkovnaName}</p>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #666666;">
          Jakmile bude balik pripraven k vyzvednuti, obdrzite SMS nebo e-mail od Zasilkovny.
        </p>
      </div>
    `
    : '';

  const content = `
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; width: 64px; height: 64px; background-color: #000000; border-radius: 50%; margin-bottom: 16px;">
        <span style="font-size: 28px; line-height: 64px; color: #ffffff;">&#128230;</span>
      </div>
      <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #000000; text-transform: uppercase; letter-spacing: 0.02em;">
        Vase objednavka byla odeslana!
      </h2>
    </div>
    
    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #333333; text-align: center;">
      Vazeny/a ${data.customerName},<br><br>
      Skvela zprava! Vase objednavka <strong>${data.orderNumber}</strong> byla prave odeslana.
    </p>
    
    ${trackingInfo}
    ${pickupInfo}
    
    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #666666; text-align: center;">
      Doruceni obvykle trva 1-3 pracovni dny. Dekujeme za nakup u UFO Sport!
    </p>
    
    <div style="text-align: center;">
      <a href="${WEBSITE_URL}/sledovani-objednavky" style="${buttonStyle}">
        Sledovat zasilku
      </a>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Objednavka ${data.orderNumber} byla odeslana - UFO Sport`,
      html: emailWrapper(content),
    });
    console.log('Shipping notification email sent:', result);
    return { success: true, result };
  } catch (error) {
    console.error('Failed to send shipping notification email:', error);
    return { success: false, error };
  }
}

export async function sendNewsletterWelcomeEmail(email: string) {
  if (!resend) {
    console.error('Cannot send newsletter welcome email: RESEND_API_KEY is not configured');
    return { success: false, error: 'Email service not configured' };
  }

  const content = `
    <div style="text-align: center; margin-bottom: 32px;">
      <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #000000; text-transform: uppercase; letter-spacing: 0.02em;">
        Vitejte v UFO Sport!
      </h2>
    </div>
    
    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #333333; text-align: center;">
      Dekujeme za prihlaseni k odberu nasich novinek!<br><br>
      Nyni budete jako prvni vedet o:
    </p>
    
    <div style="background-color: #f8f8f8; padding: 24px; margin-bottom: 24px;">
      <ul style="margin: 0; padding: 0 0 0 20px; font-size: 14px; line-height: 2; color: #333333;">
        <li>Novinkach v nasi kolekci</li>
        <li>Exkluzivnich slevach a promocich</li>
        <li>Limitovanych edicich</li>
        <li>Specialnich akcich jen pro odberatele</li>
      </ul>
    </div>
    
    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #666666; text-align: center;">
      Tesime se na vas!
    </p>
    
    <div style="text-align: center; margin-bottom: 16px;">
      <a href="${WEBSITE_URL}" style="${buttonStyle}">
        Prozkoumat kolekci
      </a>
    </div>
    
    <p style="margin: 24px 0 0 0; font-size: 11px; color: #999999; text-align: center;">
      Pokud jste se k odberu neprihlasili, muzete tento e-mail ignorovat.
    </p>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Vitejte v UFO Sport! Dekujeme za prihlaseni k odberu',
      html: emailWrapper(content),
    });
    console.log('Newsletter welcome email sent:', result);
    return { success: true, result };
  } catch (error) {
    console.error('Failed to send newsletter welcome email:', error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  if (!resend) {
    console.error('Cannot send password reset email: RESEND_API_KEY is not configured');
    return { success: false, error: 'Email service not configured' };
  }

  const content = `
    <h2 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #000000; text-transform: uppercase; letter-spacing: 0.02em; text-align: center;">
      Obnoveni hesla
    </h2>
    
    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #333333; text-align: center;">
      Obdrzeli jsme zadost o obnoveni vaseho hesla.<br>
      Kliknete na tlacitko nize pro nastaveni noveho hesla.
    </p>
    
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${resetLink}" style="${buttonStyle}">
        Obnovit heslo
      </a>
    </div>
    
    <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #666666; text-align: center;">
      Odkaz je platny po dobu 1 hodiny.
    </p>
    
    <p style="margin: 0; font-size: 12px; color: #999999; text-align: center;">
      Pokud jste o obnoveni hesla nezadali, tento e-mail prosim ignorujte.<br>
      Vase heslo zustane nezmeneno.
    </p>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Obnoveni hesla - UFO Sport',
      html: emailWrapper(content),
    });
    console.log('Password reset email sent:', result);
    return { success: true, result };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return { success: false, error };
  }
}
