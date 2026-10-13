          <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', width: '100%' }}
          >
            <a
              href="https://wa.me/420775181107"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '11px',
                fontWeight: 400,
                padding: '8px 12px',
                border: '1px solid #000',
                borderRadius: '4px',
                textDecoration: 'none',
                color: '#000',
                textTransform: 'uppercase',
                backgroundColor: '#fff',
                cursor: 'pointer',
                display: 'block',
                textAlign: 'center',
                height: '40px',
                lineHeight: '24px'
              }}
            >
              WHATSAPP
            </a>
            <a
              href="tel:+420775181107"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '11px',
                fontWeight: 400,
                padding: '8px 12px',
                border: '1px solid #000',
                borderRadius: '4px',
                textDecoration: 'none',
                color: '#000',
                textTransform: 'uppercase',
                backgroundColor: '#fff',
                cursor: 'pointer',
                display: 'block',
                textAlign: 'center',
                height: '40px',
                lineHeight: '24px'
              }}
            >
              ZAVOLEJTE NÁM
            </a>
          </div>'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
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
  productImage?: string;
}

function AnimatedLink({ href, text }: { href: string; text: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      className="relative overflow-hidden bg-white text-black font-normal uppercase tracking-tight transition-all border border-black text-sm"
      style={{ borderRadius: '4px', padding: '11.8px 25.6px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        className="block transition-all duration-200"
        style={{
          transform: isHovered ? 'translateY(-150%)' : 'translateY(0)',
          opacity: isHovered ? 0 : 1,
        }}
      >
        {text}
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-200"
        style={{
          transform: isHovered ? 'translateY(0)' : 'translateY(150%)',
          opacity: isHovered ? 1 : 0,
        }}
      >
        {text}
      </span>
    </Link>
  );
}

function UlozenoWhiteFooter() {
  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .ulozeno-desktop-footer {
            display: none !important;
          }
          .ulozeno-mobile-footer {
            display: block !important;
          }
        }
        @media (min-width: 768px) {
          .ulozeno-desktop-footer {
            display: flex !important;
          }
          .ulozeno-mobile-footer {
            display: none !important;
          }
        }
      `}</style>
      {/* Desktop White Footer - Static at bottom of page */}
      <div
        className="ulozeno-desktop-footer"
        style={{
          position: 'relative',
          width: '100%',
          backgroundColor: '#fff',
          borderTop: '1px solid #000',
          zIndex: 30,
          height: '328px',
          flexDirection: 'row',
          padding: '24px 0',
          boxSizing: 'border-box',
          marginTop: 'auto'
        }}
      >
        {/* Left Section - Payment Methods */}
        <div
          className="footer-section"
          style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            textAlign: 'center',
            gap: '12px',
            paddingLeft: '24px',
            paddingRight: '24px'
          }}
        >
          <h3
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              margin: '0',
              color: '#000'
            }}
          >
            BEZPEČNĚ PŘIJÍMÁME
          </h3>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}
          >
            <img src="/payment-methods.jpg" alt="Payment Methods" style={{ height: '96px', width: 'auto' }} />
          </div>
        </div>

        {/* Middle Section - Customer Support */}
        <div
          className="footer-section"
          style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            textAlign: 'center',
            gap: '12px',
            paddingLeft: '24px',
            paddingRight: '24px'
          }}
        >
          <h3
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              margin: '0',
              color: '#000'
            }}
          >
            ZÁKAZNICKÁ PODPORA
          </h3>
          <p
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '11px',
              fontWeight: 400,
              margin: '0 0 8px 0',
              color: '#000',
              lineHeight: '1.3'
            }}
          >
            Naše zákaznická podpora je vám k dispozici od Pondělí do Soboty 9:30 - 19:00
          </p>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexDirection: 'column',
              width: 'auto',
              alignItems: 'center'
            }}
          >
            <a
              href="https://wa.me/420775181107"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '11px',
                fontWeight: 400,
                padding: '8px 16px',
                border: '1px solid #000',
                borderRadius: '4px',
                textDecoration: 'none',
                color: '#000',
                textTransform: 'uppercase',
                backgroundColor: '#fff',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '40px'
              }}
            >
              WHATSAPP +420 775 181 107
            </a>
            <a
              href="tel:+420775181107"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '11px',
                fontWeight: 400,
                padding: '8px 16px',
                border: '1px solid #000',
                borderRadius: '4px',
                textDecoration: 'none',
                color: '#000',
                textTransform: 'uppercase',
                backgroundColor: '#fff',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '40px',
                whiteSpace: 'nowrap'
              }}
            >
              ZAVOLEJTE NÁM +420 775 181 107
            </a>
          </div>
        </div>

        {/* Right Section - Shipping Info */}
        <div
          style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            textAlign: 'center',
            gap: '12px',
            paddingLeft: '24px',
            paddingRight: '24px'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              alignItems: 'center'
            }}
          >
            <h3
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '12px',
                fontWeight: 700,
                margin: '0',
                color: '#000',
                textTransform: 'uppercase',
                letterSpacing: '0.03em'
              }}
            >
              BEZPEČNÁ PLATBA A RYCHLÉ DORUČENÍ
            </h3>
            <p
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '11px',
                fontWeight: 400,
                margin: '0',
                color: '#000',
                lineHeight: '1.3'
              }}
            >
              Využijte bezpečnou platbu přes GoPay nebo Apple Pay
            </p>
          </div>
        </div>
      </div>

      {/* Mobile White Footer Sections - same as mobile kosik page */}
      <div className="ulozeno-mobile-footer" style={{ width: '100%', marginTop: 'auto' }}>
        {/* BEZPEČNĚ PŘIJÍMÁME Section */}
        <div
          style={{
            width: '100%',
            padding: '16px',
            borderTop: '1px solid #000',
            borderBottom: '1px solid #000',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'center'
          }}
        >
          <h3
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              margin: '0',
              color: '#000',
              textAlign: 'center'
            }}
          >
            BEZPEČNĚ PŘIJÍMÁME
          </h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
            <img src="/payment-methods.jpg" alt="Payment Methods" style={{ height: '80px', width: 'auto', maxWidth: '100%' }} />
          </div>
        </div>

        {/* ZÁKAZNICKÁ PODPORA Section */}
        <div
          style={{
            width: '100%',
            padding: '16px',
            borderBottom: '1px solid #000',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <h3
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              margin: '0',
              color: '#000',
              textAlign: 'center'
            }}
          >
            ZÁKAZNICKÁ PODPORA
          </h3>
          <p
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '11px',
              fontWeight: 400,
              margin: '0 0 8px 0',
              color: '#000',
              lineHeight: '1.3',
              textAlign: 'center'
            }}
          >
            Naše zákaznická podpora je vám k dispozici od Pondělí do Soboty 9:30 - 19:00
          </p>
          <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', width: '100%' }}>
            <a
              href="https://wa.me/420775181107"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '11px',
                fontWeight: 400,
                padding: '8px 12px',
                border: '1px solid #000',
                borderRadius: '4px',
                textDecoration: 'none',
                color: '#000',
                textTransform: 'uppercase',
                backgroundColor: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                minWidth: '212px',
                height: '40px'
              }}
            >
              WHATSAPP +420 775 181 107
            </a>
            <a
              href="tel:+420775181107"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '11px',
                fontWeight: 400,
                padding: '8px 12px',
                border: '1px solid #000',
                borderRadius: '4px',
                textDecoration: 'none',
                color: '#000',
                textTransform: 'uppercase',
                backgroundColor: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                minWidth: '212px',
                height: '40px'
              }}
            >
              ZAVOLEJTE NÁM +420 775 181 107
            </a>
          </div>
        </div>

        {/* BEZPEČNÁ PLATBA & RYCHLÉ DORUČENÍ Section */}
        <div
          style={{
            width: '100%',
            padding: '16px',
            borderBottom: '1px solid #000',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <h3
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '12px',
              fontWeight: 700,
              margin: '0',
              color: '#000',
              textTransform: 'uppercase',
              textAlign: 'center',
              letterSpacing: '0.03em'
            }}
          >
            BEZPEČNÁ PLATBA A RYCHLÉ DORUČENÍ
          </h3>
          <p
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '11px',
              fontWeight: 400,
              margin: '0',
              color: '#000',
              lineHeight: '1.3',
              textAlign: 'center'
            }}
          >
            Využijte bezpečnou platbu přes GoPay nebo Apple Pay
          </p>
        </div>
      </div>
    </>
  );
}

export default function SavedProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const removeProduct = useSavedProductsStore((state) => state.removeProduct);
  const savedProductIds = useSavedProductsStore((state) => state.savedIds);
  const setSavedIds = useSavedProductsStore((state) => state.setSavedIds);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const syncInProgressRef = useRef(false);
  const lastSyncedIdsRef = useRef<string[]>([]);
  const { addItem, items, getItemCount } = useCartStore();
  const cartItemCount = getItemCount();
  const isUlozeno = pathname === '/ulozeno';

  const arraysEqual = useCallback((a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, idx) => val === sortedB[idx]);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (status === 'authenticated') {
      const hasNewIds = savedProductIds.some(id => !lastSyncedIdsRef.current.includes(id));
      const needsInitialSync = lastSyncedIdsRef.current.length === 0;
      
      if (!syncInProgressRef.current && (hasNewIds || needsInitialSync)) {
        console.log('[ULOŽENÉ PRODUKTY] Authenticated user, syncing and fetching from database');
        syncAndFetchSavedProducts();
      }
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

  const syncAndFetchSavedProducts = async () => {
    if (syncInProgressRef.current) return;
    syncInProgressRef.current = true;
    
    try {
      const localIds = useSavedProductsStore.getState().savedIds;
      console.log('[ULOŽENÉ PRODUKTY] Local saved IDs:', localIds);
      
      const response = await fetch('/api/saved-products');
      if (!response.ok) {
        console.error('[ULOŽENÉ PRODUKTY] Failed to fetch from database, keeping local IDs');
        if (localIds.length > 0) {
          await fetchSavedProductsLocal();
        } else {
          setLoading(false);
        }
        return;
      }
      
      const data = await response.json();
      console.log('[ULOŽENÉ PRODUKTY] Fetched from database:', data);
      const dbProducts = data || [];
      const dbIds = dbProducts.map((p: Product) => p.id);
      
      const idsToSync = localIds.filter((id: string) => !dbIds.includes(id));
      console.log('[ULOŽENÉ PRODUKTY] IDs to sync to database:', idsToSync);
      
      const failedSyncIds: string[] = [];
      const successSyncIds: string[] = [];
      
      if (idsToSync.length > 0) {
        console.log('[ULOŽENÉ PRODUKTY] Syncing local saved products to database...');
        for (const productId of idsToSync) {
          try {
            const syncResponse = await fetch('/api/saved-products', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId }),
            });
            if (!syncResponse.ok) {
              console.error('[ULOŽENÉ PRODUKTY] Failed to sync product:', productId, syncResponse.status);
              failedSyncIds.push(productId);
            } else {
              successSyncIds.push(productId);
            }
          } catch (err) {
            console.error('[ULOŽENÉ PRODUKTY] Error syncing product:', productId, err);
            failedSyncIds.push(productId);
          }
        }
      }
      
      let finalProducts = dbProducts;
      let finalDbIds = dbIds;
      
      if (successSyncIds.length > 0) {
        const refreshResponse = await fetch('/api/saved-products');
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          finalProducts = refreshData || [];
          finalDbIds = finalProducts.map((p: Product) => p.id);
        }
      }
      
      const unsyncedIds = localIds.filter((id: string) => !finalDbIds.includes(id));
      if (unsyncedIds.length > 0) {
        console.log('[ULOŽENÉ PRODUKTY] Fetching product data for unsynced IDs:', unsyncedIds);
        const unsyncedProductsData = await fetchProductsByIds(unsyncedIds);
        finalProducts = [...finalProducts, ...unsyncedProductsData];
      }
      
      const mergedIds = Array.from(new Set([...finalDbIds, ...localIds]));
      console.log('[ULOŽENÉ PRODUKTY] Final merged IDs:', mergedIds);
      
      setSavedIds(mergedIds);
      setProducts(finalProducts);
      lastSyncedIdsRef.current = mergedIds;
      
      if (failedSyncIds.length > 0) {
        console.warn('[ULOŽENÉ PRODUKTY] Some products could not be synced to database:', failedSyncIds);
      }
    } catch (error) {
      console.error('Error fetching saved products:', error);
    } finally {
      setLoading(false);
      syncInProgressRef.current = false;
    }
  };

  const fetchProductsByIds = async (ids: string[]): Promise<Product[]> => {
    try {
      const params = new URLSearchParams();
      ids.forEach(id => params.append('id', id));
      const response = await fetch(`/api/products?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : (data.products || []);
      }
    } catch (error) {
      console.error('[ULOŽENÉ PRODUKTY] Error fetching products by IDs:', error);
    }
    return [];
  };

  const fetchSavedProducts = async () => {
    try {
      const response = await fetch('/api/saved-products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data || []);
        
        const dbIds = (data || []).map((p: Product) => p.id);
        setSavedIds(dbIds);
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
        image: product.productImage || product.images[0],
        color: product.color,
        category: product.category,
      });
      
      removeProduct(product.id);
      setProducts(products.filter(p => p.id !== product.id));
      
      if (session?.user) {
        await fetch(`/api/saved-products?productId=${product.id}`, {
          method: 'DELETE',
        });
      }
      
      setAddingToCart(null);
      
    } catch (error) {
      console.error('Error moving to cart:', error);
      alert('Chyba při přidávání do košíku');
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white relative">
        <div className="hidden md:block" style={{position: 'absolute', left: 'calc(50vw - 350px)', top: 0, bottom: 0, width: '1px', backgroundColor: '#000', zIndex: 5, pointerEvents: 'none'}} />
        <div className="hidden md:block" style={{position: 'absolute', right: 'calc(50vw - 350px)', top: 0, bottom: 0, width: '1px', backgroundColor: '#000', zIndex: 5, pointerEvents: 'none'}} />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col relative">
        {/* Vertical lines at product edges (995px wide, centered) - hidden on mobile */}
        <div className="hidden md:block" style={{
          position: 'fixed',
          left: '50%',
          marginLeft: '-497.5px',
          top: 0,
          bottom: 0,
          width: '1px',
          backgroundColor: '#000',
          zIndex: 5
        }} />
        <div className="hidden md:block" style={{
          position: 'fixed',
          left: '50%',
          marginLeft: '497.5px',
          top: 0,
          bottom: 0,
          width: '1px',
          backgroundColor: '#000',
          zIndex: 5
        }} />

        {/* Header - same as when products exist */}
        <div className="w-full md:w-[995px]" style={{ position: 'relative', margin: '0 auto', height: '226px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
          <h1 className="text-center uppercase" style={{
            fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '22px',
            fontWeight: 700,
            lineHeight: '22px',
            letterSpacing: '0.03em',
            fontStretch: 'condensed',
            margin: 0
          }}>
            ULOŽENÉ POLOŽKY
          </h1>
        </div>

        {/* Navigation Panel - with 995px wide top and bottom borders */}
        <div className="w-full md:w-[995px]" style={{
          position: 'relative',
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
          {/* Top border - 995px wide to extend to vertical lines */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 'calc(50% - 497.5px)',
            width: '995px',
            height: '1px',
            backgroundColor: '#000',
            zIndex: 1
          }} />
          
          {/* Bottom border - 995px wide to extend to vertical lines */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 'calc(50% - 497.5px)',
            width: '995px',
            height: '1px',
            backgroundColor: '#000',
            zIndex: 1
          }} />
          
          <div className="group" style={{ position: 'relative', zIndex: 2 }}>
            <div
              className="whitespace-nowrap uppercase tracking-tight font-normal text-sm"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '12px',
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
              className="absolute pointer-events-none"
              style={{
                inset: '-4px',
                border: '1px solid #000000',
                borderRadius: '4px',
                opacity: 1
              }}
            />
          </div>
          <div className="group" style={{ position: 'relative', zIndex: 2 }}>
            <Link
              href="/kosik"
              className="whitespace-nowrap uppercase tracking-tight font-normal text-sm"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '12px',
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
              className="absolute pointer-events-none"
              style={{
                inset: '-4px',
                border: '1px solid #000000',
                borderRadius: '4px',
                opacity: 0
              }}
            />
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="w-full md:w-[995px]" style={{ position: 'relative', margin: '0 auto' }}>
            <div className="flex flex-col items-center justify-center px-8 text-center" style={{ minHeight: '300px' }}>
              <p style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                marginBottom: '24px'
              }}>
                Nemáte žádné uložené produkty
              </p>
              <AnimatedLink href="/" text="POKRAČOVAT V NÁKUPU" />
            </div>
          </div>
        </div>
        <UlozenoWhiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      <div className="flex-1 flex flex-col relative w-full">
        {/* Vertical lines at product edges (1426px wide, centered) - touch footer top */}
        <div className="hidden md:block" style={{
          position: 'absolute',
          left: '50%',
          marginLeft: '-713px',
          top: 0,
          bottom: 0,
          width: '1px',
          backgroundColor: '#000',
          zIndex: 5,
          pointerEvents: 'none'
        }} />
        <div className="hidden md:block" style={{
          position: 'absolute',
          left: '50%',
          marginLeft: '713px',
          top: 0,
          bottom: 0,
          width: '1px',
          backgroundColor: '#000',
          zIndex: 5,
          pointerEvents: 'none'
        }} />

      {/* Header - border handled by navigation panel */}
      <div className="w-full md:w-[1426px]" style={{ position: 'relative', margin: '0 auto', height: '226px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
        <h1 className="text-center uppercase" style={{
          fontFamily: 'BB-Condensed-Bold, "Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: '22px',
          fontWeight: 700,
          lineHeight: '22px',
          letterSpacing: '0.03em',
          fontStretch: 'condensed',
          margin: 0
        }}>
          ULOŽENÉ POLOŽKY
        </h1>
      </div>

      {/* Navigation Panel - with 1426px wide top and bottom borders */}
      <div className="w-full md:w-[1426px]" style={{
        position: 'relative',
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
        {/* Top border - 1426px wide to extend to vertical lines */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 'calc(50% - 713px)',
          width: '1426px',
          height: '1px',
          backgroundColor: '#000',
          zIndex: 1
        }} />
        
        {/* Bottom border - 1426px wide to extend to vertical lines */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 'calc(50% - 713px)',
          width: '1426px',
          height: '1px',
          backgroundColor: '#000',
          zIndex: 1
        }} />
        
        <div className="group" style={{ position: 'relative', zIndex: 2 }}>
          <div
            className="whitespace-nowrap uppercase tracking-tight font-normal text-sm"
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '12px',
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
            className="absolute pointer-events-none"
            style={{
              inset: '-4px',
              border: '1px solid #000000',
              borderRadius: '4px',
              opacity: isUlozeno ? 1 : 0
            }}
          />
        </div>
        <div className="group" style={{ position: 'relative', zIndex: 2 }}>
          <Link
            href="/kosik"
            className="whitespace-nowrap uppercase tracking-tight font-normal text-sm"
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '12px',
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
            className="absolute pointer-events-none"
            style={{
              inset: '-4px',
              border: '1px solid #000000',
              borderRadius: '4px',
              opacity: isUlozeno ? 0 : 1
            }}
          />
        </div>
      </div>

      <div className="flex-1 flex justify-center w-full" style={{ marginBottom: '40px' }}>
        <div className="w-full md:w-[1426px]" style={{ position: 'relative', margin: '0 auto', padding: '0', boxSizing: 'border-box' }}>
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
                  Nepřipravte se o svůj seznam přání
                </h3>
                
                <p style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '19.6px',
                  color: '#000',
                  margin: 0
                }}>
                  Přihlaste se nebo si vytvořte účet a uložte si svůj seznam přání, který můžete prohlížet na jakémkoliv zařízení
                </p>
              </div>

              <AnimatedButton
                text="PŘIHLÁSIT SE"
                onClick={() => signIn()}
                variant="black"
                style={{ borderRadius: '3px', padding: '8px 48px' }}
              />
            </div>
          )}

          {/* List Layout - matches CartLineItem page layout exactly */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {products.map((product, index) => (
              <div
                key={product.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '143px 1fr',
                  gridTemplateRows: 'auto auto',
                  border: '1px solid #000',
                  borderTop: index === 0 ? '1px solid #000' : 'none',
                  backgroundColor: '#fff',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                {/* Product Image */}
                <div style={{
                  backgroundColor: '#d9d9d9',
                  width: '143px',
                  height: '143px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  margin: 0,
                }}>
                  <Link href={`/produkty/${product.slug}`} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={product.productImage || product.images[0] || '/placeholder.png'}
                      alt={product.name}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </Link>
                </div>

                {/* Product Info */}
                <div style={{
                  padding: '23px 15px 0 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                }}>
                  <Link
                    href={`/produkty/${product.slug}`}
                    style={{
                      margin: '0 0 5px 0',
                      fontSize: '15.3px',
                      lineHeight: '17px',
                      fontWeight: 700,
                      letterSpacing: '0.03em',
                      textTransform: 'uppercase',
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      color: '#000',
                      textDecoration: 'none',
                    }}
                  >
                    {product.name}
                  </Link>

                  <div style={{
                    fontSize: '16.5px',
                    lineHeight: '19px',
                    margin: '0 0 10px 0',
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    color: '#000'
                  }}>
                    {product.price} Kč
                  </div>

                  <div style={{
                    fontSize: '16.5px',
                    lineHeight: '23px',
                    margin: 0,
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    color: '#000',
                  }}>
                    Barva: {product.color || 'Černá'}
                  </div>
                </div>

                {/* Actions Row */}
                <div style={{
                  gridColumn: '1 / -1',
                  alignSelf: 'end',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '23px 17px 15px 17px',
                  fontSize: '16.5px',
                  lineHeight: '19px',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  color: '#000',
                }}>
                  <button
                    onClick={() => handleMoveToCart(product)}
                    disabled={addingToCart === product.id}
                    style={{
                      background: 'none',
                      border: 0,
                      padding: 0,
                      font: 'inherit',
                      color: '#000',
                      textDecoration: 'underline',
                      textUnderlineOffset: '2px',
                      cursor: addingToCart === product.id ? 'not-allowed' : 'pointer',
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '16.5px',
                      lineHeight: '19px',
                      opacity: addingToCart === product.id ? 0.6 : 1,
                    }}
                  >
                    {addingToCart === product.id ? 'Přidávám...' : 'Přesunout do košíku'}
                  </button>

                  <button
                    onClick={() => handleRemove(product.id)}
                    style={{
                      background: 'none',
                      border: 0,
                      padding: 0,
                      font: 'inherit',
                      color: '#000',
                      textDecoration: 'underline',
                      textUnderlineOffset: '2px',
                      cursor: 'pointer',
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '16.5px',
                      lineHeight: '19px',
                    }}
                  >
                    Smazat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>

      {/* White Footer */}
      <UlozenoWhiteFooter />

    </div>
  );
}
