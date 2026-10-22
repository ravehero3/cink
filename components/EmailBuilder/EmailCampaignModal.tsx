'use client';

import { useState, useEffect } from 'react';

export default function EmailCampaignModal({
  campaign,
  onClose,
  onSend,
}: {
  campaign: any;
  onClose: any;
  onSend: any;
}) {
  const [subscribers, setSubscribers] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState('all');
  const [customEmails, setCustomEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/newsletter-subscribers');
      if (!res.ok) throw new Error('Failed to fetch subscribers');
      const data = await res.json();
      setSubscribers(data);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!campaign?.id) {
      alert('Kampaň musí být nejdříve uložena');
      return;
    }

    let recipientEmails = [];
    if (selectedEmails === 'all') {
      recipientEmails = subscribers.map((s) => s.email);
    } else if (selectedEmails === 'custom') {
      recipientEmails = customEmails
        .split('\n')
        .map((e) => e.trim())
        .filter((e) => e);
    }

    if (recipientEmails.length === 0) {
      alert('Vyberte alespoň jednoho příjemce');
      return;
    }

    if (!confirm(`Opravdu chcete poslat email ${recipientEmails.length} příjemcům?`)) {
      return;
    }

    try {
      setSending(true);
      const res = await fetch(`/api/email-campaigns/${campaign.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmails }),
      });

      if (!res.ok) throw new Error('Failed to send campaign');
      alert('Kampaň poslána!');
      onSend();
      onClose();
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Chyba při odesílání kampaně');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '30px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0 }}>Odeslat kampaň</h2>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '12px' }}>Vyberte příjemce</h3>

          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', cursor: 'pointer' }}>
            <input
              type="radio"
              value="all"
              checked={selectedEmails === 'all'}
              onChange={(e) => setSelectedEmails(e.target.value)}
              style={{ marginRight: '8px' }}
            />
            <span>Všichni odběratelé ({subscribers.length})</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', cursor: 'pointer' }}>
            <input
              type="radio"
              value="custom"
              checked={selectedEmails === 'custom'}
              onChange={(e) => setSelectedEmails(e.target.value)}
              style={{ marginRight: '8px' }}
            />
            <span>Vlastní seznam emaily</span>
          </label>

          {selectedEmails === 'custom' && (
            <div style={{ marginLeft: '24px', marginTop: '12px' }}>
              <textarea
                value={customEmails}
                onChange={(e) => setCustomEmails(e.target.value)}
                placeholder="Emaily oddělené novými řádky..."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  minHeight: '150px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Zrušit
          </button>
          <button
            onClick={handleSend}
            disabled={sending || (selectedEmails === 'custom' && customEmails.trim() === '')}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              opacity: sending ? 0.6 : 1,
            }}
          >
            {sending ? 'Odesílám...' : 'Poslat kampaň'}
          </button>
        </div>
      </div>
    </div>
  );
}
