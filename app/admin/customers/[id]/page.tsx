'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomer();
  }, []);

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/admin/customers/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setCustomer(data);
      }
    } catch (error) {
      console.error('Failed to fetch customer:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Načítání...</div>;
  if (!customer) return <div className="p-8">Zákazník nenalezen</div>;

  return (
    <div className="bg-white min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/customers" className="text-sm border border-black px-3 py-1 mb-6 inline-block hover:bg-black hover:text-white transition-colors">
          ← Zpět na seznam
        </Link>

        <h1 
          className="mb-8 uppercase"
          style={{
            fontFamily: 'BB-CondBold, "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '32px',
            letterSpacing: '0.02em',
          }}
        >
          Detail zákazníka
        </h1>

        <div className="border border-black p-6 mb-8">
          <h2 className="uppercase font-medium mb-4">Osobní údaje</h2>
          <div className="space-y-3 text-sm">
            <div><span className="font-medium">Jméno:</span> {customer.name || '—'}</div>
            <div><span className="font-medium">Email:</span> {customer.email}</div>
            <div><span className="font-medium">Telefon:</span> {customer.phone || '—'}</div>
            <div><span className="font-medium">Newsletter:</span> {customer.newsletterSubscribed ? 'Přihlášen/a' : 'Odhlášen/a'}</div>
            <div><span className="font-medium">Registrován/a:</span> {new Date(customer.createdAt).toLocaleDateString('cs-CZ')}</div>
          </div>
        </div>

        <div className="border border-black p-6">
          <h2 className="uppercase font-medium mb-4">Objednávky ({customer.orders.length})</h2>
          {customer.orders.length === 0 ? (
            <p className="text-gray-600">Žádné objednávky</p>
          ) : (
            <div className="space-y-2">
              {customer.orders.map((order: any) => (
                <div key={order.id} className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <div>
                    <p className="font-medium text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('cs-CZ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{order.totalPrice} Kč</p>
                    <p className="text-xs">{order.status}</p>
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
