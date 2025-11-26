import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    const updateData: any = {};
    
    if (data.name !== undefined) {
      updateData.name = data.name;
      updateData.slug = data.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    
    if (data.description !== undefined) updateData.description = data.description;
    if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
    if (data.isVisible !== undefined) updateData.isVisible = data.isVisible;
    if (data.productInfo !== undefined) updateData.productInfo = data.productInfo;
    if (data.sizeFit !== undefined) updateData.sizeFit = data.sizeFit;
    if (data.shippingInfo !== undefined) updateData.shippingInfo = data.shippingInfo;
    if (data.careInfo !== undefined) updateData.careInfo = data.careInfo;
    if (data.sizeChartType !== undefined) updateData.sizeChartType = data.sizeChartType;
    if (data.sizeChartData !== undefined) updateData.sizeChartData = data.sizeChartData;
    
    if (data.sizes !== undefined) {
      updateData.sizes = data.sizes;
      updateData.totalStock = Object.values(data.sizes).reduce(
        (sum: number, stock: any) => sum + (Number(stock) || 0),
        0
      );
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
