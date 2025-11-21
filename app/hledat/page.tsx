'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Titlebar from '@/components/Titlebar';
import Infobar from '@/components/Infobar';
import ProductsGrid from '@/components/ProductsGrid';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  category: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      fetchSearchResults();
    } else {
      setLoading(false);
    }
  }, [query]);

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Search error:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (!query) {
    return (
      <>
        <Titlebar title="VYHLEDÁVÁNÍ" />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-body">Zadejte hledaný výraz</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Titlebar title={`VÝSLEDKY HLEDÁNÍ: "${query}"`} />
      
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-body animate-pulse-color">načítá se</p>
        </div>
      ) : (
        <>
          <Infobar 
            productCount={products.length}
            currentSort="newest"
            onSortChange={() => {}}
          />
          
          {products.length === 0 ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-body mb-2">Nenalezli jsme žádné produkty</p>
                <p className="text-[12px]">Zkuste použít jiná klíčová slova</p>
              </div>
            </div>
          ) : (
            <ProductsGrid products={products} />
          )}
        </>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <>
        <Titlebar title="VYHLEDÁVÁNÍ" />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-body animate-pulse-color">načítá se</p>
        </div>
      </>
    }>
      <SearchContent />
    </Suspense>
  );
}
