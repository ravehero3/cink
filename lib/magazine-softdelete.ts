/**
 * Soft-delete functionality for magazine articles
 * Archives articles instead of permanently deleting them
 */
import { prisma } from '@/lib/prisma';

/**
 * Archive (soft-delete) an article
 */
export async function archiveArticle(
  slug: string,
  archivedBy: string
): Promise<void> {
  try {
    await prisma.magazineArticle.update({
      where: { slug },
      data: {
        archived: true,
        archivedAt: new Date(),
        archivedBy,
      },
    });
  } catch (error) {
    console.error('Error archiving article:', error);
    throw new Error('Failed to archive article');
  }
}

/**
 * Restore an archived article
 */
export async function restoreArticle(slug: string): Promise<void> {
  try {
    await prisma.magazineArticle.update({
      where: { slug },
      data: {
        archived: false,
        archivedAt: null,
        archivedBy: null,
      },
    });
  } catch (error) {
    console.error('Error restoring article:', error);
    throw new Error('Failed to restore article');
  }
}

/**
 * Permanently delete an archived article
 * Only allow deletion of articles archived for >30 days
 */
export async function permanentlyDeleteArchived(slug: string): Promise<void> {
  try {
    const article = await prisma.magazineArticle.findUnique({
      where: { slug },
    });

    if (!article) {
      throw new Error('Article not found');
    }

    if (!article.archived) {
      throw new Error('Can only permanently delete archived articles');
    }

    if (article.archivedAt) {
      const daysSinceArchive = Math.floor(
        (Date.now() - article.archivedAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceArchive < 30) {
        throw new Error(`Cannot permanently delete. Article was archived only ${daysSinceArchive} days ago. Must wait ${30 - daysSinceArchive} more days.`);
      }
    }

    // Delete cascade will also delete version history
    await prisma.magazineArticle.delete({
      where: { slug },
    });
  } catch (error) {
    console.error('Error permanently deleting article:', error);
    throw error;
  }
}

/**
 * Get all archived articles
 */
export async function getArchivedArticles() {
  return await prisma.magazineArticle.findMany({
    where: { archived: true },
    orderBy: { archivedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      author: true,
      archivedAt: true,
      archivedBy: true,
    },
  });
}

/**
 * Get only active (non-archived) articles
 */
export async function getActiveArticles(published: boolean = true) {
  return await prisma.magazineArticle.findMany({
    where: {
      archived: false,
      published,
    },
    orderBy: { publishedAt: 'desc' },
  });
}
