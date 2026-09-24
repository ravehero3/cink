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
      const res = await fetch('/api/admin/email-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) router.push('/admin/email-campaigns');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-[24px]">
      <div className="flex items-center gap-3 border-b border-black pb-4">
        <Link href="/admin/email-campaigns" className="admin-btn admin-btn-secondary" style={{ padding: 8 }} aria-label="Zpět">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="admin-title">Nová kampaň</h1>
          <p className="admin-sub">Vyplňte detaily nové e-mailové kampaně</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-card p-[24px] space-y-[16px]">
          <p className="admin-label">Základní informace</p>

          <div>
            <label className="admin-label">Název kampaně *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="admin-input"
              placeholder="např. Black Friday promoce"
            />
          </div>

          <div>
            <label className="admin-label">Předmět e-mailu *</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="admin-input"
              placeholder="Předmět e-mailu…"
            />
          </div>

          <div>
            <label className="admin-label">Cílová skupina</label>
            <select
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              className="admin-select"
            >
              <option value="all">Všichni přihlášení na newsletter</option>
              <option value="abandoned">Opustili nákupní košík</option>
              <option value="vip">VIP zákazníci</option>
            </select>
          </div>

          <div>
            <label className="admin-label">Obsah e-mailu *</label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="admin-textarea"
              rows={12}
              placeholder="Napište obsah e-mailu…"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-[16px]">
          <button type="submit" disabled={loading} className="admin-btn">
            {loading ? 'Vytváření…' : 'Vytvořit kampaň'}
          </button>
          <Link href="/admin/email-campaigns" className="admin-btn admin-btn-secondary">
            Zrušit
          </Link>
        </div>
      </form>
    </div>
  );
}
