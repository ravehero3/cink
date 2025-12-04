'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart-store';
import { useSavedProductsStore } from '@/lib/saved-products-store';
import { useSearchBarStore } from '@/lib/search-bar-store';
import { useSession } from 'next-auth/react';
import CartDrawer from './CartDrawer';
import Header2 from './Header2';
import MobileMenu from './MobileMenu';

interface Category {
  id: string;
  name: string;
  slug: string;
  isVisible?: boolean;
}

const fallbackCategories: Category[] = [
  { id: '1', name: 'VOODOO808', slug: 'voodoo808' },
  { id: '2', name: 'SPACE LOVE', slug: 'space-love' },
  { id: '3', name: 'RECREATION WELLNESS', slug: 'recreation-wellness' },
  { id: '4', name: 'T SHIRT GALLERY', slug: 't-shirt-gallery' },
];

export default function Header1() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const { data: session } = useSession();
  const pathname = usePathname();
  const isPokladna = pathname === '/pokladna';
  const cartCount = useCartStore((state) => state.getItemCount());
  const savedCount = useSavedProductsStore((state) => state.getCount());
  const { showSearchIcon, openSearchBar } = useSearchBarStore();
  const isLoggedIn = !!session;
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isCartBadgeHovered, setIsCartBadgeHovered] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const visibleCategories = data.filter((cat: Category) => cat.isVisible !== false);
            setCategories(visibleCategories);
          }
        }
      } catch (error) {
      }
    };
    
    fetchCategories();
  }, []);

  return (
    <>
      <header className="h-header border-b border-black bg-white fixed top-0 left-0 right-0 z-30">
        <div className="h-full flex items-center justify-between relative">
          
          {/* Mobile: Left side - Hamburger menu + Search */}
          {!isPokladna && (
            <div className="flex md:hidden items-center" style={{ gap: '8px', paddingLeft: '12px' }}>
              <button 
                onClick={() => setShowMobileMenu(true)}
                className="hover:opacity-70 transition-opacity"
                aria-label="Open Menu"
                style={{ width: '22px', height: '22px' }}
              >
                <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className="hover:opacity-70 transition-opacity"
                aria-label="Search"
                style={{ width: '22px', height: '22px' }}
              >
                <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          )}

          {/* Desktop: Left Group - Category Navigation */}
          {!isPokladna && (
            <nav className={`hidden md:flex items-center transition-opacity duration-300 ${showSearch ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ gap: '20px', paddingLeft: '12px' }}>
              {categories.map((category, index) => (
                <div
                  key={category.slug}
                  style={{
                    position: 'relative',
                  }}
                  className="group"
                >
                  <Link
                    href={`/${category.slug}`}
                    className="whitespace-nowrap uppercase tracking-tight font-normal text-sm"
                    style={{
                      color: 'rgb(0, 0, 0)',
                      textDecoration: 'none',
                      display: 'block',
                      padding: '0 8px'
                    }}
                  >
                    {category.name}
                  </Link>
                  <div
                    className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      inset: '-4px',
                      border: '1px solid #000000',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              ))}
            </nav>
          )}

          {/* Center: Logo - Always centered */}
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

          {/* Mobile: Right side - Cart only */}
          {!isPokladna && (
            <div className="flex md:hidden items-center" style={{ paddingRight: '12px' }}>
              <button 
                onClick={() => setShowCartDrawer(true)}
                className="relative transition-opacity"
                aria-label="Cart"
                style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {isHydrated && cartCount > 0 ? (
                  <div 
                    style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: '#24e053',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#000000',
                      textTransform: 'uppercase',
                      letterSpacing: 'normal',
                      fontFamily: 'inherit'
                    }}
                  >
                    {cartCount}
                  </div>
                ) : (
                  <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                )}
              </button>
            </div>
          )}

          {/* Desktop: Right Group - Login and Icons */}
          {!isPokladna && (
            <div className="hidden md:flex items-center" style={{ gap: '12px', paddingRight: '12px' }}>
              <div className={`flex items-center transition-opacity duration-300 ${showSearch ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ gap: '12px' }}>
                <Link
                  href={isHydrated && isLoggedIn ? "/ucet" : "/prihlaseni"}
                  className="hover:opacity-70 transition-opacity whitespace-nowrap uppercase tracking-tight font-normal text-sm"
                  style={{
                    color: 'rgb(0, 0, 0)',
                    textDecoration: 'none'
                  }}
                >
                  {isHydrated && isLoggedIn ? "Účet" : "PŘIHLÁSIT SE"}
                </Link>

                {isHydrated && session?.user?.role === 'ADMIN' && (
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
                  {isHydrated && savedCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full">
                      {savedCount}
                    </span>
                  )}
                </Link>

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
                  className="relative transition-opacity"
                  aria-label="Cart"
                  style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onMouseEnter={() => setIsCartBadgeHovered(true)}
                  onMouseLeave={() => setIsCartBadgeHovered(false)}
                >
                  {isHydrated && cartCount > 0 ? (
                    <div 
                      style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: '#24e053',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 400,
                        color: '#000000',
                        textTransform: 'uppercase',
                        letterSpacing: 'normal',
                        fontFamily: 'inherit',
                        border: isCartBadgeHovered ? '1px solid #000000' : 'none'
                      }}
                    >
                      {cartCount}
                    </div>
                  ) : (
                    <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Close Search Button - Desktop only */}
          {!isPokladna && (
            <button 
              onClick={() => setShowSearch(false)}
              className={`hidden md:block absolute hover:opacity-70 transition-opacity ${showSearch ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              aria-label="Close Search"
              style={{ 
                width: '22px', 
                height: '22px',
                top: '50%',
                right: '12px',
                transform: 'translateY(-50%)',
                padding: '0'
              }}
            >
              <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <CartDrawer 
          isOpen={showCartDrawer}
          onClose={() => setShowCartDrawer(false)}
        />
        
        <MobileMenu
          isOpen={showMobileMenu}
          onClose={() => setShowMobileMenu(false)}
          categories={categories}
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
