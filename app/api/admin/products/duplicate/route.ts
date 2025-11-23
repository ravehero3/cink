import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const originalProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!originalProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Generate new slug with timestamp
    const timestamp = Date.now();
    const newSlug = `${originalProduct.slug}-copy-${timestamp}`;

    const duplicatedProduct = await prisma.product.create({
      data: {
        name: `${originalProduct.name} (kopie)`,
        slug: newSlug,
        description: originalProduct.description,
        shortDescription: originalProduct.shortDescription,
        price: originalProduct.price,
        category: originalProduct.category,
        color: originalProduct.color,
        images: originalProduct.images as any,
        videoUrl: originalProduct.videoUrl as any,
        sizes: originalProduct.sizes as any,
        totalStock: originalProduct.totalStock,
        lowStockThreshold: originalProduct.lowStockThreshold,
        isVisible: false, // New products hidden by default
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Produkt byl duplikován',
      product: duplicatedProduct,
    });
  } catch (error) {
    console.error('Error duplicating product:', error);
    return NextResponse.json({ error: 'Failed to duplicate product' }, { status: 500 });
  }
}
