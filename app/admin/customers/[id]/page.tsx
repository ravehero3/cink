'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CustomerDetail {
  id: string;
  email: string;
  name: string;
  phone: string;
  newsletterSubscribed: boolean;
  createdAt: string;
  orders: any[];
}

const ORDER_STATUS: Record<string, string> = {
  PENDING: 'ČEKÁ',
  PAID: 'ZAPLACENO',
  PROCESSING: 'ZPRACOVÁVÁ SE',
  SHIPPED: 'ODESLÁNO',
  COMPLETED: 'DOKONČENO',
  CANCELLED: 'ZRUŠENO',
};

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/admin/customers/${params.id}`);
        if (res.ok) setCustomer(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3" style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
        <div className="w-4 h-4 border border-black border-t-transparent animate-spin" />
        <span className="text-xs uppercase tracking-widest text-[#666666]">Načítám zákazníka…</span>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="bg-white border border-black p-12 text-center" style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
        <p className="text-xs uppercase tracking-wider text-[#666666]">Zákazník nenalezen.</p>
        <Link href="/admin/customers" className="mt-4 inline-block text-xs uppercase font-bold text-black underline">
          ← Zpět na seznam
        </Link>
      </div>
    );
  }

  const totalSpent = customer.orders.reduce((sum: number, o: any) => sum + Number(o.totalPrice || 0), 0);

  return (
    <div className="space-y-8" style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif' }}>

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-black pb-4">
        <Link
          href="/admin/customers"
          className="flex items-center justify-center w-8 h-8 border border-black bg-white text-black hover:bg-black hover:text-white transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </Link>
        <div>
          <h1 className="admin-title">
            {customer.name || customer.email}
          </h1>
          <p className="admin-sub">Detail zákazníka</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Personal info */}
        <div className="bg-white border border-black p-6 space-y-4">
          <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest pb-2 border-b border-black">
            Osobní údaje
          </p>
          <div className="space-y-3">
            {[
              { label: 'Jméno', value: customer.name || '—' },
              { label: 'E-mail', value: customer.email },
              { label: 'Telefon', value: customer.phone || '—' },
              { label: 'Registrován/a', value: new Date(customer.createdAt).toLocaleDateString('cs-CZ') },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest">{label}</p>
                <p className="text-xs uppercase font-medium text-black mt-0.5">{value}</p>
              </div>
            ))}
            <div>
              <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-1">Newsletter</p>
              <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-black ${
                customer.newsletterSubscribed ? 'bg-black text-white' : 'bg-white text-black'
              }`}>
                {customer.newsletterSubscribed ? 'Přihlášen/a' : 'Odhlášen/a'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white border border-black p-6 space-y-4">
          <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest pb-2 border-b border-black">
            Přehled nákupů
          </p>
          <div className="grid grid-cols-2 gap-px bg-black border border-black">
            <div className="bg-white p-4 text-center">
              <p
                className="text-2xl font-bold text-black"
                style={{ fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif' }}
              >
                {customer.orders.length}
              </p>
              <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mt-1">Objednávek</p>
            </div>
            <div className="bg-white p-4 text-center">
              <p
                className="text-2xl font-bold text-black"
                style={{ fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif' }}
              >
                {totalSpent.toLocaleString('cs-CZ')}
              </p>
              <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mt-1">Kč celkem</p>
            </div>
          </div>
        </div>

        {/* Orders list */}
        <div className="lg:col-span-1 bg-white border border-black p-6">
          <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest pb-2 border-b border-black mb-4">
            Historie objednávek ({customer.orders.length})
          </p>
          {customer.orders.length === 0 ? (
            <p className="text-xs uppercase text-[#666666] text-center py-6">Žádné objednávky</p>
          ) : (
            <div className="space-y-3">
              {customer.orders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between pb-3 border-b border-black/10 last:border-0">
                  <div>
                    <Link
                      href={`/admin/objednavky/${order.id}`}
                      className="text-xs font-bold uppercase tracking-wider text-black hover:underline"
                    >
                      #{order.orderNumber}
                    </Link>
                    <p className="text-[10px] uppercase text-[#666666] mt-0.5">{new Date(order.createdAt).toLocaleDateString('cs-CZ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-black">{Number(order.totalPrice).toLocaleString('cs-CZ')} Kč</p>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 border border-black inline-block mt-0.5">
                      {ORDER_STATUS[order.status] || order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
