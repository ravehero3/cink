/**
 * SEO metadata generation utilities
 */

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string;
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
  ogUrl: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage?: string;
  canonicalUrl: string;
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
}

export interface SchemaOrgArticle {
  '@context': string;
  '@type': string;
  headline: string;
  description: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author?: {
    '@type': string;
    name: string;
  };
  publisher?: {
    '@type': string;
    name: string;
    logo: {
      '@type': string;
      url: string;
    };
  };
}

/**
 * Generate SEO metadata for article
 */
export function generateArticleSEO(
  article: any,
  baseUrl: string = 'https://ufosport.cz'
): SEOMetadata {
  const title = article.title || 'UFO SPORT Magazín';
  const subtitle = article.subtitle || '';
  const description =
    subtitle.substring(0, 160) ||
    title.substring(0, 160) ||
    'Přečtěte si nejnovější články z UFO SPORT magazínu';

  const ogImage =
    article.blocks?.hero || `${baseUrl}/og-image.jpg`;
  const canonicalUrl = `${baseUrl}/magazin/${article.slug}`;

  return {
    title,
    description,
    keywords: article.tags ? article.tags.split(',').map((t: string) => t.trim()).join(', ') : '',
    ogTitle: title,
    ogDescription: description,
    ogImage,
    ogUrl: canonicalUrl,
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: ogImage,
    canonicalUrl,
    author: article.author || 'UFO SPORT',
    publishedDate: article.publishedAt,
    modifiedDate: article.updatedAt,
  };
}

/**
 * Generate Schema.org JSON-LD for article
 */
export function generateArticleSchema(
  article: any,
  baseUrl: string = 'https://ufosport.cz'
): SchemaOrgArticle {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.subtitle || article.title,
    image: article.blocks?.hero,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Person',
      name: article.author || 'UFO SPORT',
    },
    publisher: {
      '@type': 'Organization',
      name: 'UFO SPORT',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
  };
}

/**
 * Generate Schema.org JSON-LD for magazine listing
 */
export function generateMagazineCollectionSchema(
  baseUrl: string = 'https://ufosport.cz'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'UFO SPORT Magazín',
    description: 'Inspirace a tipy ze světa UFO SPORT',
    url: `${baseUrl}/magazin`,
    publisher: {
      '@type': 'Organization',
      name: 'UFO SPORT',
      url: baseUrl,
    },
  };
}
