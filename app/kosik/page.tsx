'use client';

import { useCartStore, useCartHydration } from '@/lib/cart-store';
import { useSavedProductsStore } from '@/lib/saved-products-store';
import { useRecentlyViewedStore } from '@/lib/recently-viewed-store';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import CartLineItem from '@/components/CartLineItem';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  slug: string;
}

function EmptyCartLink({ href, text }: { href: string; text: string }) {
  return (
    <a
      href={href}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff',
        color: '#000',
        fontWeight: 'normal',
        textTransform: 'uppercase',
        letterSpacing: 'tight',
        transition: 'all 0.3s',
        border: '1px solid #000',
        fontSize: '13px',
        borderRadius: '4px',
        padding: '11.8px 25.6px',
        textDecoration: 'none'
      }}
    >
      {text}
    </a>
  );
}

export default function CartPage() {
  const hasHydrated = useCartHydration();
  const [savingItem, setSavingItem] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemData, setDeleteItemData] = useState<{ productId: string; productName: string; size: string } | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { items, updateQuantity, removeItem, getTotal, getItemCount } = useCartStore();
  const { addProduct } = useSavedProductsStore();
  const savedIds = useSavedProductsStore((state) => state.savedIds);
  const cartItemCount = getItemCount();
  const isKosik = pathname === '/kosik';
  const vybrranoRef = useRef<HTMLDivElement>(null);
  const recentlyViewedRef = useRef<HTMLDivElement>(null);
  const recentlyViewedProducts = useRecentlyViewedStore((state) => state.getRecentProducts(9));
  const [recentlyViewed, setRecentlyViewed] = useState<typeof recentlyViewedProducts>([]);

  // Fetch products for VYBRÁNO PRO VÁS section
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await fetch('/api/products?limit=1000');
        const data = await res.json();
        let products = [];
        if (Array.isArray(data)) {
          products = data;
        } else if (data.products && Array.isArray(data.products)) {
          products = data.products;
        }
        
        const productsWithImage = products.map((p: any) => ({
          ...p,
          image: p.productImage || (p.images && p.images.length > 0 ? p.images[0] : ''),
        }));
        setAllProducts(productsWithImage);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };

    fetchAllProducts();
  }, []);

  // Select random products
  useEffect(() => {
    if (allProducts.length > 0 && selectedProducts.length === 0) {
      const shuffled = [...allProducts].sort(() => Math.random() - 0.5);
      setSelectedProducts(shuffled.slice(0, 9));
    }
  }, [allProducts, selectedProducts.length]);

  // Populate recently viewed products
  useEffect(() => {
    setRecentlyViewed(recentlyViewedProducts);
  }, [recentlyViewedProducts]);

  const handleOpenDeleteModal = (productId: string, productName: string, size: string) => {
    setDeleteItemData({ productId, productName, size });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteItemData) {
      removeItem(deleteItemData.productId, deleteItemData.size);
      setIsDeleteModalOpen(false);
      setDeleteItemData(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteItemData(null);
  };

  const handleSaveForLater = async (item: typeof items[0]) => {
    setSavingItem(item.productId);
    try {
      addProduct(item.productId);
      
      if (session?.user) {
        await fetch('/api/saved-products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: item.productId }),
        });
      }
      
      removeItem(item.productId, item.size);
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setSavingItem(null);
    }
  };

  const total = getTotal();

  if (!hasHydrated) {
    return <div className="min-h-screen bg-white" />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col relative">
        {/* Header */}
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
            NÁKUPNÍ KOŠÍK
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
          {/* Navigation items */}
          <div className="group" style={{ position: 'relative', zIndex: 2 }}>
            <Link
              href="/ulozeno"
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
              ULOŽENÉ POLOŽKY ({savedIds.length})
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
              KOŠÍK (0)
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
        </div>

        {/* Empty Cart Message Section */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', position: 'relative', padding: '0 16px', boxSizing: 'border-box', borderTop: '1px solid #000', borderBottom: '1px solid #000' }}>
            <div className="flex flex-col items-center justify-center px-8 text-center" style={{ minHeight: '300px' }}>
              <p style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                marginBottom: '24px'
              }}>
                Váš košík je prázdný
              </p>
              <EmptyCartLink href="/" text="POKRAČOVAT V NÁKUPU" />
            </div>
          </div>
        </div>

        {/* VYBRÁNO PRO VÁS Section */}
        {selectedProducts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #000', borderBottom: '1px solid #000', minHeight: '0', position: 'relative', width: '100%' }}>
            {/* Title row with line below */}
            <div style={{ paddingTop: '2px', paddingBottom: '2px', paddingLeft: '4px', paddingRight: '4px', textAlign: 'center', borderBottom: '1px solid #000' }}>
              <h3 style={{
                fontFamily: 'BB-Condensed-Bold, "Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                fontStretch: 'condensed',
                margin: '0',
                textAlign: 'center'
              }}>
                VYBRÁNO PRO VÁS
              </h3>
            </div>
            
            {/* Products container with arrows */}
            <div style={{ display: 'flex', position: 'relative', flex: 1, height: '160px', width: '100%', alignItems: 'flex-start', padding: '0', boxSizing: 'border-box', gap: '0', paddingTop: '0' }}>
              {/* Left arrow */}
              <button onClick={() => { if (vybrranoRef.current) vybrranoRef.current.scrollBy({ left: -(vybrranoRef.current.clientWidth * 0.4), behavior: 'smooth' }); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', border: '1px solid #000', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', padding: '0', flex: '0 0 auto', position: 'absolute', left: '6px', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f5f5f5'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#fff'; }}><svg style={{ width: '14px', height: '14px', stroke: '#000', fill: 'none' }} viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></button>
              
              {/* Right arrow */}
              <button onClick={() => { if (vybrranoRef.current) vybrranoRef.current.scrollBy({ left: vybrranoRef.current.clientWidth * 0.4, behavior: 'smooth' }); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', border: '1px solid #000', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', padding: '0', flex: '0 0 auto', position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f5f5f5'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#fff'; }}><svg style={{ width: '14px', height: '14px', stroke: '#000', fill: 'none' }} viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></button>
              
              {/* Products scroll container */}
              <div ref={vybrranoRef} style={{ display: 'flex', overflowX: 'auto', overflowY: 'hidden', gap: '0', paddingLeft: '0', paddingRight: '0', paddingTop: '0', paddingBottom: '0', scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', scrollSnapType: 'x mandatory', flex: 1, cursor: 'grab', minHeight: '0', userSelect: 'none', WebkitUserSelect: 'none', width: '100%' }} className="select-none">
                {selectedProducts.map((product, index) => (<div key={product.id} style={{ display: 'flex', flex: '0 0 calc(50% - 6px)', scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>{index > 0 && <div style={{ width: '1px', backgroundColor: '#000', flex: '0 0 1px' }} />}<a href={`/produkty/${product.slug}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', width: '100%', padding: '0 6px', flex: 1 }}><div style={{ position: 'relative', width: '100%', paddingBottom: '100%', backgroundColor: '#f5f5f5', overflow: 'hidden', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{product.image && <img src={product.image} alt={product.name} style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" onError={(e) => { const img = e.target as HTMLImageElement; img.style.display = 'none'; }} />}</div><h4 style={{ fontFamily: 'BB-Condensed-Bold, "Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', fontStretch: 'condensed', margin: '0 0 2px 0', textAlign: 'center', color: '#000', lineHeight: '1.2' }}>{product.name}</h4><p style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '10px', fontWeight: 400, margin: '0', textAlign: 'center', color: '#000', lineHeight: '1.2' }}>{product.price} Kč</p></a></div>))}
              </div>
            </div>
          </div>
        )}

        {/* PROHLÍŽELI JSTE Section */}
        {recentlyViewed.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #000', borderBottom: '1px solid #000', minHeight: '0', position: 'relative', width: '100%', height: 'auto' }}>
            {/* Title row with line below */}
            <div style={{ paddingTop: '4px', paddingBottom: '4px', paddingLeft: '4px', paddingRight: '4px', textAlign: 'center', borderBottom: '1px solid #000', flexShrink: 0 }}>
              <h3 style={{ fontFamily: 'BB-Condensed-Bold, "Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', fontStretch: 'condensed', margin: '0', textAlign: 'center' }}>
                PROHLÍŽELI JSTE
              </h3>
            </div>
            
            {/* Products container with arrows */}
            <div style={{ display: 'flex', position: 'relative', flex: 1, height: '180px', width: '100%', alignItems: 'flex-start', padding: '0', boxSizing: 'border-box', gap: '0', paddingTop: '0' }}>
              
              {/* Products scroll container */}
              <div ref={recentlyViewedRef} style={{ display: 'flex', overflowX: 'auto', overflowY: 'hidden', gap: '0', paddingLeft: '0', paddingRight: '0', paddingTop: '0', paddingBottom: '0', scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', scrollSnapType: 'x mandatory', flex: 1, cursor: 'grab', minHeight: '0', userSelect: 'none', WebkitUserSelect: 'none', width: '100%' }} className="select-none">
                {recentlyViewed.map((product, index) => (<div key={product.id} style={{ display: 'flex', flex: '0 0 calc(50% - 6px)', scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>{index > 0 && <div style={{ width: '1px', backgroundColor: '#000', flex: '0 0 1px' }} />}<a href={`/produkty/${product.slug}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', width: '100%', padding: '0 6px', flex: 1 }}><div style={{ position: 'relative', width: '100%', paddingBottom: '100%', backgroundColor: '#f5f5f5', overflow: 'hidden', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{product.image && <img src={product.image} alt={product.name} style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" onError={(e) => { const img = e.target as HTMLImageElement; img.style.display = 'none'; }} />}</div><h4 style={{ fontFamily: 'BB-Condensed-Bold, "Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', fontStretch: 'condensed', margin: '0 0 2px 0', textAlign: 'center', color: '#000', lineHeight: '1.2' }}>{product.name}</h4><p style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '10px', fontWeight: 400, margin: '0', textAlign: 'center', color: '#000', lineHeight: '1.2' }}>{product.price} Kč</p></a></div>))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Footer Sections */}
        {/* BEZPEČNĚ PŘIJÍMÁME Section */}
        <div className="md:hidden" style={{
          width: '100%',
          padding: '12px 16px',
          borderTop: '1px solid #000',
          borderBottom: '1px solid #000',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'center'
        }}>
          <h3 style={{
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            margin: '0',
            color: '#000',
            textAlign: 'center'
          }}>
            BEZPEČNĚ PŘIJÍMÁME
          </h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
            <img src="/payment-methods.jpg" alt="Payment Methods" style={{ height: '60px', width: 'auto', maxWidth: '100%' }} />
          </div>
        </div>

        {/* Process Info Section */}
        <div className="md:hidden" style={{
          width: '100%',
          padding: '12px 16px',
          borderTop: '1px solid #000',
          borderBottom: '1px solid #000',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <p style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '11px', fontWeight: 400, margin: '0', color: '#000', lineHeight: '1.4' }}>• Odesíláme ASAP</p>
          <p style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '11px', fontWeight: 400, margin: '0', color: '#000', lineHeight: '1.4' }}>• Možnost vrácení do 14ti dnů</p>
          <p style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '11px', fontWeight: 400, margin: '0', color: '#000', lineHeight: '1.4' }}>• VOODOO808 natiskne vaše tričko</p>
          <p style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '11px', fontWeight: 400, margin: '0', color: '#000', lineHeight: '1.4' }}>• AKA47 odešle vaší objednávkou</p>
        </div>

        {/* Mobile bottom padding */}
        <div className="md:hidden" style={{ height: '92px' }} />
      </div>
    );
  }
  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .footer-container {
            display: none !important;
          }
        }
        @media (min-width: 768px) {
          .md\:hidden {
            display: none !important;
          }
        }
      `}</style>
      <div className="min-h-screen bg-white flex flex-col relative">
      {/* Vertical lines at product edges (995px wide, centered) - stop at footer top */}
      <div className="hidden md:block" style={{
        position: 'fixed',
        left: '50%',
        marginLeft: '-713px',
        top: 0,
        height: 'calc(100vh - 328px)',
        width: '1px',
        backgroundColor: '#000',
        zIndex: 5
      }} />
      <div className="hidden md:block" style={{
        position: 'fixed',
        left: '50%',
        marginLeft: '713px',
        top: 0,
        height: 'calc(100vh - 328px)',
        width: '1px',
        backgroundColor: '#000',
        zIndex: 5
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
          NÁKUPNÍ KOŠÍK
        </h1>
      </div>

      {/* Navigation Panel - with 995px wide top and bottom borders */}
      <div className="w-full md:w-[1426px]" style={{
        position: 'relative',
        margin: '0 auto',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '0 16px',
        overflow: 'visible',
        zIndex: 10,
        width: '100%'
      }}>
        {/* Top border - 995px wide to extend to vertical lines */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 'calc(50% - 713px)',
        width: '1426px',
          height: '1px',
          backgroundColor: '#000',
          zIndex: 1
        }} />
        
        {/* Bottom border - 995px wide to extend to vertical lines */}
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
          <Link
            href="/ulozeno"
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
            ULOŽENÉ POLOŽKY ({savedIds.length})
          </Link>
          <div
            className="absolute pointer-events-none"
            style={{
              inset: '-4px',
              border: '1px solid #000000',
              borderRadius: '4px',
              opacity: isKosik ? 0 : 1
            }}
          />
        </div>
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
            KOŠÍK ({cartItemCount})
          </div>
          <div
            className="absolute pointer-events-none"
            style={{
              inset: '-4px',
              border: '1px solid #000000',
              borderRadius: '4px',
              opacity: isKosik ? 1 : 0
            }}
          />
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .md\:hidden {
            display: none !important;
          }
        }
      `}</style>

      <div className="flex-1 flex justify-center w-full" style={{ marginBottom: '40px' }}>
        <div style={{ position: 'relative', margin: '0 auto', padding: '0', boxSizing: 'border-box', width: '100%', maxWidth: '1426px' }}>
          {items.map((item, index) => (
            <CartLineItem
              key={`${item.productId}-${item.size}`}
              productId={item.productId}
              name={item.name}
              price={item.price}
              image={item.image}
              slug={item.slug}
              color={item.color}
              size={item.size}
              quantity={item.quantity}
              category={item.category}
              layout="page"
              isFirstItem={index === 0}
              isSavingForLater={savingItem === item.productId}
              onUpdateQuantity={updateQuantity}
              onRemove={handleOpenDeleteModal}
              onSaveForLater={() => handleSaveForLater(item)}
            />
          ))}
        </div>
      </div>


      <div className="hidden md:flex" style={{
        width: '100%',
        maxWidth: '1426px',
        marginLeft: 'auto',
        marginRight: 'auto',
        borderTop: '1px solid #000',
        borderBottom: '1px solid #000',
        flexDirection: 'column',
        height: '684px'
      }}>
        <div style={{
          maxWidth: '1426px',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: '16px',
          paddingRight: '16px',
          width: '100%',
          paddingTop: '2px',
          paddingBottom: '2px',
          textAlign: 'center',
          borderBottom: '1px solid #000'
        }}>
          <h2 style={{
            fontFamily: 'BB-Condensed-Bold, "Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '13px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            fontStretch: 'condensed',
            margin: '0',
            color: '#000'
          }}>
            VYBRÁNO PRO VÁS
          </h2>
        </div>
        
        {/* Products container with arrows */}
        <div style={{ display: 'flex', position: 'relative', flex: 1, minHeight: '0', width: '100%' }}>
          {/* Left arrow */}
          <button
            onClick={() => {
              if (vybrranoRef.current) {
                const productWidth = vybrranoRef.current.scrollWidth / selectedProducts.length;
                vybrranoRef.current.scrollBy({
                  left: -productWidth,
                  behavior: 'smooth'
                });
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              border: '1px solid #000',
              borderRadius: '4px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              padding: '0',
              flex: '0 0 auto',
              position: 'absolute',
              left: '24px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#f5f5f5';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#fff';
            }}
          >
            <svg style={{ width: '14px', height: '14px', stroke: '#000', fill: 'none' }} viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Right arrow */}
          <button
            onClick={() => {
              if (vybrranoRef.current) {
                const productWidth = vybrranoRef.current.scrollWidth / selectedProducts.length;
                vybrranoRef.current.scrollBy({
                  left: productWidth,
                  behavior: 'smooth'
                });
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              border: '1px solid #000',
              borderRadius: '4px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              padding: '0',
              flex: '0 0 auto',
              position: 'absolute',
              right: '24px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#f5f5f5';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#fff';
            }}
          >
            <svg style={{ width: '14px', height: '14px', stroke: '#000', fill: 'none' }} viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Horizontal scroll container */}
          <div 
            ref={vybrranoRef}
            style={{
              display: 'flex',
              overflowX: 'auto',
              overflowY: 'hidden',
              gap: '0',
              paddingLeft: '0',
              paddingRight: '0',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              scrollSnapType: 'x mandatory',
              cursor: 'grab',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              flex: '1',
              minHeight: '0',
              maxWidth: '1426px',
              marginLeft: 'auto',
              marginRight: 'auto',
              width: '100%'
            }}
          >
            {selectedProducts.map((product, index) => (
              <div key={product.id} style={{ display: 'flex', flex: '0 0 calc(30% - 0.3px)', scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
                {index > 0 && <div style={{ width: '1px', backgroundColor: '#000', flex: '0 0 1px' }} />}
                <Link
                  href={`/produkty/${product.slug}`}
                  style={{ display: 'flex', flexDirection: 'column', width: '100%', paddingTop: '4px', paddingBottom: '4px', paddingLeft: '12px', paddingRight: '12px', textDecoration: 'none' }}
                  className="hover:opacity-80 transition-opacity"
                >
                  <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', backgroundColor: '#f5f5f5', overflow: 'hidden', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        loading="lazy"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                  <h4 style={{
                    fontFamily: 'BB-Condensed-Bold, "Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    marginTop: 0,
                    marginBottom: '2px',
                    letterSpacing: '0.03em',
                    fontStretch: 'condensed',
                    color: '#000000',
                    lineHeight: '1.1',
                    textAlign: 'center'
                  }}>
                    {product.name}
                  </h4>
                  <p style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '9px',
                    fontWeight: 400,
                    lineHeight: '1.1',
                    color: '#000000',
                    margin: '0 0 2px 0',
                    textAlign: 'center'
                  }}>{product.price} Kč</p>
                  <div style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '10px',
                    fontWeight: 400,
                    lineHeight: '1.1',
                    color: '#000000',
                    textDecoration: 'underline',
                    textAlign: 'center'
                  }}>
                    Přidat
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>


      
      
      {/* Mobile VYBRÁNO PRO VÁS Section - only visible on mobile */}
      {items.length > 0 && selectedProducts.length > 0 && (
        <div className="md:hidden" style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderTop: '1px solid #000',
          borderBottom: '1px solid #000',
          minHeight: '0',
          position: 'relative'
        }}>
          {/* Title row with line below */}
          <div style={{
            paddingTop: '4px',
            paddingBottom: '4px',
            paddingLeft: '4px',
            paddingRight: '4px',
            textAlign: 'center',
            borderBottom: '1px solid #000'
          }}>
            <h3 style={{
              fontFamily: 'BB-Condensed-Bold, "Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              fontStretch: 'condensed',
              margin: '0',
              textAlign: 'center'
            }}>
              VYBRÁNO PRO VÁS
            </h3>
          </div>
          
          {/* Products container with arrows */}
          <div style={{
            display: 'flex',
            position: 'relative',
            flex: 1,
            minHeight: '200px',
            width: '100%',
            alignItems: 'center',
            padding: '0',
            boxSizing: 'border-box',
            gap: '0'
          }}>
            {/* Left arrow */}
            <button
              onClick={() => {
                if (vybrranoRef.current) {
                  vybrranoRef.current.scrollBy({
                    left: -(vybrranoRef.current.clientWidth * 0.5),
                    behavior: 'smooth'
                  });
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                border: '1px solid #000',
                borderRadius: '4px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                padding: '0',
                flex: '0 0 auto',
                position: 'absolute',
                left: '6px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#fff';
              }}
            >
              <svg style={{ width: '14px', height: '14px', stroke: '#000', fill: 'none' }} viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Right arrow */}
            <button
              onClick={() => {
                if (vybrranoRef.current) {
                  vybrranoRef.current.scrollBy({
                    left: vybrranoRef.current.clientWidth * 0.5,
                    behavior: 'smooth'
                  });
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                border: '1px solid #000',
                borderRadius: '4px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                padding: '0',
                flex: '0 0 auto',
                position: 'absolute',
                right: '6px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#fff';
              }}
            >
              <svg style={{ width: '14px', height: '14px', stroke: '#000', fill: 'none' }} viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Products scroll container - shows ~1.5 products */}
            <div
              ref={vybrranoRef}
              style={{
                display: 'flex',
                overflowX: 'auto',
                overflowY: 'hidden',
                gap: '0',
                paddingLeft: '0',
                paddingRight: '0',
                paddingTop: '6px',
                paddingBottom: '6px',
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                scrollSnapType: 'x mandatory',
                flex: 1,
                cursor: 'grab',
                minHeight: '0',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                width: '100%',
                minWidth: '0'
              }}
              className="select-none"
            >
              {selectedProducts.map((product, index) => (
                <div
                  key={product.id}
                  style={{
                    display: 'flex',
                    flex: '0 0 calc(50% - 14px)',
                    scrollSnapAlign: 'start',
                    scrollSnapStop: 'always'
                  }}
                >
                  {index > 0 && (
                    <div style={{ width: '1px', backgroundColor: '#000', flex: '0 0 1px' }} />
                  )}
                  <a
                    href={`/produkty/${product.slug}`}
                    style={{
                      textDecoration: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      width: '100%',
                      paddingTop: '0',
                      paddingBottom: '0',
                      paddingLeft: '6px',
                      paddingRight: '6px',
                      flex: 1
                    }}
                  >
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        paddingBottom: '100%',
                        backgroundColor: '#f5f5f5',
                        overflow: 'hidden',
                        marginBottom: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                          loading="lazy"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                    <h4
                      style={{
                        fontFamily: 'BB-Condensed-Bold, "Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        fontStretch: 'condensed',
                        margin: '0 0 2px 0',
                        textAlign: 'center',
                        color: '#000',
                        lineHeight: '1.2'
                      }}
                    >
                      {product.name}
                    </h4>
                    <p
                      style={{
                        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                        fontSize: '10px',
                        fontWeight: 400,
                        margin: '0',
                        textAlign: 'center',
                        color: '#000',
                        lineHeight: '1.2'
                      }}
                    >
                      {product.price} Kč
                    </p>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      
      {items.length > 0 && (
        <div className="md:hidden" style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          padding: '8px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          boxSizing: 'border-box',
          backgroundColor: '#fff',
          borderTop: '1px solid #000',
          zIndex: 45,
          maxHeight: '92px',
          overflow: 'hidden'
        }}>
          <button
            onClick={() => router.push('/pokladna')}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#000',
              border: '1px solid #000',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 400,
              textTransform: 'uppercase',
              cursor: 'pointer',
              color: '#fff',
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              lineHeight: '1.2'
            }}
          >
            PŘEJÍT K POKLADNĚ ({items.length})
          </button>

          {/* White button - GoPay */}
          <button
            onClick={() => router.push('/pokladna?payment=gopay')}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#fff',
              border: '1px solid #000',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 400,
              textTransform: 'uppercase',
              cursor: 'pointer',
              color: '#000',
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              minHeight: '32px',
              lineHeight: '1.2'
            }}
          >
            <img src="https://cdnweb.fakturoid.cz/images/articles/2015/10/gopay-logo.png" alt="GoPay" style={{ height: '18px', width: 'auto', objectFit: 'contain', flexShrink: 0 }} />
            GOPAY
          </button>
        </div>
      )}

      {/* Desktop Checkout Buttons - 552px wide */}
      {items.length > 0 && (
        <div className="hidden md:flex" style={{
          width: '100%',
          justifyContent: 'center',
          padding: '24px 16px',
          boxSizing: 'border-box',
          backgroundColor: '#fff',
          borderBottom: '1px solid #000'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '552px'
          }}>
            <button
              onClick={() => router.push('/pokladna')}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#000',
                border: '1px solid #000',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 400,
                textTransform: 'uppercase',
                cursor: 'pointer',
                color: '#fff',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#333'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#000'; }}
            >
              PŘEJÍT K POKLADNĚ ({items.length})
            </button>

            <button
              onClick={() => router.push('/pokladna?payment=gopay')}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#fff',
                border: '1px solid #000',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 400,
                textTransform: 'uppercase',
                cursor: 'pointer',
                color: '#000',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f5f5f5'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#fff'; }}
            >
              <img src="https://cdnweb.fakturoid.cz/images/articles/2015/10/gopay-logo.png" alt="GoPay" style={{ height: '20px', width: 'auto', objectFit: 'contain', flexShrink: 0 }} />
              GOPAY
            </button>
          </div>
        </div>
      )}

{/* Custom White Footer - Static at bottom of page */}
      <div className="footer-container hidden md:flex" style={{
        position: 'relative',
        left: 0,
        right: 0,
        width: '100%',
        backgroundColor: '#fff',
        borderTop: '1px solid #000',
        zIndex: 1,
        height: '328px',
        display: 'flex',
        flexDirection: 'row',
        padding: '24px 0',
        boxSizing: 'border-box'
      }}>
        {/* Left Section - Payment Methods */}
        <div className="footer-section" style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          textAlign: 'center',
          gap: '12px',
          borderRight: '1px solid #000',
          paddingLeft: '24px',
          paddingRight: '24px'
        }}>
          <h3 style={{
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            margin: '0',
            color: '#000'
          }}>
            BEZPEČNĚ PŘIJÍMÁME
          </h3>
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <img src="/payment-methods.jpg" alt="Payment Methods" style={{ height: '96px', width: 'auto' }} />
          </div>
        </div>

        {/* Middle Section - Customer Support */}
        <div className="footer-section" style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          textAlign: 'center',
          gap: '12px',
          borderRight: '1px solid #000',
          paddingLeft: '24px',
          paddingRight: '24px'
        }}>
          <h3 style={{
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            margin: '0',
            color: '#000'
          }}>
            ZÁKAZNICKÁ PODPORA
          </h3>
          <p style={{
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '11px',
            fontWeight: 400,
            margin: '0 0 8px 0',
            color: '#000',
            lineHeight: '1.3'
          }}>
            Naše zákaznická podpora je vám k dispozici od Pondělí do Soboty 9:30 - 19:00
          </p>
          <div style={{
            display: 'flex',
            gap: '8px',
            flexDirection: 'column',
            width: '100%'
          }}>
            <a
              href="https://wa.me/YOUR_WHATSAPP"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '11px',
                fontWeight: 400,
                padding: '6px 12px',
                border: '1px solid #000',
                borderRadius: '4px',
                textDecoration: 'none',
                color: '#000',
                textTransform: 'uppercase',
                backgroundColor: '#fff',
                cursor: 'pointer',
                display: 'block'
              }}
            >
              WHATSAPP
            </a>
            <a
              href="tel:+YOUR_PHONE"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '11px',
                fontWeight: 400,
                padding: '6px 12px',
                border: '1px solid #000',
                borderRadius: '4px',
                textDecoration: 'none',
                color: '#000',
                textTransform: 'uppercase',
                backgroundColor: '#fff',
                cursor: 'pointer',
                display: 'block'
              }}
            >
              ZAVOLEJTE NÁM
            </a>
          </div>
        </div>

        {/* Right Section - Shipping Info */}
        <div style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          textAlign: 'center',
          gap: '16px',
          paddingLeft: '24px',
          paddingRight: '24px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <p style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '13px',
              fontWeight: 700,
              margin: '0',
              color: '#000',
              textTransform: 'uppercase'
            }}>
              Bezpečná platba
            </p>
            <p style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '13px',
              fontWeight: 700,
              margin: '0',
              color: '#000',
              textTransform: 'uppercase'
            }}>
              Rychlé doručení
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Footer Sections - Full width on mobile */}
      {items.length > 0 && (
        <>
          {/* BEZPEČNĚ PŘIJÍMÁME Section */}
          <div className="md:hidden" style={{
            width: '100%',
            padding: '16px',
            borderTop: '1px solid #000',
            borderBottom: '1px solid #000',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <h3 style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              margin: '0',
              color: '#000',
              textAlign: 'center'
            }}>
              BEZPEČNĚ PŘIJÍMÁME
            </h3>
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <img src="/payment-methods.jpg" alt="Payment Methods" style={{ height: '80px', width: 'auto', maxWidth: '100%' }} />
            </div>
          </div>

          {/* ZÁKAZNICKÁ PODPORA Section */}
          <div className="md:hidden" style={{
            width: '100%',
            padding: '16px',
            borderTop: '1px solid #000',
            borderBottom: '1px solid #000',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <h3 style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              margin: '0',
              color: '#000',
              textAlign: 'center'
            }}>
              ZÁKAZNICKÁ PODPORA
            </h3>
            <p style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '11px',
              fontWeight: 400,
              margin: '0 0 8px 0',
              color: '#000',
              lineHeight: '1.3',
              textAlign: 'center'
            }}>
              Naše zákaznická podpora je vám k dispozici od Pondělí do Soboty 9:30 - 19:00
            </p>
            <div style={{
              display: 'flex',
              gap: '8px',
              flexDirection: 'column',
              width: '100%'
            }}>
              <a
                href="https://wa.me/YOUR_WHATSAPP"
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
                  textAlign: 'center'
                }}
              >
                WHATSAPP
              </a>
              <a
                href="tel:+YOUR_PHONE"
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
                  textAlign: 'center'
                }}
              >
                ZAVOLEJTE NÁM
              </a>
            </div>
          </div>

          {/* BEZPEČNÁ PLATBA & RYCHLÉ DORUČENÍ Section */}
          <div className="md:hidden" style={{
            width: '100%',
            padding: '16px',
            borderTop: '1px solid #000',
            borderBottom: '1px solid #000',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              alignItems: 'center'
            }}>
              <p style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '13px',
                fontWeight: 700,
                margin: '0',
                color: '#000',
                textTransform: 'uppercase',
                textAlign: 'center'
              }}>
                Bezpečná platba
              </p>
              <p style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '13px',
                fontWeight: 700,
                margin: '0',
                color: '#000',
                textTransform: 'uppercase',
                textAlign: 'center'
              }}>
                Rychlé doručení
              </p>
            </div>
          </div>
        </>
      )}

      {/* Mobile bottom padding for sticky buttons */}
      <div className="md:hidden" style={{ height: '92px' }} />

      {/* Padding for footer spacing - removed since footer is now static */}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        productName={deleteItemData?.productName || ''}
        productSize={deleteItemData?.size || ''}
      />
      </div>
    </>
  );
}
