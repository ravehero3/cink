'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchBarStore } from '@/lib/search-bar-store';
import Link from 'next/link';

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
}

export default function SearchBar() {
  const { isVisible, setVisible, setShowSearchIcon } = useSearchBarStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus when search bar becomes visible
  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  // Scroll detection
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setVisible(false);
        setShowSearchIcon(true);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setVisible(true);
        setShowSearchIcon(false);
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setVisible, setShowSearchIcon]);

  // Search functionality
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);

    searchTimeout.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        const data = await response.json();
        setSearchResults(data.products || []);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  const handleResultClick = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-header left-0 right-0 z-20 bg-white border-b border-black">
      <div className="h-header flex items-center" style={{ paddingLeft: '12px', paddingRight: '12px' }}>
        <svg style={{ width: '17px', height: '17px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="CO PRÁVĚ HLEDÁTE?"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none placeholder:text-black placeholder:uppercase"
          style={{ 
            marginLeft: '12px',
            fontFamily: 'BB Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            letterSpacing: '0.42px',
            lineHeight: '16.1px'
          }}
        />
      </div>

      {/* Search Results */}
      {searchQuery.trim().length > 0 && (
        <div className="bg-white border-b border-black max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center text-sm">Hledání...</div>
          ) : searchResults.length > 0 ? (
            <>
              {searchResults.map((result) => (
                <Link
                  key={result.id}
                  href={`/produkty/${result.slug}`}
                  onClick={handleResultClick}
                  className="block p-4 border-t border-black hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="text-sm font-bold uppercase">{result.name}</div>
                      <div className="text-xs uppercase mt-1">{result.category}</div>
                    </div>
                    <div className="text-sm">{result.price} Kč</div>
                  </div>
                </Link>
              ))}
            </>
          ) : (
            <div className="p-6 text-center text-sm">Žádné výsledky</div>
          )}
        </div>
      )}
    </div>
  );
}
