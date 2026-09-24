'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/store/toastStore';
import ConfirmModal from '@/components/admin/ConfirmModal';

interface NewsletterSubscriber {
  id: string;
  email: string;
  createdAt: string;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const [deleteModal, setDeleteModal] = useState<{ id: string; email: string } | null>(null);

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

  const handleDelete = (id: string, email: string) => {
    setDeleteModal({ id, email });
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    try {
      const response = await fetch(`/api/admin/newsletter/${deleteModal.id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Odběratel byl odebrán');
        fetchSubscribers();
      } else {
        toast.error('Nepodařilo se odebrat odběratele');
      }
    } catch {
      toast.error('Došlo k chybě při odebírání');
    } finally {
      setDeleteModal(null);
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
      toast.error('Nepodařilo se exportovat CSV soubor');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-12">
        <div className="admin-spinner" />
        <span className="admin-sub" style={{ margin: 0 }}>Načítám odběratele…</span>
      </div>
    );
  }

  return (
    <div className="space-y-[24px]">
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-black pb-4">
        <div>
          <h1 className="admin-title">Newsletter</h1>
          <p className="admin-sub">{subscribers.length} odběratelů celkem</p>
        </div>
        {subscribers.length > 0 && (
          <button onClick={handleExportCSV} className="admin-btn admin-btn-secondary">
            Stáhnout CSV
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-black border border-black">
        <div className="bg-white p-[20px]">
          <p className="admin-label">Celkem odběratelů</p>
          <p className="admin-title" style={{ fontSize: 23 }}>{subscribers.length}</p>
        </div>
        {subscribers.length > 0 && (
          <div className="bg-white p-[20px]">
            <p className="admin-label">Nejnovější</p>
            <p className="text-xs uppercase tracking-wider font-medium truncate">{subscribers[0]?.email}</p>
            <p className="admin-sub">
              {new Date(subscribers[0]?.createdAt).toLocaleDateString('cs-CZ')}
            </p>
          </div>
        )}
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-black">
              <tr>
                <th className="admin-th">#</th>
                <th className="admin-th">Email</th>
                <th className="admin-th">Datum registrace</th>
                <th className="admin-th">Akce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {subscribers.map((subscriber, idx) => (
                <tr key={subscriber.id} className="hover:bg-black/5 transition-colors">
                  <td className="admin-td text-[#666666] w-10">{idx + 1}</td>
                  <td className="admin-td font-medium">{subscriber.email}</td>
                  <td className="admin-td text-[#666666] whitespace-nowrap">
                    {new Date(subscriber.createdAt).toLocaleDateString('cs-CZ', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="admin-td">
                    <button
                      onClick={() => handleDelete(subscriber.id, subscriber.email)}
                      className="admin-btn admin-btn-secondary"
                      style={{ padding: '6px 12px', fontSize: 10 }}
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
          <div className="admin-empty">Žádní odběratelé. Zobrazí se po registraci na e-shopu.</div>
        )}
        {subscribers.length > 0 && (
          <div className="px-4 py-3 border-t border-black text-xs uppercase tracking-wider text-[#666666]">
            {subscribers.length} odběratelů
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={!!deleteModal}
        title="Odebrat odběratele"
        message={`Opravdu chcete odebrat odběratele „${deleteModal?.email}"? Tuto akci nelze vrátit zpět.`}
        confirmLabel="Odebrat"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal(null)}
      />
    </div>
  );
}
