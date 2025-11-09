'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart-store';
import { useSavedProductsStore } from '@/lib/saved-products-store';
import { useSession } from 'next-auth/react';
import SavedProductsWindow from './SavedProductsWindow';
import CartDrawer from './CartDrawer';
import Header2 from './Header2';

const categories = [
  { name: 'VOODOO808', slug: 'voodoo808', font: 'BB-CondBold, "Helvetica Neue", Helvetica, Arial, sans-serif' },
  { name: 'SPACE LOVE', slug: 'space-love', font: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
  { name: 'RECREATION WELLNESS', slug: 'recreation-wellness', font: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
  { name: 'T SHIRT GALLERY', slug: 't-shirt-gallery', font: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif' },
];

export default function Header1() {
  const { data: session } = useSession();
  const cartCount = useCartStore((state) => state.getItemCount());
  const savedCount = useSavedProductsStore((state) => state.getCount());
  const isLoggedIn = !!session;
  const [showSavedWindow, setShowSavedWindow] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      <header className="h-header border-b border-black bg-white fixed top-0 left-0 right-0 z-30">
        <div className="h-full max-w-container mx-auto grid grid-cols-3 items-center relative">
          <nav className={`flex justify-start transition-opacity duration-300 ${showSearch ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ gap: '20px', paddingLeft: '20px' }}>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/kategorie/${category.slug}`}
                className="hover:opacity-70 transition-opacity whitespace-nowrap"
                style={{
                  fontFamily: category.font,
                  fontSize: '12px',
                  lineHeight: '15.6px',
                  color: 'rgb(0, 0, 0)',
                  padding: '0px 8px',
                  margin: '0px',
                  textDecoration: 'none',
                  textTransform: 'none',
                  letterSpacing: '0.36px',
                  wordSpacing: '0px'
                }}
              >
                {category.name}
              </Link>
            ))}
          </nav>

          <Link href="/" className="uppercase text-center whitespace-nowrap" style={{ 
            fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '22px',
            fontWeight: 700,
            lineHeight: '22px',
            letterSpacing: '0.03em',
            fontStretch: 'condensed'
          }}>
            UFO SPORT
          </Link>

          <div className="flex items-center justify-end" style={{ gap: '20px', paddingRight: '32px' }}>
            <div className={`flex items-center transition-opacity duration-300 ${showSearch ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ gap: '20px' }}>
              <Link
                href={isLoggedIn ? "/ucet" : "/prihlaseni"}
                className="hover:opacity-70 transition-opacity whitespace-nowrap"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '12px',
                  lineHeight: '15.6px',
                  color: 'rgb(0, 0, 0)',
                  padding: '0px 8px',
                  margin: '0px',
                  marginRight: '20px',
                  textDecoration: 'none',
                  textTransform: 'none',
                  letterSpacing: '0.36px',
                  wordSpacing: '0px'
                }}
              >
                {isLoggedIn ? "Účet" : "PŘIHLÁSIT SE"}
              </Link>

              <button 
                onClick={() => setShowSavedWindow(true)}
                className="relative hover:opacity-70 transition-opacity"
                aria-label="Saved"
                style={{ width: '22px', height: '22px', marginRight: '22px' }}
              >
                <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {savedCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full">
                    {savedCount}
                  </span>
                )}
              </button>

              <button 
                onClick={() => setShowSearch(!showSearch)}
                className="relative hover:opacity-70 transition-opacity"
                aria-label="Search"
                style={{ width: '22px', height: '22px', marginRight: '220px' }}
              >
                <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              <button 
                onClick={() => setShowCartDrawer(true)}
                className="relative hover:opacity-70 transition-opacity"
                aria-label="Cart"
                style={{ width: '22px', height: '22px', marginRight: '200px' }}
              >
                <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <button 
            onClick={() => setShowSearch(false)}
            className={`absolute hover:opacity-70 transition-opacity ${showSearch ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            aria-label="Close Search"
            style={{ 
              width: '22px', 
              height: '22px',
              top: '50%',
              right: '32px',
              transform: 'translateY(-50%)',
              padding: '0'
            }}
          >
            <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <SavedProductsWindow 
          isOpen={showSavedWindow}
          onClose={() => setShowSavedWindow(false)}
        />
        <CartDrawer 
          isOpen={showCartDrawer}
          onClose={() => setShowCartDrawer(false)}
        />
      </header>

      <Header2 isOpen={showSearch} onClose={() => setShowSearch(false)} />
      
      {/* Dark overlay when search is open */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 pointer-events-none`}
        style={{ 
          top: '88px',
          opacity: showSearch ? 0.5 : 0,
          zIndex: 10
        }}
      />
    </>
  );
}
