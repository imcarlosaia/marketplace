import { formatPrice } from './format';

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

export interface SellerEmailInput {
  title: string;
  price: number;
  url: string;
  message: string;
  buyerEmail: string;
}

export interface SellerEmail {
  subject: string;
  html: string;
  text: string;
}

export function buildSellerEmail({ title, price, url, message, buyerEmail }: SellerEmailInput): SellerEmail {
  const subject = `New message about "${title}"`;
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, '<br>');
  const html = [
    '<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.5;color:#16181D;max-width:560px">',
    '<p style="margin:0 0 4px;color:#5D6470">You have a new message about your listing</p>',
    `<p style="margin:0 0 16px;font-size:18px;font-weight:600"><a href="${escapeHtml(url)}" style="color:#1F4FA8">${escapeHtml(title)}</a> · ${escapeHtml(formatPrice(price))}</p>`,
    `<div style="background:#F4F5F7;border-radius:12px;padding:14px 16px;margin:0 0 16px">${safeMessage}</div>`,
    `<p style="margin:0 0 4px">From: ${escapeHtml(buyerEmail)}</p>`,
    '<p style="margin:0;color:#5D6470">Reply to this email to answer the buyer.</p>',
    '</div>',
  ].join('');
  const text = [
    `You have a new message about your listing "${title}" (${formatPrice(price)}).`,
    '',
    message,
    '',
    `From: ${buyerEmail}`,
    `Listing: ${url}`,
    '',
    'Reply to this email to answer the buyer.',
  ].join('\n');
  return { subject, html, text };
}
