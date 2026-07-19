'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { StatCardSkeleton } from '@/components/admin/Skeleton';

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
    label: 'Nový produkt',
    description: 'Přidat produkt do katalogu',
    color: 'bg-black',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    ),
  },
  {
    href: '/admin/objednavky',
    label: 'Objednávky',
    description: 'Spravovat a sledovat',
    color: 'bg-[#1a1a2e]',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <path d="M9 12h6M9 16h4"/>
      </svg>
    ),
  },
  {
    href: '/admin/media',
    label: 'Galerie médií',
    description: 'Nahrát a spravovat obrázky',
    color: 'bg-[#1a2e1a]',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
  },
  {
    href: '/admin/emaily',
    label: 'E-mailové šablony',
    description: 'Spravovat komunikaci',
    color: 'bg-[#2e1a1a]',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
  },
];

const STAT_ITEMS = [
  {
    key: 'totalRevenue',
    label: 'Celkový příjem',
    format: (v: number) => `${v.toLocaleString('cs-CZ')} Kč`,
    href: '/admin/objednavky',
    accent: 'emerald',
  },
  {
    key: 'totalOrders',
    label: 'Celkem objednávek',
    format: (v: number) => v.toString(),
    href: '/admin/objednavky',
    accent: 'blue',
  },
  {
    key: 'pendingOrders',
    label: 'Čekající objednávky',
    format: (v: number) => v.toString(),
    href: '/admin/objednavky',
    accent: 'amber',
  },
  {
    key: 'productsCount',
    label: 'Produktů v katalogu',
    format: (v: number) => v.toString(),
    href: '/admin/produkty',
    accent: 'violet',
  },
  {
    key: 'newsletterCount',
    label: 'Odběratelé',
    format: (v: number) => v.toString(),
    href: '/admin/newsletter',
    accent: 'sky',
  },
  {
    key: 'promoCodesCount',
    label: 'Aktivní promo kódy',
    format: (v: number) => v.toString(),
    href: '/admin/promo-kody',
    accent: 'pink',
  },
  {
    key: 'lowStockProducts',
    label: 'Nízký sklad',
    format: (v: number) => v.toString(),
    href: '/admin/produkty',
    accent: 'red',
  },
];

const ACCENT_COLORS: Record<string, { dot: string; badge: string; value: string }> = {
  emerald: { dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700', value: 'text-emerald-600' },
  blue:    { dot: 'bg-blue-400',    badge: 'bg-blue-50 text-blue-700',       value: 'text-blue-600'    },
  amber:   { dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700',     value: 'text-amber-600'   },
  violet:  { dot: 'bg-violet-400',  badge: 'bg-violet-50 text-violet-700',   value: 'text-violet-600'  },
  sky:     { dot: 'bg-sky-400',     badge: 'bg-sky-50 text-sky-700',         value: 'text-sky-600'     },
  pink:    { dot: 'bg-pink-400',    badge: 'bg-pink-50 text-pink-700',       value: 'text-pink-600'    },
  red:     { dot: 'bg-red-400',     badge: 'bg-red-50 text-red-700',         value: 'text-red-600'     },
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
  const hour = now.getHours();
  const greeting = hour < 5 ? 'Dobrou noc' : hour < 12 ? 'Dobré ráno' : hour < 18 ? 'Dobrý den' : 'Dobrý večer';
  const dateStr = now.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });

  if (loading) {
    return (
      <div className="space-y-10">
        <div className="space-y-2 animate-pulse">
          <div className="h-4 w-48 bg-gray-100 rounded-lg" />
          <div className="h-9 w-72 bg-gray-100 rounded-xl" />
          <div className="h-4 w-40 bg-gray-100 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {[...Array(7)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="space-y-3">
          <div className="h-4 w-24 bg-gray-100 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-[76px] animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 bg-gray-100 rounded-md w-3/4" />
                    <div className="h-3 bg-gray-100 rounded-md w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-medium text-gray-400 capitalize mb-1">{dateStr}</p>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-none">
            {greeting}, {session?.user?.name?.split(' ')[0] || 'Admin'}
          </h1>
          <p className="mt-2 text-sm text-gray-400">Přehled obchodu UFO SPORT</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/produkty/novy"
            className="inline-flex items-center gap-2 bg-gray-900 text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-700 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nový produkt
          </Link>
        </div>
      </div>

      {/* Low stock alert */}
      {stats && stats.lowStockProducts > 0 && (
        <Link href="/admin/produkty" className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3.5 hover:bg-red-100 transition-colors group">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span className="text-[13px] font-semibold">
            {stats.lowStockProducts} {stats.lowStockProducts === 1 ? 'produkt má' : 'produkty mají'} nízký stav skladu — klikněte pro zobrazení
          </span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-auto group-hover:translate-x-0.5 transition-transform">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      )}

      {/* Pending orders alert */}
      {stats && stats.pendingOrders > 0 && (
        <Link href="/admin/objednavky" className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-5 py-3.5 hover:bg-amber-100 transition-colors group">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span className="text-[13px] font-semibold">
            {stats.pendingOrders} {stats.pendingOrders === 1 ? 'objednávka čeká' : 'objednávky čekají'} na vyřízení
          </span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-auto group-hover:translate-x-0.5 transition-transform">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      )}

      {/* Stats grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Statistiky</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {STAT_ITEMS.map((item) => {
            const val = stats ? (stats as any)[item.key] as number : 0;
            const colors = ACCENT_COLORS[item.accent];
            const inner = (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-md transition-all duration-200 group h-full relative overflow-hidden">
                <div className={`absolute top-0 inset-x-0 h-[3px] rounded-t-2xl ${colors.dot}`} />
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none truncate mb-4 mt-0.5">
                  {item.label}
                </p>
                <p className="text-[2rem] font-bold text-gray-900 tracking-tight leading-none">
                  {item.format(val)}
                </p>
                {item.href && (
                  <p className="mt-3 text-[11px] font-medium text-gray-300 group-hover:text-gray-600 transition-colors flex items-center gap-1">
                    Zobrazit
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </p>
                )}
              </div>
            );
            return item.href ? (
              <Link key={item.key} href={item.href} className="flex">{inner}</Link>
            ) : (
              <div key={item.key} className="flex">{inner}</div>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Rychlé akce</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-900 hover:shadow-sm transition-all duration-200"
            >
              <div className={`w-9 h-9 rounded-xl ${action.color} flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform duration-200`}>
                {action.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-gray-800 truncate">{action.label}</p>
                <p className="text-[11px] text-gray-400 truncate mt-0.5">{action.description}</p>
              </div>
              <svg
                className="shrink-0 text-gray-200 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all"
                width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
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
