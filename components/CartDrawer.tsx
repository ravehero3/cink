'use client';

import type { MouseEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/cart-store';
import { useRecentlyViewedStore } from '@/lib/recently-viewed-store';
import { X } from 'lucide-react';

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

function CheckoutButton({ total, onClose }: { total: number; onClose: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href="/pokladna"
      onClick={onClose}
      className="block w-full relative overflow-hidden bg-black text-white text-center text-xs uppercase tracking-tight font-bold"
      style={{ borderRadius: '4px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
        PŘEJÍT K POKLADNĚ · {total.toFixed(2)} Kč
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{
          transform: isHovered ? 'translateY(0)' : 'translateY(150%)',
          opacity: isHovered ? 1 : 0,
        }}
      >
        PŘEJÍT K POKLADNĚ · {total.toFixed(2)} Kč
      </span>
    </Link>
  );
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();
  const recentlyViewedProducts = useRecentlyViewedStore((state) => state.products);
  const recentlyViewed = useMemo(() => recentlyViewedProducts.slice(0, 3), [recentlyViewedProducts]);
  const total = useMemo(() => getTotal(), [items]);

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

  return (
    <>
      <div
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleOverlayClick}
      />
      
      <div
        className={`fixed top-0 right-0 h-full w-1/3 bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col border-l border-black">
          <div className="border-b border-black relative" style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#6bdc66' }}>
            <h2 
              style={{
                fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '15px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                fontStretch: 'condensed'
              }}
            >
              NÁKUPNÍ KOŠÍK
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
                padding: '0'
              }}
            >
              <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="h-full flex flex-col relative">
                <div style={{ height: 'calc(25% - 0.5px)' }} className="flex flex-col items-center justify-center px-6">
                  <p 
                    style={{
                      fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      textAlign: 'center',
                      marginBottom: '8px'
                    }}
                  >
                    Váš košík je prázdný
                  </p>
                  <SavedItemsButton onClose={onClose} />
                </div>
                
                <div className="border-b border-black" />
                
                <div style={{ height: 'calc(50% - 1px)' }} className="flex flex-col">
                  <div className="text-center" style={{ marginTop: '64px' }}>
                    <h3 
                      style={{
                        fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                        fontSize: '15px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        fontStretch: 'condensed'
                      }}
                    >
                      PROHLÍŽELI JSTE
                    </h3>
                  </div>
                </div>
                
                <div className="border-b border-black" />
                
                <div style={{ height: 'calc(25% + 16px)', position: 'relative' }} className="flex flex-col">
                  <div className="space-y-2" style={{ 
                    fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '9px',
                    letterSpacing: '0.8px',
                    paddingLeft: '12px',
                    paddingTop: '12px'
                  }}>
                    <p>• Odesíláme ASAP</p>
                    <p>• Možnost vrácení do 14ti dnů</p>
                  </div>
                  <div className="flex items-center justify-center" style={{ position: 'absolute', top: '50%', left: '0', right: '0', transform: 'translateY(-50%)' }}>
                    <img 
                      src="/payment-methods.jpg" 
                      alt="Payment Methods: Visa, Mastercard, GoPay, PayPal, Apple Pay" 
                      style={{ height: '76.8px', width: 'auto' }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-6 py-6">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}`}
                    className="flex gap-4 mb-6 pb-6 border-b border-black last:border-0"
                  >
                    <Link
                      href={`/produkty/${item.slug}`}
                      onClick={onClose}
                      className="flex-shrink-0"
                    >
                      <div className="w-24 h-32 relative bg-white border border-black">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>

                    <div className="flex-1 flex flex-col text-sm">
                      <Link
                        href={`/produkty/${item.slug}`}
                        onClick={onClose}
                        className="hover:opacity-60 transition-opacity"
                      >
                        <h3 className="font-bold uppercase tracking-tight mb-2 text-base">
                          {item.name}
                        </h3>
                      </Link>
                      
                      <p className="text-xs mb-2">
                        Size: {item.size} | Color: {item.color}
                      </p>
                      
                      <p className="mb-3 font-medium">{item.price} Kč</p>

                      <div className="mt-auto flex items-center gap-3">
                        <div className="flex items-center border border-black">
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-black hover:text-white transition-colors text-xs"
                          >
                            −
                          </button>
                          <span className="px-3 py-1 border-x border-black min-w-[40px] text-center text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-black hover:text-white transition-colors text-xs"
                          >
                            +
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.productId, item.size)}
                          className="text-xs hover:opacity-60 transition-opacity underline uppercase"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {recentlyViewed.length > 0 && (
              <div className="border-t border-black px-6 py-6">
                <h3 className="text-sm font-bold uppercase tracking-tight mb-6">
                  RECENTLY VIEWED
                </h3>
                <div className="space-y-5">
                  {recentlyViewed.map((product) => (
                    <Link
                      key={product.id}
                      href={`/produkty/${product.slug}`}
                      onClick={onClose}
                      className="flex gap-4 hover:opacity-60 transition-opacity"
                    >
                      <div className="w-20 h-24 relative bg-white border border-black flex-shrink-0">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold uppercase tracking-tight mb-1 line-clamp-2">
                          {product.name}
                        </h4>
                        <p className="text-xs font-medium">{product.price} Kč</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-black px-6 py-6">
              <div className="mb-6 space-y-1.5 text-xs">
                <p>• Odesíláme ASAP</p>
                <p>• Možnost vrácení do 14ti dnů</p>
              </div>

              <div className="flex items-center justify-center mb-6">
                <img 
                  src="/payment-methods.jpg" 
                  alt="Payment Methods: Visa, Mastercard, GoPay, PayPal, Apple Pay" 
                  style={{ height: '76.8px', width: 'auto' }}
                />
              </div>

              <CheckoutButton total={total} onClose={onClose} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
