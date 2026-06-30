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

const QUICK_ACTIONS = [
  {
    href: '/admin/produkty/novy',
    label: 'Přidat produkt',
    description: 'Vytvořit nový produkt',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    ),
  },
  {
    href: '/admin/objednavky',
    label: 'Objednávky',
    description: 'Zobrazit všechny objednávky',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
      </svg>
    ),
  },
  {
    href: '/admin/promo-kody',
    label: 'Promo kódy',
    description: 'Spravovat slevové kódy',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    ),
  },
  {
    href: '/admin/emaily',
    label: 'E-mailové kampaně',
    description: 'Spravovat e-maily',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
  },
];

function StatCard({
  label,
  value,
  href,
  badge,
  badgeVariant = 'neutral',
}: {
  label: string;
  value: string | number;
  href?: string;
  badge?: string;
  badgeVariant?: 'neutral' | 'warning' | 'success' | 'danger';
}) {
  const badgeColors: Record<string, string> = {
    neutral: 'bg-gray-100 text-gray-500',
    warning: 'bg-orange-50 text-orange-600',
    success: 'bg-emerald-50 text-emerald-600',
    danger: 'bg-red-50 text-red-500',
  };

  const inner = (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3 hover:border-gray-200 hover:shadow-sm transition-all duration-200 group">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest leading-tight">{label}</p>
        {badge && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${badgeColors[badgeVariant]}`}>
            {badge}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
      {href && (
        <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
          Zobrazit
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      )}
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

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
    if (session?.user?.role === 'ADMIN') fetchStats();
  }, [session]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) setStats(await res.json());
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? 'Dobré ráno' : now.getHours() < 18 ? 'Dobrý den' : 'Dobrý večer';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Načítám statistiky…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{greeting} 👋</h1>
        <p className="mt-1 text-sm text-gray-400">Přehled vašeho obchodu UFO SPORT.</p>
      </div>

      {/* Stats grid */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Statistiky</p>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          <StatCard
            label="Celkem objednávek"
            value={stats?.totalOrders ?? 0}
            href="/admin/objednavky"
          />
          <StatCard
            label="Čekající objednávky"
            value={stats?.pendingOrders ?? 0}
            href="/admin/objednavky"
            badge={stats && stats.pendingOrders > 0 ? `${stats.pendingOrders} nových` : undefined}
            badgeVariant={stats && stats.pendingOrders > 0 ? 'warning' : 'neutral'}
          />
          <StatCard
            label="Celkový příjem"
            value={stats ? `${stats.totalRevenue.toLocaleString('cs-CZ')} Kč` : '— Kč'}
            badgeVariant="success"
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
              badge={stats.lowStockProducts > 0 ? 'Pozor' : 'OK'}
              badgeVariant={stats.lowStockProducts > 0 ? 'danger' : 'success'}
            />
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Rychlé akce</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:border-gray-900 hover:shadow-sm transition-all duration-200"
            >
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-all duration-200 shrink-0">
                {action.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 group-hover:text-gray-900 truncate">{action.label}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{action.description}</p>
              </div>
              <svg
                className="ml-auto shrink-0 text-gray-300 group-hover:text-gray-700 transition-colors"
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
