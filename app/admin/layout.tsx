'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

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
        <aside className="w-64 min-h-screen border-r border-black bg-white">
          <nav className="space-y-0.5" style={{ padding: '2px 0 32px 2px' }}>
            <h2 className="text-header font-bold mb-1">ADMIN PANEL</h2>
            <Link
              href="/admin"
              className="block text-body uppercase hover:underline py-0.5"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/produkty"
              className="block text-body uppercase hover:underline py-0.5"
            >
              Produkty
            </Link>
            <Link
              href="/admin/objednavky"
              className="block text-body uppercase hover:underline py-0.5"
            >
              Objednávky
            </Link>
            <Link
              href="/admin/promo-kody"
              className="block text-body uppercase hover:underline py-0.5"
            >
              Promo kódy
            </Link>
            <Link
              href="/admin/newsletter"
              className="block text-body uppercase hover:underline py-0.5"
            >
              Newsletter
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
