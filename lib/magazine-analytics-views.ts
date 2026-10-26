/**
 * Magazine article analytics and view tracking
 */
import { prisma } from '@/lib/prisma';

/**
 * Increment article view count
 * Called when user views an article
 */
export async function recordArticleView(slug: string): Promise<void> {
  try {
    // Update view count with atomic operation
    await prisma.magazineArticle.update({
      where: { slug },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  } catch (error) {
    console.error('Error recording article view:', error);
    // Don't throw - view tracking is optional
  }
}

/**
 * Get most viewed articles
 */
export async function getMostViewedArticles(limit: number = 5) {
  return await prisma.magazineArticle.findMany({
    where: { published: true },
    select: {
      id: true,
      slug: true,
      title: true,
      viewCount: true,
      publishedAt: true,
    },
    orderBy: { viewCount: 'desc' },
    take: limit,
  });
}

/**
 * Get article analytics
 */
export interface ArticleAnalytics {
  slug: string;
  title: string;
  viewCount: number;
  publishedAt?: Date;
  category?: string;
  author?: string;
}

export async function getArticleAnalytics(slug: string): Promise<ArticleAnalytics | null> {
  const article = await prisma.magazineArticle.findUnique({
    where: { slug },
    select: {
      slug: true,
      title: true,
      viewCount: true,
      publishedAt: true,
      category: true,
      author: true,
    },
  });

  return article || null;
}

/**
 * Get all published articles ranked by view count
 */
export async function getArticleRankings() {
  return await prisma.magazineArticle.findMany({
    where: { published: true },
    select: {
      slug: true,
      title: true,
      viewCount: true,
      category: true,
      author: true,
      publishedAt: true,
    },
    orderBy: [
      { viewCount: 'desc' },
      { publishedAt: 'desc' },
    ],
  });
}

/**
 * Get articles published today with view count
 */
export async function getTodaysArticles() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return await prisma.magazineArticle.findMany({
    where: {
      published: true,
      publishedAt: {
        gte: today,
        lt: tomorrow,
      },
    },
    select: {
      slug: true,
      title: true,
      viewCount: true,
      publishedAt: true,
    },
    orderBy: { viewCount: 'desc' },
  });
}
