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
  { name: 'VOODOO808', slug: 'voodoo808' },
  { name: 'SPACE LOVE', slug: 'space-love' },
  { name: 'RECREATION WELLNESS', slug: 'recreation-wellness' },
  { name: 'T SHIRT GALLERY', slug: 't-shirt-gallery' },
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
        <div className="h-full max-w-container mx-auto grid grid-cols-3 items-center">
          <nav className="flex justify-start pl-5" style={{ gap: '20px' }}>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/kategorie/${category.slug}`}
                className="text-sm font-normal uppercase tracking-wider hover:opacity-70 transition-opacity whitespace-nowrap"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          <Link href="/" className="text-sm font-bold uppercase tracking-wider text-center whitespace-nowrap">
            UFO SPORT
          </Link>

          <div className="flex items-center justify-end pr-5" style={{ gap: '20px' }}>
            <Link
              href={isLoggedIn ? "/ucet" : "/prihlaseni"}
              className="text-sm font-normal uppercase tracking-wider hover:opacity-70 transition-opacity whitespace-nowrap"
            >
              {isLoggedIn ? "ÚČET" : "PŘIHLÁSIT SE"}
            </Link>

            <button 
              onClick={() => setShowSavedWindow(true)}
              className="relative hover:opacity-70 transition-opacity"
              aria-label="Saved"
            >
              <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            >
              <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <button 
              onClick={() => setShowCartDrawer(true)}
              className="relative hover:opacity-70 transition-opacity"
              aria-label="Cart"
            >
              <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    </>
  );
}
