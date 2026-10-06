'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ToastRenderer from '@/components/admin/Toast';

const SECTION_LABELS: Record<string, string> = {
  objednavky: 'Objednávky',
  produkty: 'Produkty',
  customers: 'Zákazníci',
  'promo-kody': 'Promo kódy',
  newsletter: 'Newsletter',
  emaily: 'E-maily a cesty',
  'email-campaigns': 'E-mail kampaně',
  media: 'Média',
  'live-nabidky': 'Live nabídky',
  stranky: 'Stránky',
  'seo-management': 'SEO',
  'pricing-rules': 'Cenová pravidla',
  'nastaveni-uploadu': 'Diagnostika',
  'domovska-stranka': 'Domovská stránka',
};

function Breadcrumbs({ pathname }: { pathname: string }) {
  const segs = pathname.split('/').filter(Boolean);
  if (segs.length <= 1) return null;
  const section = segs[1];
  const sectionLabel = SECTION_LABELS[section];
  if (!sectionLabel) return null;

  const crumbs: { label: string; href: string; active: boolean }[] = [
    { label: sectionLabel, href: `/admin/${section}`, active: segs.length === 2 },
  ];

  if (segs[2]) {
    const sub =
      segs[2] === 'novy' ? 'Nový produkt' :
      section === 'produkty' ? 'Upravit produkt' :
      section === 'objednavky' ? 'Detail objednávky' :
      section === 'customers' ? 'Detail zákazníka' :
      section === 'email-campaigns' && segs[2] === 'new' ? 'Nová kampaň' : 'Detail';
    crumbs.push({ label: sub, href: pathname, active: true });
  }

  return (
    <nav className="flex items-center gap-2 mb-6 text-xs uppercase tracking-wider" aria-label="Drobečková navigace">
      <Link href="/admin" className="text-[#666666] hover:text-black transition-colors font-medium">
        DASHBOARD
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-2 text-black">
          <span className="text-[#666666]">/</span>
          {crumb.active ? (
            <span className="font-bold">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="text-[#666666] hover:text-black transition-colors font-medium">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

const NAV_SECTIONS = [
  {
    label: 'Obsah & Systém',
    items: [
      { href: '/admin/domovska-stranka', label: 'Domovská stránka' },
      { href: '/admin/media', label: 'Média / Galerie' },
      { href: '/admin/stranky', label: 'Stránky' },
      { href: '/admin/seo-management', label: 'SEO' },
      { href: '/admin/nastaveni-uploadu', label: 'Diagnostika' },
    ],
  },
  {
    label: 'Obchod',
    items: [
      { href: '/admin/objednavky', label: 'Objednávky' },
      { href: '/admin/produkty', label: 'Produkty' },
      { href: '/admin/customers', label: 'Zákazníci' },
      { href: '/admin/promo-kody', label: 'Promo kódy' },
      { href: '/admin/pricing-rules', label: 'Cenová pravidla' },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { href: '/admin/newsletter', label: 'Newsletter' },
      { href: '/admin/emaily', label: 'E-maily a cesty' },
      { href: '/admin/email-campaigns', label: 'E-mail kampaně' },
      { href: '/admin/live-nabidky', label: 'Live nabídky' },
    ],
  },
];

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border border-black border-t-transparent animate-spin" />
          <span
            className="text-xs uppercase tracking-widest font-medium"
            style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif' }}
          >
            Načítání…
          </span>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'ADMIN') return null;

  const SidebarContent = () => (
    <div
      className="flex flex-col h-full bg-white text-black"
      style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif' }}
    >
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-black">
        <Link href="/admin/objednavky" className="block">
          <p
            className="text-sm font-bold uppercase tracking-wider text-black"
            style={{ fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif' }}
          >
            UFO SPORT
          </p>
          <p className="text-[10px] uppercase tracking-widest text-[#666666] mt-0.5">
            Admin panel
          </p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-0 py-2">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="px-5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#666666]">
              {section.label}
            </p>
            <div className="mt-1">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-5 py-2 text-xs uppercase tracking-wider transition-colors border-b border-black/5 ${
                      isActive
                        ? 'bg-black text-white font-medium'
                        : 'text-black hover:bg-black hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer info & Logout */}
      <div className="border-t border-black bg-white">
        <div className="px-5 py-3 border-b border-black/10 flex items-center justify-between text-[11px] uppercase tracking-wider text-[#666666]">
          <span className="truncate">{session.user?.email || 'Admin'}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="hover:text-black font-semibold uppercase"
          >
            Odhlásit
          </button>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-wider text-black hover:bg-black hover:text-white transition-colors"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Zpět na e-shop
        </Link>
      </div>
    </div>
  );

  return (
    <div
      data-admin
      className="min-h-screen bg-white text-black flex flex-col md:flex-row"
      style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif' }}
    >
      {/* Mobile top bar */}
      <header className="admin-mobile-bar md:hidden fixed top-0 left-0 right-0 border-b border-black bg-white flex items-center justify-between px-4 z-40">
        <Link href="/admin/objednavky" className="text-xs font-bold uppercase tracking-wider">
          UFO SPORT / ADMIN
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 hover:opacity-70 transition-opacity"
          aria-label="Menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-11 z-30 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative w-64 bg-white border-r border-black h-full overflow-y-auto">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="admin-sidebar hidden md:flex flex-col min-h-screen border-r border-black bg-white fixed top-0 left-0 bottom-0 z-30">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="admin-main flex-1 min-h-screen bg-white">
        <div className="p-[24px] md:p-[32px] max-w-[1600px]">
          <Breadcrumbs pathname={pathname} />
          {children}
        </div>
      </main>

      {/* Global Toast */}
      <ToastRenderer />
    </div>
  );
}
