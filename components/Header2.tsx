'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useSearchShortcutsStore } from '@/store/searchShortcutsStore';
import EditSearchShortcutsModal from './EditSearchShortcutsModal';

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
}

interface Header2Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function Header2({ isOpen, onClose }: Header2Props) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const { shortcuts } = useSearchShortcutsStore();

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
    onClose();
  };

  return (
    <>
      <div 
        className="fixed top-header left-0 right-0 z-20 bg-white transition-all duration-300 ease-in-out overflow-hidden"
        style={{ 
          maxHeight: isOpen ? '500px' : '0',
          opacity: isOpen ? 1 : 0
        }}
      >
        <div className="h-header flex items-center max-w-container mx-auto border-b border-black">
          <div className="flex items-center gap-3 flex-1 pl-5">
            <svg style={{ width: '14.8px', height: '14.8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Co právě hledáte?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="flex-1 text-body bg-transparent border-none outline-none placeholder:text-black"
            />
          </div>
        </div>

        <div className="w-full border-b border-black">
          {searchQuery.trim().length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
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
          ) : (
            <div className="px-5 py-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase">MOST SEARCHED</h3>
                {isAdmin && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="text-xs uppercase hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>
              <div className="flex gap-4">
                {shortcuts.map((shortcut, index) => (
                  <Link
                    key={index}
                    href={shortcut.link}
                    onClick={handleResultClick}
                    className="text-sm hover:underline"
                  >
                    {shortcut.text}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showEditModal && (
        <EditSearchShortcutsModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}
