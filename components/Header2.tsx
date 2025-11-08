'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
}

export default function Header2() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowResults(false);
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
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    setShowResults(true);

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleResultClick = () => {
    setShowResults(false);
    setSearchQuery('');
  };

  return (
    <header className="h-header border-b border-black bg-white fixed top-header left-0 right-0 z-20">
      <div className="h-full flex items-center px-lg max-w-container mx-auto">
        <div ref={dropdownRef} className="flex items-center gap-3 flex-1 relative">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          
          <input
            type="text"
            placeholder="Co právě hledáte?"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 text-xs bg-transparent border-none outline-none focus:border-b focus:border-black placeholder:text-black"
          />

          {showResults && (
            <div className="absolute top-full left-0 right-0 bg-white border border-black mt-1 max-h-96 overflow-y-auto z-50">
              {isLoading ? (
                <div className="p-4 text-body text-center">Hledám...</div>
              ) : searchResults.length > 0 ? (
                <>
                  {searchResults.map((result) => (
                    <Link
                      key={result.id}
                      href={`/produkty/${result.slug}`}
                      onClick={handleResultClick}
                      className="block p-4 border-b border-black last:border-b-0 hover:bg-black hover:text-white transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="text-body font-bold">{result.name}</div>
                          <div className="text-[12px]">{result.category}</div>
                        </div>
                        <div className="text-body">{result.price} Kč</div>
                      </div>
                    </Link>
                  ))}
                  {searchResults.length === 5 && (
                    <div className="p-3 text-center text-[12px] bg-black text-white">
                      Zobrazit všechny výsledky
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 text-body text-center">
                  {searchQuery.length > 0 ? 'Žádné výsledky' : 'Začněte psát...'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
