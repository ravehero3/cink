'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart-store';
import { useSavedProductsStore } from '@/lib/saved-products-store';
import { useSession } from 'next-auth/react';
import SavedProductsWindow from './SavedProductsWindow';
import CartDrawer from './CartDrawer';

const categories = [
  { name: 'VOODOO808', slug: 'voodoo808' },
  { name: 'SPACE LOVE', slug: 'space-love' },
  { name: 'RECREATION WELLNESS', slug: 'recreation-wellness' },
  { name: 'T SHIRT GALLERY', slug: 't-shirt-gallery' },
];

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
}

export default function Header1() {
  const { data: session } = useSession();
  const cartCount = useCartStore((state) => state.getItemCount());
  const savedCount = useSavedProductsStore((state) => state.getCount());
  const isLoggedIn = !!session;
  const isAdmin = session?.user?.role === 'ADMIN';
  const [showSavedWindow, setShowSavedWindow] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearchLoading(true);
    setShowSearchResults(true);

    searchTimeout.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        const data = await response.json();
        setSearchResults(data.products || []);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearchLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  const handleSearchResultClick = () => {
    setShowSearchResults(false);
    setSearchQuery('');
  };

  return (
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
          <button
            onClick={() => setShowSearchResults(!showSearchResults)}
            className="text-sm font-normal uppercase tracking-wider hover:opacity-70 transition-opacity whitespace-nowrap"
          >
            {isLoggedIn ? "ÚČET" : "PŘIHLÁSIT SE"}
          </button>

          <button 
            onClick={() => setShowSavedWindow(true)}
            className="relative hover:opacity-70 transition-opacity"
            aria-label="Saved"
          >
            <svg className="w-[13px] h-[13px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full">
                {savedCount}
              </span>
            )}
          </button>

          <div ref={searchDropdownRef} className="relative">
            <button 
              onClick={() => setShowSearchResults(!showSearchResults)}
              className="relative hover:opacity-70 transition-opacity"
              aria-label="Search"
            >
              <svg className="w-[13px] h-[13px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {showSearchResults && (
              <div className="absolute top-full right-0 mt-4 w-96 bg-white border border-black z-50">
                <div className="p-sm border-b border-black flex items-center gap-2 pl-[calc(16px-10px)]">
                  <svg className="w-[11px] h-[11px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Co právě hledáte"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="flex-1 text-[15px] font-bold bg-transparent border-none outline-none placeholder:text-black placeholder:font-bold"
                  />
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {isSearchLoading ? (
                    <div className="p-6 text-center text-small">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {searchResults.map((result) => (
                        <Link
                          key={result.id}
                          href={`/produkty/${result.slug}`}
                          onClick={handleSearchResultClick}
                          className="block p-sm border-b border-black last:border-b-0 hover:bg-black hover:text-white transition-colors"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="text-small font-bold uppercase">{result.name}</div>
                              <div className="text-xs uppercase mt-1">{result.category}</div>
                            </div>
                            <div className="text-small">{result.price} Kč</div>
                          </div>
                        </Link>
                      ))}
                    </>
                  ) : searchQuery.length > 0 ? (
                    <div className="p-6 text-center text-small">No results found</div>
                  ) : (
                    <div className="p-6 text-center text-small">Start typing to search...</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowCartDrawer(true)}
            className="relative hover:opacity-70 transition-opacity"
            aria-label="Cart"
          >
            <svg className="w-[13px] h-[13px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  );
}
