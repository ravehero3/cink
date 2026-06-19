'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

const NAV_ITEMS = [
  { href: '/admin/objednavky', label: 'Objednavky' },
  { href: '/admin/produkty', label: 'Produkty' },
  { href: '/admin/promo-kody', label: 'Promo kody' },
  { href: '/admin/newsletter', label: 'Newsletter' },
  { href: '/admin/emaily', label: 'Emaily' },
  { href: '/admin/media', label: 'Media' },
  { href: '/admin/live-nabidky', label: 'Live nabidky' },
  { href: '/admin/stranky', label: 'Stranky' },
  { href: '/admin/nastaveni-uploadu', label: 'Diagnostika' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/prihlaseni');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500 tracking-wide">Nacitani...</span>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col fixed top-0 left-0 z-30" style={{ boxShadow: '1px 0 0 0 #e5e7eb' }}>
        {/* Brand */}
        <div className="px-6 py-6 border-b border-gray-100">
          <Link href="/admin/objednavky" className="block">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs tracking-widest">U</span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 tracking-wide">UFO SPORT</p>
                <p className="text-xs text-gray-400 tracking-wider">Admin panel</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 font-medium ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-100">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Zpet na e-shop
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
