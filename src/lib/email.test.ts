import { describe, expect, it } from 'vitest';
import { buildSellerEmail, escapeHtml } from './email';

describe('escapeHtml', () => {
  it('escapes the five special characters', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  });
});

describe('buildSellerEmail', () => {
  const email = buildSellerEmail({
    title: 'Chair <b>',
    price: 45,
    url: 'https://example.com/item/1',
    message: 'Hi,\n<script>alert(1)</script>',
    buyerEmail: 'buyer@example.com',
  });

  it('names the listing in the subject', () => {
    expect(email.subject).toBe('New message about "Chair <b>"');
  });

  it('escapes user text in the HTML and keeps line breaks', () => {
    expect(email.html).toContain('Chair &lt;b&gt;');
    expect(email.html).toContain('Hi,<br>&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(email.html).not.toContain('<script>');
    expect(email.html).toContain('href="https://example.com/item/1"');
    expect(email.html).toContain('$45');
  });

  it('has a plain-text version with the message and reply hint', () => {
    expect(email.text).toContain('Hi,\n<script>alert(1)</script>');
    expect(email.text).toContain('buyer@example.com');
    expect(email.text).toContain('Reply to this email to answer the buyer.');
  });
});
