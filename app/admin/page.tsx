'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  productsCount: number;
  promoCodesCount: number;
  newsletterCount: number;
  lowStockProducts: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if admin on mount
  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user?.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-body">Načítání statistik...</div>;
  }

  return (
    <div>
      <h1 className="text-title font-bold mb-8">DASHBOARD</h1>

      {/* Statistics Grid */}
      <div className="grid grid-cols-3 gap-6 mb-12">
        <div className="border border-black p-6">
          <div className="text-body uppercase mb-2">Celkem objednávek</div>
          <div className="text-title font-bold">{stats?.totalOrders || 0}</div>
        </div>
        <div className="border border-black p-6">
          <div className="text-body uppercase mb-2">Nevyřízené objednávky</div>
          <div className="text-title font-bold">{stats?.pendingOrders || 0}</div>
        </div>
        <div className="border border-black p-6">
          <div className="text-body uppercase mb-2">Celkový příjem</div>
          <div className="text-title font-bold">{stats?.totalRevenue?.toFixed(2) || '0.00'} Kč</div>
        </div>
        <div className="border border-black p-6">
          <div className="text-body uppercase mb-2">Počet produktů</div>
          <div className="text-title font-bold">{stats?.productsCount || 0}</div>
        </div>
        <div className="border border-black p-6">
          <div className="text-body uppercase mb-2">Aktivní promo kódy</div>
          <div className="text-title font-bold">{stats?.promoCodesCount || 0}</div>
        </div>
        <div className="border border-black p-6">
          <div className="text-body uppercase mb-2">Newsletter odběratelé</div>
          <div className="text-title font-bold">{stats?.newsletterCount || 0}</div>
        </div>
        {stats?.lowStockProducts !== undefined && (
          <div className={`border-2 p-6 ${stats.lowStockProducts > 0 ? 'border-red-600 bg-red-50' : 'border-black'}`}>
            <div className="text-body uppercase mb-2">⚠️ Nízký sklad</div>
            <div className={`text-title font-bold ${stats.lowStockProducts > 0 ? 'text-red-600' : ''}`}>
              {stats.lowStockProducts}
            </div>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-header font-bold mb-6">RYCHLÉ ODKAZY</h2>
        <div className="grid grid-cols-2 gap-6">
          <Link
            href="/admin/produkty/novy"
            className="border border-black p-6 hover:bg-black hover:text-white transition-colors"
          >
            <div className="text-body uppercase font-bold">+ Přidat nový produkt</div>
          </Link>
          <Link
            href="/admin/objednavky"
            className="border border-black p-6 hover:bg-black hover:text-white transition-colors"
          >
            <div className="text-body uppercase font-bold">Zobrazit objednávky</div>
          </Link>
          <Link
            href="/admin/promo-kody"
            className="border border-black p-6 hover:bg-black hover:text-white transition-colors"
          >
            <div className="text-body uppercase font-bold">Spravovat promo kódy</div>
          </Link>
          <Link
            href="/admin/newsletter"
            className="border border-black p-6 hover:bg-black hover:text-white transition-colors"
          >
            <div className="text-body uppercase font-bold">Newsletter odběratelé</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
