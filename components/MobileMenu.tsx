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
        className={`fixed top-0 left-0 h-full w-4/5 max-w-[320px] bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col border-r border-black">
          <div className="border-b border-black relative" style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '16px', paddingRight: '12px' }}>
            <span 
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
            </span>
            <button
              onClick={onClose}
              className="hover:opacity-70 transition-opacity"
              style={{
                width: '22px',
                height: '22px',
                padding: '0',
                color: '#000000'
              }}
            >
              <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <nav className="py-4">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/${category.slug}`}
                  onClick={onClose}
                  className="block px-6 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  style={{
                    fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '16px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                    fontStretch: 'condensed',
                    color: '#000000'
                  }}
                >
                  {category.name}
                </Link>
              ))}
            </nav>

            <div className="border-t border-black py-4">
              <Link
                href={isLoggedIn ? "/ucet" : "/prihlaseni"}
                onClick={onClose}
                className="block px-6 py-3 hover:bg-gray-50 transition-colors"
                style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#000000'
                }}
              >
                {isLoggedIn ? "MŮJ ÚČET" : "PŘIHLÁSIT SE"}
              </Link>

              <Link
                href="/ulozeno"
                onClick={onClose}
                className="block px-6 py-3 hover:bg-gray-50 transition-colors"
                style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#000000'
                }}
              >
                ULOZENE POLOZKY
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="block px-6 py-3 hover:bg-gray-50 transition-colors"
                  style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#000000'
                  }}
                >
                  SPRAVCE ESHOPU
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
