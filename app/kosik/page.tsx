'use client';

import { useCartStore, useCartHydration } from '@/lib/cart-store';
import { useSavedProductsStore } from '@/lib/saved-products-store';
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
  const cartItemCount = getItemCount();
  const isKosik = pathname === '/kosik';
  const vybrranoRef = useRef<HTMLDivElement>(null);

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
              ULOŽENÉ POLOŽKY
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
              KOŠÍK ({cartItemCount})
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

        <div className="flex-1 flex justify-center">
          <div style={{ width: '995px', position: 'relative' }}>
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

            {/* VYBRÁNO PRO VÁS Section - when cart empty */}
            {selectedProducts.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #000', borderBottom: '1px solid #000', minHeight: '0', position: 'relative' }}>
                {/* Title row with line below */}
                <div style={{ paddingTop: '4px', paddingBottom: '4px', paddingLeft: '16px', paddingRight: '16px', textAlign: 'center', borderBottom: '1px solid #000' }}>
                  <h3 style={{
                    fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '13px',
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
                
                {/* Products container with centered arrows */}
                <div style={{ display: 'flex', position: 'relative', flex: 1, minHeight: '0' }}>
                  {/* Left arrow - positioned in the middle */}
                  <button
                    onClick={() => {
                      if (vybrranoRef.current) {
                        vybrranoRef.current.scrollBy({
                          left: -(vybrranoRef.current.clientWidth * 0.4),
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
                      left: '8px',
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
                  
                  {/* Right arrow - positioned in the middle */}
                  <button
                    onClick={() => {
                      if (vybrranoRef.current) {
                        vybrranoRef.current.scrollBy({
                          left: vybrranoRef.current.clientWidth * 0.4,
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
                      right: '8px',
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
                  
                  {/* Products scroll container */}
                  <div
                    ref={vybrranoRef}
                    style={{ 
                      display: 'flex', 
                      overflowX: 'auto', 
                      overflowY: 'hidden', 
                      gap: '0', 
                      paddingLeft: '0', 
                      paddingRight: '0', 
                      paddingTop: '4px',
                      scrollBehavior: 'smooth', 
                      WebkitOverflowScrolling: 'touch',
                      scrollbarWidth: 'none',
                      scrollSnapType: 'x mandatory',
                      flex: 1,
                      cursor: 'grab',
                      minHeight: '0',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      width: '100%'
                    }}
                    className="select-none"
                  >
                    {selectedProducts.map((product, index) => (
                      <div key={product.id} style={{ display: 'flex', flex: '0 0 calc(66.666% - 0.67px)', scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
                        {index > 0 && <div style={{ width: '1px', backgroundColor: '#000', flex: '0 0 1px' }} />}
                        <div
                          style={{ display: 'flex', flexDirection: 'column', width: '100%', paddingTop: '12px', paddingBottom: '12px', paddingLeft: '12px', paddingRight: '12px' }}
                          className="hover:opacity-80 transition-opacity"
                        >
                          <a
                            href={`/produkty/${product.slug}`}
                            style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', flex: 1 }}
                          >
                            <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', backgroundColor: '#f5f5f5', overflow: 'hidden', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                              fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                              fontSize: '13px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.03em',
                              fontStretch: 'condensed',
                              margin: '0 0 4px 0',
                              textAlign: 'center',
                              color: '#000',
                              lineHeight: '1.2'
                            }}>
                              {product.name}
                            </h4>
                            <p style={{
                              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                              fontSize: '11px',
                              fontWeight: 400,
                              margin: '0 0 4px 0',
                              textAlign: 'center',
                              color: '#000',
                              lineHeight: '1.2'
                            }}>
                              {product.price} Kč
                            </p>
                          </a>
                          <button
                            onClick={() => {
                              const { addItem } = useCartStore.getState();
                              addItem({
                                productId: product.id,
                                name: product.name,
                                price: product.price,
                                image: product.image,
                                slug: product.slug,
                                size: 'ONE SIZE',
                                color: '',
                                quantity: 1,
                                category: ''
                              });
                            }}
                            style={{
                              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                              fontSize: '11px',
                              fontWeight: 400,
                              margin: '0',
                              textAlign: 'center',
                              color: '#000',
                              textDecoration: 'underline',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0',
                              lineHeight: '1.2'
                            }}
                          >
                            Přidat do košíku
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col relative" style={{ paddingBottom: '80px' }}>
      {/* Vertical lines at product edges (995px wide, centered) - stop at footer top */}
      <div className="hidden md:block" style={{
        position: 'fixed',
        left: '50%',
        marginLeft: '-497.5px',
        top: 0,
        height: 'calc(100vh - 80px)',
        width: '1px',
        backgroundColor: '#000',
        zIndex: 5
      }} />
      <div className="hidden md:block" style={{
        position: 'fixed',
        left: '50%',
        marginLeft: '497.5px',
        top: 0,
        height: 'calc(100vh - 80px)',
        width: '1px',
        backgroundColor: '#000',
        zIndex: 5
      }} />

      {/* Header - border handled by navigation panel */}
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
            ULOŽENÉ POLOŽKY
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

      <div className="flex-1 flex justify-center" style={{ marginBottom: '40px' }}>
        <div className="w-full md:w-[995px]" style={{ position: 'relative' }}>
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

      {/* VYBRÁNO PRO VÁS Section - compact height */}
      <div style={{
        maxWidth: '995px',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: '16px',
        paddingRight: '16px',
        marginBottom: '0px',
        borderBottom: '1px solid #000',
        width: '100%'
      }}>
        <div style={{
          paddingTop: '16px',
          paddingBottom: '8px',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '13px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            fontStretch: 'condensed',
            margin: '0 0 4px 0',
            color: '#000'
          }}>
            VYBRÁNO PRO VÁS
          </h2>
        </div>
        {/* Horizontal scroll container - shows 1.5 products on desktop */}
        <div 
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
            paddingBottom: '8px',
            cursor: 'grab',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            minHeight: '0'
          }}
        >
          {selectedProducts.map((product, index) => (
            <div key={product.id} style={{ display: 'flex', flex: '0 0 calc(66.666% - 0.67px)', scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
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
                  fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
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

      {/* Sticky Footer with Checkout Button */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '995px',
        backgroundColor: '#fff',
        borderTop: '1px solid #000',
        zIndex: 10,
        padding: '12px 16px',
        boxSizing: 'border-box',
        height: '80px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <button
          onClick={() => router.push('/pokladna')}
          style={{
            width: '100%',
            height: '40px',
            borderRadius: '4px',
            border: '1px solid #000',
            fontSize: '13px',
            textTransform: 'uppercase',
            letterSpacing: '.06em',
            textDecoration: 'none',
            background: '#000',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 300,
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          POKRAČOVAT V OBJEDNÁVCE
        </button>
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        productName={deleteItemData?.productName || ''}
        productSize={deleteItemData?.size || ''}
      />
    </div>
  );
}
