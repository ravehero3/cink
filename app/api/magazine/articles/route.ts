import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import {
  sanitizeTitle,
  sanitizeAuthor,
  sanitizeCategory,
  sanitizeTags,
  validateInstagramUrl,
  validateSlug,
} from '@/lib/magazine-sanitize';
import { createArticleVersion } from '@/lib/magazine-versions';

export async function GET(request: NextRequest) {
  try {
    const allParam = request.nextUrl.searchParams.get('all');
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'ADMIN';

    // Admins see all active articles, public sees only published
    const articles = await prisma.magazineArticle.findMany({
      where: allParam === '1' && isAdmin ? { archived: false } : { published: true, archived: false },
      orderBy: { publishedAt: 'desc' },
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug, title, subtitle, author, category, tags, blocks, published } = await request.json();

    // Validate and sanitize inputs
    try {
      var validatedSlug = validateSlug(slug);
      var validatedTitle = sanitizeTitle(title);
      var validatedAuthor = sanitizeAuthor(author);
      var validatedCategory = sanitizeCategory(category);
      var validatedTags = sanitizeTags(tags);
    } catch (validationError: any) {
      return NextResponse.json({ error: validationError.message }, { status: 400 });
    }

    // Validate blocks (Instagram URL if present)
    if (blocks?.instagram) {
      try {
        blocks.instagram = validateInstagramUrl(blocks.instagram);
      } catch (instagramError: any) {
        return NextResponse.json({ error: instagramError.message }, { status: 400 });
      }
    }

    // Check slug uniqueness (active articles only)
    const existing = await prisma.magazineArticle.findUnique({ where: { slug: validatedSlug } });
    if (existing && !existing.archived) {
      return NextResponse.json(
        { error: 'Tento slug již existuje. Zvolte jiný.' },
        { status: 409 }
      );
    }

    const article = await prisma.magazineArticle.create({
      data: {
        slug: validatedSlug,
        title: validatedTitle,
        subtitle: subtitle ? String(subtitle).trim().substring(0, 1000) : null,
        author: validatedAuthor || null,
        category: validatedCategory || null,
        tags: validatedTags || null,
        blocks: blocks || {},
        published,
        publishedAt: published ? new Date() : null,
      },
    });

    // Create initial version history entry
    await createArticleVersion(
      article.id,
      {
        title: article.title,
        subtitle: article.subtitle,
        author: article.author,
        category: article.category,
        tags: article.tags,
        blocks: article.blocks,
        published: article.published,
        publishedAt: article.publishedAt,
      },
      session.user?.email || 'unknown',
      `Article created${published ? ' and published' : ''}`
    );

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
