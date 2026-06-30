'use client';

import { useEffect, useState } from 'react';

interface NewsletterSubscriber {
  id: string;
  email: string;
  createdAt: string;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const response = await fetch('/api/admin/newsletter');
      if (response.ok) {
        const data = await response.json();
        setSubscribers(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Opravdu chcete odebrat odběratele "${email}"?`)) return;
    try {
      const response = await fetch(`/api/admin/newsletter/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchSubscribers();
      } else {
        alert('Nepodařilo se odebrat odběratele');
      }
    } catch (error) {
      console.error('Failed to delete subscriber:', error);
      alert('Došlo k chybě při odebírání');
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/admin/newsletter/export');
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Nepodařilo se exportovat CSV soubor');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Načítám odběratele…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Newsletter</h1>
          <p className="mt-1 text-sm text-gray-400">{subscribers.length} odběratelů celkem</p>
        </div>
        {subscribers.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Stáhnout CSV
          </button>
        )}
      </div>

      {/* Stat card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Celkem odběratelů</p>
          <p className="text-3xl font-bold text-gray-900">{subscribers.length}</p>
        </div>
        {subscribers.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Nejnovější</p>
            <p className="text-sm font-semibold text-gray-700 truncate">{subscribers[0]?.email}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(subscribers[0]?.createdAt).toLocaleDateString('cs-CZ')}
            </p>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">#</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Email</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Datum registrace</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {subscribers.map((subscriber, idx) => (
                <tr key={subscriber.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-300 font-mono w-10">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{subscriber.email}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(subscriber.createdAt).toLocaleDateString('cs-CZ', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(subscriber.id, subscriber.email)}
                      className="text-xs font-medium text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Odebrat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {subscribers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500">Žádní odběratelé</p>
            <p className="text-xs text-gray-400 mt-1">Odběratelé se zde zobrazí po registraci na e-shopu.</p>
          </div>
        )}
        {subscribers.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
            {subscribers.length} odběratelů
          </div>
        )}
      </div>
    </div>
  );
}
