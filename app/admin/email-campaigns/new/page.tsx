'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUploadModal from '@/components/admin/ImageUploadModal';

type Step = 'basic' | 'template' | 'send';

interface FormData {
  name: string;
  subject: string;
  header2Title: string;
  header2Subtitle: string;
  content: string;
  targetAudience: 'all' | 'abandoned' | 'vip';
  storyImage?: string;
  showBrowseAll?: boolean;
}

export default function NewEmailCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('basic');
  const [loading, setLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [campaigns, setCampaigns] = useState<any>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    subject: '',
    header2Title: '',
    header2Subtitle: '',
    content: '',
    targetAudience: 'all',
    showBrowseAll: true,
  });

  // Generate preview
  useEffect(() => {
    if (step !== 'template' || !formData.subject) return;
    
    const timer = setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const res = await fetch('/api/admin/email-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: formData.subject,
            preheader: formData.header2Subtitle,
            header2Title: formData.header2Title,
            header2Subtitle: formData.header2Subtitle,
            infoHtml: formData.content,
            actionText: '',
            actionButton: { label: 'PŘEJÍT DO OBCHODU', href: process.env.NEXT_PUBLIC_SITE_URL || 'https://ufosport.cz' },
            showBrowseAll: formData.showBrowseAll,
            marketing: true,
            customization: formData.storyImage ? { storyImage: formData.storyImage } : undefined,
          }),
        });
        if (res.ok) setPreviewHtml(await res.text());
      } catch (e) {
        console.error(e);
      } finally {
        setPreviewLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData, step]);

  const handleBasicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.subject || !formData.header2Title) {
      alert('Vyplňte všechna povinná pole');
      return;
    }
    setStep('template');
  };

  const handleSaveCampaign = async () => {
    if (!formData.content) {
      alert('Napište obsah e-mailu');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/admin/email-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const campaign = await res.json();
        setCampaigns(campaign);
        setStep('send');
      } else {
        alert('Chyba při vytváření kampaně');
      }
    } catch (e) {
      console.error(e);
      alert('Chyba připojení');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      alert('Zadejte e-mail');
      return;
    }
    
    setSendLoading(true);
    try {
      const res = await fetch('/api/admin/email-campaigns/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaigns?.id,
          testEmail,
          html: previewHtml,
        }),
      });
      if (res.ok) {
        alert('Testovací e-mail odeslán!');
        setTestEmail('');
      } else {
        alert('Chyba při odesílání testovacího e-mailu');
      }
    } catch (e) {
      console.error(e);
      alert('Chyba připojení');
    } finally {
      setSendLoading(false);
    }
  };

  const handleSendCampaign = async (scheduled = false) => {
    setSendLoading(true);
    try {
      const res = await fetch(`/api/admin/email-campaigns/${campaigns.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduled,
          scheduledFor: scheduled ? `${scheduleDate}T${scheduleTime}` : null,
          html: previewHtml,
        }),
      });
      if (res.ok) {
        alert(scheduled ? 'Kampaň naplánována!' : 'Kampaň odesílána!');
        router.push('/admin/email-campaigns');
      } else {
        alert('Chyba při odesílání kampaně');
      }
    } catch (e) {
      console.error(e);
      alert('Chyba připojení');
    } finally {
      setSendLoading(false);
    }
  };

  return (
    <div className="space-y-[24px]">
      <div className="flex items-center gap-3 border-b border-black pb-4">
        <Link 
          href="/admin/email-campaigns" 
          className="admin-btn admin-btn-secondary" 
          style={{ padding: 8 }} 
          aria-label="Zpět"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="admin-title">Nová e-mailová kampaň</h1>
          <p className="admin-sub">
            {step === 'basic' && 'Krok 1: Základní informace'}
            {step === 'template' && 'Krok 2: Obsah e-mailu'}
            {step === 'send' && 'Krok 3: Odeslání kampaně'}
          </p>
        </div>
      </div>

      {/* STEP 1: BASIC INFO */}
      {step === 'basic' && (
        <form onSubmit={handleBasicSubmit}>
          <div className="admin-card p-[24px] space-y-[16px] max-w-2xl">
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
              <label className="admin-label">Nadpis sekce *</label>
              <input
                type="text"
                required
                value={formData.header2Title}
                onChange={(e) => setFormData({ ...formData, header2Title: e.target.value })}
                className="admin-input"
                placeholder="Hlavní nadpis e-mailu…"
              />
            </div>

            <div>
              <label className="admin-label">Podnadpis sekce</label>
              <input
                type="text"
                value={formData.header2Subtitle}
                onChange={(e) => setFormData({ ...formData, header2Subtitle: e.target.value })}
                className="admin-input"
                placeholder="Podnadpis…"
              />
            </div>

            <div>
              <label className="admin-label">Cílová skupina</label>
              <select
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                className="admin-select"
              >
                <option value="all">Všichni přihlášení na newsletter</option>
                <option value="abandoned">Opustili nákupní košík</option>
                <option value="vip">VIP zákazníci</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showBrowseAll"
                checked={formData.showBrowseAll}
                onChange={(e) => setFormData({ ...formData, showBrowseAll: e.target.checked })}
                className="w-4 h-4 border border-black"
              />
              <label htmlFor="showBrowseAll" className="admin-label" style={{ margin: 0 }}>
                Zobrazit tlačítko "ZOBRAZIT VŠE"
              </label>
            </div>
          </div>

          <div className="flex gap-2 mt-[16px]">
            <button type="submit" className="admin-btn">
              Pokračovat → Obsah e-mailu
            </button>
            <Link href="/admin/email-campaigns" className="admin-btn admin-btn-secondary">
              Zrušit
            </Link>
          </div>
        </form>
      )}

      {/* STEP 2: TEMPLATE */}
      {step === 'template' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[16px]">
          <div className="space-y-[16px]">
            <div className="admin-card p-[24px] space-y-[16px]">
              <p className="admin-label">Obsah e-mailu</p>

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
                <p className="text-xs text-[#666666] uppercase tracking-wider mt-2">
                  Použijte HTML nebo jednoduchý text
                </p>
              </div>

              <div>
                <label className="admin-label">Příběhový obrázek (volitelné)</label>
                <button
                  type="button"
                  onClick={() => setShowImageUpload(true)}
                  className="admin-btn admin-btn-secondary"
                  style={{ width: '100%' }}
                >
                  {formData.storyImage ? '✓ Obrázek nahrán' : '+ Nahrát obrázek'}
                </button>
                {formData.storyImage && (
                  <div className="mt-2 relative inline-block">
                    <img
                      src={formData.storyImage}
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 4 }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, storyImage: undefined })}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('basic')}
                className="admin-btn admin-btn-secondary"
              >
                ← Zpět
              </button>
              <button
                type="button"
                onClick={handleSaveCampaign}
                disabled={loading}
                className="admin-btn"
              >
                {loading ? 'Ukládání…' : 'Uložit a pokračovat → Odeslání'}
              </button>
            </div>
          </div>

          <div className="admin-card overflow-hidden flex flex-col">
            <div className="px-[20px] py-[12px] border-b border-black flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider font-bold">Náhled e-mailu</p>
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
      )}

      {/* STEP 3: SEND */}
      {step === 'send' && (
        <div className="space-y-[16px]">
          <div className="admin-card p-[24px] space-y-[16px]">
            <div>
              <p className="admin-label mb-2">Testovací e-mail</p>
              <p className="text-xs text-[#666666] uppercase tracking-wider mb-2">
                Pošlete si testovací e-mail na libovolnou adresu před tím, než ho odešlete všem
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="admin-input flex-1"
                  placeholder="váš-email@example.com"
                />
                <button
                  onClick={handleSendTestEmail}
                  disabled={sendLoading}
                  className="admin-btn"
                >
                  {sendLoading ? 'Odesílám…' : 'Odeslat test'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[16px]">
            <div className="admin-card p-[24px] space-y-[16px]">
              <p className="admin-label">Odeslat ihned</p>
              <p className="text-xs text-[#666666] uppercase tracking-wider">
                Kampaň bude odesílána všem {formData.targetAudience === 'all' ? 'přihlášeným na newsletter' : formData.targetAudience === 'abandoned' ? 'zákazníkům s opuštěným košíkem' : 'VIP zákazníkům'}
              </p>
              <button
                onClick={() => handleSendCampaign(false)}
                disabled={sendLoading}
                className="admin-btn"
                style={{ width: '100%' }}
              >
                {sendLoading ? 'Odesílám…' : '→ Odeslat ihned'}
              </button>
            </div>

            <div className="admin-card p-[24px] space-y-[16px]">
              <p className="admin-label">Naplánovat pro později</p>
              <div>
                <label className="admin-label text-xs">Datum *</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="admin-input"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="admin-label text-xs">Čas *</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="admin-input"
                />
              </div>
              <button
                onClick={() => {
                  if (!scheduleDate) {
                    alert('Vyberte datum');
                    return;
                  }
                  handleSendCampaign(true);
                }}
                disabled={sendLoading || !scheduleDate}
                className="admin-btn"
                style={{ width: '100%' }}
              >
                {sendLoading ? 'Plánuji…' : '→ Naplánovat'}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep('template')}
              className="admin-btn admin-btn-secondary"
            >
              ← Zpět na obsah
            </button>
            <Link href="/admin/email-campaigns" className="admin-btn admin-btn-secondary">
              Zrušit
            </Link>
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onImagesSelected={(urls) => {
          if (urls[0]) {
            setFormData({ ...formData, storyImage: urls[0] });
          }
          setShowImageUpload(false);
        }}
        maxImages={1}
        title="Nahrání příběhového obrázku"
        description="Přetáhněte obrázek, který vypráví příběh"
      />
    </div>
  );
}
