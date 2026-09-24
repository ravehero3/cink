'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  targetAudience: string;
  sentCount: number;
  openedCount: number;
  sentAt: string | null;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Koncept',
  scheduled: 'Naplánováno',
  sent: 'Odesláno',
};

export default function EmailCampaignsPage() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCampaigns(); }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/admin/email-campaigns');
      if (res.ok) setCampaigns(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm('Opravdu chcete odstranit tuto kampaň?')) return;
    try {
      const res = await fetch(`/api/admin/email-campaigns/${id}`, { method: 'DELETE' });
      if (res.ok) setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-12">
        <div className="admin-spinner" />
        <span className="admin-sub" style={{ margin: 0 }}>Načítám kampaně…</span>
      </div>
    );
  }

  return (
    <div className="space-y-[24px]">
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-black pb-4">
        <div>
          <h1 className="admin-title">E-mailové kampaně</h1>
          <p className="admin-sub">{campaigns.length} kampaní celkem</p>
        </div>
        <Link href="/admin/email-campaigns/new" className="admin-btn">
          + Nová kampaň
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="admin-card admin-empty">
          <p>Zatím žádné kampaně</p>
          <p className="mt-[8px]">Vytvořte svoji první e-mailovou kampaň.</p>
          <Link href="/admin/email-campaigns/new" className="admin-btn mt-[16px]">
            Vytvořit kampaň
          </Link>
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          {campaigns.map((campaign, idx) => (
            <div
              key={campaign.id}
              className={`px-[24px] py-[20px] flex items-start justify-between gap-4 hover:bg-black/5 transition-colors ${
                idx !== campaigns.length - 1 ? 'border-b border-black' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider truncate">{campaign.name}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-[4px] border border-black">
                    {STATUS_LABELS[campaign.status] || campaign.status}
                  </span>
                </div>
                <p className="text-xs uppercase tracking-wider text-[#666666] truncate mb-2">{campaign.subject}</p>
                <div className="flex flex-wrap gap-4 text-[11px] uppercase tracking-wider text-[#666666]">
                  <span>
                    Cílová skupina:{' '}
                    <span className="text-black font-medium">
                      {campaign.targetAudience === 'all' ? 'Všichni' : campaign.targetAudience}
                    </span>
                  </span>
                  {campaign.status === 'sent' && (
                    <>
                      <span>Odesláno: <span className="text-black font-medium">{campaign.sentCount}</span></span>
                      <span>
                        Otevřeno:{' '}
                        <span className="text-black font-medium">
                          {campaign.openedCount} ({campaign.sentCount > 0 ? Math.round((campaign.openedCount / campaign.sentCount) * 100) : 0}%)
                        </span>
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/admin/email-campaigns/${campaign.id}`}
                  className="admin-btn admin-btn-secondary"
                  style={{ padding: '6px 12px', fontSize: 10 }}
                >
                  Upravit
                </Link>
                <button
                  onClick={() => deleteCampaign(campaign.id)}
                  className="admin-btn admin-btn-secondary"
                  style={{ padding: '6px 12px', fontSize: 10 }}
                >
                  Smazat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
