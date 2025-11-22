import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Musíte být přihlášeni' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { savedProducts: true },
    });

    if (!user || !user.savedProducts || user.savedProducts.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: user.savedProducts,
        },
        isVisible: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: true,
        category: true,
        color: true,
      },
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('Error fetching saved products:', error);
    return NextResponse.json(
      { error: 'Došlo k chybě při načítání uložených produktů' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('[saved-products POST] Session:', session?.user ? 'authenticated' : 'NOT authenticated');

    if (!session?.user) {
      console.log('[saved-products POST] No session, returning 401');
      return NextResponse.json(
        { error: 'Musíte být přihlášeni' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId } = body;
    console.log('[saved-products POST] Adding product:', productId, 'for user:', session.user.id);

    if (!productId) {
      return NextResponse.json(
        { error: 'ID produktu je povinné' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produkt nebyl nalezen' },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { savedProducts: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Uživatel nebyl nalezen' },
        { status: 404 }
      );
    }

    const savedProducts = user.savedProducts || [];
    
    if (savedProducts.includes(productId)) {
      return NextResponse.json(
        { message: 'Produkt je již uložen' },
        { status: 200 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        savedProducts: [...savedProducts, productId],
      },
      select: { savedProducts: true },
    });

    console.log('[saved-products POST] Updated user saved products:', updatedUser.savedProducts);

    return NextResponse.json(
      { success: true, message: 'Produkt byl uložen', savedProducts: updatedUser.savedProducts },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving product:', error);
    return NextResponse.json(
      { error: 'Došlo k chybě při ukládání produktu' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Musíte být přihlášeni' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'ID produktu je povinné' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { savedProducts: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Uživatel nebyl nalezen' },
        { status: 404 }
      );
    }

    const savedProducts = user.savedProducts || [];
    const updatedSavedProducts = savedProducts.filter(id => id !== productId);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        savedProducts: updatedSavedProducts,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Produkt byl odebrán z uložených' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing saved product:', error);
    return NextResponse.json(
      { error: 'Došlo k chybě při odebírání produktu' },
      { status: 500 }
    );
  }
}
