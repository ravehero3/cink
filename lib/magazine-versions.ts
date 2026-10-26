/**
 * Magazine article version history tracking
 */
import { prisma } from '@/lib/prisma';

export interface ArticleSnapshot {
  title: string;
  subtitle?: string | null;
  author?: string | null;
  category?: string | null;
  tags?: string | null;
  blocks: any;
  published: boolean;
  publishedAt?: Date | null;
}

/**
 * Create a version history entry when article is updated
 */
export async function createArticleVersion(
  articleId: string,
  snapshot: ArticleSnapshot,
  editor: string,
  changeNotes?: string
) {
  try {
    await prisma.magazineArticleVersion.create({
      data: {
        articleId,
        title: snapshot.title,
        subtitle: snapshot.subtitle || null,
        author: snapshot.author || null,
        category: snapshot.category || null,
        tags: snapshot.tags || null,
        blocks: snapshot.blocks,
        published: snapshot.published,
        publishedAt: snapshot.publishedAt || null,
        editor,
        changeNotes: changeNotes || null,
      },
    });
  } catch (error) {
    console.error('Error creating article version:', error);
    // Don't throw - version history is nice-to-have, not critical
  }
}

/**
 * Get all versions of an article
 */
export async function getArticleVersions(
  articleId: string,
  limit: number = 50
) {
  return await prisma.magazineArticleVersion.findMany({
    where: { articleId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Get specific version
 */
export async function getArticleVersion(versionId: string) {
  return await prisma.magazineArticleVersion.findUnique({
    where: { id: versionId },
  });
}

/**
 * Restore article to a specific version
 */
export async function restoreArticleVersion(
  articleId: string,
  versionId: string,
  editor: string
) {
  const version = await prisma.magazineArticleVersion.findUnique({
    where: { id: versionId },
  });

  if (!version || version.articleId !== articleId) {
    throw new Error('Version not found');
  }

  // Update article with version data
  const updated = await prisma.magazineArticle.update({
    where: { id: articleId },
    data: {
      title: version.title,
      subtitle: version.subtitle,
      author: version.author,
      category: version.category,
      tags: version.tags,
      blocks: version.blocks,
      published: version.published,
      publishedAt: version.publishedAt,
    },
  });

  // Create new version entry for restoration
  await createArticleVersion(
    articleId,
    updated,
    editor,
    `Restored from version created on ${version.createdAt.toLocaleString()}`
  );

  return updated;
}

/**
 * Format version metadata for display
 */
export interface VersionMetadata {
  id: string;
  createdAt: Date;
  editor: string;
  changeNotes?: string;
  title: string;
  isPublished: boolean;
}

export function formatVersionMetadata(version: any): VersionMetadata {
  return {
    id: version.id,
    createdAt: version.createdAt,
    editor: version.editor,
    changeNotes: version.changeNotes,
    title: version.title,
    isPublished: version.published,
  };
}
