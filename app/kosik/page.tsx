'use client';

import { useCartStore, useCartHydration } from '@/lib/cart-store';
import { useSavedProductsStore } from '@/lib/saved-products-store';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import CartLineItem from '@/components/CartLineItem';
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
  const hasHydrated = useCartHydration();
  const [savingItem, setSavingItem] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemData, setDeleteItemData] = useState<{ productId: string; productName: string; size: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { items, updateQuantity, removeItem, getTotal, getItemCount } = useCartStore();
  const { addProduct } = useSavedProductsStore();
  const cartItemCount = getItemCount();
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

  const total = getTotal();

  if (!hasHydrated) {
    return <div className="min-h-screen bg-white" />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col relative">
        {/* Vertical lines at product edges (995px wide, centered) - hidden on mobile */}
        <div className="hidden md:block" style={{
          position: 'fixed',
          left: '50%',
          marginLeft: '-497.5px',
          top: 0,
          bottom: 0,
          width: '1px',
          backgroundColor: '#000',
          zIndex: 5
        }} />
        <div className="hidden md:block" style={{
          position: 'fixed',
          left: '50%',
          marginLeft: '497.5px',
          top: 0,
          bottom: 0,
          width: '1px',
          backgroundColor: '#000',
          zIndex: 5
        }} />

        {/* Header - same as when products exist */}
        <div className="w-full md:w-[995px]" style={{ position: 'relative', margin: '0 auto', height: '226px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
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
        <div className="w-full md:w-[995px]" style={{
          position: 'relative',
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
      {/* Vertical lines at product edges (995px wide, centered in 50% container) - hidden on mobile */}
      <div className="hidden md:block" style={{
        position: 'fixed',
        left: '50%',
        marginLeft: '-497.5px',
        top: 0,
        bottom: 0,
        width: '1px',
        backgroundColor: '#000',
        zIndex: 5
      }} />
      <div className="hidden md:block" style={{
        position: 'fixed',
        left: '50%',
        marginLeft: '497.5px',
        top: 0,
        bottom: 0,
        width: '1px',
        backgroundColor: '#000',
        zIndex: 5
      }} />

      {/* Header - border handled by navigation panel */}
      <div className="w-full md:w-[995px]" style={{ position: 'relative', margin: '0 auto', height: '226px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
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
      <div className="w-full md:w-[995px]" style={{
        position: 'relative',
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
        <div className="w-full md:w-[995px]" style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          height: '1px',
          backgroundColor: '#000',
          zIndex: 1
        }} />
        
        {/* Bottom border - 995px wide to extend to vertical lines */}
        <div className="w-full md:w-[995px]" style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
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
        <div className="w-full md:w-[995px]" style={{ position: 'relative' }}>
          {items.map((item, index) => (
            <CartLineItem
              key={`${item.productId}-${item.size}`}
              productId={item.productId}
              name={item.name}
              price={item.price}
              image={item.image}
              slug={item.slug}
              color={item.color}
              size={item.size}
              quantity={item.quantity}
              category={item.category}
              layout="page"
              isFirstItem={index === 0}
              isSavingForLater={savingItem === item.productId}
              onUpdateQuantity={updateQuantity}
              onRemove={handleOpenDeleteModal}
              onSaveForLater={() => handleSaveForLater(item)}
            />
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
        zIndex: 10,
        padding: '0 16px',
        height: '40px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <AnimatedButton
          text={`PŘEJÍT K POKLADNĚ (${cartItemCount})`}
          onClick={() => router.push('/pokladna')}
          type="button"
          style={{
            width: '100%',
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '12px',
            fontWeight: 300,
            padding: '0',
            textTransform: 'uppercase',
            cursor: 'pointer',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            borderRadius: '0',
            backgroundColor: '#fff'
          }}
        />
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
