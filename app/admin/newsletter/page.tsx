'use client';

import { useEffect, useState } from 'react';

interface NewsletterSubscriber {
  id: string;
  email: string;
  civility: string;
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
      const response = await fetch(`/api/admin/newsletter/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Odběratel byl odebrán');
        fetchSubscribers();
      } else {
        alert('Nepodařilo se odebrat odběratele');
      }
    } catch (error) {
      console.error('Failed to delete subscriber:', error);
      alert('Došlo k chybě při odebírání');
    }
  };

  const exportToCSV = () => {
    const headers = ['Email', 'Oslovení', 'Datum registrace'];
    const rows = subscribers.map((sub) => [
      sub.email,
      sub.civility,
      new Date(sub.createdAt).toLocaleDateString('cs-CZ'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="text-body">Načítání odběratelů...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-title font-bold">NEWSLETTER ODBĚRATELÉ</h1>
        {subscribers.length > 0 && (
          <button
            onClick={exportToCSV}
            className="bg-black text-white px-6 py-3 text-body uppercase hover:bg-white hover:text-black border border-black transition-colors"
          >
            Exportovat CSV
          </button>
        )}
      </div>

      {/* Statistics */}
      <div className="border border-black p-6 mb-8">
        <div className="text-body">
          <strong>Celkem odběratelů:</strong> {subscribers.length}
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="border border-black">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black">
              <th className="text-left p-4 text-body uppercase">Email</th>
              <th className="text-left p-4 text-body uppercase">Oslovení</th>
              <th className="text-left p-4 text-body uppercase">Datum registrace</th>
              <th className="text-left p-4 text-body uppercase">Akce</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((subscriber) => (
              <tr key={subscriber.id} className="border-b border-black last:border-b-0">
                <td className="p-4 text-body">{subscriber.email}</td>
                <td className="p-4 text-body uppercase">{subscriber.civility}</td>
                <td className="p-4 text-body">
                  {new Date(subscriber.createdAt).toLocaleDateString('cs-CZ', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleDelete(subscriber.id, subscriber.email)}
                    className="px-3 py-1 text-body uppercase border border-black hover:bg-black hover:text-white"
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
        <div className="text-center py-12 text-body">
          Žádní odběratelé newsletteru nebyli nalezeni.
        </div>
      )}
    </div>
  );
}
