/**
 * Input sanitization utilities for magazine articles
 * Prevents XSS and injection attacks
 */

/**
 * Sanitize user input text - removes/escapes dangerous characters
 */
export function sanitizeText(input: string | null | undefined, maxLength: number = 1000): string {
  if (!input) return '';
  
  let text = String(input).trim();
  
  // Enforce max length
  if (text.length > maxLength) {
    text = text.substring(0, maxLength);
  }
  
  // Remove/escape HTML tags and dangerous characters
  text = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  // Remove null bytes
  text = text.replace(/\0/g, '');
  
  return text;
}

/**
 * Validate and sanitize article title
 */
export function sanitizeTitle(title: string | null | undefined): string {
  const sanitized = sanitizeText(title, 200);
  if (sanitized.length === 0) {
    throw new Error('Titul článku nemůže být prázdný');
  }
  return sanitized;
}

/**
 * Validate and sanitize author name
 */
export function sanitizeAuthor(author: string | null | undefined): string {
  return sanitizeText(author, 100);
}

/**
 * Validate and sanitize category
 */
export function sanitizeCategory(category: string | null | undefined): string {
  return sanitizeText(category, 50);
}

/**
 * Validate and sanitize tags (comma-separated)
 */
export function sanitizeTags(tags: string | null | undefined): string {
  if (!tags) return '';
  
  // Split, sanitize each, rejoin
  const sanitized = tags
    .split(',')
    .map((tag) => sanitizeText(tag.trim(), 30))
    .filter((tag) => tag.length > 0)
    .slice(0, 10); // Max 10 tags
  
  return sanitized.join(',');
}

/**
 * Validate Instagram URL
 * Must be a valid Instagram post URL
 */
export function validateInstagramUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  const trimmed = String(url).trim();
  if (trimmed.length === 0) return '';
  
  // Must be HTTPS Instagram URL
  const instagramRegex = /^https:\/\/(www\.)?instagram\.com\/p\/[a-zA-Z0-9_-]+\/?(\?.*)?$/;
  
  if (!instagramRegex.test(trimmed)) {
    throw new Error('Neplatná Instagram URL. Musí být formátu: https://www.instagram.com/p/[ID]/');
  }
  
  return trimmed;
}

/**
 * Validate article slug
 */
export function validateSlug(slug: string | null | undefined): string {
  if (!slug) {
    throw new Error('Slug nemůže být prázdný');
  }
  
  const trimmed = String(slug).trim().toLowerCase();
  
  // Must be lowercase letters, numbers, and hyphens only
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(trimmed)) {
    throw new Error('Slug musí obsahovat pouze malá písmena, čísla a pomlčky');
  }
  
  // Max length
  if (trimmed.length > 100) {
    throw new Error('Slug je příliš dlouhý (max 100 znaků)');
  }
  
  return trimmed;
}

/**
 * Escape HTML for safe display
 */
export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
