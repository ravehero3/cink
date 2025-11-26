'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

  const filteredCustomers = customers.filter(customer =>
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8">Načítání...</div>;

  return (
    <div className="bg-white min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 
          className="mb-8 uppercase"
          style={{
            fontFamily: 'BB-CondBold, "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '32px',
            letterSpacing: '0.02em',
          }}
        >
          Správa zákazníků
        </h1>

        <div className="mb-6 border-b border-black pb-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <input
              type="text"
              placeholder="Hledat podle jména nebo e-mailu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="col-span-2 border border-black p-3 text-sm focus:outline-none"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-black p-3 text-sm focus:outline-none"
            >
              <option value="createdAt">Nejnovější</option>
              <option value="name">Jméno A-Z</option>
              <option value="totalSpent">Nejvíce utraceno</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm uppercase mr-4">Typ:</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="border border-black p-2 text-sm focus:outline-none"
            >
              <option value="all">Všichni</option>
              <option value="USER">Běžní zákazníci</option>
              <option value="ADMIN">Administrátoři</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black">
                <th className="py-3 px-2 uppercase font-medium text-xs" style={{ letterSpacing: '0.03em' }}>Jméno</th>
                <th className="py-3 px-2 uppercase font-medium text-xs" style={{ letterSpacing: '0.03em' }}>E-mail</th>
                <th className="py-3 px-2 uppercase font-medium text-xs" style={{ letterSpacing: '0.03em' }}>Telefon</th>
                <th className="py-3 px-2 uppercase font-medium text-xs" style={{ letterSpacing: '0.03em' }}>Objednávky</th>
                <th className="py-3 px-2 uppercase font-medium text-xs" style={{ letterSpacing: '0.03em' }}>Celkem utraceno</th>
                <th className="py-3 px-2 uppercase font-medium text-xs" style={{ letterSpacing: '0.03em' }}>Poslední objednávka</th>
                <th className="py-3 px-2 uppercase font-medium text-xs" style={{ letterSpacing: '0.03em' }}>Newsletter</th>
                <th className="py-3 px-2 uppercase font-medium text-xs" style={{ letterSpacing: '0.03em' }}>Akce</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer, idx) => (
                <tr key={customer.id} className={idx !== filteredCustomers.length - 1 ? 'border-b border-black' : ''}>
                  <td className="py-3 px-2">{customer.name || '—'}</td>
                  <td className="py-3 px-2 text-xs">{customer.email}</td>
                  <td className="py-3 px-2 text-xs">{customer.phone || '—'}</td>
                  <td className="py-3 px-2 font-medium">{customer.totalOrders}</td>
                  <td className="py-3 px-2 font-medium">{customer.totalSpent} Kč</td>
                  <td className="py-3 px-2 text-xs">
                    {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString('cs-CZ') : '—'}
                  </td>
                  <td className="py-3 px-2">
                    <span className={`text-xs px-2 py-1 ${customer.newsletterSubscribed ? 'bg-black text-white' : 'bg-white border border-black'}`}>
                      {customer.newsletterSubscribed ? 'Ano' : 'Ne'}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <Link href={`/admin/customers/${customer.id}`} className="border border-black px-3 py-1 text-xs hover:bg-black hover:text-white transition-colors">
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-sm text-gray-600">
          Celkem: <strong>{filteredCustomers.length}</strong> zákazníků
        </div>
      </div>
    </div>
  );
}
