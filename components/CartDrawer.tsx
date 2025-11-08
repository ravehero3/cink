'use client';

import type { MouseEvent } from 'react';
import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/cart-store';
import { useRecentlyViewedStore } from '@/lib/recently-viewed-store';
import { X } from 'lucide-react';

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
        className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="border-b border-black px-6 py-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium uppercase tracking-wide">Cart</h2>
              <button
                onClick={onClose}
                className="p-1 hover:opacity-60 transition-opacity"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-6 py-8">
                <p className="text-sm mb-8">Your cart is empty.</p>
              </div>
            ) : (
              <div className="px-6 py-6">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}`}
                    className="flex gap-4 mb-6 pb-6 border-b border-gray-200 last:border-0"
                  >
                    <Link
                      href={`/produkty/${item.slug}`}
                      onClick={onClose}
                      className="flex-shrink-0"
                    >
                      <div className="w-24 h-32 relative bg-gray-100">
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
                        <h3 className="font-medium uppercase tracking-wide mb-1">
                          {item.name}
                        </h3>
                      </Link>
                      
                      <p className="text-xs mb-2 text-gray-600">
                        Size: {item.size} | Color: {item.color}
                      </p>
                      
                      <p className="mb-3">{item.price} €</p>

                      <div className="mt-auto flex items-center gap-3">
                        <div className="flex items-center border border-black">
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-gray-100 transition-colors text-xs"
                          >
                            −
                          </button>
                          <span className="px-3 py-1 border-x border-black min-w-[40px] text-center text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-gray-100 transition-colors text-xs"
                          >
                            +
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.productId, item.size)}
                          className="text-xs hover:opacity-60 transition-opacity underline"
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
                <h3 className="text-xs font-medium uppercase tracking-wide mb-4">
                  Recently Viewed
                </h3>
                <div className="space-y-4">
                  {recentlyViewed.map((product) => (
                    <Link
                      key={product.id}
                      href={`/produkty/${product.slug}`}
                      onClick={onClose}
                      className="flex gap-3 hover:opacity-60 transition-opacity"
                    >
                      <div className="w-20 h-24 relative bg-gray-100 flex-shrink-0">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-medium uppercase tracking-wide mb-1 line-clamp-2">
                          {product.name}
                        </h4>
                        <p className="text-xs">{product.price} €</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-black px-6 py-6">
              <div className="mb-4 space-y-2 text-xs">
                <p>• Complimentary 2-4 days shipping</p>
                <p>• 30 days free return</p>
                <p>• 30 days free online exchange</p>
                <p>• UFO SPORT signature packaging</p>
              </div>

              <div className="flex items-center gap-2 mb-6">
                <svg className="h-4" viewBox="0 0 38 24" fill="none">
                  <rect width="38" height="24" rx="2" fill="#1A1F71"/>
                  <path d="M15.258 18.126h2.484l1.554-9.588h-2.484l-1.554 9.588z" fill="#fff"/>
                </svg>
                <svg className="h-4" viewBox="0 0 38 24" fill="none">
                  <rect width="38" height="24" rx="2" fill="#EB001B"/>
                  <circle cx="14.5" cy="12" r="7" fill="#FF5F00"/>
                  <circle cx="23.5" cy="12" r="7" fill="#F79E1B"/>
                </svg>
                <svg className="h-4" viewBox="0 0 38 24" fill="none">
                  <rect width="38" height="24" rx="2" fill="#0066B2"/>
                </svg>
                <svg className="h-4" viewBox="0 0 38 24" fill="none">
                  <rect width="38" height="24" rx="2" fill="#00457C"/>
                </svg>
              </div>

              <Link
                href="/pokladna"
                onClick={onClose}
                className="block w-full bg-black text-white text-center text-xs uppercase tracking-wide py-4 hover:opacity-90 transition-opacity"
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
