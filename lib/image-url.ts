/**
 * Convert local image paths to full URLs
 * Handles:
 * - Local /uploads/images/* paths → https://ufosport.cz/uploads/images/*
 * - Already-full URLs (http/https) → returned as-is
 * - Relative paths without protocol → returned as-is (for client-relative paths)
 */
export function getFullImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return '';
  
  // Already a full URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Local upload path
  if (imagePath.startsWith('/uploads/')) {
    // Use the current domain (will work in browser and server contexts)
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || 'https://ufosport.cz';
    return `${baseUrl}${imagePath}`;
  }
  
  // Return as-is for other cases
  return imagePath;
}
