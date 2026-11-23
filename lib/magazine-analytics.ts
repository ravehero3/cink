/**
 * Utility functions for article analytics and metadata
 */

/**
 * Calculate reading time in minutes
 * Based on average reading speed of 200 words per minute
 */
export function calculateReadingTime(text: string): number {
  if (!text) return 0;
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / 200);
  return Math.max(1, minutes);
}

/**
 * Format reading time for display in Czech
 * Returns:
 * • 1 minuta čtení (1 minute)
 * • 2, 3, 4 minuty čtení (2-4 minutes)
 * • 5+ minut čtení (5+ minutes)
 */
export function formatReadingTime(minutes: number): string {
  if (minutes < 1) minutes = 1;
  
  if (minutes === 1) return '1 minuta čtení';
  if (minutes >= 2 && minutes <= 4) return `${minutes} minuty čtení`;
  return `${minutes}+ minut čtení`;
}

/**
 * Extract all text content from article blocks
 * Used for word count and reading time calculation
 */
export function extractArticleText(blocks: any): string {
  if (!blocks || typeof blocks !== 'object') return '';

  const textParts: string[] = [];

  // Extract from all text blocks
  if (blocks.text1) textParts.push(String(blocks.text1));
  if (blocks.text2) textParts.push(String(blocks.text2));
  if (blocks.text3) textParts.push(String(blocks.text3));
  
  // Extract title/subtitle for context
  if (blocks.title) textParts.push(String(blocks.title));
  if (blocks.subtitle) textParts.push(String(blocks.subtitle));

  return textParts.join(' ');
}

/**
 * Get article metadata for display
 */
export interface ArticleMetadata {
  wordCount: number;
  readingTime: number;
  readingTimeFormatted: string;
}

export function getArticleMetadata(blocks: any): ArticleMetadata {
  const text = extractArticleText(blocks);
  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const readingTime = calculateReadingTime(text);
  
  return {
    wordCount,
    readingTime,
    readingTimeFormatted: formatReadingTime(readingTime),
  };
}
