'use client';

import type { MouseEvent } from 'react';
import { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/cart-store';
import { useRecentlyViewedStore } from '@/lib/recently-viewed-store';
import { useSavedProductsStore } from '@/lib/saved-products-store';
import { X } from 'lucide-react';
import AnimatedButton from './AnimatedButton';
import DeleteConfirmModal from './DeleteConfirmModal';
import CartLineItem from './CartLineItem';
import { useRouter } from 'next/navigation';

function SavedItemsButton({ onClose }: { onClose: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href="/ulozeno"
      onClick={onClose}
      className="relative overflow-hidden bg-white text-black font-normal uppercase tracking-tight transition-all border border-black"
      style={{ borderRadius: '4px', padding: '8px 20px', fontSize: '12px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        className="block transition-all duration-300"
        style={{
          transform: isHovered ? 'translateY(-150%)' : 'translateY(0)',
          opacity: isHovered ? 0 : 1,
        }}
      >
        Uložené položky
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{
          transform: isHovered ? 'translateY(0)' : 'translateY(150%)',
          opacity: isHovered ? 1 : 0,
        }}
      >
        Uložené položky
      </span>
    </Link>
  );
}

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  images?: string[];
  slug: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();
  const { addProduct: saveProduct } = useSavedProductsStore();
  const recentlyViewedProducts = useRecentlyViewedStore((state) => state.products);
  const recentlyViewed = useMemo(() => recentlyViewedProducts.slice(0, 3), [recentlyViewedProducts]);
  const total = useMemo(() => getTotal(), [items]);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemData, setDeleteItemData] = useState<{ productId: string; productName: string; size: string } | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  
  // Refs for drag scrolling
  const vybrranoRef = useRef<HTMLDivElement>(null);
  const prohlizeniRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await fetch('/api/products?limit=1000');
        const data = await res.json();
        console.log('Fetched products:', data); // Debug log
        let products = [];
        if (Array.isArray(data)) {
          products = data;
        } else if (data.products && Array.isArray(data.products)) {
          products = data.products;
        }
        
        // Use productImage (featured) if available, otherwise fall back to first image
        const productsWithImage = products.map((p: any) => ({
          ...p,
          image: p.productImage || (p.images && p.images.length > 0 ? p.images[0] : ''),
        }));
        setAllProducts(productsWithImage);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };

    if (isOpen && allProducts.length === 0) {
      fetchAllProducts();
    }
  }, [isOpen, allProducts.length]);
  useEffect(() => {
    if (allProducts.length > 0 && selectedProducts.length === 0) {
      const shuffled = [...allProducts].sort(() => Math.random() - 0.5);
      setSelectedProducts(shuffled.slice(0, 9));
    }
  }, [allProducts, selectedProducts.length]);

  // Enable drag scrolling
  const enableDragScroll = (ref: React.RefObject<HTMLDivElement>) => {
    const element = ref.current;
    if (!element) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const handleMouseDown = (e: Event) => {
      const mouseEvent = e as unknown as MouseEvent;
      isDown = true;
      startX = mouseEvent.pageX - element.offsetLeft;
      scrollLeft = element.scrollLeft;
      element.style.cursor = 'grabbing';
    };

    const handleMouseLeave = () => {
      isDown = false;
      element.style.cursor = 'grab';
    };

    const handleMouseUp = () => {
      isDown = false;
      element.style.cursor = 'grab';
    };

    const handleMouseMove = (e: Event) => {
      if (!isDown) return;
      const mouseEvent = e as unknown as MouseEvent;
      mouseEvent.preventDefault();
      const x = mouseEvent.pageX - element.offsetLeft;
      const walk = (x - startX) * 1;
      element.scrollLeft = scrollLeft - walk;
    };

    const handleTouchStart = (e: Event) => {
      const touchEvent = e as TouchEvent;
      startX = touchEvent.touches[0].pageX - element.offsetLeft;
      scrollLeft = element.scrollLeft;
    };

    const handleTouchMove = (e: Event) => {
      const touchEvent = e as TouchEvent;
      const x = touchEvent.touches[0].pageX - element.offsetLeft;
      const walk = (x - startX) * 1;
      element.scrollLeft = scrollLeft - walk;
    };

    // Remove old listeners if they exist
    element.removeEventListener('mousedown', handleMouseDown as EventListener);
    element.removeEventListener('mouseleave', handleMouseLeave as EventListener);
    element.removeEventListener('mouseup', handleMouseUp as EventListener);
    element.removeEventListener('mousemove', handleMouseMove as EventListener);
    element.removeEventListener('touchstart', handleTouchStart as EventListener);
    element.removeEventListener('touchmove', handleTouchMove as EventListener);

    // Add listeners
    element.addEventListener('mousedown', handleMouseDown as EventListener);
    element.addEventListener('mouseleave', handleMouseLeave as EventListener);
    element.addEventListener('mouseup', handleMouseUp as EventListener);
    element.addEventListener('mousemove', handleMouseMove as EventListener);
    element.addEventListener('touchstart', handleTouchStart as EventListener);
    element.addEventListener('touchmove', handleTouchMove as EventListener);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown as EventListener);
      element.removeEventListener('mouseleave', handleMouseLeave as EventListener);
      element.removeEventListener('mouseup', handleMouseUp as EventListener);
      element.removeEventListener('mousemove', handleMouseMove as EventListener);
      element.removeEventListener('touchstart', handleTouchStart as EventListener);
      element.removeEventListener('touchmove', handleTouchMove as EventListener);
    };
  };

  useEffect(() => {
    if (isOpen && vybrranoRef.current && prohlizeniRef.current) {
      // Set initial cursor
      vybrranoRef.current.style.cursor = 'grab';
      prohlizeniRef.current.style.cursor = 'grab';
      
      // Enable drag scroll
      const cleanup1 = enableDragScroll(vybrranoRef);
      const cleanup2 = enableDragScroll(prohlizeniRef);
      
      return () => {
        cleanup1?.();
        cleanup2?.();
      };
    }
  }, [isOpen]);

  const handleSaveForLater = (productId: string, size: string) => {
    saveProduct(productId);
    removeItem(productId, size);
  };

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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAddToCart = (product: Product) => {
    // This would need the size selection - for now just show message
    alert('Please go to product page to select size');
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleOverlayClick}
      />
      
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-1/3 bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col md:border-l border-black">
          <div className="border-b border-black relative" style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#24e053' }}>
            <h2 
              style={{
                fontFamily: 'BB-Condensed-Bold, "Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                fontStretch: 'condensed',
                color: '#000000'
              }}
            >
              KOŠÍK
            </h2>
            <button
              onClick={onClose}
              className="absolute hover:opacity-70 transition-opacity"
              style={{
                width: '22px',
                height: '22px',
                top: '50%',
                right: '8px',
                transform: 'translateY(-50%)',
                padding: '0',
                color: '#000000'
              }}
            >
              <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto relative" style={{ scrollbarWidth: 'none' }}>
            {isDeleteModalOpen && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 10,
                  pointerEvents: 'none'
                }}
              />
            )}
            {items.length === 0 ? (
              <div className="flex flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Empty Cart Section - 240px */}
                <div style={{ height: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingLeft: '24px', paddingRight: '24px', borderBottom: '1px solid #000' }}>
                  <p 
                    style={{
                      fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      textAlign: 'center',
                      margin: '0',
                      marginBottom: '22px'
                    }}
                  >
                    Váš nákupní košík je prázdný
                  </p>
                  <SavedItemsButton onClose={onClose} />
                </div>

                {/* VYBRÁNO PRO VÁS Section */}
                <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid #000', minHeight: '0', flex: 1 }}>
                  <div style={{ paddingTop: '8px', paddingBottom: '0px', paddingLeft: '16px', paddingRight: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', position: 'relative' }}>
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
                        marginTop: 'calc(50% - 12px)'
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
                    <h3 
                      style={{
                        fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                        fontSize: '13px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        fontStretch: 'condensed',
                        margin: '0',
                        textAlign: 'center',
                        flex: 1
                      }}
                    >
                      VYBRÁNO PRO VÁS
                    </h3>
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
                        marginTop: 'calc(50% - 12px)'
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
                  </div>
                  {/* Horizontal scroll container - 1.5 products show */}
                  <div 
                    ref={vybrranoRef}
                    style={{ 
                      display: 'flex', 
                      overflowX: 'auto', 
                      overflowY: 'hidden', 
                      gap: '0', 
                      paddingLeft: '0', 
                      paddingRight: '0', 
                      paddingTop: '8px',
                      scrollBehavior: 'smooth', 
                      WebkitOverflowScrolling: 'touch',
                      scrollbarWidth: 'none',
                      scrollSnapType: 'x mandatory',
                      flex: 1,
                      cursor: 'grab',
                      minHeight: '0',
                      userSelect: 'none',
                      WebkitUserSelect: 'none'
                    }}
                    className="select-none"
                  >
                    {selectedProducts.map((product, index) => (
                      <div key={product.id} style={{ display: 'flex', flex: '0 0 calc(40% - 0.4px)', scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
                        {index > 0 && <div style={{ width: '1px', backgroundColor: '#000', flex: '0 0 1px' }} />}
                        <Link
                          href={`/produkty/${product.slug}`}
                          onClick={onClose}
                          style={{ display: 'flex', flexDirection: 'column', width: '100%', paddingTop: '16px', paddingBottom: '16px', paddingLeft: '16px', paddingRight: '16px', textDecoration: 'none' }}
                          className="hover:opacity-80 transition-opacity"
                        >
                          <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', backgroundColor: '#f5f5f5', overflow: 'hidden', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                            marginTop: 0,
                            marginBottom: '6px',
                            letterSpacing: '0.03em',
                            fontStretch: 'condensed',
                            color: '#000000',
                            lineHeight: '1.2',
                            textAlign: 'center'
                          }}>
                            {product.name}
                          </h4>
                          <p style={{
                            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                            fontSize: '10px',
                            fontWeight: 400,
                            lineHeight: '1.2',
                            color: '#000000',
                            margin: '0 0 8px 0',
                            textAlign: 'center'
                          }}>{product.price} Kč</p>
                          <div style={{
                              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                              fontSize: '11px',
                              fontWeight: 400,
                              lineHeight: '1.2',
                              color: '#000000',
                              textDecoration: 'underline',
                              textAlign: 'center'
                            }}>
                              Přidat do košíku
                            </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PROHLÍŽELI JSTE Section - only show when cart is empty */}
                {recentlyViewed.length > 0 && items.length === 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid #000', minHeight: '0', flex: 1 }}>
                    <div style={{ paddingTop: '8px', paddingBottom: '0px', paddingLeft: '16px', paddingRight: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', position: 'relative' }}>
                      <button
                        onClick={() => {
                          if (prohlizeniRef.current) {
                            prohlizeniRef.current.scrollBy({
                              left: -(prohlizeniRef.current.clientWidth * 0.4),
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
                          marginTop: 'calc(50% - 12px)'
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
                      <h3 
                        style={{
                          fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                          fontSize: '13px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                          fontStretch: 'condensed',
                          margin: '0',
                          textAlign: 'center',
                          flex: 1
                        }}
                      >
                        PROHLÍŽELI JSTE
                      </h3>
                      <button
                        onClick={() => {
                          if (prohlizeniRef.current) {
                            prohlizeniRef.current.scrollBy({
                              left: prohlizeniRef.current.clientWidth * 0.4,
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
                          marginTop: 'calc(50% - 12px)'
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
                    </div>
                    {/* Horizontal scroll container - 1.5 products show */}
                    <div 
                      ref={prohlizeniRef}
                      style={{ 
                        display: 'flex', 
                        overflowX: 'auto', 
                        overflowY: 'hidden', 
                        gap: '0', 
                        paddingLeft: '0', 
                        paddingRight: '0', 
                        paddingTop: '8px',
                        scrollBehavior: 'smooth', 
                        WebkitOverflowScrolling: 'touch',
                        scrollbarWidth: 'none',
                        scrollSnapType: 'x mandatory',
                        flex: 1,
                        cursor: 'grab',
                        minHeight: '0',
                        userSelect: 'none',
                        WebkitUserSelect: 'none'
                      }}
                      className="select-none"
                    >
                      {recentlyViewed.map((product, index) => (
                        <div key={product.id} style={{ display: 'flex', flex: '0 0 calc(40% - 0.4px)', scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
                          {index > 0 && <div style={{ width: '1px', backgroundColor: '#000', flex: '0 0 1px' }} />}
                          <Link
                            href={`/produkty/${product.slug}`}
                            onClick={onClose}
                            style={{ display: 'flex', flexDirection: 'column', width: '100%', paddingTop: '16px', paddingBottom: '16px', paddingLeft: '16px', paddingRight: '16px', textDecoration: 'none' }}
                            className="hover:opacity-80 transition-opacity"
                          >
                            <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', backgroundColor: '#f5f5f5', overflow: 'hidden', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                              marginTop: 0,
                              marginBottom: '6px',
                              letterSpacing: '0.03em',
                              fontStretch: 'condensed',
                              color: '#000000',
                              lineHeight: '1.2',
                              textAlign: 'center'
                            }}>
                              {product.name}
                            </h4>
                            <p style={{
                              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                              fontSize: '10px',
                              fontWeight: 400,
                              lineHeight: '1.2',
                              color: '#000000',
                              margin: '0 0 8px 0',
                              textAlign: 'center'
                            }}>{product.price} Kč</p>
                            <div style={{
                              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                              fontSize: '11px',
                              fontWeight: 400,
                              lineHeight: '1.2',
                              color: '#000000',
                              textDecoration: 'underline',
                              textAlign: 'center'
                            }}>
                              Přidat do košíku
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Info Section */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
                  <div style={{ 
                    fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '12px',
                    fontWeight: 400,
                    lineHeight: '1.4',
                    letterSpacing: '0.8px'
                  }}>
                    <p style={{ margin: '0 0 8px 0' }}>• Odesíláme ASAP</p>
                    <p style={{ margin: '0 0 8px 0' }}>• Možnost vrácení do 14ti dnů</p>
                    <p style={{ margin: '0 0 8px 0' }}>• VOODOO808 natiskne vaše triko</p>
                    <p style={{ margin: '0' }}>• AKA47 odešle vaší objednávku</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <img 
                      src="/payment-methods.jpg" 
                      alt="Payment Methods: Visa, Mastercard, GoPay, PayPal, Apple Pay" 
                      style={{ height: '64px', width: 'auto' }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
                {/* Cart items - FIRST */}
                {items.map((item) => (
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
                    onUpdateQuantity={updateQuantity}
                    onRemove={handleOpenDeleteModal}
                    onSaveForLater={handleSaveForLater}
                    onClose={onClose}
                  />
                ))}

                {/* VYBRÁNO PRO VÁS Section */}
                <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid #000', minHeight: '0', flex: '0 0 auto' }}>
                  <div style={{ paddingTop: '12px', paddingBottom: '8px', paddingLeft: '16px', paddingRight: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
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
                        marginTop: 'calc(50% - 12px)'
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
                    <h3 
                      style={{
                        fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                        fontSize: '13px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        fontStretch: 'condensed',
                        margin: '0',
                        textAlign: 'center',
                        flex: 1
                      }}
                    >
                      VYBRÁNO PRO VÁS
                    </h3>
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
                        marginTop: 'calc(50% - 12px)'
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
                  </div>
                  {/* Horizontal scroll container - 1.5 products show */}
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
                      flex: 1,
                      cursor: 'grab',
                      minHeight: '0',
                      userSelect: 'none',
                      WebkitUserSelect: 'none'
                    }}
                    className="select-none"
                  >
                    {selectedProducts.map((product, index) => (
                      <div key={product.id} style={{ display: 'flex', flex: '0 0 calc(40% - 0.4px)', scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
                        {index > 0 && <div style={{ width: '1px', backgroundColor: '#000', flex: '0 0 1px' }} />}
                        <Link
                          href={`/produkty/${product.slug}`}
                          onClick={onClose}
                          style={{ display: 'flex', flexDirection: 'column', width: '100%', paddingTop: '6px', paddingBottom: '12px', paddingLeft: '16px', paddingRight: '16px', textDecoration: 'none' }}
                          className="hover:opacity-80 transition-opacity"
                        >
                          <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', backgroundColor: '#f5f5f5', overflow: 'hidden', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                            marginTop: 0,
                            marginBottom: '6px',
                            letterSpacing: '0.03em',
                            fontStretch: 'condensed',
                            color: '#000000',
                            lineHeight: '1.2',
                            textAlign: 'center'
                          }}>
                            {product.name}
                          </h4>
                          <p style={{
                            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                            fontSize: '10px',
                            fontWeight: 400,
                            lineHeight: '1.2',
                            color: '#000000',
                            margin: '0 0 8px 0',
                            textAlign: 'center'
                          }}>{product.price} Kč</p>
                          <div style={{
                              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                              fontSize: '11px',
                              fontWeight: 400,
                              lineHeight: '1.2',
                              color: '#000000',
                              textDecoration: 'underline',
                              textAlign: 'center'
                            }}>
                              Přidat do košíku
                            </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PROHLÍŽELI JSTE Section - never show when items in cart */}
                {recentlyViewed.length > 0 && items.length === 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid #000', minHeight: '0', flex: '0 0 auto' }}>
                  <div style={{ paddingTop: '12px', paddingBottom: '8px', paddingLeft: '16px', paddingRight: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
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
                        marginTop: 'calc(50% - 12px)'
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
                    <h3 
                      style={{
                        fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                        fontSize: '13px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        fontStretch: 'condensed',
                        margin: '0',
                        textAlign: 'center',
                        flex: 1
                      }}
                    >
                      VYBRÁNO PRO VÁS
                    </h3>
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
                        marginTop: 'calc(50% - 12px)'
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
                  </div>
                    {/* Horizontal scroll container - 1.5 products show */}
                    <div 
                      ref={prohlizeniRef}
                      style={{ 
                        display: 'flex', 
                        overflowX: 'auto', 
                        overflowY: 'hidden', 
                        gap: '0', 
                        paddingLeft: '0', 
                        paddingRight: '0', 
                        paddingTop: '8px',
                        scrollBehavior: 'smooth', 
                        WebkitOverflowScrolling: 'touch',
                        scrollbarWidth: 'none',
                        scrollSnapType: 'x mandatory',
                        flex: 1,
                        cursor: 'grab',
                        minHeight: '0',
                        userSelect: 'none',
                        WebkitUserSelect: 'none'
                      }}
                      className="select-none"
                    >
                      {recentlyViewed.map((product, index) => (
                        <div key={product.id} style={{ display: 'flex', flex: '0 0 calc(66.666% - 0.67px)', scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
                          {index > 0 && <div style={{ width: '1px', backgroundColor: '#000', flex: '0 0 1px' }} />}
                          <Link
                            href={`/produkty/${product.slug}`}
                            onClick={onClose}
                            style={{ display: 'flex', flexDirection: 'column', width: '100%', paddingTop: '6px', paddingBottom: '12px', paddingLeft: '16px', paddingRight: '16px', textDecoration: 'none' }}
                            className="hover:opacity-80 transition-opacity"
                          >
                            <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', backgroundColor: '#f5f5f5', overflow: 'hidden', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                              fontSize: '11px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              marginTop: 0,
                              marginBottom: '4px',
                              letterSpacing: '0.03em',
                              fontStretch: 'condensed',
                              color: '#000000',
                              lineHeight: '1.2',
                              textAlign: 'center'
                            }}>
                              {product.name}
                            </h4>
                            <p style={{
                              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                              fontSize: '10px',
                              fontWeight: 400,
                              lineHeight: '1.2',
                              color: '#000000',
                              margin: '0 0 8px 0',
                              textAlign: 'center'
                            }}>{product.price} Kč</p>
                            <div style={{
                              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                              fontSize: '11px',
                              fontWeight: 400,
                              lineHeight: '1.2',
                              color: '#000000',
                              textDecoration: 'underline',
                              textAlign: 'center'
                            }}>
                              Přidat do košíku
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div style={{ marginTop: 'auto' }}>
              {/* First 1px line */}
              <div style={{
                borderTop: '1px solid #000'
              }} />
              
              {/* Pricing section - 64px height */}
              <div style={{
                height: '64px',
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '4px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '12px',
                    fontWeight: 400,
                    lineHeight: '19.6px',
                    color: '#999999'
                  }}>
                    CENA ZA DOPRAVU
                  </span>
                  <span style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '12px',
                    fontWeight: 400,
                    lineHeight: '19.6px',
                    color: '#999999'
                  }}>
                    79 Kč
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                    fontStretch: 'condensed',
                    color: '#000000'
                  }}>
                    PŘEDPOKLÁDANÁ CENA
                  </span>
                  <span style={{
                    fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                    fontStretch: 'condensed',
                    color: '#000000'
                  }}>
                    {(total + 79).toFixed(2)} Kč
                  </span>
                </div>
              </div>

              {/* Second 1px line */}
              <div style={{
                borderTop: '1px solid #000'
              }} />
              
              {/* Buttons section */}
              <div style={{
                padding: '12px',
                display: 'flex',
                gap: '8px'
              }}>
                <AnimatedButton
                  text={`PŘEJÍT K POKLADNĚ (${items.length})`}
                  onClick={() => {
                    onClose();
                    router.push('/pokladna');
                  }}
                  type="button"
                  style={{
                    flex: 1,
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '12px',
                    fontWeight: 400,
                    padding: '12px',
                    backgroundColor: '#fff',
                    border: '1px solid #000',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    color: '#000'
                  }}
                />
                <AnimatedButton
                  text="ZOBRAZIT KOŠÍK"
                  onClick={() => {
                    onClose();
                    router.push('/kosik');
                  }}
                  type="button"
                  style={{
                    flex: 1,
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '12px',
                    fontWeight: 400,
                    padding: '12px',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        productName={deleteItemData?.productName || ''}
        productSize={deleteItemData?.size || ''}
      />
    </>
  );
}
