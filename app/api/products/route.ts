import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get('category');
    const colors = searchParams.getAll('color');
    const sizes = searchParams.getAll('size');
    const search = searchParams.get('search');
    const ids = searchParams.getAll('id');
    const sort = searchParams.get('sort') || 'newest';
    const rawPage = parseInt(searchParams.get('page') || '1');
    const rawLimit = parseInt(searchParams.get('limit') || '20');
    
    // Validate and clamp parameters to prevent DoS attacks
    const page = Math.max(1, Math.min(rawPage || 1, 1000)); // Max 1000 pages
    const limit = Math.max(1, Math.min(rawLimit || 20, 100)); // Max 100 items per page

    const where: Prisma.ProductWhereInput = {
      isVisible: true,
    };

    // If specific IDs are requested, fetch only those
    if (ids.length > 0) {
      where.id = { in: ids };
    }

    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (colors.length > 0) {
      where.color = { in: colors };
    }

    if (sizes.length > 0) {
      where.AND = sizes.map(size => ({
        sizes: {
          path: [size],
          not: Prisma.DbNull,
        },
      }));
    }

    if (search) {
      const searchLower = search.toLowerCase();
      where.OR = [
        { name: { contains: searchLower, mode: 'insensitive' } },
        { description: { contains: searchLower, mode: 'insensitive' } },
        { category: { contains: searchLower, mode: 'insensitive' } },
      ];
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    
    switch (sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'price-low':
        orderBy = { price: 'asc' };
        break;
      case 'price-high':
        orderBy = { price: 'desc' };
        break;
      case 'name-az':
        orderBy = { name: 'asc' };
        break;
      case 'name-za':
        orderBy = { name: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          price: true,
          category: true,
          color: true,
          images: true,
          sizes: true,
          totalStock: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
