'use client';

import { useCartStore } from '@/lib/cart-store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import AnimatedButton from '@/components/AnimatedButton';

export default function CartPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
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
    <div className="min-h-screen bg-white flex flex-col">
      <div className="border-b border-black">
        <div className="mx-auto px-4 py-8" style={{ width: '33.333%', minWidth: '400px', maxWidth: '600px' }}>
          <h1 className="text-center uppercase" style={{
            fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '16px',
            fontWeight: 700,
            letterSpacing: '0.05em'
          }}>
            NÁKUPNÍ KOŠÍK
          </h1>
        </div>
      </div>

      <div className="flex-1 flex justify-center" style={{ paddingBottom: '80px' }}>
        <div style={{ width: '33.333%', minWidth: '400px', maxWidth: '600px' }}>
          {items.map((item, index) => (
            <div
              key={`${item.productId}-${item.size}`}
              style={{
                borderRight: '1px solid #000',
                borderLeft: '1px solid #000',
                borderBottom: index === items.length - 1 ? '1px solid #000' : 'none',
                borderTop: index === 0 ? '1px solid #000' : 'none',
                padding: '16px'
              }}
            >
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <Link href={`/produkty/${item.slug}`} style={{ flexShrink: 0 }}>
                  <div style={{
                    width: '80px',
                    height: '96px',
                    border: '1px solid #000',
                    backgroundColor: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
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
                    style={{ textDecoration: 'none', color: '#000' }}
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
                      color: '#000'
                    }}>
                      {item.name}
                    </h3>
                  </Link>
                  
                  <p style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '19.6px',
                    color: '#000',
                    marginBottom: '8px'
                  }}>
                    {item.price} Kč
                  </p>

                  <p style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '17.6px',
                    color: '#000',
                    marginBottom: '4px'
                  }}>
                    Barva: {item.color}
                  </p>

                  <p style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '17.6px',
                    color: '#000',
                    marginBottom: '8px'
                  }}>
                    Velikost: {item.size}
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '17.6px',
                      color: '#000'
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
                        color: '#000'
                      }}
                      className="hover:opacity-60 transition-opacity"
                    >
                      −
                    </button>
                    <span style={{
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '17.6px',
                      color: '#000'
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
                        color: '#000'
                      }}
                      className="hover:opacity-60 transition-opacity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId, item.size)}
                    style={{
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#000',
                      textDecoration: 'underline',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      textAlign: 'left'
                    }}
                    className="hover:opacity-60 transition-opacity"
                  >
                    Smazat
                  </button>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{
                    fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#000'
                  }}>
                    {item.price * item.quantity} Kč
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Footer with Checkout Button */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTop: '1px solid #000',
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '12px'
        }}>
          <div style={{ width: '33.333%', minWidth: '400px', maxWidth: '600px' }}>
            <AnimatedButton
              text={`PŘEJÍT K POKLADNĚ (${items.length})`}
              onClick={() => router.push('/pokladna')}
              type="button"
              style={{
                width: '100%',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '12px',
                fontWeight: 400,
                padding: '12px',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
