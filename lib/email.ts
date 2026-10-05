import { Resend } from 'resend';
import { prisma } from './prisma';
import { createHash } from 'crypto';
import { renderEmail, type EmailType, type EmailVars, SAMPLE_VARS } from './email-catalog';
import { WEBSITE_URL } from './email-layout';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.warn('WARNING: RESEND_API_KEY is not set. Email sending will fail.');
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const FROM_EMAIL = 'UFO Sport <noreply@ufosport.cz>';
export { WEBSITE_URL };

function buildUnsubscribeUrl(email: string): string {
  const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret';
  const token = createHash('sha256').update(email.toLowerCase() + secret).digest('hex').slice(0, 32);
  return `${WEBSITE_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}

export { buildUnsubscribeUrl };

async function logEmail(data: {
  toEmail: string;
  type: string;
  subject: string;
  html?: string;
  status: 'sent' | 'failed';
  error?: string;
  journeyId?: string;
}) {
  try {
    await prisma.emailLog.create({ data });
  } catch (error) {
    console.error('Failed to write email log:', error);
  }
}

export async function sendCatalogEmail(options: {
  type: EmailType;
  to: string;
  vars?: EmailVars;
  journeyId?: string;
  isTest?: boolean;
}) {
  const { type, to, vars = {}, journeyId, isTest } = options;

  const templateConfig = await prisma.emailTemplate.findUnique({
    where: { type },
  });

  const customization = (templateConfig?.variables as any) || undefined;
  const rendered = renderEmail(type, { ...vars, isTest }, buildUnsubscribeUrl(to), { customization });

  if (templateConfig && !templateConfig.isActive && !isTest) {
    await logEmail({
      toEmail: to,
      type,
      subject: rendered.subject,
      html: rendered.html,
      status: 'failed',
      error: 'E-mail je pozastaven v administraci.',
      journeyId,
    });
    return { success: false, error: 'E-mail je pozastaven.' };
  }

  if (!resend) {
    await logEmail({
      toEmail: to,
      type,
      subject: rendered.subject,
      html: rendered.html,
      status: 'failed',
      error: 'Email service not configured',
      journeyId,
    });
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: rendered.subject,
      html: rendered.html,
    });

    if ((result as { error?: { message?: string } }).error) {
      const message = (result as { error: { message?: string } }).error.message || 'Resend error';
      await logEmail({ toEmail: to, type, subject: rendered.subject, html: rendered.html, status: 'failed', error: message, journeyId });
      return { success: false, error: message };
    }

    await logEmail({ toEmail: to, type, subject: rendered.subject, html: rendered.html, status: 'sent', journeyId });
    return { success: true, result };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await logEmail({ toEmail: to, type, subject: rendered.subject, html: rendered.html, status: 'failed', error: message, journeyId });
    return { success: false, error };
  }
}

export interface OrderItem {
  name: string;
  size?: string;
  quantity: number;
  price: number;
  image?: string;
  slug?: string;
}

export async function enrichOrderItemsWithImages(items: OrderItem[]): Promise<OrderItem[]> {
  if (!items || items.length === 0) return items;
  try {
    const missing = items.some((i) => !i.image || !i.slug);
    if (!missing) return items;

    const names = items.map((i) => i.name).filter(Boolean);
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { in: names } },
        ],
      },
      select: { name: true, slug: true, images: true },
    });

    const byName = new Map<string, { image?: string; slug: string }>();
    for (const p of products) {
      byName.set(p.name.toLowerCase().trim(), {
        image: p.images?.[0],
        slug: p.slug,
      });
    }

    return items.map((item) => {
      const found = byName.get(item.name.toLowerCase().trim());
      return {
        ...item,
        image: item.image || found?.image,
        slug: item.slug || found?.slug,
      };
    });
  } catch (err) {
    console.error('Failed to enrich order items with images:', err);
    return items;
  }
}

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalPrice: number;
  shippingMethod?: string;
  zasilkovnaName?: string;
  pplName?: string;
  shippingStreet?: string;
  shippingCity?: string;
  shippingZip?: string;
  customerPhone?: string;
}

function toVars(data: OrderEmailData): EmailVars {
  return {
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    customerPhone: data.customerPhone,
    orderNumber: data.orderNumber,
    items: data.items,
    productImages: data.items.map((i) => i.image).filter(Boolean) as string[],
    totalPrice: data.totalPrice,
    shippingMethod: data.shippingMethod,
    zasilkovnaName: data.zasilkovnaName,
    pplName: data.pplName,
    shippingStreet: data.shippingStreet,
    shippingCity: data.shippingCity,
    shippingZip: data.shippingZip,
  };
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  data.items = await enrichOrderItemsWithImages(data.items);
  return sendCatalogEmail({ type: 'ORDER_CONFIRMATION', to: data.customerEmail, vars: toVars(data) });
}

export async function sendPaymentSuccessEmail(data: OrderEmailData) {
  data.items = await enrichOrderItemsWithImages(data.items);
  return sendCatalogEmail({ type: 'PAYMENT_SUCCESS', to: data.customerEmail, vars: toVars(data) });
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
  return sendCatalogEmail({
    type: 'SHIPPING_NOTIFICATION',
    to: data.customerEmail,
    vars: {
      orderNumber: data.orderNumber,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      trackingNumber: data.trackingNumber,
      shippingMethod: data.shippingMethod,
      zasilkovnaName: data.zasilkovnaName,
    },
  });
}

export async function sendNewsletterWelcomeEmail(email: string) {
  return sendCatalogEmail({ type: 'NEWSLETTER_WELCOME', to: email, vars: { customerEmail: email } });
}

const ADMIN_NOTIFICATION_EMAIL = 'andrea.gasi@seznam.cz';

export async function sendAdminOrderNotificationEmail(data: OrderEmailData & { customerPhone?: string }) {
  data.items = await enrichOrderItemsWithImages(data.items);
  return sendCatalogEmail({
    type: 'ADMIN_ORDER_NOTIFICATION',
    to: ADMIN_NOTIFICATION_EMAIL,
    vars: toVars(data),
  });
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  return sendCatalogEmail({
    type: 'PASSWORD_RESET',
    to: email,
    vars: { customerEmail: email, resetLink },
  });
}

export async function sendAbandonedCartEmail(email: string, items: OrderItem[]) {
  return sendCatalogEmail({
    type: 'ABANDONED_CART',
    to: email,
    vars: { customerEmail: email, items },
  });
}

export function getPreviewHtml(type: EmailType) {
  return renderEmail(type, SAMPLE_VARS).html;
}

export { SAMPLE_VARS };
