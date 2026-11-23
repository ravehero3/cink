import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set');
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
};

async function renderEmailFromBlocks(blocks: any[]) {
  let html = `
    <html>
      <head>
        <style>
          body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
          h1, h2, h3, h4, h5, h6 { margin: 20px 0 10px 0; }
          p { margin: 12px 0; }
          .offer { background-color: #ffe0e6; padding: 20px; border-radius: 6px; text-align: center; margin: 16px 0; }
          .code { background-color: #e8f5e9; padding: 16px; border-radius: 4px; text-align: center; font-family: monospace; font-weight: bold; font-size: 18px; margin: 16px 0; letter-spacing: 1px; }
          img { max-width: 100%; height: auto; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999; text-align: center; }
        </style>
      </head>
      <body>
  `;

  for (const block of blocks) {
    switch (block.type) {
      case 'header':
        html += `<h2>${escapeHtml(block.content.text)}</h2>`;
        break;
      case 'text':
        html += `<p>${escapeHtml(block.content.text).replace(/\n/g, '<br>')}</p>`;
        break;
      case 'image':
        if (block.content.url) {
          html += `<img src="${block.content.url}" alt="${escapeHtml(block.content.alt)}" style="max-width: 100%; border-radius: 4px;">`;
        }
        break;
      case 'offer':
        html += `
          <div class="offer">
            <h3>${escapeHtml(block.content.text)}</h3>
            <p>${escapeHtml(block.content.subtitle)}</p>
            <div style="font-size: 18px; font-weight: bold; color: #d61b5e; margin: 12px 0;">${escapeHtml(block.content.code)}</div>
            <p>${escapeHtml(block.content.discount)} sleva</p>
          </div>
        `;
        break;
      case 'code':
        html += `<div class="code">${escapeHtml(block.content.code)}</div>`;
        break;
    }
  }

  html += `
        <div class="footer">
          UFOsport.cz © 2024
        </div>
      </body>
    </html>
  `;

  return html;
}

function escapeHtml(text: string) {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: params.id },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const { recipientEmails } = await request.json();

    if (!recipientEmails || recipientEmails.length === 0) {
      return NextResponse.json({ error: 'No recipients' }, { status: 400 });
    }

    const blocks = JSON.parse(campaign.content);
    const html = await renderEmailFromBlocks(blocks);

    const resend = getResendClient();
    if (!resend) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const email of recipientEmails) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'objednavky@ufosport.cz',
          to: email,
          subject: campaign.subject,
          html,
        });
        sentCount++;
      } catch (error) {
        console.error(`Failed to send to ${email}:`, error);
        failedCount++;
      }
    }

    // Update campaign
    await prisma.emailCampaign.update({
      where: { id: params.id },
      data: {
        status: 'sent',
        sentAt: new Date(),
        sentCount,
        recipientEmails,
      },
    });

    return NextResponse.json({
      success: true,
      sentCount,
      failedCount,
      message: `Odesláno ${sentCount} emailů${failedCount > 0 ? `, ${failedCount} selhalo` : ''}`,
    });
  } catch (error) {
    console.error('Error sending campaign:', error);
    return NextResponse.json({ error: 'Failed to send campaign' }, { status: 500 });
  }
}
