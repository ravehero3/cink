import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await prisma.product.findFirst({
      where: {
        slug: params.slug,
        isVisible: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        category: true,
        color: true,
        images: true,
        videoUrl: true,
        sizes: true,
        totalStock: true,
        createdAt: true,
        productInfo: true,
        sizeFit: true,
        shippingInfo: true,
        careInfo: true,
        sizeChartType: true,
        sizeChartData: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
