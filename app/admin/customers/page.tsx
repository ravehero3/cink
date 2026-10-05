'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { TableSkeleton, PageHeaderSkeleton } from '@/components/admin/Skeleton';

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

  if (loading) {
    return (
      <div className="space-y-6" style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
        <PageHeaderSkeleton />
        <div className="bg-white border border-black p-4">
          <div className="h-9 w-full bg-black/10 animate-pulse" />
        </div>
        <div className="bg-white border border-black overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-black">
              <tr>
                {['Jméno','E-mail','Telefon','Objednávky','Utraceno','Poslední objednávka','Newsletter','Akce'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-black uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody><TableSkeleton rows={8} cols={8} /></tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif' }}>

      {/* Header */}
      <div className="border-b border-black pb-4">
          <h1 className="admin-title">
            Zákazníci
          </h1>
          <p className="admin-sub">{filteredCustomers.length} zákazníků v databázi</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-black p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Hledat podle jména nebo e-mailu…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs uppercase pl-8 pr-3 py-2 border border-black focus:outline-none bg-white placeholder:text-black/30 tracking-wider"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs uppercase border border-black px-3 py-2 bg-white focus:outline-none text-black tracking-wider cursor-pointer"
          >
            <option value="createdAt">Nejnovější</option>
            <option value="name">Jméno A–Z</option>
            <option value="totalSpent">Nejvíce utraceno</option>
          </select>

          {/* Role filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="text-xs uppercase border border-black px-3 py-2 bg-white focus:outline-none text-black tracking-wider cursor-pointer"
          >
            <option value="all">Všichni</option>
            <option value="USER">Zákazníci</option>
            <option value="ADMIN">Administrátoři</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-black overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-16 text-xs uppercase tracking-wider text-[#666666]">Žádní zákazníci nenalezeni.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-white border-b border-black">
                <tr>
                  {['Jméno', 'E-mail', 'Telefon', 'Objednávky', 'Celkem utraceno', 'Poslední objednávka', 'Newsletter', 'Akce'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[10px] font-bold text-black uppercase tracking-widest whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-black/5 transition-colors">
                    <td className="px-4 py-3 font-bold uppercase text-black">{customer.name || '—'}</td>
                    <td className="px-4 py-3 text-[#666666]">{customer.email}</td>
                    <td className="px-4 py-3 text-[#666666]">{customer.phone || '—'}</td>
                    <td className="px-4 py-3 font-bold text-black">{customer.totalOrders}</td>
                    <td className="px-4 py-3 font-bold text-black">{Number(customer.totalSpent).toLocaleString('cs-CZ')} Kč</td>
                    <td className="px-4 py-3 text-[#666666] whitespace-nowrap">
                      {customer.lastOrderDate
                        ? new Date(customer.lastOrderDate).toLocaleDateString('cs-CZ')
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-black ${
                          customer.newsletterSubscribed
                            ? 'bg-black text-white'
                            : 'bg-white text-black'
                        }`}
                      >
                        {customer.newsletterSubscribed ? 'Ano' : 'Ne'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="text-[10px] font-bold uppercase tracking-wider text-black border border-black bg-white hover:bg-black hover:text-white px-2.5 py-1 transition-colors whitespace-nowrap inline-block"
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
