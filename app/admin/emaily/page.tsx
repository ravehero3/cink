'use client';

import { useState, useEffect, useRef } from 'react';

const EMAIL_TYPES = [
  {
    id: 'ORDER_CONFIRMATION',
    label: 'Potvrzeni objednavky',
    description: 'Odesila se zakaznikovi ihned po vytvoreni objednavky.',
    trigger: 'Automaticky — po odeslani objednavky',
  },
  {
    id: 'PAYMENT_SUCCESS',
    label: 'Platba prijata',
    description: 'Odesila se po uspesnem potvrzeni platby pres GoPay.',
    trigger: 'Automaticky — po potvrzeni platby (GoPay webhook)',
  },
  {
    id: 'SHIPPING_NOTIFICATION',
    label: 'Zasilka na ceste',
    description: 'Odesila se zakaznikovi pri zmene stavu objednavky na "Odeslano".',
    trigger: 'Manualne — zmenou stavu objednavky',
  },
  {
    id: 'NEWSLETTER_WELCOME',
    label: 'Uvitaci newsletter',
    description: 'Odesila se pri prihlaseni k odberu novinek.',
    trigger: 'Automaticky — pri prihlaseni k newsletteru',
  },
  {
    id: 'PASSWORD_RESET',
    label: 'Obnoveni hesla',
    description: 'Odesila se pri zadosti o reset hesla zakaznika.',
    trigger: 'Automaticky — pri zadosti o reset hesla',
  },
  {
    id: 'ABANDONED_CART',
    label: 'Zapomnety kosik',
    description: 'Odesila se zakaznikum, kteri nedokoncili objednavku.',
    trigger: 'Automaticky — po urcite dobe neaktivity',
  },
  {
    id: 'ADMIN_ORDER_NOTIFICATION',
    label: 'Notifikace adminu',
    description: 'Interna notifikace o nove objednavce odesila se na andrea.gasi@seznam.cz.',
    trigger: 'Automaticky — po odeslani objednavky',
  },
];

export default function EmailAdminPage() {
  const [selectedType, setSelectedType] = useState(EMAIL_TYPES[0].id);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showTestForm, setShowTestForm] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const selectedTypeInfo = EMAIL_TYPES.find((t) => t.id === selectedType);

  const handleSelectType = (type: string) => {
    setSelectedType(type);
    setPreviewLoading(true);
    setTestResult(null);
    setShowTestForm(false);
  };

  const handleIframeLoad = () => {
    setPreviewLoading(false);
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
        body: JSON.stringify({ email: testEmail.trim(), type: selectedType }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTestResult({ success: true, message: `Testovaci e-mail byl odeslan na ${testEmail}.` });
        setTestEmail('');
        setShowTestForm(false);
      } else {
        setTestResult({ success: false, message: data.error || 'Odeslani selhalo.' });
      }
    } catch {
      setTestResult({ success: false, message: 'Chyba sitoveho pripojeni. Zkuste to znovu.' });
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">E-maily</h1>
        <p className="mt-1 text-sm text-gray-500">Nahled vsech automatickych e-mailu a moznost odeslat testovaci zpravy.</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left column — email type list */}
        <div className="col-span-3">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.07)' }}>
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Typy e-mailu</p>
            </div>
            <div className="p-2">
              {EMAIL_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleSelectType(type.id)}
                  className={`w-full text-left px-3 py-3 rounded-xl transition-all duration-150 mb-0.5 last:mb-0 ${
                    selectedType === type.id
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <p className={`text-sm font-medium leading-tight ${selectedType === type.id ? 'text-white' : 'text-gray-800'}`}>
                    {type.label}
                  </p>
                  <p className={`text-xs mt-0.5 leading-snug line-clamp-2 ${selectedType === type.id ? 'text-gray-300' : 'text-gray-400'}`}>
                    {type.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column — preview + actions */}
        <div className="col-span-9 flex flex-col gap-5">
          {/* Info card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5" style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.07)' }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-base font-semibold text-gray-900">{selectedTypeInfo?.label}</h2>
                <p className="mt-1 text-sm text-gray-500">{selectedTypeInfo?.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-600">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                    {selectedTypeInfo?.trigger}
                  </span>
                </div>
              </div>

              {/* Test send area */}
              <div className="flex-shrink-0">
                {!showTestForm ? (
                  <button
                    onClick={() => { setShowTestForm(true); setTestResult(null); }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" />
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
                      className="w-52 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                    />
                    <button
                      onClick={handleSendTest}
                      disabled={sendingTest}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      {sendingTest ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Odesilam...
                        </>
                      ) : (
                        'Odeslat'
                      )}
                    </button>
                    <button
                      onClick={() => { setShowTestForm(false); setTestResult(null); }}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Result message */}
            {testResult && (
              <div className={`mt-4 flex items-start gap-2 px-4 py-3 rounded-xl text-sm ${
                testResult.success
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {testResult.success ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                  </svg>
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Email preview card */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col" style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.07)', minHeight: '700px' }}>
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <p className="text-xs font-medium text-gray-400">Nahled e-mailu — {selectedTypeInfo?.label}</p>
              <div className="w-16" />
            </div>

            {/* Loading state */}
            {previewLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white z-10 rounded-b-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                  <span className="text-sm text-gray-400">Nacitam nahled...</span>
                </div>
              </div>
            )}

            <div className="relative flex-1">
              <iframe
                ref={iframeRef}
                key={selectedType}
                src={`/api/admin/email-preview?type=${selectedType}`}
                onLoad={handleIframeLoad}
                className="w-full border-0"
                style={{ height: '700px' }}
                title={`Nahled e-mailu: ${selectedTypeInfo?.label}`}
                sandbox="allow-same-origin"
              />
            </div>
          </div>

          {/* Help card */}
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900">Informace o odesilani e-mailu</p>
                <ul className="mt-2 space-y-1.5 text-xs text-blue-700 leading-relaxed">
                  <li>E-maily jsou odesilany pres sluzbu Resend z adresy <strong>noreply@ufosport.cz</strong>.</li>
                  <li>Pro spravnou funkci je nutne mit overenu domenu <strong>ufosport.cz</strong> v Resend dashboardu.</li>
                  <li>Testovaci e-maily jsou oznaceny predponou <strong>[TEST]</strong> v predmetu.</li>
                  <li>Loga a obrazky v e-mailech jsou nacitany z <strong>www.ufosport.cz/logo.png</strong>.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
