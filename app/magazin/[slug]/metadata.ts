import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { generateArticleSEO, generateArticleSchema } from '@/lib/magazine-seo';

/**
 * Generate dynamic metadata for magazine articles
 */
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const article = await prisma.magazineArticle.findUnique({
      where: { slug: params.slug },
    });

    if (!article || !article.published) {
      return {
        title: 'Článek nenalezen | UFO SPORT',
        description: 'Požadovaný článek nebyl nalezen',
      };
    }

    const seo = generateArticleSEO(article);

    return {
      title: `${seo.title} | UFO SPORT Magazín`,
      description: seo.description,
      keywords: seo.keywords,
      authors: [{ name: seo.author }],
      openGraph: {
        type: 'article',
        url: seo.ogUrl,
        title: seo.ogTitle,
        description: seo.ogDescription,
        images: [
          {
            url: seo.ogImage || '',
            width: 1200,
            height: 630,
            alt: seo.ogTitle,
          },
        ],
        publishedTime: seo.publishedDate,
        modifiedTime: seo.modifiedDate,
        authors: [seo.author || 'UFO SPORT'],
        tags: seo.keywords ? seo.keywords.split(', ') : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: seo.twitterTitle,
        description: seo.twitterDescription,
        images: [seo.twitterImage || ''],
        creator: '@ufosport',
      },
      alternates: {
        canonical: seo.canonicalUrl,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'UFO SPORT Magazín',
      description: 'Inspirace a tipy ze světa UFO SPORT',
    };
  }
}
