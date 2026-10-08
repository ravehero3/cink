import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession();
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
    const session = await getServerSession();
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, subtitle, author, category, tags, blocks, published } = await request.json();

    const article = await prisma.magazineArticle.update({
      where: { slug: params.slug },
      data: {
        title,
        subtitle,
        author,
        category,
        tags,
        blocks: blocks || {},
        published,
        publishedAt: published ? (await prisma.magazineArticle.findUnique({
          where: { slug: params.slug },
        })).publishedAt || new Date() : null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(article);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    console.error('Error updating article:', error);
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession();
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
