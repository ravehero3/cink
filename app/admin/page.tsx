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
  accent?: 'warning' | 'ok' | 'default';
}) => {
  const card = (
    <div
      className={`bg-white border border-black p-5 transition-colors hover:bg-black hover:text-white group ${
        accent === 'warning' ? 'border-l-4' : ''
      }`}
      style={accent === 'warning' ? { borderLeftColor: '#000' } : {}}
    >
      <p
        className="uppercase mb-3 group-hover:text-white text-[10px] tracking-widest text-[#666666]"
        style={{
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        }}
      >
        {label}
      </p>
      <p
        className="text-2xl font-bold tracking-tight"
        style={{
          fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
        }}
      >
        {value}
        {accent === 'warning' && typeof value === 'number' && value > 0 && (
          <span className="text-sm ml-2 font-normal">⚠</span>
        )}
      </p>
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
      <div className="flex items-center gap-3 py-12">
        <div className="w-4 h-4 border border-black border-t-transparent animate-spin" />
        <span
          className="text-xs uppercase tracking-widest font-medium"
          style={{
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          }}
        >
          Načítám statistiky...
        </span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 border-b border-black pb-4">
          <h1 className="admin-title">
            Přehled obchodu
          </h1>
          <p className="admin-sub">
            Aktuální stav a statistiky e-shopu UFO SPORT.
          </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-black border border-black mb-10">
        <StatCard
          label="Celkem objednávek"
          value={stats?.totalOrders ?? 0}
          href="/admin/objednavky"
        />
        <StatCard
          label="Nevyřízené objednávky"
          value={stats?.pendingOrders ?? 0}
          href="/admin/objednavky"
          accent={stats && stats.pendingOrders > 0 ? 'warning' : 'default'}
        />
        <StatCard
          label="Celkový příjem"
          value={stats ? `${stats.totalRevenue.toLocaleString('cs-CZ')} Kč` : '— Kč'}
        />
        <StatCard
          label="Počet produktů"
          value={stats?.productsCount ?? 0}
          href="/admin/produkty"
        />
        <StatCard
          label="Aktivní promo kódy"
          value={stats?.promoCodesCount ?? 0}
          href="/admin/promo-kody"
        />
        <StatCard
          label="Odběratelé newsletteru"
          value={stats?.newsletterCount ?? 0}
          href="/admin/newsletter"
        />
        {stats !== null && (
          <StatCard
            label="Nízký sklad"
            value={stats.lowStockProducts}
            href="/admin/produkty"
            accent={stats.lowStockProducts > 0 ? 'warning' : 'ok'}
          />
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2
          className="mb-3 uppercase text-[11px] font-bold tracking-widest text-[#666666]"
          style={{
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          }}
        >
          Rychlé akce
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-black border border-black">
          {[
            { href: '/admin/produkty/novy', label: 'Přidat produkt' },
            { href: '/admin/objednavky', label: 'Zobrazit objednávky' },
            { href: '/admin/promo-kody', label: 'Spravovat promo kódy' },
            { href: '/admin/emaily', label: 'E-maily a cesty' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="bg-white p-5 flex items-center justify-between hover:bg-black hover:text-white transition-colors group"
            >
              <span
                className="uppercase text-xs tracking-wider"
                style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
              >
                {action.label}
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
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
