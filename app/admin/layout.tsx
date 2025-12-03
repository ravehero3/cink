'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-body">Načítání...</div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Sidebar */}
        <aside className="min-h-screen border-r border-black bg-white" style={{ width: '280px' }}>
          <nav className="space-y-0.5" style={{ padding: '8px 8px 32px 8px' }}>
            <Link
              href="/admin/stranky"
              className="block text-header font-bold mb-3 hover:opacity-70 transition-opacity cursor-pointer"
            >
              ADMIN
            </Link>
            <Link
              href="/admin/objednavky"
              className={`block text-body uppercase hover:underline py-0.5 ${
                pathname === '/admin/objednavky' ? 'font-bold' : ''
              }`}
            >
              Objednávky
            </Link>
            <Link
              href="/admin/produkty"
              className={`block text-body uppercase hover:underline py-0.5 ${
                pathname === '/admin/produkty' || pathname.startsWith('/admin/produkty/') ? 'font-bold' : ''
              }`}
            >
              Produkty
            </Link>
            <Link
              href="/admin/promo-kody"
              className={`block text-body uppercase hover:underline py-0.5 ${
                pathname === '/admin/promo-kody' ? 'font-bold' : ''
              }`}
            >
              Promo kódy
            </Link>
            <Link
              href="/admin/newsletter"
              className={`block text-body uppercase hover:underline py-0.5 ${
                pathname === '/admin/newsletter' ? 'font-bold' : ''
              }`}
            >
              Newsletter
            </Link>
            <Link
              href="/admin/media"
              className={`block text-body uppercase hover:underline py-0.5 ${
                pathname === '/admin/media' ? 'font-bold' : ''
              }`}
            >
              Média
            </Link>
            <div className="pt-2 mt-2 border-t border-black">
              <Link
                href="/"
                className="block text-body uppercase hover:underline py-0.5"
              >
                ← Zpět na e-shop
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
