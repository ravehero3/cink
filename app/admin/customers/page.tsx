'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  newsletterSubscribed: boolean;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  lastOrderDate: string | null;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'totalSpent' | 'createdAt'>('createdAt');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchCustomers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, filterRole]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`/api/admin/customers?sortBy=${sortBy}&role=${filterRole}`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputCls =
    'w-full text-sm bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-300';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Načítám zákazníky…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Zákazníci</h1>
        <p className="mt-0.5 text-sm text-gray-400">{filteredCustomers.length} zákazníků</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Hledat podle jména nebo e-mailu…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white placeholder:text-gray-300"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-700"
          >
            <option value="createdAt">Nejnovější</option>
            <option value="name">Jméno A–Z</option>
            <option value="totalSpent">Nejvíce utraceno</option>
          </select>

          {/* Role filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-700"
          >
            <option value="all">Všichni</option>
            <option value="USER">Zákazníci</option>
            <option value="ADMIN">Administrátoři</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400">Žádní zákazníci nenalezeni.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Jméno', 'E-mail', 'Telefon', 'Objednávky', 'Celkem utraceno', 'Poslední objednávka', 'Newsletter', 'Akce'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{customer.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{customer.email}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{customer.phone || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{customer.totalOrders}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{customer.totalSpent} Kč</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {customer.lastOrderDate
                        ? new Date(customer.lastOrderDate).toLocaleDateString('cs-CZ')
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-lg ${
                          customer.newsletterSubscribed
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {customer.newsletterSubscribed ? 'Ano' : 'Ne'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="text-xs font-semibold text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-400 transition-colors"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
