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
                right: '28px',
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
              <>
                <div className="flex flex-col items-center px-6" style={{ paddingTop: '98px' }}>
                  <p 
                    style={{
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '14px',
                      textAlign: 'center',
                      marginBottom: '24px'
                    }}
                  >
                    Váš košík je prázdný
                  </p>
                  <SavedItemsButton onClose={onClose} />
                </div>
                <div className="border-b border-black" style={{ marginTop: '72px' }} />
                <div className="text-center" style={{ marginTop: '84px' }}>
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
                <div className="border-b border-black" style={{ marginTop: '256px' }} />
                <div className="px-6" style={{ marginTop: '24px' }}>
                  <div className="space-y-2 mb-6" style={{ 
                    fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '19.6px'
                  }}>
                    <p>• 30 dní free vrácení</p>
                    <p>• 30 dní free online výměna</p>
                    <p>• Nálepky v každé objednávce</p>
                  </div>
                  <div className="flex items-center justify-center" style={{ gap: '4px' }}>
                    <svg className="h-3" viewBox="0 0 38 24" fill="none">
                      <rect width="38" height="24" rx="2" fill="#000000"/>
                      <path d="M15.258 18.126h2.484l1.554-9.588h-2.484l-1.554 9.588z" fill="#fff"/>
                    </svg>
                    <svg className="h-3" viewBox="0 0 38 24" fill="none">
                      <rect width="38" height="24" rx="2" fill="#000000"/>
                      <circle cx="14.5" cy="12" r="6" fill="#fff"/>
                      <circle cx="23.5" cy="12" r="6" fill="#fff"/>
                      <path d="M19 7.5 A 6 6 0 0 1 19 16.5 A 6 6 0 0 1 19 7.5" fill="#000"/>
                    </svg>
                    <svg className="h-3" viewBox="0 0 38 24" fill="none">
                      <rect width="38" height="24" rx="2" fill="#000000"/>
                      <text x="19" y="16" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Arial">PayPal</text>
                    </svg>
                    <svg className="h-3" viewBox="0 0 38 24" fill="none">
                      <rect width="38" height="24" rx="2" fill="#000000"/>
                      <text x="19" y="16" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Arial">GP</text>
                    </svg>
                    <svg className="h-3" viewBox="0 0 38 24" fill="none">
                      <rect width="38" height="24" rx="2" fill="#000000"/>
                      <circle cx="19" cy="12" r="5" fill="#fff"/>
                    </svg>
                  </div>
                </div>
              </>
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
                      
                      <p className="mb-3 font-medium">{item.price} €</p>

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
                        <p className="text-xs font-medium">{product.price} €</p>
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
                <p>• Complimentary 2-4 days shipping</p>
                <p>• 30 days free return</p>
                <p>• 30 days free online exchange</p>
                <p>• UFO SPORT signature packaging</p>
              </div>

              <div className="flex items-center gap-1.5 mb-6">
                <svg className="h-2.5" viewBox="0 0 38 24" fill="none">
                  <rect width="38" height="24" rx="2" fill="#1A1F71"/>
                  <path d="M15.258 18.126h2.484l1.554-9.588h-2.484l-1.554 9.588z" fill="#fff"/>
                </svg>
                <svg className="h-2.5" viewBox="0 0 38 24" fill="none">
                  <rect width="38" height="24" rx="2" fill="#EB001B"/>
                  <circle cx="14.5" cy="12" r="7" fill="#FF5F00"/>
                  <circle cx="23.5" cy="12" r="7" fill="#F79E1B"/>
                </svg>
                <svg className="h-2.5" viewBox="0 0 38 24" fill="none">
                  <rect width="38" height="24" rx="2" fill="#0066B2"/>
                </svg>
                <svg className="h-2.5" viewBox="0 0 38 24" fill="none">
                  <rect width="38" height="24" rx="2" fill="#00457C"/>
                </svg>
              </div>

              <Link
                href="/pokladna"
                onClick={onClose}
                className="block w-full bg-black text-white text-center text-xs uppercase tracking-tight py-4 hover:opacity-90 transition-opacity font-bold"
              >
                Checkout · {total.toFixed(2)} €
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
