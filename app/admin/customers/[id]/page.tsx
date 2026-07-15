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
  PENDING: 'Čeká',
  PAID: 'Zaplaceno',
  PROCESSING: 'Zpracovává se',
  SHIPPED: 'Odesláno',
  COMPLETED: 'Dokončeno',
  CANCELLED: 'Zrušeno',
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
      <div className="flex items-center justify-center h-60">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Načítám zákazníka…</span>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <p className="text-sm text-gray-500">Zákazník nenalezen.</p>
        <Link href="/admin/customers" className="mt-4 inline-block text-sm font-semibold text-gray-900 underline">
          ← Zpět na seznam
        </Link>
      </div>
    );
  }

  const totalSpent = customer.orders.reduce((sum: number, o: any) => sum + Number(o.totalPrice || 0), 0);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/customers"
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{customer.name || customer.email}</h1>
          <p className="mt-0.5 text-sm text-gray-400">Detail zákazníka</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Personal info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Osobní údaje</p>
          <div className="space-y-3">
            {[
              { label: 'Jméno', value: customer.name || '—' },
              { label: 'E-mail', value: customer.email },
              { label: 'Telefon', value: customer.phone || '—' },
              { label: 'Registrován/a', value: new Date(customer.createdAt).toLocaleDateString('cs-CZ') },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
                <p className="text-sm text-gray-900 mt-0.5 font-medium">{value}</p>
              </div>
            ))}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Newsletter</p>
              <span className={`inline-block mt-0.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${
                customer.newsletterSubscribed ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {customer.newsletterSubscribed ? 'Přihlášen/a' : 'Odhlášen/a'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Přehled</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{customer.orders.length}</p>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Objednávky</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{totalSpent.toLocaleString('cs-CZ')}</p>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Kč celkem</p>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Objednávky ({customer.orders.length})
          </p>
          {customer.orders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Žádné objednávky</p>
          ) : (
            <div className="space-y-2">
              {customer.orders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('cs-CZ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{Number(order.totalPrice).toLocaleString('cs-CZ')} Kč</p>
                    <p className="text-xs text-gray-400">{ORDER_STATUS[order.status] || order.status}</p>
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
