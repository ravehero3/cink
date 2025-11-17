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
        className="fixed top-header left-0 right-0 z-20 bg-white"
        style={{ 
          maxHeight: isOpen ? '500px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.4s ease-in-out'
        }}
      >
        <div 
          className="h-header flex items-center max-w-container mx-auto border-b border-black bg-white"
          style={{
            transform: isOpen ? 'translateY(0)' : 'translateY(-44px)',
            transition: 'transform 0.4s ease-in-out'
          }}
        >
          <div className="flex items-center gap-3 flex-1" style={{ paddingLeft: '20px' }}>
            <svg style={{ width: '17px', height: '17px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="CO PRÁVĚ HLEDÁTE?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="flex-1 text-body bg-transparent border-none outline-none placeholder:text-black placeholder:uppercase"
            />
          </div>
        </div>

        <div 
          className="w-full bg-white"
          style={{
            opacity: isOpen ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
            transitionDelay: isOpen ? '1.4s' : '0s'
          }}
        >
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
            <div className="py-6">
              <div className="flex items-center justify-center" style={{ marginBottom: '8px' }}>
                <h3 
                  style={{
                    fontSize: '22px',
                    fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontWeight: 700,
                    lineHeight: '16px',
                    textTransform: 'uppercase',
                    color: 'rgb(0, 0, 0)',
                    letterSpacing: '0.03em',
                    wordSpacing: '0px',
                    padding: '0px 16px 0px 44px',
                    margin: '0px',
                    fontStretch: 'condensed'
                  }}
                >
                  NEJČASTĚJI VYHLEDÁVANÉ
                </h3>
                {isAdmin && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="text-xs uppercase hover:underline ml-4"
                  >
                    Edit
                  </button>
                )}
              </div>
              <div className="flex flex-col items-center" style={{ gap: '8px' }}>
                {shortcuts.map((shortcut, index) => (
                  <Link
                    key={index}
                    href={shortcut.link}
                    onClick={handleResultClick}
                    style={{
                      fontSize: '12px',
                      fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontWeight: 400,
                      lineHeight: '16px',
                      textTransform: 'uppercase',
                      color: 'rgb(0, 0, 0)',
                      letterSpacing: 'normal',
                      wordSpacing: '0px',
                      padding: '0px 16px 0px 44px',
                      margin: '0px',
                      textDecoration: 'none'
                    }}
                    className="hover:underline"
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
