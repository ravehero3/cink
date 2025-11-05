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
          <div className="p-8">
            <h2 className="text-header font-bold mb-8">ADMIN PANEL</h2>
            <nav className="space-y-4">
              <Link
                href="/admin"
                className="block text-body uppercase hover:underline"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/produkty"
                className="block text-body uppercase hover:underline"
              >
                Produkty
              </Link>
              <Link
                href="/admin/objednavky"
                className="block text-body uppercase hover:underline"
              >
                Objednávky
              </Link>
              <Link
                href="/admin/promo-kody"
                className="block text-body uppercase hover:underline"
              >
                Promo kódy
              </Link>
              <Link
                href="/admin/newsletter"
                className="block text-body uppercase hover:underline"
              >
                Newsletter
              </Link>
              <div className="pt-4 mt-4 border-t border-black">
                <Link
                  href="/"
                  className="block text-body uppercase hover:underline"
                >
                  ← Zpět na e-shop
                </Link>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
