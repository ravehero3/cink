'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
}

export default function MobileMenu({ isOpen, onClose, categories }: MobileMenuProps) {
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const isAdmin = session?.user?.role === 'ADMIN';

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      <div
        className={`fixed top-0 left-0 h-full w-full bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col border-r border-black">
          {/* Header - 44px height to match mobile header */}
          <div className="border-b border-black relative flex items-center justify-center" style={{ height: '44px', backgroundColor: '#ffffff' }}>
            <h2 
              style={{
                fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                fontStretch: 'condensed',
                color: '#000000'
              }}
            >
              MENU
            </h2>
            <button
              onClick={onClose}
              className="absolute hover:opacity-70 transition-opacity"
              style={{
                width: '24px',
                height: '24px',
                right: '12px',
                padding: '0',
                color: '#000000'
              }}
              aria-label="Zavřít menu"
            >
              <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menu Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Categories */}
            <nav className="border-b border-black w-full">
              {categories.map((category, index) => (
                <Link
                  key={category.slug}
                  href={`/${category.slug}`}
                  onClick={onClose}
                  className="block px-6 hover:bg-gray-50 transition-colors border-b border-gray-200 flex items-center"
                  style={{
                    height: '44px',
                    fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                    fontStretch: 'condensed',
                    color: '#000000',
                    borderBottom: index < categories.length - 1 ? '1px solid #e5e5e5' : 'none'
                  }}
                >
                  {category.name}
                </Link>
              ))}
            </nav>

            {/* Account & Settings - Only Admin link */}
            {isAdmin && (
              <div className="border-b border-black w-full">
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="block px-6 hover:bg-gray-50 transition-colors flex items-center"
                  style={{
                    height: '44px',
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#000000'
                  }}
                >
                  SPRAVCE ESHOPU
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
