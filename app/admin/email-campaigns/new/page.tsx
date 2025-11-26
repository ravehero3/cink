'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewEmailCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    targetAudience: 'all',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/email-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/email-campaigns');
      }
    } catch (error) {
      console.error('Failed to create campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/email-campaigns" className="text-sm border border-black px-3 py-1 mb-6 inline-block hover:bg-black hover:text-white transition-colors">
          ← Zpět
        </Link>

        <h1 
          className="mb-8 uppercase"
          style={{
            fontFamily: 'BB-CondBold, "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '32px',
            letterSpacing: '0.02em',
          }}
        >
          Nová emailová kampaň
        </h1>

        <form onSubmit={handleSubmit} className="border border-black p-8 space-y-6">
          <div>
            <label className="block text-xs uppercase font-medium mb-2">Název kampaně</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-black p-3 text-sm focus:outline-none"
              placeholder="např. Black Friday promoce"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-medium mb-2">Předmět emailu</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full border border-black p-3 text-sm focus:outline-none"
              placeholder="Subjekt emailu..."
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-medium mb-2">Cílová skupina</label>
            <select
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              className="w-full border border-black p-3 text-sm focus:outline-none"
            >
              <option value="all">Všichni přihlášení na newsletter</option>
              <option value="abandoned">Opustili nákupní košík</option>
              <option value="vip">VIP zákazníci</option>
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase font-medium mb-2">Obsah emailu</label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full border border-black p-3 text-sm focus:outline-none"
              rows={10}
              placeholder="Napište obsah emailu..."
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-black text-white border border-black uppercase text-sm hover:bg-white hover:text-black transition-colors disabled:opacity-50"
            >
              {loading ? 'Vytváření...' : 'Vytvořit kampaň'}
            </button>
            <Link href="/admin/email-campaigns" className="px-6 py-3 border border-black uppercase text-sm hover:bg-black hover:text-white transition-colors">
              Zrušit
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
