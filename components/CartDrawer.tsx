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
  image: string;
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

  // Fetch all products
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await fetch('/api/products?limit=1000');
        const data = await res.json();
        console.log('Fetched products:', data); // Debug log
        if (Array.isArray(data)) {
          setAllProducts(data);
        } else if (data.products && Array.isArray(data.products)) {
          setAllProducts(data.products);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };

    if (isOpen && allProducts.length === 0) {
      fetchAllProducts();
    }
  }, [isOpen, allProducts.length]);

  // Select 9 random products when all products load
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

    element.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - element.offsetLeft;
      scrollLeft = element.scrollLeft;
    });

    element.addEventListener('mouseleave', () => {
      isDown = false;
    });

    element.addEventListener('mouseup', () => {
      isDown = false;
    });

    element.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - element.offsetLeft;
      const walk = (x - startX) * 1;
      element.scrollLeft = scrollLeft - walk;
    });

    // Touch support
    element.addEventListener('touchstart', (e) => {
      startX = e.touches[0].pageX - element.offsetLeft;
      scrollLeft = element.scrollLeft;
    });

    element.addEventListener('touchmove', (e) => {
      const x = e.touches[0].pageX - element.offsetLeft;
      const walk = (x - startX) * 1;
      element.scrollLeft = scrollLeft - walk;
    });
  };

  useEffect(() => {
    if (isOpen) {
      enableDragScroll(vybrranoRef);
      enableDragScroll(prohlizeniRef);
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
                fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
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

                {/* VYBRÁNO PRO VÁS Section - 634px */}
                <div style={{ height: '634px', display: 'flex', flexDirection: 'column', borderBottom: '1px solid #000' }}>
                  <div style={{ paddingTop: '16px', paddingBottom: '16px', paddingLeft: '16px', paddingRight: '16px', borderBottom: '1px solid #000' }}>
                    <h3 
                      style={{
                        fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                        fontSize: '13px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        fontStretch: 'condensed',
                        margin: '0',
                        textAlign: 'center'
                      }}
                    >
                      VYBRÁNO PRO VÁS
                    </h3>
                  </div>
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
                      flex: 1,
                      cursor: 'grab'
                    }}
                    className="select-none"
                  >
                    {selectedProducts.map((product) => (
                      <div
                        key={product.id}
                        style={{ display: 'flex', flexDirection: 'column', width: 'calc(50% - 8px)', marginRight: '16px', flexShrink: 0, paddingTop: '16px', paddingBottom: '16px', paddingLeft: '16px', paddingRight: '0px' }}
                      >
                        <div style={{ position: 'relative', width: '100%', height: '402px', backgroundColor: '#fff', border: '1px solid #000', overflow: 'hidden', marginBottom: '26px' }}>
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <h4 style={{
                          fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                          fontSize: '12px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          marginTop: 0,
                          marginBottom: '26px',
                          letterSpacing: '0.03em',
                          fontStretch: 'condensed',
                          color: '#000000',
                          lineHeight: '1.3',
                          textAlign: 'center'
                        }}>
                          {product.name}
                        </h4>
                        <p style={{
                          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                          fontSize: '11px',
                          fontWeight: 400,
                          lineHeight: '1.3',
                          color: '#000000',
                          margin: '0 0 26px 0',
                          textAlign: 'center'
                        }}>{product.price} Kč</p>
                        <button
                          onClick={() => handleAddToCart(product)}
                          style={{
                            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                            fontSize: '11px',
                            fontWeight: 400,
                            lineHeight: '1.3',
                            color: '#000000',
                            textDecoration: 'underline',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            textAlign: 'center'
                          }}
                          className="hover:opacity-60 transition-opacity"
                        >
                          Přidat do košíku
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PROHLÍŽELI JSTE Section - 634px */}
                {recentlyViewed.length > 0 && (
                  <div style={{ height: '634px', display: 'flex', flexDirection: 'column', borderBottom: '1px solid #000' }}>
                    <div style={{ paddingTop: '16px', paddingBottom: '16px', paddingLeft: '16px', paddingRight: '16px', borderBottom: '1px solid #000' }}>
                      <h3 
                        style={{
                          fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                          fontSize: '13px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                          fontStretch: 'condensed',
                          margin: '0',
                          textAlign: 'center'
                        }}
                      >
                        PROHLÍŽELI JSTE
                      </h3>
                    </div>
                    {/* Horizontal scroll container */}
                    <div 
                      ref={prohlizeniRef}
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
                        flex: 1,
                        cursor: 'grab'
                      }}
                      className="select-none"
                    >
                      {recentlyViewed.map((product, index) => (
                        <div key={product.id} style={{ display: 'flex', flex: '0 0 50%' }}>
                          {index > 0 && <div style={{ width: '1px', backgroundColor: '#000', flex: '0 0 1px' }} />}
                          <Link
                            href={`/produkty/${product.slug}`}
                            onClick={onClose}
                            style={{ display: 'flex', flexDirection: 'column', width: '100%', flexShrink: 0, paddingTop: '16px', paddingBottom: '16px', paddingLeft: '16px', paddingRight: '16px', textDecoration: 'none' }}
                            className="hover:opacity-80 transition-opacity"
                          >
                            <div style={{ position: 'relative', width: '100%', height: '402px', backgroundColor: '#fff', overflow: 'hidden', marginBottom: '26px' }}>
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <h4 style={{
                              fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                              fontSize: '12px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              marginTop: 0,
                              marginBottom: '26px',
                              letterSpacing: '0.03em',
                              fontStretch: 'condensed',
                              color: '#000000',
                              lineHeight: '1.3',
                              textAlign: 'center'
                            }}>
                              {product.name}
                            </h4>
                            <p style={{
                              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                              fontSize: '11px',
                              fontWeight: 400,
                              lineHeight: '1.3',
                              color: '#000000',
                              margin: 0,
                              textAlign: 'center'
                            }}>{product.price} Kč</p>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Info Section - 200px */}
                <div style={{ height: '200px', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
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
              <div style={{ padding: '0' }}>
                {items.map((item, index) => (
                  <div
                    key={`${item.productId}-${item.size}`}
                    style={{
                      borderBottom: index < items.length - 1 ? '1px solid #000' : 'none',
                      padding: '16px',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                      <Link
                        href={`/produkty/${item.slug}`}
                        onClick={onClose}
                        style={{ flexShrink: 0 }}
                      >
                        <div style={{
                          width: '80px',
                          height: '106px',
                          border: '1px solid #000',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          backgroundColor: '#fff'
                        }}>
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                          />
                        </div>
                      </Link>

                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Link
                          href={`/produkty/${item.slug}`}
                          onClick={onClose}
                          style={{ textDecoration: 'none', color: 'rgb(0, 0, 0)' }}
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
                            color: '#000000'
                          }}>
                            {item.name}
                          </h3>
                        </Link>
                        
                        <p style={{
                          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                          fontSize: '14px',
                          fontWeight: 400,
                          lineHeight: '19.6px',
                          color: 'rgb(0, 0, 0)',
                          marginBottom: '8px'
                        }}>
                          {item.price} Kč
                        </p>

                        <p style={{
                          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                          fontSize: '14px',
                          fontWeight: 400,
                          lineHeight: '17.6px',
                          color: 'rgb(0, 0, 0)',
                          marginBottom: '4px'
                        }}>
                          Barva: {item.color}
                        </p>

                        <p style={{
                          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                          fontSize: '14px',
                          fontWeight: 400,
                          lineHeight: '17.6px',
                          color: 'rgb(0, 0, 0)',
                          marginBottom: '8px'
                        }}>
                          Velikost: {item.size}
                        </p>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '4px'
                        }}>
                          <span style={{
                            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                            fontSize: '14px',
                            fontWeight: 400,
                            lineHeight: '17.6px',
                            color: 'rgb(0, 0, 0)'
                          }}>
                            Množství:
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                            style={{
                              padding: '2px 8px',
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                              fontWeight: 400,
                              color: 'rgb(0, 0, 0)'
                            }}
                          >
                            −
                          </button>
                          <span style={{
                            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                            fontSize: '14px',
                            fontWeight: 400,
                            lineHeight: '17.6px',
                            color: 'rgb(0, 0, 0)'
                          }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                            style={{
                              padding: '2px 8px',
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                              fontWeight: 400,
                              color: 'rgb(0, 0, 0)'
                            }}
                          >
                            +
                          </button>
                        </div>

                        {item.quantity < 6 && (
                          <p style={{
                            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                            fontSize: '14px',
                            fontWeight: 400,
                            lineHeight: '19.6px',
                            color: '#666'
                          }}>
                            Poslední kusy na skladě
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end'
                    }}>
                      <button
                        onClick={() => handleSaveForLater(item.productId, item.size)}
                        style={{
                          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                          fontSize: '14px',
                          fontWeight: 400,
                          lineHeight: '19.6px',
                          color: 'rgb(0, 0, 0)',
                          textDecoration: 'underline',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          padding: 0
                        }}
                        className="hover:opacity-60 transition-opacity"
                      >
                        Uložit na později
                      </button>
                      <div style={{
                        display: 'flex',
                        gap: '16px'
                      }}>
                        <Link
                          href={`/produkty/${item.slug}`}
                          onClick={onClose}
                          style={{
                            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                            fontSize: '14px',
                            fontWeight: 400,
                            lineHeight: '19.6px',
                            color: 'rgb(0, 0, 0)',
                            textDecoration: 'underline'
                          }}
                          className="hover:opacity-60 transition-opacity"
                        >
                          Upravit
                        </Link>
                        <button
                          onClick={() => handleOpenDeleteModal(item.productId, item.name, item.size)}
                          style={{
                            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                            fontSize: '14px',
                            fontWeight: 400,
                            lineHeight: '19.6px',
                            color: 'rgb(0, 0, 0)',
                            textDecoration: 'underline',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            padding: 0
                          }}
                          className="hover:opacity-60 transition-opacity"
                        >
                          Smazat
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
