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
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* Vertical lines at 25% and 75% */}
      <div style={{
        position: 'fixed',
        left: '25%',
        top: 0,
        bottom: 0,
        width: '1px',
        backgroundColor: '#000',
        zIndex: 5
      }} />
      <div style={{
        position: 'fixed',
        right: '25%',
        top: 0,
        bottom: 0,
        width: '1px',
        backgroundColor: '#000',
        zIndex: 5
      }} />

      <div className="flex justify-center">
        <div className="mx-auto px-4 py-8" style={{ width: '50%', borderBottom: '1px solid #000' }}>
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
        <div style={{ width: '50%', position: 'relative' }}>
          {items.map((item, index) => (
            <div
              key={`${item.productId}-${item.size}`}
              style={{
                borderTop: index === 0 ? '1px solid #000' : 'none',
                borderBottom: '1px solid #000',
                padding: '16px',
                paddingBottom: '16px'
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

              {/* Buttons section */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                paddingTop: '8px'
              }}>
                <button
                  onClick={() => removeItem(item.productId, item.size)}
                  style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '19.6px',
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
                <Link
                  href={`/produkty/${item.slug}`}
                  style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '19.6px',
                    color: '#000',
                    textDecoration: 'underline'
                  }}
                  className="hover:opacity-60 transition-opacity"
                >
                  Upravit
                </Link>
              </div>

              {/* Horizontal line at bottom */}
              {index === items.length - 1 && (
                <div style={{
                  marginTop: '16px',
                  borderBottom: '1px solid #000'
                }} />
              )}
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
          <div style={{ width: '50%' }}>
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
