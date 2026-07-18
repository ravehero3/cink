'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const NAV_SECTIONS = [
  {
    label: 'Obchod',
    items: [
      {
        href: '/admin/objednavky',
        label: 'Objednávky',
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        ),
      },
      {
        href: '/admin/customers',
        label: 'Zákazníci',
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        ),
      },
      {
        href: '/admin/promo-kody',
        label: 'Promo kódy',
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
        ),
      },
      {
        href: '/admin/pricing-rules',
        label: 'Cenová pravidla',
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Marketing',
    items: [
      {
        href: '/admin/newsletter',
        label: 'Newsletter',
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 0h3.09a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 7.6a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.42 15l-.5 1.92z"/>
          </svg>
        ),
      },
      {
        href: '/admin/emaily',
        label: 'E-maily',
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        ),
      },
      {
        href: '/admin/email-campaigns',
        label: 'E-mail kampaně',
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        ),
      },
      {
        href: '/admin/live-nabidky',
        label: 'Live nabídky',
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Obsah',
    items: [
      {
        href: '/admin/media',
        label: 'Média / Galerie',
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        ),
      },
      {
        href: '/admin/stranky',
        label: 'Stránky',
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        ),
      },
      {
        href: '/admin/seo-management',
        label: 'SEO',
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        ),
      },
    ],
  },
];

function NavItem({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group ${
        isActive
          ? 'bg-white/10 text-white'
          : 'text-white/45 hover:text-white/80 hover:bg-white/[0.05]'
      }`}
    >
      <span className={`shrink-0 transition-colors ${isActive ? 'text-white' : 'text-white/35 group-hover:text-white/60'}`}>
        {icon}
      </span>
      {label}
      {isActive && (
        <span className="ml-auto w-1 h-1 rounded-full bg-white/60" />
      )}
    </Link>
  );
}

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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
          <span className="text-sm text-gray-400 tracking-wide">Načítání…</span>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'ADMIN') return null;

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-[#111111]">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 group-hover:bg-white/90 transition-colors">
            <span className="text-black font-black text-[11px] tracking-widest">U</span>
          </div>
          <div>
            <p className="text-white text-[13px] font-bold tracking-wide leading-none">UFO SPORT</p>
            <p className="text-white/30 text-[10px] font-medium tracking-widest uppercase mt-0.5">Admin panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.15em] px-3 mb-2">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-white/[0.06] space-y-0.5">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-white/35 hover:text-white/70 hover:bg-white/[0.05] transition-all group"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 group-hover:text-white/60 transition-colors">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          E-shop
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/prihlaseni' })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-white/35 hover:text-white/70 hover:bg-white/[0.05] transition-all group text-left"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 group-hover:text-white/60 transition-colors">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Odhlásit se
        </button>

        {/* User info */}
        {session?.user && (
          <div className="mt-2 px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
            <p className="text-[11px] font-semibold text-white/60 leading-none truncate">
              {session.user.name || session.user.email}
            </p>
            {session.user.name && (
              <p className="text-[10px] text-white/25 mt-0.5 truncate">{session.user.email}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 fixed top-0 left-0 h-screen z-30">
        <Sidebar />
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#111111] border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center">
              <span className="text-black font-black text-[10px] tracking-widest">U</span>
            </div>
            <span className="text-white text-[13px] font-bold tracking-wide">UFO SPORT</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
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

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="bg-[#111111] border-t border-white/[0.06] px-3 py-4 max-h-[80vh] overflow-y-auto space-y-5">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label}>
                <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.15em] px-3 mb-2">
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                          isActive ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white/80 hover:bg-white/[0.05]'
                        }`}
                      >
                        <span className={isActive ? 'text-white' : 'text-white/35'}>{item.icon}</span>
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="border-t border-white/[0.06] pt-4 space-y-0.5">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-white/35 hover:text-white/70"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                E-shop
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <main className="flex-1 px-6 lg:px-8 py-8 pt-[4.5rem] lg:pt-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
        <footer className="px-6 lg:px-8 py-4 text-[11px] text-gray-300 border-t border-gray-200">
          UFO Sport Admin · {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
