'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EmailEditor from '@/components/EmailBuilder/EmailEditor';
import EmailCampaignModal from '@/components/EmailBuilder/EmailCampaignModal';

export default function EmailBuilderPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch campaigns on mount
  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/email-campaigns');
      if (!res.ok) throw new Error('Failed to fetch campaigns');
      const data = await res.json();
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedCampaign(null);
  };

  const handleSelectCampaign = (campaign: any) => {
    setSelectedCampaign(campaign);
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Opravdu chcete smazat tuto kampaň?')) return;
    try {
      const res = await fetch(`/api/email-campaigns/${campaignId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete campaign');
      fetchCampaigns();
      setSelectedCampaign(null);
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Left Sidebar - Campaign List */}
      <div
        style={{
          width: '300px',
          borderRight: '1px solid #ddd',
          backgroundColor: '#fff',
          overflowY: 'auto',
          padding: '20px',
        }}
      >
        <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 'bold' }}>
          Email Kampaně
        </h2>
        <button
          onClick={handleCreateNew}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '20px',
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          + Nová kampaň
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              onClick={() => handleSelectCampaign(campaign)}
              style={{
                padding: '12px',
                backgroundColor: selectedCampaign?.id === campaign.id ? '#f0f0f0' : '#fff',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (selectedCampaign?.id !== campaign.id) {
                  e.currentTarget.style.backgroundColor = '#f9f9f9';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCampaign?.id !== campaign.id) {
                  e.currentTarget.style.backgroundColor = '#fff';
                }
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                {campaign.name}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                Předmět: {campaign.subject}
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                <span
                  style={{
                    backgroundColor: campaign.status === 'draft' ? '#ffc107' : '#28a745',
                    color: '#fff',
                    padding: '2px 6px',
                    borderRadius: '3px',
                  }}
                >
                  {campaign.status === 'draft' ? 'Koncept' : 'Odesláno'}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCampaign(campaign.id);
                }}
                style={{
                  marginTop: '8px',
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >
                Smazat
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Editor */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {selectedCampaign === null ? (
          <div style={{ padding: '40px' }}>
            <h1 style={{ marginBottom: '20px' }}>Vytvořit novou kampaň</h1>
            <EmailEditor
              onSave={(campaign) => {
                fetchCampaigns();
                setSelectedCampaign(campaign);
              }}
            />
          </div>
        ) : (
          <div style={{ padding: '40px' }}>
            <h1 style={{ marginBottom: '20px' }}>Upravit kampaň</h1>
            <EmailEditor
              campaign={selectedCampaign}
              onSave={(campaign) => {
                fetchCampaigns();
                setSelectedCampaign(campaign);
              }}
            />
          </div>
        )}
      </div>

      {showCampaignModal && (
        <EmailCampaignModal
          campaign={selectedCampaign}
          onClose={() => setShowCampaignModal(false)}
          onSend={() => {
            setShowCampaignModal(false);
            fetchCampaigns();
          }}
        />
      )}
    </div>
  );
}
