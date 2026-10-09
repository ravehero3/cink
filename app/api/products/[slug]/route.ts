import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFullImageUrl } from '@/lib/image-url';

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
        productImage: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Convert local image paths to full URLs
    const productWithFullUrls = {
      ...product,
      images: (product.images || []).map((img: string) => getFullImageUrl(img)),
      productImage: getFullImageUrl(product.productImage),
    };

    return NextResponse.json(productWithFullUrls);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
