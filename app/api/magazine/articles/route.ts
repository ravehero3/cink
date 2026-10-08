import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const allParam = request.nextUrl.searchParams.get('all');
    const session = await getServerSession();
    const isAdmin = session?.user?.role === 'ADMIN';

    // Admins see all, public sees only published
    const articles = await prisma.magazineArticle.findMany({
      where: allParam === '1' && isAdmin ? {} : { published: true },
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
    const session = await getServerSession();
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug, title, subtitle, author, category, tags, blocks, published } = await request.json();

    // Validate slug
    if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
    }

    // Check uniqueness
    const existing = await prisma.magazineArticle.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }

    const article = await prisma.magazineArticle.create({
      data: {
        slug,
        title,
        subtitle,
        author,
        category,
        tags,
        blocks: blocks || {},
        published,
        publishedAt: published ? new Date() : null,
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
