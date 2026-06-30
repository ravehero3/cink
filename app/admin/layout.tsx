'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  {
    href: '/admin/objednavky',
    label: 'Objednávky',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <path d="M9 12h6M9 16h4"/>
      </svg>
    ),
  },
  {
    href: '/admin/produkty',
    label: 'Produkty',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
  },
  {
    href: '/admin/promo-kody',
    label: 'Promo kódy',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    ),
  },
  {
    href: '/admin/newsletter',
    label: 'Newsletter',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    href: '/admin/emaily',
    label: 'Emaily',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
  },
  {
    href: '/admin/media',
    label: 'Média',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
  },
  {
    href: '/admin/live-nabidky',
    label: 'Live nabídky',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  },
  {
    href: '/admin/stranky',
    label: 'Stránky',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/prihlaseni');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9]">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
          <span className="text-sm text-gray-400 tracking-wide">Načítání…</span>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      {/* Top navigation bar */}
      <header className="sticky top-0 z-40 bg-[#0f0f0f] border-b border-white/[0.06]">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
          <div className="flex items-center h-14 gap-6">

            {/* Brand */}
            <Link href="/admin" className="flex items-center gap-2.5 shrink-0 mr-2">
              <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center">
                <span className="text-black font-bold text-[11px] tracking-widest">U</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-white text-sm font-semibold tracking-wide">UFO SPORT</span>
                <span className="text-white/20 text-xs">/</span>
                <span className="text-white/40 text-xs font-medium tracking-wide">Admin</span>
              </div>
            </Link>

            {/* Divider */}
            <div className="hidden lg:block w-px h-5 bg-white/10 shrink-0" />

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-1 overflow-x-auto">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || (pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium whitespace-nowrap transition-all duration-150 ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className={isActive ? 'text-white' : 'text-white/40'}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="ml-auto flex items-center gap-2 shrink-0">
              <Link
                href="/"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                E-shop
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden flex items-center justify-center w-8 h-8 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                {mobileMenuOpen ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown nav */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/[0.06] bg-[#0f0f0f] px-4 py-3 space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                    isActive ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/[0.06]'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-white/40'}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-white/[0.06] mt-2">
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-white/40 hover:text-white/70"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Zpět na e-shop
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
