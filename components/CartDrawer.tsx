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
      href="/ulozene"
      onClick={onClose}
      className="relative overflow-hidden bg-white text-black font-normal uppercase tracking-tight transition-all border border-black"
      style={{ borderRadius: '4px', padding: '10px 20px', fontSize: '12px' }}
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
        <div className="h-full flex flex-col">
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
                    <p>• Odesíláme ihned!!!</p>
                    <p>• Možnost vrácení do 14ti dnů</p>
                  </div>
                  <div className="flex items-center justify-center gap-2" style={{ position: 'absolute', top: '50%', left: '0', right: '0', transform: 'translateY(-50%)' }}>
                    {/* Visa */}
                    <svg style={{ height: '4px' }} viewBox="0 0 48 15" fill="none">
                      <rect width="48" height="15" rx="1.5" fill="#000"/>
                      <path d="M19 11l1.5-6h2l-1.5 6h-2zm6-6l-1.8 4.2-.3-1.5-.8-3.7-.1-.4c-.1-.3-.4-.5-.8-.6h-3.1l-.1.4c.9.2 1.7.5 2.4.9l1.6 5.7h2.1l3.2-6h-2.1zm7.5 0c-.8 0-1.4.2-1.7.5l-.2 1c.4-.2.9-.4 1.5-.4.5 0 .9.1.9.4 0 .2-.1.3-.3.5l-1.2.6c-.9.4-1.3.9-1.3 1.5 0 1 .8 1.5 1.7 1.5.6 0 1.1-.2 1.4-.5l.1.4h1.8l1.1-3.7c0-.2.1-.4.1-.5 0-1-.8-1.3-2-1.3zm-1.1 3.7c0-.3.3-.5.8-.7l.6-.3c0 .4-.3.8-.5 1-.2.1-.4.2-.6.2-.2 0-.3-.1-.3-.2zm7.1-3.7c-.8 0-1.4.2-1.7.5l-.2 1c.4-.2.9-.4 1.5-.4.5 0 .9.1.9.4 0 .2-.1.3-.3.5l-1.2.6c-.9.4-1.3.9-1.3 1.5 0 1 .8 1.5 1.7 1.5.6 0 1.1-.2 1.4-.5l.1.4h1.8l1.1-3.7c0-.2.1-.4.1-.5 0-1-.8-1.3-2-1.3zm-1.1 3.7c0-.3.3-.5.8-.7l.6-.3c0 .4-.3.8-.5 1-.2.1-.4.2-.6.2-.2 0-.3-.1-.3-.2z" fill="#fff"/>
                    </svg>
                    {/* GoPay */}
                    <svg style={{ height: '4px' }} viewBox="0 0 52 15" fill="none">
                      <rect width="52" height="15" rx="1.5" fill="#000"/>
                      <path d="M16 9c-.4.5-1 .7-1.7.7-1.2 0-2.1-.9-2.1-2.2 0-1.3.9-2.2 2.1-2.2.7 0 1.3.3 1.7.8V5h1.3v6h-1.3V9zm0-1.5c0-.7-.5-1.2-1.2-1.2s-1.2.5-1.2 1.2.5 1.2 1.2 1.2 1.2-.5 1.2-1.2zm7.3-2.2c-1.3 0-2.3 1-2.3 2.2s1 2.2 2.3 2.2c1.3 0 2.3-1 2.3-2.2s-1-2.2-2.3-2.2zm0 3.4c-.7 0-1.2-.5-1.2-1.2s.5-1.2 1.2-1.2 1.2.5 1.2 1.2-.5 1.2-1.2 1.2zm6.1-3.4c-.8 0-1.4.3-1.8.9v-.8h-1.3v6.3h1.3V9.1c.4.5 1 .8 1.8.8 1.2 0 2.1-.9 2.1-2.2 0-1.3-.9-2.2-2.1-2.2zm-.2 3.4c-.7 0-1.2-.5-1.2-1.2s.5-1.2 1.2-1.2 1.2.5 1.2 1.2-.5 1.2-1.2 1.2zm5-3.3c-.5 0-.9.2-1.2.5v-.4h-1.3v4.2h1.3V7.9c0-.6.4-1 .9-1h.3v-1.4h-.1zm4.5 3.3c-.2.1-.4.2-.6.2-.3 0-.5-.2-.5-.5v-2h1.1v-1h-1.1V4.8h-1.3v1.4h-.7v1h.7v2.3c0 1 .6 1.5 1.5 1.5.4 0 .8-.1 1.1-.3l-.2-1z" fill="#fff"/>
                    </svg>
                    {/* Mastercard */}
                    <svg style={{ height: '4px' }} viewBox="0 0 48 15" fill="none">
                      <rect width="48" height="15" rx="1.5" fill="#000"/>
                      <circle cx="18" cy="7.5" r="5" fill="#fff"/>
                      <circle cx="30" cy="7.5" r="5" fill="#fff"/>
                      <path d="M24 4A6 6 0 0 0 24 11 6 6 0 0 0 24 4" fill="#000"/>
                    </svg>
                    {/* PayPal */}
                    <svg style={{ height: '4px' }} viewBox="0 0 52 15" fill="none">
                      <rect width="52" height="15" rx="1.5" fill="#000"/>
                      <path d="M17.5 5.5h2.2c1.6 0 2.5.8 2.5 2 0 1.4-1 2.3-2.6 2.3h-1l-.5 2.2h-1.1l1.5-6.5zm1.3 3.5h.9c.9 0 1.4-.4 1.4-1.1 0-.6-.4-.9-1.1-.9h-.9l-.3 2zm3.8-3.5h1.1l-.3 1.3c.4-.9 1-1.4 1.8-1.4.2 0 .3 0 .5.1l-.2 1.1c-.2 0-.3-.1-.5-.1-.7 0-1.3.5-1.5 1.4l-.6 2.6h-1.1l1.5-6.5zm5.2 4.7c.3 0 .6-.1.8-.3l.1.4c.1.2.3.3.5.3h.8l.9-4c0-.1 0-.2 0-.3 0-.7-.6-1.1-1.6-1.1-.6 0-1.2.2-1.5.4l.2.8c.3-.2.8-.3 1.2-.3.5 0 .7.2.7.4 0 .1 0 .2-.1.3l-.1.1c-.2-.1-.4-.1-.7-.1-1 0-1.8.5-1.8 1.4 0 .7.5 1 1.1 1zm.3-.8c-.3 0-.5-.2-.5-.4 0-.4.3-.7.9-.7.2 0 .4 0 .5.1 0 .5-.5.9-1 .9zm2.8-6.9l-.4 1.8h1l-.2.8h-1l-.6 2.7c0 .2-.1.3-.1.4 0 .2.1.3.3.3.2 0 .3 0 .5-.1l-.2.8c-.2.1-.4.1-.7.1-.6 0-1-.3-1-.9 0-.1 0-.3.1-.4l.6-2.9h-.7l.2-.8h.7l.4-1.8h1.1z" fill="#fff"/>
                    </svg>
                    {/* Apple Pay */}
                    <svg style={{ height: '4px' }} viewBox="0 0 48 15" fill="none">
                      <rect width="48" height="15" rx="1.5" fill="#000"/>
                      <path d="M16.5 7.8c0-.9.8-1.5 2.2-1.6-.1-.4-.5-.7-1-.7-.5 0-.9.2-1.1.6l-.8-.4c.3-.6.9-1 1.9-1 1.2 0 2 .7 2 1.8v3h-.9v-.6c-.3.4-.8.7-1.5.7-1 0-1.8-.5-1.8-1.4 0-.9.8-1.4 1.8-1.4.5 0 1 .2 1.3.5v-.4c0-.6-.4-1-1.1-1-.5 0-.9.2-1.1.5l-.8-.4zm2.3 1.3c-.3-.2-.6-.3-1-.3-.6 0-1 .3-1 .7s.4.7 1 .7c.7 0 1.2-.4 1.2-.9v-.2h-.2zm4.4-4.3c.4-.5.9-.8 1.6-.8v1c-.1 0-.2 0-.3 0-.6 0-1.2.4-1.2 1.2v3.3h-1V4.8h1v.9zm4.3-.9c1.2 0 2.1.9 2.1 2.1s-.9 2.1-2.1 2.1-2.1-.9-2.1-2.1.9-2.1 2.1-2.1zm0 3.3c.6 0 1.1-.5 1.1-1.2s-.5-1.2-1.1-1.2-1.1.5-1.1 1.2.5 1.2 1.1 1.2z" fill="#fff"/>
                      <path d="M14.5 5.5c-.2-.3-.5-.4-.9-.4-.8 0-1.3.6-1.3 1.4 0 .8.5 1.4 1.3 1.4.4 0 .7-.1.9-.4v.4c0 .5-.4.8-.9.8-.4 0-.7-.2-.9-.5l-.7.5c.3.5.9.8 1.6.8 1 0 1.6-.6 1.6-1.6v-3h-.8v.4zm-.1 1c0 .5-.3.8-.8.8s-.8-.3-.8-.8.3-.8.8-.8.8.3.8.8z" fill="#fff"/>
                    </svg>
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
                <p>• Odesíláme ihned!!!</p>
                <p>• Možnost vrácení do 14ti dnů</p>
              </div>

              <div className="flex items-center justify-center gap-2 mb-6">
                {/* Visa */}
                <svg style={{ height: '4px' }} viewBox="0 0 48 15" fill="none">
                  <rect width="48" height="15" rx="1.5" fill="#000"/>
                  <path d="M19 11l1.5-6h2l-1.5 6h-2zm6-6l-1.8 4.2-.3-1.5-.8-3.7-.1-.4c-.1-.3-.4-.5-.8-.6h-3.1l-.1.4c.9.2 1.7.5 2.4.9l1.6 5.7h2.1l3.2-6h-2.1zm7.5 0c-.8 0-1.4.2-1.7.5l-.2 1c.4-.2.9-.4 1.5-.4.5 0 .9.1.9.4 0 .2-.1.3-.3.5l-1.2.6c-.9.4-1.3.9-1.3 1.5 0 1 .8 1.5 1.7 1.5.6 0 1.1-.2 1.4-.5l.1.4h1.8l1.1-3.7c0-.2.1-.4.1-.5 0-1-.8-1.3-2-1.3zm-1.1 3.7c0-.3.3-.5.8-.7l.6-.3c0 .4-.3.8-.5 1-.2.1-.4.2-.6.2-.2 0-.3-.1-.3-.2zm7.1-3.7c-.8 0-1.4.2-1.7.5l-.2 1c.4-.2.9-.4 1.5-.4.5 0 .9.1.9.4 0 .2-.1.3-.3.5l-1.2.6c-.9.4-1.3.9-1.3 1.5 0 1 .8 1.5 1.7 1.5.6 0 1.1-.2 1.4-.5l.1.4h1.8l1.1-3.7c0-.2.1-.4.1-.5 0-1-.8-1.3-2-1.3zm-1.1 3.7c0-.3.3-.5.8-.7l.6-.3c0 .4-.3.8-.5 1-.2.1-.4.2-.6.2-.2 0-.3-.1-.3-.2z" fill="#fff"/>
                </svg>
                {/* GoPay */}
                <svg style={{ height: '4px' }} viewBox="0 0 52 15" fill="none">
                  <rect width="52" height="15" rx="1.5" fill="#000"/>
                  <path d="M16 9c-.4.5-1 .7-1.7.7-1.2 0-2.1-.9-2.1-2.2 0-1.3.9-2.2 2.1-2.2.7 0 1.3.3 1.7.8V5h1.3v6h-1.3V9zm0-1.5c0-.7-.5-1.2-1.2-1.2s-1.2.5-1.2 1.2.5 1.2 1.2 1.2 1.2-.5 1.2-1.2zm7.3-2.2c-1.3 0-2.3 1-2.3 2.2s1 2.2 2.3 2.2c1.3 0 2.3-1 2.3-2.2s-1-2.2-2.3-2.2zm0 3.4c-.7 0-1.2-.5-1.2-1.2s.5-1.2 1.2-1.2 1.2.5 1.2 1.2-.5 1.2-1.2 1.2zm6.1-3.4c-.8 0-1.4.3-1.8.9v-.8h-1.3v6.3h1.3V9.1c.4.5 1 .8 1.8.8 1.2 0 2.1-.9 2.1-2.2 0-1.3-.9-2.2-2.1-2.2zm-.2 3.4c-.7 0-1.2-.5-1.2-1.2s.5-1.2 1.2-1.2 1.2.5 1.2 1.2-.5 1.2-1.2 1.2zm5-3.3c-.5 0-.9.2-1.2.5v-.4h-1.3v4.2h1.3V7.9c0-.6.4-1 .9-1h.3v-1.4h-.1zm4.5 3.3c-.2.1-.4.2-.6.2-.3 0-.5-.2-.5-.5v-2h1.1v-1h-1.1V4.8h-1.3v1.4h-.7v1h.7v2.3c0 1 .6 1.5 1.5 1.5.4 0 .8-.1 1.1-.3l-.2-1z" fill="#fff"/>
                </svg>
                {/* Mastercard */}
                <svg style={{ height: '4px' }} viewBox="0 0 48 15" fill="none">
                  <rect width="48" height="15" rx="1.5" fill="#000"/>
                  <circle cx="18" cy="7.5" r="5" fill="#fff"/>
                  <circle cx="30" cy="7.5" r="5" fill="#fff"/>
                  <path d="M24 4A6 6 0 0 0 24 11 6 6 0 0 0 24 4" fill="#000"/>
                </svg>
                {/* PayPal */}
                <svg style={{ height: '4px' }} viewBox="0 0 52 15" fill="none">
                  <rect width="52" height="15" rx="1.5" fill="#000"/>
                  <path d="M17.5 5.5h2.2c1.6 0 2.5.8 2.5 2 0 1.4-1 2.3-2.6 2.3h-1l-.5 2.2h-1.1l1.5-6.5zm1.3 3.5h.9c.9 0 1.4-.4 1.4-1.1 0-.6-.4-.9-1.1-.9h-.9l-.3 2zm3.8-3.5h1.1l-.3 1.3c.4-.9 1-1.4 1.8-1.4.2 0 .3 0 .5.1l-.2 1.1c-.2 0-.3-.1-.5-.1-.7 0-1.3.5-1.5 1.4l-.6 2.6h-1.1l1.5-6.5zm5.2 4.7c.3 0 .6-.1.8-.3l.1.4c.1.2.3.3.5.3h.8l.9-4c0-.1 0-.2 0-.3 0-.7-.6-1.1-1.6-1.1-.6 0-1.2.2-1.5.4l.2.8c.3-.2.8-.3 1.2-.3.5 0 .7.2.7.4 0 .1 0 .2-.1.3l-.1.1c-.2-.1-.4-.1-.7-.1-1 0-1.8.5-1.8 1.4 0 .7.5 1 1.1 1zm.3-.8c-.3 0-.5-.2-.5-.4 0-.4.3-.7.9-.7.2 0 .4 0 .5.1 0 .5-.5.9-1 .9zm2.8-6.9l-.4 1.8h1l-.2.8h-1l-.6 2.7c0 .2-.1.3-.1.4 0 .2.1.3.3.3.2 0 .3 0 .5-.1l-.2.8c-.2.1-.4.1-.7.1-.6 0-1-.3-1-.9 0-.1 0-.3.1-.4l.6-2.9h-.7l.2-.8h.7l.4-1.8h1.1z" fill="#fff"/>
                </svg>
                {/* Apple Pay */}
                <svg style={{ height: '4px' }} viewBox="0 0 48 15" fill="none">
                  <rect width="48" height="15" rx="1.5" fill="#000"/>
                  <path d="M16.5 7.8c0-.9.8-1.5 2.2-1.6-.1-.4-.5-.7-1-.7-.5 0-.9.2-1.1.6l-.8-.4c.3-.6.9-1 1.9-1 1.2 0 2 .7 2 1.8v3h-.9v-.6c-.3.4-.8.7-1.5.7-1 0-1.8-.5-1.8-1.4 0-.9.8-1.4 1.8-1.4.5 0 1 .2 1.3.5v-.4c0-.6-.4-1-1.1-1-.5 0-.9.2-1.1.5l-.8-.4zm2.3 1.3c-.3-.2-.6-.3-1-.3-.6 0-1 .3-1 .7s.4.7 1 .7c.7 0 1.2-.4 1.2-.9v-.2h-.2zm4.4-4.3c.4-.5.9-.8 1.6-.8v1c-.1 0-.2 0-.3 0-.6 0-1.2.4-1.2 1.2v3.3h-1V4.8h1v.9zm4.3-.9c1.2 0 2.1.9 2.1 2.1s-.9 2.1-2.1 2.1-2.1-.9-2.1-2.1.9-2.1 2.1-2.1zm0 3.3c.6 0 1.1-.5 1.1-1.2s-.5-1.2-1.1-1.2-1.1.5-1.1 1.2.5 1.2 1.1 1.2z" fill="#fff"/>
                  <path d="M14.5 5.5c-.2-.3-.5-.4-.9-.4-.8 0-1.3.6-1.3 1.4 0 .8.5 1.4 1.3 1.4.4 0 .7-.1.9-.4v.4c0 .5-.4.8-.9.8-.4 0-.7-.2-.9-.5l-.7.5c.3.5.9.8 1.6.8 1 0 1.6-.6 1.6-1.6v-3h-.8v.4zm-.1 1c0 .5-.3.8-.8.8s-.8-.3-.8-.8.3-.8.8-.8.8.3.8.8z" fill="#fff"/>
                </svg>
              </div>

              <Link
                href="/pokladna"
                onClick={onClose}
                className="block w-full bg-black text-white text-center text-xs uppercase tracking-tight py-4 hover:opacity-90 transition-opacity font-bold"
                style={{ borderRadius: '4px' }}
              >
                PŘEJÍT K POKLADNĚ · {total.toFixed(2)} Kč
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
