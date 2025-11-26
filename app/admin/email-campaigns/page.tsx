'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, Edit } from 'lucide-react';

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

export default function EmailCampaignsPage() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/admin/email-campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm('Opravdu chcete odstranit tuto kampaň?')) return;
    try {
      const response = await fetch(`/api/admin/email-campaigns/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setCampaigns(campaigns.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete campaign:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'sent': return 'bg-black text-white';
      case 'scheduled': return 'bg-gray-100 text-black border border-black';
      case 'draft': return 'bg-white text-black border border-black';
      default: return 'bg-white text-black border border-black';
    }
  };

  const statusLabels: Record<string, string> = {
    draft: 'Koncept',
    scheduled: 'Naplánováno',
    sent: 'Odesláno'
  };

  if (loading) return <div className="p-8">Načítání...</div>;

  return (
    <div className="bg-white min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <h1 
            className="uppercase"
            style={{
              fontFamily: 'BB-CondBold, "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '32px',
              letterSpacing: '0.02em',
            }}
          >
            Emailové kampaně
          </h1>
          <Link 
            href="/admin/email-campaigns/new"
            className="px-6 py-3 border border-black bg-black text-white uppercase text-sm hover:bg-white hover:text-black transition-colors"
          >
            + Nová kampaň
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <div className="border border-black p-8 text-center">
            <p className="text-gray-600 mb-4">Zatím žádné emailové kampaně</p>
            <Link href="/admin/email-campaigns/new" className="border border-black px-4 py-2 inline-block hover:bg-black hover:text-white transition-colors">
              Vytvořit první kampaň
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="border border-black p-4 flex justify-between items-start hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <h3 className="font-medium uppercase mb-1">{campaign.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{campaign.subject}</p>
                  <div className="flex gap-4 text-xs">
                    <span><strong>Cílová skupina:</strong> {campaign.targetAudience === 'all' ? 'Všichni' : campaign.targetAudience}</span>
                    <span><strong>Stav:</strong> <span className={`px-2 py-1 ${getStatusBadge(campaign.status)}`}>{statusLabels[campaign.status] || campaign.status}</span></span>
                    {campaign.status === 'sent' && (
                      <>
                        <span><strong>Odesláno:</strong> {campaign.sentCount}</span>
                        <span><strong>Otevřeno:</strong> {campaign.openedCount} ({campaign.sentCount > 0 ? Math.round((campaign.openedCount / campaign.sentCount) * 100) : 0}%)</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link 
                    href={`/admin/email-campaigns/${campaign.id}`}
                    className="p-2 border border-black hover:bg-black hover:text-white transition-colors"
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    onClick={() => deleteCampaign(campaign.id)}
                    className="p-2 border border-black hover:bg-black hover:text-white transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
