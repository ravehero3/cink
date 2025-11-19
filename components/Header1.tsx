'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart-store';
import { useSavedProductsStore } from '@/lib/saved-products-store';
import { useSearchBarStore } from '@/lib/search-bar-store';
import { useSession } from 'next-auth/react';
import CartDrawer from './CartDrawer';
import Header2 from './Header2';

const categories = [
  { name: 'VOODOO808', slug: 'voodoo808' },
  { name: 'SPACE LOVE', slug: 'space-love' },
  { name: 'RECREATION WELLNESS', slug: 'recreation-wellness' },
  { name: 'T SHIRT GALLERY', slug: 't-shirt-gallery' },
];

export default function Header1() {
  const { data: session } = useSession();
  const cartCount = useCartStore((state) => state.getItemCount());
  const savedCount = useSavedProductsStore((state) => state.getCount());
  const { showSearchIcon, openSearchBar } = useSearchBarStore();
  const isLoggedIn = !!session;
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      <header className="h-header border-b border-black bg-white fixed top-0 left-0 right-0 z-30">
        <div className="h-full max-w-container mx-auto flex items-center justify-between relative">
          {/* Left Group: Category Navigation - VOODOO808 moved 80px to left */}
          <nav className={`flex items-center transition-opacity duration-300 ${showSearch ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ gap: '20px', paddingLeft: '20px' }}>
            {categories.map((category, index) => (
              <Link
                key={category.slug}
                href={`/kategorie/${category.slug}`}
                className="hover:opacity-70 transition-opacity whitespace-nowrap uppercase tracking-tight font-normal text-sm"
                style={{
                  color: 'rgb(0, 0, 0)',
                  textDecoration: 'none',
                  marginLeft: index === 0 ? '-80px' : '0'
                }}
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Center: Logo - Exact center */}
          <Link 
            href="/" 
            className="uppercase whitespace-nowrap absolute left-1/2 transform -translate-x-1/2" 
            style={{ 
              fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '22px',
              fontWeight: 700,
              lineHeight: '22px',
              letterSpacing: '0.03em',
              fontStretch: 'condensed'
            }}
          >
            UFO SPORT
          </Link>

          {/* Right Group: Login and Icons - 20px from right, 20px gap between items */}
          <div className="flex items-center" style={{ gap: '20px', paddingRight: '20px' }}>
            <div className={`flex items-center transition-opacity duration-300 ${showSearch ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ gap: '20px' }}>
              <Link
                href={isLoggedIn ? "/ucet" : "/prihlaseni"}
                className="hover:opacity-70 transition-opacity whitespace-nowrap uppercase tracking-tight font-normal text-sm"
                style={{
                  color: 'rgb(0, 0, 0)',
                  textDecoration: 'none'
                }}
              >
                {isLoggedIn ? "Účet" : "PŘIHLÁSIT SE"}
              </Link>

              {session?.user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="hover:opacity-70 transition-opacity whitespace-nowrap uppercase tracking-tight font-normal text-sm"
                  style={{
                    color: 'rgb(0, 0, 0)',
                    textDecoration: 'none'
                  }}
                >
                  SPRÁVCE ESHOPU
                </Link>
              )}

              <Link 
                href="/ulozeno"
                className="relative hover:opacity-70 transition-opacity"
                aria-label="Saved"
                style={{ width: '22px', height: '22px' }}
              >
                <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {savedCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full">
                    {savedCount}
                  </span>
                )}
              </Link>

              {/* Show category search icon when category search bar is hidden, otherwise show global search */}
              {showSearchIcon ? (
                <button 
                  onClick={openSearchBar}
                  className="relative hover:opacity-70 transition-opacity"
                  aria-label="Open Category Search"
                  style={{ width: '22px', height: '22px' }}
                >
                  <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              ) : (
                <button 
                  onClick={() => setShowSearch(!showSearch)}
                  className="relative hover:opacity-70 transition-opacity"
                  aria-label="Search"
                  style={{ width: '22px', height: '22px' }}
                >
                  <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}

              <button 
                onClick={() => setShowCartDrawer(true)}
                className="relative hover:opacity-70 transition-opacity"
                aria-label="Cart"
                style={{ width: '22px', height: '22px', marginRight: '80px' }}
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

          {/* Close Search Button */}
          <button 
            onClick={() => setShowSearch(false)}
            className={`absolute hover:opacity-70 transition-opacity ${showSearch ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            aria-label="Close Search"
            style={{ 
              width: '22px', 
              height: '22px',
              top: '50%',
              right: '20px',
              transform: 'translateY(-50%)',
              padding: '0'
            }}
          >
            <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
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
