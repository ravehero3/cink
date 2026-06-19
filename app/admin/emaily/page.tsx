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
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
    color: 'blue',
  },
  {
    id: 'PAYMENT_SUCCESS',
    label: 'Platba přijata',
    description: 'Odesílá se po úspěšném potvrzení platby přes GoPay.',
    trigger: 'Automaticky',
    triggerDetail: 'Po potvrzení platby (GoPay webhook)',
    subject: 'Platba přijata — UFO26001 — UFO Sport',
    from: 'UFO Sport <noreply@ufosport.cz>',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    color: 'green',
  },
  {
    id: 'SHIPPING_NOTIFICATION',
    label: 'Zásilka na cestě',
    description: 'Odesílá se zákazníkovi při změně stavu na „Odesláno".',
    trigger: 'Manuálně',
    triggerDetail: 'Změnou stavu objednávky',
    subject: 'Vaše objednávka UFO26001 byla odeslána — UFO Sport',
    from: 'UFO Sport <noreply@ufosport.cz>',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    color: 'orange',
  },
  {
    id: 'NEWSLETTER_WELCOME',
    label: 'Uvítací newsletter',
    description: 'Odesílá se při přihlášení k odběru novinek.',
    trigger: 'Automaticky',
    triggerDetail: 'Při přihlášení k newsletteru',
    subject: 'Vítejte v UFO Sport',
    from: 'UFO Sport <noreply@ufosport.cz>',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    color: 'purple',
  },
  {
    id: 'PASSWORD_RESET',
    label: 'Obnovení hesla',
    description: 'Odesílá se při žádosti o reset hesla zákazníka.',
    trigger: 'Automaticky',
    triggerDetail: 'Při žádosti o reset hesla',
    subject: 'Obnovení hesla — UFO Sport',
    from: 'UFO Sport <noreply@ufosport.cz>',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
      </svg>
    ),
    color: 'gray',
  },
  {
    id: 'ABANDONED_CART',
    label: 'Zapomenutý košík',
    description: 'Odesílá se zákazníkům, kteří nedokončili objednávku.',
    trigger: 'Automaticky',
    triggerDetail: 'Po určité době neaktivity',
    subject: 'Zapomněli jste něco v košíku? — UFO Sport',
    from: 'UFO Sport <noreply@ufosport.cz>',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/>
      </svg>
    ),
    color: 'yellow',
  },
  {
    id: 'ADMIN_ORDER_NOTIFICATION',
    label: 'Notifikace adminu',
    description: 'Interní notifikace o nové objednávce na andrea.gasi@seznam.cz.',
    trigger: 'Automaticky',
    triggerDetail: 'Po odeslání objednávky',
    subject: 'Nová objednávka UFO26001 — 1 650 Kč',
    from: 'UFO Sport <noreply@ufosport.cz>',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
      </svg>
    ),
    color: 'red',
  },
];

const COLOR_CLASSES: Record<string, { bg: string; text: string; dot: string }> = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  green:  { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700',  dot: 'bg-orange-500' },
  purple: { bg: 'bg-violet-50', text: 'text-violet-700',  dot: 'bg-violet-500' },
  gray:   { bg: 'bg-gray-100',  text: 'text-gray-600',   dot: 'bg-gray-400' },
  yellow: { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-500' },
  red:    { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500' },
};

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
  const colors = COLOR_CLASSES[selected.color];

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
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">E-maily</h1>
          <p className="mt-1 text-sm text-gray-500">Náhled všech automatických e-mailů a odesílání testovacích zpráv.</p>
        </div>

        {/* Service status pill */}
        {serviceStatus && (
          <div className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium border ${
            serviceStatus.configured
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <span className={`w-2 h-2 rounded-full ${serviceStatus.configured ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {serviceStatus.configured ? 'Resend aktivní' : 'Resend není nastaven'}
          </div>
        )}
      </div>

      {/* RESEND not configured warning */}
      {serviceStatus && !serviceStatus.configured && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-900">Chybí RESEND_API_KEY</p>
            <p className="text-sm text-amber-700 mt-0.5">E-maily se neodesílají. Přidejte <code className="bg-amber-100 px-1 rounded text-xs font-mono">RESEND_API_KEY</code> do proměnných prostředí a ověřte doménu <strong>ufosport.cz</strong> v Resend dashboardu.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-5">

        {/* ── Left column: email type list ── */}
        <div className="col-span-3">
          <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div className="px-4 py-3.5 border-b border-gray-100">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Typy e-mailů</p>
            </div>
            <div className="p-2 space-y-0.5">
              {EMAIL_TYPES.map((type) => {
                const isActive = type.id === selectedId;
                const c = COLOR_CLASSES[type.color];
                return (
                  <button
                    key={type.id}
                    onClick={() => handleSelect(type.id)}
                    className={`w-full text-left px-3 py-3 rounded-xl transition-all duration-150 group ${
                      isActive ? 'bg-gray-950 text-white' : 'hover:bg-gray-50/80 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`flex-shrink-0 ${isActive ? 'text-white/80' : 'text-gray-400 group-hover:text-gray-600'}`}>
                        {type.icon}
                      </span>
                      <div className="min-w-0">
                        <p className={`text-[13px] font-semibold leading-tight truncate ${isActive ? 'text-white' : 'text-gray-800'}`}>
                          {type.label}
                        </p>
                        <span className={`inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
                          isActive
                            ? type.trigger === 'Automaticky'
                              ? 'bg-white/15 text-white/80'
                              : 'bg-white/15 text-white/80'
                            : type.trigger === 'Automaticky'
                              ? 'bg-gray-100 text-gray-500'
                              : 'bg-amber-50 text-amber-600'
                        }`}>
                          {type.trigger}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="col-span-9 flex flex-col gap-4">

          {/* Email metadata card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl ${colors.bg} ${colors.text} flex-shrink-0`}>
                    {selected.icon}
                  </span>
                  <h2 className="text-base font-bold text-gray-900 tracking-tight">{selected.label}</h2>
                </div>

                {/* Email header fields — styled like a real email client */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-baseline gap-2">
                    <span className="w-16 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex-shrink-0">Od</span>
                    <span className="text-gray-700 font-medium">{selected.from}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="w-16 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex-shrink-0">Předmět</span>
                    <span className="text-gray-900 font-semibold">{selected.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex-shrink-0">Spouštěč</span>
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                      {selected.triggerDetail}
                    </span>
                  </div>
                </div>
              </div>

              {/* Test send */}
              <div className="flex-shrink-0 flex flex-col items-end gap-2">
                {!showTestPanel ? (
                  <button
                    onClick={() => { setShowTestPanel(true); setTestResult(null); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-950 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z"/>
                    </svg>
                    Odeslat test
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendTest()}
                      placeholder="email@example.com"
                      autoFocus
                      className="w-52 px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 bg-white transition-shadow"
                    />
                    <button
                      onClick={handleSendTest}
                      disabled={sendingTest}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gray-950 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingTest ? (
                        <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z"/>
                        </svg>
                      )}
                      {sendingTest ? 'Odesílám…' : 'Odeslat'}
                    </button>
                    <button
                      onClick={() => { setShowTestPanel(false); setTestResult(null); }}
                      className="p-2.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Result toast */}
            {testResult && (
              <div className={`mt-4 flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm font-medium ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {testResult.success ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                  </svg>
                )}
                {testResult.message}
              </div>
            )}
          </div>

          {/* Email preview card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden flex flex-col" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

            {/* Preview toolbar */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
              {/* macOS dots */}
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                <div className="w-3 h-3 rounded-full bg-green-400/80" />
              </div>

              {/* Subject pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg max-w-[360px]">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <span className="text-[11px] text-gray-500 truncate font-medium">{selected.subject}</span>
              </div>

              {/* Desktop / Mobile toggle */}
              <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('desktop')}
                  title="Zobrazení pro desktop"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                    viewMode === 'desktop' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                  Desktop
                </button>
                <button
                  onClick={() => setViewMode('mobile')}
                  title="Zobrazení pro mobil"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                    viewMode === 'mobile' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <svg width="11" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
                  </svg>
                  Mobil
                </button>
              </div>
            </div>

            {/* Preview area */}
            <div
              className="overflow-y-auto bg-gray-100/60 transition-all duration-300"
              style={{ minHeight: 680 }}
            >
              <div
                className="mx-auto transition-all duration-300"
                style={{
                  width: viewMode === 'mobile' ? 390 : '100%',
                  maxWidth: viewMode === 'mobile' ? 390 : '100%',
                  padding: viewMode === 'mobile' ? '24px 0' : 0,
                }}
              >
                {previewLoading && (
                  <div className="flex items-center justify-center" style={{ height: 680 }}>
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
                      <span className="text-xs text-gray-400 font-medium">Načítám náhled…</span>
                    </div>
                  </div>
                )}
                <iframe
                  key={selectedId}
                  src={`/api/admin/email-preview?type=${selectedId}`}
                  onLoad={() => setPreviewLoading(false)}
                  className={`w-full border-0 transition-opacity duration-200 ${previewLoading ? 'opacity-0' : 'opacity-100'}`}
                  style={{
                    height: 680,
                    display: 'block',
                    borderRadius: viewMode === 'mobile' ? 16 : 0,
                    overflow: 'hidden',
                    boxShadow: viewMode === 'mobile' ? '0 4px 24px rgba(0,0,0,0.12)' : 'none',
                  }}
                  title={`Náhled: ${selected.label}`}
                  sandbox="allow-same-origin"
                />
              </div>
            </div>

            {/* Bottom bar */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
              <p className="text-[11px] text-gray-400 font-medium">
                Náhled e-mailu · {selected.label}
                {viewMode === 'mobile' && ' · Mobil (390 px)'}
                {viewMode === 'desktop' && ' · Desktop (600 px)'}
              </p>
              <a
                href={`/api/admin/email-preview?type=${selectedId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-gray-700 font-medium transition-colors"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Otevřít v nové záložce
              </a>
            </div>
          </div>

          {/* Info card */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-white rounded-2xl border border-gray-200/80 p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-2 mb-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                </svg>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Informace o odesílání</p>
              </div>
              <ul className="space-y-2">
                {[
                  ['Odesílatel', 'noreply@ufosport.cz (přes Resend)'],
                  ['Ověřená doména', 'ufosport.cz musí být ověřena v Resend dashboardu'],
                  ['Testovací e-maily', 'jsou označeny předponou [TEST] v předmětu'],
                  ['Loga v e-mailech', 'načítána z www.ufosport.cz/logo.png'],
                ].map(([label, value]) => (
                  <li key={label} className="flex items-start gap-2 text-sm">
                    <span className="text-gray-400 flex-shrink-0 font-medium w-36">{label}</span>
                    <span className="text-gray-700">{value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Přehled typů</p>
              <div className="space-y-2">
                {EMAIL_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelect(t.id)}
                    className={`w-full flex items-center gap-2 text-left transition-colors rounded-lg px-2 py-1.5 -mx-2 ${
                      t.id === selectedId ? 'bg-gray-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${COLOR_CLASSES[t.color].dot}`} />
                    <span className="text-xs text-gray-700 truncate">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
