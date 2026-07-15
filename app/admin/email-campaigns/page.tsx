'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, Edit, Mail } from 'lucide-react';

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

const STATUS_STYLES: Record<string, string> = {
  sent: 'bg-emerald-50 text-emerald-700',
  scheduled: 'bg-blue-50 text-blue-700',
  draft: 'bg-gray-100 text-gray-500',
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
      <div className="flex items-center justify-center h-60">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Načítám kampaně…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">E-mailové kampaně</h1>
          <p className="mt-0.5 text-sm text-gray-400">{campaigns.length} kampaní celkem</p>
        </div>
        <Link
          href="/admin/email-campaigns/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nová kampaň
        </Link>
      </div>

      {/* List */}
      {campaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 flex flex-col items-center gap-4 text-center">
          <Mail size={40} className="text-gray-300" />
          <div>
            <p className="text-base font-semibold text-gray-700">Zatím žádné kampaně</p>
            <p className="text-sm text-gray-400 mt-1">Vytvořte svoji první e-mailovou kampaň.</p>
          </div>
          <Link
            href="/admin/email-campaigns/new"
            className="mt-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors"
          >
            Vytvořit kampaň
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="px-6 py-5 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide truncate">{campaign.name}</h3>
                    <span className={`inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md ${STATUS_STYLES[campaign.status] || STATUS_STYLES.draft}`}>
                      {STATUS_LABELS[campaign.status] || campaign.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate mb-2">{campaign.subject}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                    <span>
                      Cílová skupina: <span className="text-gray-600 font-medium">
                        {campaign.targetAudience === 'all' ? 'Všichni' : campaign.targetAudience}
                      </span>
                    </span>
                    {campaign.status === 'sent' && (
                      <>
                        <span>Odesláno: <span className="text-gray-600 font-medium">{campaign.sentCount}</span></span>
                        <span>
                          Otevřeno: <span className="text-gray-600 font-medium">
                            {campaign.openedCount} ({campaign.sentCount > 0 ? Math.round((campaign.openedCount / campaign.sentCount) * 100) : 0}%)
                          </span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    href={`/admin/email-campaigns/${campaign.id}`}
                    className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Upravit"
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    onClick={() => deleteCampaign(campaign.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Smazat"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
