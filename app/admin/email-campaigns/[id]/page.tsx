'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditEmailCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    targetAudience: 'all',
    status: 'draft',
  });
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const res = await fetch(`/api/admin/email-campaigns/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            name: data.name,
            subject: data.subject,
            content: data.content,
            targetAudience: data.targetAudience,
            status: data.status,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchCampaign();
  }, [params.id]);

  useEffect(() => {
    if (initialLoading) return;
    const timer = setTimeout(async () => {
      if (!formData.content) return setPreviewHtml('');
      setPreviewLoading(true);
      try {
        const res = await fetch('/api/admin/email-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject: formData.subject, content: formData.content }),
        });
        if (res.ok) setPreviewHtml(await res.text());
      } catch (e) {
        console.error(e);
      } finally {
        setPreviewLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.subject, formData.content, initialLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/email-campaigns/${params.id}`, {
        method: 'PATCH',
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

  const toggleStatus = async () => {
    const newStatus = formData.status === 'scheduled' ? 'draft' : 'scheduled';
    try {
      const res = await fetch(`/api/admin/email-campaigns/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setFormData({ ...formData, status: newStatus });
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center gap-3 py-12">
        <div className="admin-spinner" />
        <span className="admin-sub" style={{ margin: 0 }}>Načítám kampaň…</span>
      </div>
    );
  }

  return (
    <div className="space-y-[24px]">
      <div className="flex items-center justify-between gap-4 border-b border-black pb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/admin/email-campaigns" className="admin-btn admin-btn-secondary" style={{ padding: 8 }} aria-label="Zpět">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="admin-title">Upravit kampaň</h1>
            <p className="admin-sub">Úprava a náhled stávající e-mailové kampaně</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={toggleStatus} 
            className={`admin-btn ${formData.status === 'scheduled' ? 'admin-btn-secondary' : ''}`}
          >
            {formData.status === 'scheduled' ? 'Pozastavit (Odebrat z plánu)' : 'Naplánovat k odeslání'}
          </button>
          {formData.status === 'scheduled' && (
             <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Aktivní</span>
          )}
          {formData.status === 'draft' && (
             <span className="text-[10px] font-bold text-[#666666] uppercase tracking-wider">Pozastaveno</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[16px]">
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
              />
            </div>
          </div>

          <div className="flex gap-2 mt-[16px]">
            <button type="submit" disabled={loading} className="admin-btn">
              {loading ? 'Ukládání…' : 'Uložit změny'}
            </button>
            <Link href="/admin/email-campaigns" className="admin-btn admin-btn-secondary">
              Zrušit
            </Link>
          </div>
        </form>

        <div className="admin-card overflow-hidden flex flex-col">
          <div className="px-[20px] py-[12px] border-b border-black flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider">Náhled e-mailu</p>
            {previewLoading && <div className="admin-spinner" style={{ width: 14, height: 14 }} />}
          </div>
          <div className="overflow-y-auto bg-white flex-1 relative" style={{ minHeight: 600 }}>
            {previewHtml ? (
              <iframe
                srcDoc={previewHtml}
                className="w-full h-full border-0 absolute inset-0"
                title="Náhled"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="admin-sub" style={{ margin: 0 }}>Začněte psát obsah pro zobrazení náhledu</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
