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
  const cartItemCount = items.length;

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const total = getTotal();

  if (!isHydrated) {
    return <div className="min-h-screen bg-white" />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center">
        <div style={{ width: '995px', padding: '32px 16px 32px 16px', borderBottom: '1px solid #000' }}>
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

        {/* Navigation Panel */}
        <div style={{
          width: '995px',
          height: '44px',
          borderBottom: '1px solid #000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          padding: '0 16px'
        }}>
          <Link
            href="/ulozeno"
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '19.6px',
              color: '#000',
              textDecoration: 'none',
              padding: '6px 12px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: 'transparent'
            }}
          >
            ULOŽENÉ POLOŽKY
          </Link>
          <div
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '19.6px',
              color: '#000',
              padding: '6px 12px',
              border: '1px solid #000',
              borderRadius: '8px',
              backgroundColor: '#fff'
            }}
          >
            KOŠÍK ({cartItemCount})
          </div>
        </div>

        <div style={{ width: '995px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <p style={{
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            marginBottom: '24px'
          }}>
            Váš košík je prázdný
          </p>
          <Link
            href="/"
            className="bg-black text-white uppercase px-8 py-3 hover:bg-gray-800 transition-colors"
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '12px',
              fontWeight: 400,
              letterSpacing: '0.5px',
              textDecoration: 'none'
            }}
          >
            POKRAČOVAT V NÁKUPU
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* Vertical lines at product edges (995px wide, centered in 50% container) */}
      <div style={{
        position: 'fixed',
        left: 'calc(50vw - 497.5px)',
        top: 0,
        bottom: 0,
        width: '1px',
        backgroundColor: '#000',
        zIndex: 5
      }} />
      <div style={{
        position: 'fixed',
        right: 'calc(50vw - 497.5px)',
        top: 0,
        bottom: 0,
        width: '1px',
        backgroundColor: '#000',
        zIndex: 5
      }} />

      <div style={{ width: '995px', margin: '0 auto', height: '226px', borderBottom: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
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

      {/* Navigation Panel */}
      <div style={{
        width: '995px',
        margin: '0 auto',
        height: '44px',
        borderBottom: '1px solid #000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        padding: '0 16px'
      }}>
        <div className="group" style={{ position: 'relative' }}>
          <Link
            href="/ulozeno"
            className="whitespace-nowrap uppercase tracking-tight font-normal text-sm"
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '14px',
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
            className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              inset: '-4px',
              border: '1px solid #000000',
              borderRadius: '4px'
            }}
          />
        </div>
        <div className="group" style={{ position: 'relative' }}>
          <div
            className="whitespace-nowrap uppercase tracking-tight font-normal text-sm"
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '14px',
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
            className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              inset: '-4px',
              border: '1px solid #000000',
              borderRadius: '4px'
            }}
          />
        </div>
      </div>

      <div className="flex-1 flex justify-center" style={{ paddingBottom: '80px' }}>
        <div style={{ width: '995px', position: 'relative' }}>
          {items.map((item, index) => (
            <div
              key={`${item.productId}-${item.size}`}
              style={{
                width: '995px',
                height: '270px',
                margin: '0 auto',
                borderTop: index === 0 ? '1px solid #000' : 'none',
                borderBottom: '1px solid #000',
                padding: '16px',
                paddingBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <Link href={`/produkty/${item.slug}`} style={{ flexShrink: 0 }}>
                  <div style={{
                    width: '160px',
                    height: '192px',
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

              </div>

              {/* Buttons section */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                paddingTop: '8px'
              }}>
                <button
                  onClick={() => {
                    // TODO: Add to saved products
                  }}
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
                  Uložit na později
                </button>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end' }}>
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
                      textAlign: 'right'
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
