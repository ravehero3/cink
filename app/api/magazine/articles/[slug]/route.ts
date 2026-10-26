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

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'ADMIN';

    const article = await prisma.magazineArticle.findUnique({
      where: { slug: params.slug },
    });

    if (!article) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Non-admins can only see published articles
    if (!isAdmin && !article.published) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug: newSlug, title, subtitle, author, category, tags, blocks, published } = await request.json();
    const currentSlug = params.slug;

    // Validate and sanitize inputs
    try {
      var validatedNewSlug = validateSlug(newSlug);
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

    // Fetch existing article
    const existing = await prisma.magazineArticle.findUnique({
      where: { slug: currentSlug },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Článek nenalezen' }, { status: 404 });
    }

    // Check if new slug already exists and is different from current
    if (validatedNewSlug !== currentSlug) {
      const slugConflict = await prisma.magazineArticle.findUnique({
        where: { slug: validatedNewSlug },
      });
      if (slugConflict) {
        return NextResponse.json(
          { error: 'Tento slug již existuje. Zvolte jiný.' },
          { status: 409 }
        );
      }
    }

    // Set publishedAt: keep existing if already published, set now if publishing for first time
    let publishedAt = existing.publishedAt;
    if (published && !existing.published) {
      publishedAt = new Date();
    } else if (!published) {
      publishedAt = null;
    }

    const article = await prisma.magazineArticle.update({
      where: { slug: currentSlug },
      data: {
        slug: validatedNewSlug,
        title: validatedTitle,
        subtitle: subtitle ? String(subtitle).trim().substring(0, 1000) : null,
        author: validatedAuthor || null,
        category: validatedCategory || null,
        tags: validatedTags || null,
        blocks: blocks || {},
        published,
        publishedAt,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(article);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Článek nenalezen' }, { status: 404 });
    }
    console.error('Error updating article:', error);
    return NextResponse.json({ error: 'Chyba při aktualizaci článku' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.magazineArticle.delete({
      where: { slug: params.slug },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    console.error('Error deleting article:', error);
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
