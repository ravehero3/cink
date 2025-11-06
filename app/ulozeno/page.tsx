'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Titlebar from '@/components/Titlebar';
import ProductCard from '@/components/ProductCard';
import { useSavedProductsStore } from '@/lib/saved-products-store';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  category: string;
}

export default function SavedProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const savedProductIds = useSavedProductsStore((state) => state.savedIds);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/prihlaseni?redirect=/ulozeno');
      return;
    }

    if (status === 'authenticated' && savedProductIds.length > 0) {
      fetchSavedProducts();
    } else {
      setLoading(false);
    }
  }, [status, savedProductIds, router]);

  const fetchSavedProducts = async () => {
    try {
      const response = await fetch('/api/saved-products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching saved products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <>
        <Titlebar title="ULOŽENÉ PRODUKTY" />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-body">Načítám uložené produkty...</p>
        </div>
      </>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (products.length === 0) {
    return (
      <>
        <Titlebar title="ULOŽENÉ PRODUKTY" />
        <div className="min-h-screen flex items-center justify-center px-8">
          <div className="text-center">
            <p className="text-body mb-6">Nemáte žádné uložené produkty</p>
            <Link
              href="/"
              className="inline-block bg-black text-white text-body uppercase px-8 py-3 border border-black hover:bg-white hover:text-black transition-colors"
            >
              POKRAČOVAT V NÁKUPU
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Titlebar title="ULOŽENÉ PRODUKTY" />
      
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="mb-6">
          <p className="text-body">
            {products.length} {products.length === 1 ? 'produkt' : products.length < 5 ? 'produkty' : 'produktů'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-black border border-black">
          {products.map((product) => (
            <ProductCard 
              key={product.id}
              id={product.id}
              name={product.name}
              slug={product.slug}
              price={product.price}
              image={product.images[0] || '/placeholder.png'}
              isSaved={true}
            />
          ))}
        </div>
      </div>
    </>
  );
}
