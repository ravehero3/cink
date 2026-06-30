import { createHash } from 'crypto';

function makeToken(email: string) {
  const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret';
  return createHash('sha256').update(email.toLowerCase() + secret).digest('hex').slice(0, 32);
}

export function buildUnsubscribeUrl(email: string): string {
  const base = process.env.NEXTAUTH_URL || 'https://www.ufosport.cz';
  const token = makeToken(email);
  return `${base}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}

export function makeTokenForEmail(email: string): string {
  return makeToken(email);
}
