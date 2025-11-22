'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSavedProductsStore } from '@/lib/saved-products-store';
import { useCartStore } from '@/lib/cart-store';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  category: string;
  color: string;
}

export default function SavedProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const removeProduct = useSavedProductsStore((state) => state.removeProduct);
  // Use hook selector to ensure Zustand is properly hydrated
  const savedProductIds = useSavedProductsStore((state) => state.savedIds);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { addItem } = useCartStore();

  // Set mounted flag to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // For authenticated users, always fetch from database
    if (status === 'authenticated') {
      console.log('[ULOŽENÉ PRODUKTY] Authenticated user, fetching from database');
      fetchSavedProducts();
    } 
    // For unauthenticated users, use local store
    else if (status === 'unauthenticated') {
      console.log('[ULOŽENÉ PRODUKTY] Unauthenticated user, using Zustand store. SavedIds:', savedProductIds);
      if (savedProductIds.length > 0) {
        console.log('[ULOŽENÉ PRODUKTY] Found saved products, fetching details...');
        fetchSavedProductsLocal();
      } else {
        console.log('[ULOŽENÉ PRODUKTY] No saved products in Zustand');
        setLoading(false);
      }
    } 
    // Loading state
    else if (status === 'loading') {
      setLoading(true);
    }
    // Other cases
    else {
      setLoading(false);
    }
  }, [status, mounted, savedProductIds]);

  const fetchSavedProducts = async () => {
    try {
      const response = await fetch('/api/saved-products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data || []);
      }
    } catch (error) {
      console.error('Error fetching saved products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedProductsLocal = async () => {
    try {
      if (savedProductIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      // Fetch only the saved products by ID
      const params = new URLSearchParams();
      savedProductIds.forEach(id => params.append('id', id));
      
      const response = await fetch(`/api/products?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        console.log('[ULOŽENÉ PRODUKTY] Fetched saved products:', data);
        // Handle both formats: direct array or object with products field
        const products = Array.isArray(data) ? data : (data.products || []);
        console.log('[ULOŽENÉ PRODUKTY] Retrieved saved products count:', products.length);
        setProducts(products);
      } else {
        console.error('[ULOŽENÉ PRODUKTY] API response not ok:', response.status);
      }
    } catch (error) {
      console.error('[ULOŽENÉ PRODUKTY] Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    removeProduct(productId);
    setProducts(products.filter(p => p.id !== productId));
    
    // If authenticated, also remove from database
    if (session?.user) {
      try {
        await fetch(`/api/saved-products?productId=${productId}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Error removing saved product:', error);
      }
    }
  };

  const handleMoveToCart = (product: Product) => {
    router.push(`/produkty/${product.slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center">
        <div 
          className="border-l border-r border-black relative w-full flex flex-col" 
          style={{ width: '33.333%', minWidth: '400px', maxWidth: '600px', paddingTop: '88px', marginTop: '-88px' }}
        >
          <div className="flex items-center justify-center py-20">
            <p className="text-sm">Načítám...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div 
        className="border-l border-r border-black relative w-full flex flex-col" 
        style={{ width: '33.333%', minWidth: '400px', maxWidth: '600px', paddingTop: '88px', marginTop: '-88px' }}
      >
        <div 
          className="border-b border-black flex items-center justify-center"
          style={{ height: '80px' }}
        >
          <h1 
            className="uppercase text-center"
            style={{
              fontFamily: '"Helvetica Neue Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '16px',
              fontWeight: 400,
              letterSpacing: '1px'
            }}
          >
            ULOŽENÉ PRODUKTY
          </h1>
        </div>

        <div 
          className="border-b border-black flex items-center px-6 gap-4"
          style={{ height: '60px' }}
        >
          <button
            className="bg-white text-black border border-black text-xs uppercase px-4 py-2 hover:bg-black hover:text-white transition-colors"
            style={{
              fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
              borderRadius: '4px'
            }}
          >
            ULOŽENÉ PRODUKTY ({products.length})
          </button>
          <Link 
            href="/kosik"
            className="text-xs uppercase hover:underline"
            style={{
              fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif'
            }}
          >
            NÁKUPNÍ KOŠÍK
          </Link>
        </div>

        {status !== 'authenticated' && products.length === 0 && (
          <div 
            className="border-b border-black flex flex-col items-center justify-center px-8 text-center"
            style={{ minHeight: '200px', paddingTop: '40px', paddingBottom: '40px' }}
          >
            <h2 
              className="mb-4"
              style={{
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '16px',
                fontWeight: 700
              }}
            >
              NEZTRAŤTE SVŮJ LIST
            </h2>
            <p 
              className="mb-6"
              style={{
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '12px',
                lineHeight: '1.6'
              }}
            >
              Přihlaste se nebo si vytvořte účet a uložte si svůj wish list do budoucna
            </p>
            <Link
              href="/prihlaseni?redirect=/ulozeno"
              className="bg-black text-white uppercase px-8 py-3 hover:bg-gray-800 transition-colors"
              style={{
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '12px',
                borderRadius: '4px',
                letterSpacing: '0.5px'
              }}
            >
              PŘIHLÁSIT SE
            </Link>
          </div>
        )}

        {products.length === 0 ? (
          <div 
            className="flex flex-col items-center justify-center px-8 text-center"
            style={{ minHeight: '300px' }}
          >
            <p 
              className="mb-6"
              style={{
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '14px'
              }}
            >
              Nemáte žádné uložené produkty
            </p>
            <Link
              href="/"
              className="bg-black text-white uppercase px-8 py-3 hover:bg-gray-800 transition-colors"
              style={{
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '12px',
                borderRadius: '4px',
                letterSpacing: '0.5px'
              }}
            >
              POKRAČOVAT V NÁKUPU
            </Link>
          </div>
        ) : (
          products.map((product, index) => (
            <div 
              key={product.id}
              className="relative border-b border-black"
              style={{ minHeight: '200px' }}
            >
              <div className="flex h-full">
                <div className="w-1/2 border-r border-black relative">
                  <Link href={`/produkty/${product.slug}`}>
                    <div className="relative w-full h-full" style={{ minHeight: '200px' }}>
                      <Image
                        src={product.images[0] || '/placeholder.png'}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </Link>
                </div>

                <div className="w-1/2 p-4 flex flex-col justify-between">
                  <div>
                    <Link href={`/produkty/${product.slug}`}>
                      <h3 
                        className="mb-2 hover:underline"
                        style={{
                          fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                          fontSize: '13px',
                          fontWeight: 700
                        }}
                      >
                        {product.name}
                      </h3>
                    </Link>
                    <p 
                      className="mb-2"
                      style={{
                        fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                        fontSize: '13px'
                      }}
                    >
                      {product.price} Kč
                    </p>
                    <div style={{ marginBottom: '4px' }}>
                      <p 
                        style={{
                          fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                          fontSize: '11px'
                        }}
                      >
                        Barva: {product.color || 'Černá'}
                      </p>
                    </div>
                    <p 
                      style={{
                        fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                        fontSize: '11px'
                      }}
                    >
                      Velikost: XL
                    </p>
                  </div>

                  <div className="flex justify-between items-end pt-4">
                    <button
                      onClick={() => handleMoveToCart(product)}
                      className="underline hover:no-underline text-left"
                      style={{
                        fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                        fontSize: '11px'
                      }}
                    >
                      Přesunout do košíku
                    </button>
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="underline hover:no-underline text-right"
                      style={{
                        fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                        fontSize: '11px'
                      }}
                    >
                      Odstranit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
