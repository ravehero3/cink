'use client';

import { useCartStore } from '@/lib/cart-store';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const total = getTotal();

  if (!isHydrated) {
    return <div className="min-h-screen bg-white" />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-black">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-title font-bold text-center uppercase">NÁKUPNÍ KOŠÍK</h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-body mb-8">Váš košík je prázdný</p>
          <Link
            href="/"
            className="inline-block bg-black text-white px-8 py-3 text-body uppercase border border-black hover:bg-white hover:text-black transition-colors"
          >
            POKRAČOVAT V NÁKUPU
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-black">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-title font-bold text-center uppercase">NÁKUPNÍ KOŠÍK</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="border border-black">
              {items.map((item, index) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  className={`p-6 ${index !== 0 ? 'border-t border-black' : ''}`}
                >
                  <div className="flex gap-6">
                    <Link href={`/produkty/${item.slug}`} className="flex-shrink-0">
                      <div className="w-20 h-20 border border-black flex items-center justify-center overflow-hidden bg-white">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="object-contain w-full h-full p-1"
                        />
                      </div>
                    </Link>

                    <div className="flex-1">
                      <Link href={`/produkty/${item.slug}`}>
                        <h3 className="text-product-name font-bold mb-2 hover:underline">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-body mb-2">Velikost: {item.size}</p>
                      <p className="text-body mb-2">Barva: {item.color}</p>
                      <p className="text-body font-bold mb-4">{item.price} Kč</p>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-black">
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                            className="px-3 py-1 text-body hover:bg-black hover:text-white transition-colors"
                          >
                            −
                          </button>
                          <span className="px-4 py-1 text-body border-x border-black">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                            className="px-3 py-1 text-body hover:bg-black hover:text-white transition-colors"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.productId, item.size)}
                          className="text-body underline hover:no-underline"
                        >
                          ODSTRANIT
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-product-name font-bold">
                        {item.price * item.quantity} Kč
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="border border-black p-6 sticky top-24">
              <h2 className="text-header font-bold mb-6 uppercase">SOUHRN OBJEDNÁVKY</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-body">
                  <span>Mezisoučet</span>
                  <span>{total} Kč</span>
                </div>
                <div className="flex justify-between text-body">
                  <span>Doprava</span>
                  <span>Vypočítáno při pokladně</span>
                </div>
                <div className="border-t border-black pt-4">
                  <div className="flex justify-between text-product-name font-bold">
                    <span>CELKEM</span>
                    <span>{total} Kč</span>
                  </div>
                </div>
              </div>

              <Link
                href="/pokladna"
                className="block w-full bg-black text-white text-center py-3 text-body uppercase border border-black hover:bg-white hover:text-black transition-colors"
              >
                POKRAČOVAT K POKLADNĚ
              </Link>

              <Link
                href="/"
                className="block w-full text-center py-3 text-body uppercase underline hover:no-underline mt-4"
              >
                POKRAČOVAT V NÁKUPU
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
