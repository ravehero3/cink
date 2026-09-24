'use client';

import { useState, useEffect } from 'react';

const EMAIL_TYPES = [
  {
    id: 'ORDER_CONFIRMATION',
    label: 'Potvrzení objednávky',
    description: 'Odesílá se zákazníkovi ihned po vytvoření objednávky.',
    trigger: 'Automaticky',
    triggerDetail: 'Po odeslání objednávky',
    subject: 'Potvrzení objednávky UFO26001 — UFO Sport',
    from: 'UFO Sport <noreply@ufosport.cz>',
  },
  {
    id: 'PAYMENT_SUCCESS',
    label: 'Platba přijata',
    description: 'Odesílá se po úspěšném potvrzení platby přes GoPay.',
    trigger: 'Automaticky',
    triggerDetail: 'Po potvrzení platby (GoPay webhook)',
    subject: 'Platba přijata — UFO26001 — UFO Sport',
    from: 'UFO Sport <noreply@ufosport.cz>',
  },
  {
    id: 'SHIPPING_NOTIFICATION',
    label: 'Zásilka na cestě',
    description: 'Odesílá se zákazníkovi při změně stavu na „Odesláno".',
    trigger: 'Manuálně',
    triggerDetail: 'Změnou stavu objednávky',
    subject: 'Vaše objednávka UFO26001 byla odeslána — UFO Sport',
    from: 'UFO Sport <noreply@ufosport.cz>',
  },
  {
    id: 'NEWSLETTER_WELCOME',
    label: 'Uvítací newsletter',
    description: 'Odesílá se při přihlášení k odběru novinek.',
    trigger: 'Automaticky',
    triggerDetail: 'Při přihlášení k newsletteru',
    subject: 'Vítejte v UFO Sport',
    from: 'UFO Sport <noreply@ufosport.cz>',
  },
  {
    id: 'PASSWORD_RESET',
    label: 'Obnovení hesla',
    description: 'Odesílá se při žádosti o reset hesla zákazníka.',
    trigger: 'Automaticky',
    triggerDetail: 'Při žádosti o reset hesla',
    subject: 'Obnovení hesla — UFO Sport',
    from: 'UFO Sport <noreply@ufosport.cz>',
  },
  {
    id: 'ABANDONED_CART',
    label: 'Zapomenutý košík',
    description: 'Odesílá se zákazníkům, kteří nedokončili objednávku.',
    trigger: 'Automaticky',
    triggerDetail: 'Po určité době neaktivity',
    subject: 'Zapomněli jste něco v košíku? — UFO Sport',
    from: 'UFO Sport <noreply@ufosport.cz>',
  },
  {
    id: 'ADMIN_ORDER_NOTIFICATION',
    label: 'Notifikace adminu',
    description: 'Interní notifikace o nové objednávce na andrea.gasi@seznam.cz.',
    trigger: 'Automaticky',
    triggerDetail: 'Po odeslání objednávky',
    subject: 'Nová objednávka UFO26001 — 1 650 Kč',
    from: 'UFO Sport <noreply@ufosport.cz>',
  },
];

type ViewMode = 'desktop' | 'mobile';

export default function EmailAdminPage() {
  const [selectedId, setSelectedId] = useState(EMAIL_TYPES[0].id);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [previewLoading, setPreviewLoading] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<{ configured: boolean; fromEmail: string } | null>(null);

  const selected = EMAIL_TYPES.find((t) => t.id === selectedId)!;

  useEffect(() => {
    fetch('/api/admin/email-status')
      .then((r) => r.json())
      .then((d) => setServiceStatus(d))
      .catch(() => setServiceStatus({ configured: false, fromEmail: 'noreply@ufosport.cz' }));
  }, []);

  const handleSelect = (id: string) => {
    if (id === selectedId) return;
    setSelectedId(id);
    setPreviewLoading(true);
    setTestResult(null);
    setShowTestPanel(false);
  };

  const handleSendTest = async () => {
    if (!testEmail.trim() || !testEmail.includes('@')) {
      setTestResult({ success: false, message: 'Zadejte platnou e-mailovou adresu.' });
      return;
    }
    setSendingTest(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/email-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail.trim(), type: selectedId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({ success: true, message: `Testovací e-mail odeslán na ${testEmail}.` });
        setTestEmail('');
        setShowTestPanel(false);
      } else {
        setTestResult({ success: false, message: data.error || 'Odeslání selhalo.' });
      }
    } catch {
      setTestResult({ success: false, message: 'Chyba připojení. Zkuste to znovu.' });
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="space-y-[24px]">
      <div className="flex items-start justify-between gap-4 flex-wrap border-b border-black pb-4">
        <div>
          <h1 className="admin-title">E-maily</h1>
          <p className="admin-sub">Náhled automatických e-mailů a odesílání testovacích zpráv</p>
        </div>
        {serviceStatus && (
          <span className="text-[10px] font-bold uppercase tracking-widest border border-black px-3 py-2">
            {serviceStatus.configured ? 'Resend aktivní' : 'Resend není nastaven'}
          </span>
        )}
      </div>

      {serviceStatus && !serviceStatus.configured && (
        <div className="flex items-start gap-3 p-4 border border-black text-xs uppercase tracking-wider">
          <span className="font-bold shrink-0">[ CHYBA ]</span>
          <div className="normal-case tracking-normal">
            <p className="font-bold uppercase tracking-wider text-xs">Chybí RESEND_API_KEY</p>
            <p className="text-[#666666] mt-1">
              E-maily se neodesílají. Přidejte <code className="border border-black px-1 font-mono text-[11px]">RESEND_API_KEY</code> do proměnných prostředí a ověřte doménu <strong>ufosport.cz</strong> v Resend dashboardu.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[16px]">
        <div className="lg:col-span-3">
          <div className="admin-card overflow-hidden">
            <div className="px-[16px] py-[12px] border-b border-black">
              <p className="admin-label" style={{ margin: 0 }}>Typy e-mailů</p>
            </div>
            <div>
              {EMAIL_TYPES.map((type, idx) => {
                const isActive = type.id === selectedId;
                return (
                  <button
                    key={type.id}
                    onClick={() => handleSelect(type.id)}
                    className={`w-full text-left px-[16px] py-[12px] transition-colors ${
                      idx !== EMAIL_TYPES.length - 1 ? 'border-b border-black' : ''
                    } ${isActive ? 'bg-black text-white' : 'bg-white hover:bg-black hover:text-white'}`}
                  >
                    <p className="text-xs font-bold uppercase tracking-wider">{type.label}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase tracking-wider opacity-70">
                      {type.trigger}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-9 flex flex-col gap-[16px]">
          <div className="admin-card p-[20px]">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <h2 className="admin-title" style={{ fontSize: 14 }}>{selected.label}</h2>
                <p className="admin-sub">{selected.description}</p>
                <div className="space-y-2 text-xs uppercase tracking-wider mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="w-16 text-[10px] font-bold text-[#666666] shrink-0">Od</span>
                    <span className="normal-case tracking-normal">{selected.from}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="w-16 text-[10px] font-bold text-[#666666] shrink-0">Předmět</span>
                    <span className="font-medium normal-case tracking-normal">{selected.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-[10px] font-bold text-[#666666] shrink-0">Spouštěč</span>
                    <span className="text-[10px] font-bold border border-black px-2 py-[2px]">
                      {selected.triggerDetail}
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-end gap-2">
                {!showTestPanel ? (
                  <button
                    onClick={() => { setShowTestPanel(true); setTestResult(null); }}
                    className="admin-btn"
                  >
                    Odeslat test
                  </button>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendTest()}
                      placeholder="email@example.com"
                      autoFocus
                      className="admin-input w-52"
                      style={{ textTransform: 'none' }}
                    />
                    <button onClick={handleSendTest} disabled={sendingTest} className="admin-btn">
                      {sendingTest ? 'Odesílám…' : 'Odeslat'}
                    </button>
                    <button
                      onClick={() => { setShowTestPanel(false); setTestResult(null); }}
                      className="admin-btn admin-btn-secondary"
                      style={{ padding: 10 }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            {testResult && (
              <div className="mt-4 flex items-start gap-2 px-4 py-3 border border-black text-xs uppercase tracking-wider">
                <span className="font-bold shrink-0">{testResult.success ? '[ OK ]' : '[ CHYBA ]'}</span>
                <span className="normal-case tracking-normal">{testResult.message}</span>
              </div>
            )}
          </div>

          <div className="admin-card overflow-hidden flex flex-col">
            <div className="px-[20px] py-[12px] border-b border-black flex items-center justify-between gap-3 flex-wrap">
              <p className="text-xs uppercase tracking-wider truncate max-w-[360px]">{selected.subject}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('desktop')}
                  className={`admin-tab ${viewMode === 'desktop' ? 'is-active' : ''}`}
                >
                  Desktop
                </button>
                <button
                  onClick={() => setViewMode('mobile')}
                  className={`admin-tab ${viewMode === 'mobile' ? 'is-active' : ''}`}
                >
                  Mobil
                </button>
              </div>
            </div>

            <div className="overflow-y-auto bg-white" style={{ minHeight: 680 }}>
              <div
                className="mx-auto"
                style={{
                  width: viewMode === 'mobile' ? 390 : '100%',
                  maxWidth: viewMode === 'mobile' ? 390 : '100%',
                  padding: viewMode === 'mobile' ? '24px 0' : 0,
                }}
              >
                {previewLoading && (
                  <div className="flex items-center justify-center gap-3" style={{ height: 680 }}>
                    <div className="admin-spinner" />
                    <span className="admin-sub" style={{ margin: 0 }}>Načítám náhled…</span>
                  </div>
                )}
                <iframe
                  key={selectedId}
                  src={`/api/admin/email-preview?type=${selectedId}`}
                  onLoad={() => setPreviewLoading(false)}
                  className={`w-full border-0 ${previewLoading ? 'opacity-0' : 'opacity-100'}`}
                  style={{
                    height: 680,
                    display: 'block',
                    border: viewMode === 'mobile' ? '1px solid #000' : 'none',
                  }}
                  title={`Náhled: ${selected.label}`}
                  sandbox="allow-same-origin"
                />
              </div>
            </div>

            <div className="px-[20px] py-[12px] border-t border-black flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wider text-[#666666]">
                Náhled · {selected.label} · {viewMode === 'mobile' ? 'Mobil (390 px)' : 'Desktop'}
              </p>
              <a
                href={`/api/admin/email-preview?type=${selectedId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] uppercase tracking-wider hover:underline"
              >
                Otevřít v nové záložce →
              </a>
            </div>
          </div>

          <div className="admin-card p-[20px]">
            <p className="admin-label">Informace o odesílání</p>
            <ul className="space-y-2">
              {[
                ['Odesílatel', 'noreply@ufosport.cz (přes Resend)'],
                ['Ověřená doména', 'ufosport.cz musí být ověřena v Resend dashboardu'],
                ['Testovací e-maily', 'jsou označeny předponou [TEST] v předmětu'],
                ['Loga v e-mailech', 'načítána z www.ufosport.cz/logo.png'],
              ].map(([label, value]) => (
                <li key={label} className="flex items-start gap-2 text-xs uppercase tracking-wider">
                  <span className="text-[#666666] shrink-0 w-36">{label}</span>
                  <span className="normal-case tracking-normal">{value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
