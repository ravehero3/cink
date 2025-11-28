'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSavedProductsStore } from '@/lib/saved-products-store';
import { useCartStore } from '@/lib/cart-store';
import AnimatedButton from '@/components/AnimatedButton';

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
  const savedProductIds = useSavedProductsStore((state) => state.savedIds);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const { addItem, items } = useCartStore();
  const cartItemCount = items.length;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (status === 'authenticated') {
      console.log('[ULOŽENÉ PRODUKTY] Authenticated user, fetching from database');
      fetchSavedProducts();
    } 
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
    else if (status === 'loading') {
      setLoading(true);
    }
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

      const params = new URLSearchParams();
      savedProductIds.forEach(id => params.append('id', id));
      
      const response = await fetch(`/api/products?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        console.log('[ULOŽENÉ PRODUKTY] Fetched saved products:', data);
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

  const handleMoveToCart = async (product: Product) => {
    try {
      setAddingToCart(product.id);
      
      const response = await fetch(`/api/products/${product.slug}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product details');
      }
      
      const fullProduct = await response.json();
      const sizes = (fullProduct.sizes || {}) as Record<string, number>;
      
      const availableSize = Object.entries(sizes).find(([_, stock]) => stock > 0)?.[0];
      
      if (!availableSize) {
        alert('Žádná velikost není k dispozici');
        setAddingToCart(null);
        return;
      }
      
      addItem({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        size: availableSize,
        quantity: 1,
        price: Number(product.price),
        image: product.images[0],
        color: product.color,
      });
      
      setAddingToCart(null);
      
    } catch (error) {
      console.error('Error moving to cart:', error);
      alert('Chyba při přidávání do košíku');
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-white" />;
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex justify-center">
          <div style={{ width: '50%', padding: '32px 16px 32px 16px', borderBottom: '1px solid #000' }}>
            <h1 className="text-center uppercase" style={{
              fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '22px',
              fontWeight: 700,
              lineHeight: '22px',
              letterSpacing: '0.03em',
              fontStretch: 'condensed',
              margin: 0
            }}>
              ULOŽENÉ PRODUKTY
            </h1>
          </div>
        </div>

        {/* Navigation Panel */}
        <div style={{
          width: '995px',
          margin: '0 auto',
          height: '44px',
          borderBottom: '1px solid #000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          padding: '0 16px'
        }}>
          <div className="group" style={{ position: 'relative' }}>
            <div
              className="whitespace-nowrap uppercase tracking-tight font-normal text-sm"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '19.6px',
                color: '#000',
                padding: '0 8px',
                display: 'block'
              }}
            >
              ULOŽENÉ POLOŽKY
            </div>
            <div
              className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                inset: '-4px',
                border: '1px solid #000000',
                borderRadius: '4px'
              }}
            />
          </div>
          <div className="group" style={{ position: 'relative' }}>
            <Link
              href="/kosik"
              className="whitespace-nowrap uppercase tracking-tight font-normal text-sm"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '19.6px',
                color: '#000',
                textDecoration: 'none',
                padding: '0 8px',
                display: 'block'
              }}
            >
              KOŠÍK ({cartItemCount})
            </Link>
            <div
              className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                inset: '-4px',
                border: '1px solid #000000',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>

        <div className="flex justify-center">
          <div className="flex flex-col items-center justify-center px-8 text-center" style={{ width: '50%', minHeight: '300px' }}>
            <p style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              marginBottom: '24px'
            }}>
              Nemáte žádné uložené produkty
            </p>
            <Link
              href="/"
              className="bg-black text-white uppercase px-8 py-3 hover:bg-gray-800 transition-colors"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '12px',
                fontWeight: 400,
                letterSpacing: '0.5px',
                textDecoration: 'none'
              }}
            >
              POKRAČOVAT V NÁKUPU
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* Vertical lines at 700px apart (centered) */}
      <div style={{
        position: 'fixed',
        left: 'calc(50vw - 350px)',
        top: 0,
        bottom: 0,
        width: '1px',
        backgroundColor: '#000',
        zIndex: 5,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'fixed',
        right: 'calc(50vw - 350px)',
        top: 0,
        bottom: 0,
        width: '1px',
        backgroundColor: '#000',
        zIndex: 5,
        pointerEvents: 'none'
      }} />

      {/* Horizontal lines at 700px intervals (starting after banner + nav) */}
      {[...Array(18)].map((_, i) => (
        <div
          key={`h-line-${i}`}
          style={{
            position: 'fixed',
            left: 'calc(50vw - 350px)',
            right: 'calc(50vw - 350px)',
            top: `${2370 + i * 700}px`,
            height: '1px',
            backgroundColor: '#000',
            zIndex: 4,
            pointerEvents: 'none'
          }}
        />
      ))}

      {/* Header with 700px wide bottom border */}
      <div style={{ position: 'relative', width: '995px', margin: '0 auto', height: '226px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
        <h1 className="text-center uppercase" style={{
          fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: '22px',
          fontWeight: 700,
          lineHeight: '22px',
          letterSpacing: '0.03em',
          fontStretch: 'condensed',
          margin: 0
        }}>
          ULOŽENÉ PRODUKTY
        </h1>
        {/* Bottom border - 700px wide */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 'calc(50% - 350px)',
          width: '700px',
          height: '1px',
          backgroundColor: '#000',
          zIndex: 1
        }} />
      </div>

      {/* Navigation Panel - with 700px wide top and bottom borders */}
      <div style={{
        position: 'relative',
        width: '995px',
        margin: '0 auto',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        padding: '0 16px',
        overflow: 'visible',
        zIndex: 10
      }}>
        {/* Top border - 700px wide */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 'calc(50% - 350px)',
          width: '700px',
          height: '1px',
          backgroundColor: '#000',
          zIndex: 1
        }} />
        
        {/* Bottom border - 700px wide */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 'calc(50% - 350px)',
          width: '700px',
          height: '1px',
          backgroundColor: '#000',
          zIndex: 1
        }} />
        
        <div className="group" style={{ position: 'relative', zIndex: 2 }}>
          <div
            className="whitespace-nowrap uppercase tracking-tight font-normal text-sm"
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '19.6px',
              color: '#000',
              padding: '0 8px',
              display: 'block'
            }}
          >
            ULOŽENÉ POLOŽKY
          </div>
          <div
            className="absolute opacity-100 pointer-events-none"
            style={{
              inset: '-4px',
              border: '1px solid #000000',
              borderRadius: '4px'
            }}
          />
        </div>
        <div className="group" style={{ position: 'relative', zIndex: 2 }}>
          <Link
            href="/kosik"
            className="whitespace-nowrap uppercase tracking-tight font-normal text-sm"
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '19.6px',
              color: '#000',
              textDecoration: 'none',
              padding: '0 8px',
              display: 'block'
            }}
          >
            KOŠÍK ({cartItemCount})
          </Link>
          <div
            className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              inset: '-4px',
              border: '1px solid #000000',
              borderRadius: '4px'
            }}
          />
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        <div style={{ width: '700px', position: 'relative' }}>
          {/* Login Prompt - Only for unauthenticated users */}
          {status === 'unauthenticated' && (
            <div
              style={{
                borderTop: '1px solid #000',
                borderBottom: '1px solid #000',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '270px',
                textAlign: 'center'
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{
                  fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  marginBottom: '16px',
                  lineHeight: '19.6px',
                  letterSpacing: '0.03em',
                  fontStretch: 'condensed',
                  color: '#000'
                }}>
                  Nepřijďte o svůj list
                </h3>
                
                <p style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '19.6px',
                  color: '#000',
                  margin: 0
                }}>
                  Přihlaste se nebo si vytvořte účet a uložte si svůj list který můžete prohlížet na jakémkoliv zařízení
                </p>
              </div>

              <AnimatedButton
                text="PŘIHLÁSIT SE"
                onClick={() => signIn()}
                variant="white"
              />
            </div>
          )}

          {products.map((product, index) => (
            <div
              key={product.id}
              style={{
                borderTop: index === 0 ? '1px solid #000' : 'none',
                borderBottom: '1px solid #000',
                padding: '16px',
                paddingBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <Link href={`/produkty/${product.slug}`} style={{ flexShrink: 0 }}>
                  <div style={{
                    width: '160px',
                    height: '192px',
                    border: '1px solid #000',
                    backgroundColor: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={product.images[0] || '/placeholder.png'}
                      alt={product.name}
                      style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                    />
                  </div>
                </Link>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Link
                    href={`/produkty/${product.slug}`}
                    style={{ textDecoration: 'none', color: '#000' }}
                    className="hover:opacity-60 transition-opacity"
                  >
                    <h3 style={{
                      fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '14px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      marginBottom: '4px',
                      lineHeight: '19.6px',
                      letterSpacing: '0.03em',
                      fontStretch: 'condensed',
                      color: '#000'
                    }}>
                      {product.name}
                    </h3>
                  </Link>
                  
                  <p style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '19.6px',
                    color: '#000',
                    marginBottom: '8px'
                  }}>
                    {product.price} Kč
                  </p>

                  <p style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '17.6px',
                    color: '#000',
                    marginBottom: '4px'
                  }}>
                    Barva: {product.color || 'Černá'}
                  </p>
                </div>
              </div>

              {/* Buttons section */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                paddingTop: '8px'
              }}>
                <button
                  onClick={() => handleMoveToCart(product)}
                  disabled={addingToCart === product.id}
                  style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '19.6px',
                    color: '#000',
                    textDecoration: 'underline',
                    border: 'none',
                    background: 'none',
                    cursor: addingToCart === product.id ? 'not-allowed' : 'pointer',
                    padding: 0,
                    textAlign: 'left',
                    opacity: addingToCart === product.id ? 0.6 : 1
                  }}
                  className="hover:opacity-60 transition-opacity"
                >
                  {addingToCart === product.id ? 'Přidávám...' : 'Přesunout do košíku'}
                </button>
                <button
                  onClick={() => handleRemove(product.id)}
                  style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '19.6px',
                    color: '#000',
                    textDecoration: 'underline',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    textAlign: 'right'
                  }}
                  className="hover:opacity-60 transition-opacity"
                >
                  Smazat
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
