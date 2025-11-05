import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createProduct } from '@/lib/product-helpers';

export async function GET() {
  try {
    const testProduct = await createProduct(prisma, {
      name: 'Test Product',
      slug: 'test-product-' + Date.now(),
      description: 'Test product for stock calculation',
      price: 999,
      category: 'VOODOO808',
      color: 'black',
      images: [],
      sizes: { S: 5, M: 10, L: 8, XL: 3, XXL: 2 },
    });
    
    const expectedTotal = 5 + 10 + 8 + 3 + 2;
    
    await prisma.product.delete({
      where: { id: testProduct.id },
    });
    
    return NextResponse.json({
      status: 'success',
      message: 'Stock calculation helper working correctly',
      test: {
        sizes: testProduct.sizes,
        calculatedStock: testProduct.totalStock,
        expectedStock: expectedTotal,
        correct: testProduct.totalStock === expectedTotal,
      },
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
