'use client';

import { useCartStore } from '@/lib/cart-store';
import { useSavedProductsStore } from '@/lib/saved-products-store';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import AnimatedButton from '@/components/AnimatedButton';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

function AnimatedLink({ href, text }: { href: string; text: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      className="relative overflow-hidden bg-white text-black font-normal uppercase tracking-tight transition-all border border-black text-sm"
      style={{ borderRadius: '4px', padding: '11.8px 25.6px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        className="block transition-all duration-200"
        style={{
          transform: isHovered ? 'translateY(-150%)' : 'translateY(0)',
          opacity: isHovered ? 0 : 1,
        }}
      >
        {text}
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-200"
        style={{
          transform: isHovered ? 'translateY(0)' : 'translateY(150%)',
          opacity: isHovered ? 1 : 0,
        }}
      >
        {text}
      </span>
    </Link>
  );
}

export default function CartPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [savingItem, setSavingItem] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemData, setDeleteItemData] = useState<{ productId: string; productName: string; size: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();
  const { addProduct } = useSavedProductsStore();
  const cartItemCount = items.length;
  const isKosik = pathname === '/kosik';

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

  const handleSaveForLater = async (item: typeof items[0]) => {
    setSavingItem(item.productId);
    try {
      addProduct(item.productId);
      
      if (session?.user) {
        await fetch('/api/saved-products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: item.productId }),
        });
      }
      
      removeItem(item.productId, item.size);
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setSavingItem(null);
    }
  };

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const total = getTotal();

  if (!isHydrated) {
    return <div className="min-h-screen bg-white" />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col relative">
        {/* Vertical lines at product edges (995px wide, centered) */}
        <div style={{
          position: 'absolute',
          left: 'calc(50vw - 497.5px)',
          top: 0,
          bottom: 0,
          width: '1px',
          backgroundColor: '#000',
          zIndex: 5
        }} />
        <div style={{
          position: 'absolute',
          right: 'calc(50vw - 497.5px)',
          top: 0,
          bottom: 0,
          width: '1px',
          backgroundColor: '#000',
          zIndex: 5
        }} />

        {/* Header - same as when products exist */}
        <div style={{ position: 'relative', width: '995px', margin: '0 auto', height: '226px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
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

        {/* Navigation Panel - with 995px wide top and bottom borders */}
        <div style={{
          position: 'relative',
          width: '995px',
          margin: '0 auto',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          padding: '0 16px',
          overflow: 'visible',
          zIndex: 10
        }}>
          {/* Top border - 995px wide to extend to vertical lines */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 'calc(50% - 497.5px)',
            width: '995px',
            height: '1px',
            backgroundColor: '#000',
            zIndex: 1
          }} />
          
          {/* Bottom border - 995px wide to extend to vertical lines */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 'calc(50% - 497.5px)',
            width: '995px',
            height: '1px',
            backgroundColor: '#000',
            zIndex: 1
          }} />
          
          <div className="group" style={{ position: 'relative', zIndex: 2 }}>
            <Link
              href="/ulozeno"
              className="whitespace-nowrap uppercase tracking-tight font-normal text-sm"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '12px',
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
              className="absolute pointer-events-none"
              style={{
                inset: '-4px',
                border: '1px solid #000000',
                borderRadius: '4px',
                opacity: 0
              }}
            />
          </div>
          <div className="group" style={{ position: 'relative', zIndex: 2 }}>
            <div
              className="whitespace-nowrap uppercase tracking-tight font-normal text-sm"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '12px',
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
              className="absolute pointer-events-none"
              style={{
                inset: '-4px',
                border: '1px solid #000000',
                borderRadius: '4px',
                opacity: 1
              }}
            />
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <div style={{ width: '995px', position: 'relative' }}>
            <div className="flex flex-col items-center justify-center px-8 text-center" style={{ minHeight: '300px' }}>
              <p style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                marginBottom: '24px'
              }}>
                Váš košík je prázdný
              </p>
              <AnimatedLink href="/" text="POKRAČOVAT V NÁKUPU" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* Vertical lines at product edges (995px wide, centered in 50% container) - end at footer */}
      <div style={{
        position: 'absolute',
        left: 'calc(50vw - 497.5px)',
        top: 0,
        bottom: 0,
        width: '1px',
        backgroundColor: '#000',
        zIndex: 5
      }} />
      <div style={{
        position: 'absolute',
        right: 'calc(50vw - 497.5px)',
        top: 0,
        bottom: 0,
        width: '1px',
        backgroundColor: '#000',
        zIndex: 5
      }} />

      {/* Header - border handled by navigation panel */}
      <div style={{ position: 'relative', width: '995px', margin: '0 auto', height: '226px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
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

      {/* Navigation Panel - with 700px wide top and bottom borders */}
      <div style={{
        position: 'relative',
        width: '995px',
        margin: '0 auto',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        padding: '0 16px',
        overflow: 'visible',
        zIndex: 10
      }}>
        {/* Top border - 995px wide to extend to vertical lines */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 'calc(50% - 497.5px)',
          width: '995px',
          height: '1px',
          backgroundColor: '#000',
          zIndex: 1
        }} />
        
        {/* Bottom border - 995px wide to extend to vertical lines */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 'calc(50% - 497.5px)',
          width: '995px',
          height: '1px',
          backgroundColor: '#000',
          zIndex: 1
        }} />
        <div className="group" style={{ position: 'relative', zIndex: 2 }}>
          <Link
            href="/ulozeno"
            className="whitespace-nowrap uppercase tracking-tight font-normal text-sm"
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '12px',
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
            className="absolute pointer-events-none"
            style={{
              inset: '-4px',
              border: '1px solid #000000',
              borderRadius: '4px',
              opacity: isKosik ? 0 : 1
            }}
          />
        </div>
        <div className="group" style={{ position: 'relative', zIndex: 2 }}>
          <div
            className="whitespace-nowrap uppercase tracking-tight font-normal text-sm"
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '12px',
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
            className="absolute pointer-events-none"
            style={{
              inset: '-4px',
              border: '1px solid #000000',
              borderRadius: '4px',
              opacity: isKosik ? 1 : 0
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
                  onClick={() => handleSaveForLater(item)}
                  disabled={savingItem === item.productId}
                  style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '19.6px',
                    color: '#000',
                    textDecoration: 'underline',
                    border: 'none',
                    background: 'none',
                    cursor: savingItem === item.productId ? 'not-allowed' : 'pointer',
                    padding: 0,
                    textAlign: 'left',
                    opacity: savingItem === item.productId ? 0.6 : 1
                  }}
                  className="hover:opacity-60 transition-opacity"
                >
                  {savingItem === item.productId ? 'Ukládám...' : 'Uložit na později'}
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
                    onClick={() => handleOpenDeleteModal(item.productId, item.name, item.size)}
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

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        productName={deleteItemData?.productName || ''}
        productSize={deleteItemData?.size || ''}
      />
    </div>
  );
}
