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

const StatCard = ({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: string | number;
  href?: string;
  accent?: 'red' | 'green' | 'default';
}) => {
  const bg =
    accent === 'red'
      ? 'bg-red-50 border-red-200'
      : accent === 'green'
      ? 'bg-green-50 border-green-200'
      : 'bg-white border-gray-200';

  const valueColor =
    accent === 'red' ? 'text-red-700' : accent === 'green' ? 'text-green-700' : 'text-gray-900';

  const card = (
    <div
      className={`rounded-2xl border p-6 ${bg} transition-shadow hover:shadow-md`}
      style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.07)' }}
    >
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{label}</p>
      <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );

  if (href) {
    return <Link href={href}>{card}</Link>;
  }
  return card;
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Nacitam statistiky...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Prehled</h1>
        <p className="mt-1 text-sm text-gray-500">Vitejte zpet. Zde je aktualni stav vasehoo obchodu.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        <StatCard
          label="Celkem objednavek"
          value={stats?.totalOrders ?? 0}
          href="/admin/objednavky"
        />
        <StatCard
          label="Nevyrizene objednavky"
          value={stats?.pendingOrders ?? 0}
          href="/admin/objednavky"
          accent={stats && stats.pendingOrders > 0 ? 'red' : 'default'}
        />
        <StatCard
          label="Celkovy prijem"
          value={stats ? `${stats.totalRevenue.toLocaleString('cs-CZ')} Kc` : '— Kc'}
        />
        <StatCard
          label="Pocet produktu"
          value={stats?.productsCount ?? 0}
          href="/admin/produkty"
        />
        <StatCard
          label="Aktivni promo kody"
          value={stats?.promoCodesCount ?? 0}
          href="/admin/promo-kody"
        />
        <StatCard
          label="Odberatele newsletteru"
          value={stats?.newsletterCount ?? 0}
          href="/admin/newsletter"
        />
        {stats !== null && (
          <StatCard
            label="Nizky sklad"
            value={stats.lowStockProducts}
            href="/admin/produkty"
            accent={stats.lowStockProducts > 0 ? 'red' : 'green'}
          />
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Rychle akce</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { href: '/admin/produkty/novy', label: 'Pridat produkt' },
            { href: '/admin/objednavky', label: 'Zobrazit objednavky' },
            { href: '/admin/promo-kody', label: 'Spravovat promo kody' },
            { href: '/admin/emaily', label: 'Spravovat e-maily' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between group hover:border-gray-900 transition-all"
              style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.07)' }}
            >
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{action.label}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400 group-hover:text-gray-900 transition-colors"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
