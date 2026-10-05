'use client';

import { useEffect, useMemo, useState } from 'react';
import { EMAIL_CATALOG, type EmailType } from '@/lib/email-catalog';
import JourneySequencePanel from '@/components/admin/JourneySequencePanel';

type Tab = 'sablony' | 'odeslane' | 'cesty';
type ViewMode = 'desktop' | 'mobile';

interface EmailLog {
  id: string;
  toEmail: string;
  type: string;
  subject: string;
  status: string;
  error: string | null;
  journeyId: string | null;
  sentAt: string;
}

interface JourneyStep {
  id: string;
  position: number;
  delayHours: number;
  emailType: string;
  generatePromo: boolean;
  promoDiscountValue: number;
  promoValidDays: number;
  skipIfPurchased: boolean;
  skipIfPaid: boolean;
}

interface Journey {
  id: string;
  key: string;
  name: string;
  description: string;
  trigger: string;
  isActive: boolean;
  steps: JourneyStep[];
  _count?: { enrollments: number };
}

interface JourneyStat {
  journeyId: string;
  status: string;
  _count: { _all: number };
}

const TRIGGER_LABELS: Record<string, string> = {
  ORDER_PAID: 'Zaplacená objednávka',
  ORDER_CREATED: 'Nezaplacená objednávka',
  CART_ABANDONED: 'Opuštěný košík',
  NEWSLETTER_SIGNUP: 'Přihlášení k newsletteru',
  ACCOUNT_CREATED: 'Nový účet',
  ORDER_SHIPPED: 'Objednávka odeslána',
  WINBACK: 'Neaktivní zákazník',
};

function catalogLabel(type: string) {
  return EMAIL_CATALOG.find((item) => item.id === type)?.label || type;
}

function formatDelay(hours: number) {
  if (hours === 0) return 'Ihned';
  if (hours % 24 === 0) {
    const days = hours / 24;
    return days === 1 ? '1 den' : `${days} dní`;
  }
  if (hours === 1) return '1 hodina';
  if (hours < 5) return `${hours} hodiny`;
  return `${hours} hodin`;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function EmailAdminPage() {
  const [tab, setTab] = useState<Tab>('sablony');
  const [selectedId, setSelectedId] = useState<EmailType>(EMAIL_CATALOG[0].id);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [previewLoading, setPreviewLoading] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<{ configured: boolean; fromEmail: string } | null>(null);

  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logQuery, setLogQuery] = useState('');
  const [logType, setLogType] = useState('');
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [journeyStats, setJourneyStats] = useState<JourneyStat[]>([]);
  const [journeysLoading, setJourneysLoading] = useState(false);
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(null);
  const [runningCron, setRunningCron] = useState(false);
  const [cronResult, setCronResult] = useState<string | null>(null);

  const [templates, setTemplates] = useState<{ id: string; type: string; isActive: boolean }[]>([]);

  const selected = EMAIL_CATALOG.find((t) => t.id === selectedId)!;
  const selectedLog = logs.find((log) => log.id === selectedLogId) || null;
  const selectedJourney = journeys.find((j) => j.id === selectedJourneyId) || journeys[0] || null;
  const selectedTemplate = templates.find((t) => t.type === selectedId);
  const isTemplateActive = selectedTemplate ? selectedTemplate.isActive : true;

  useEffect(() => {
    fetch('/api/admin/email-status')
      .then((r) => r.json())
      .then((d) => setServiceStatus(d))
      .catch(() => setServiceStatus({ configured: false, fromEmail: 'noreply@ufosport.cz' }));

    fetch('/api/admin/email-templates')
      .then((r) => r.json())
      .then((d) => setTemplates(Array.isArray(d) ? d : []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (tab !== 'odeslane') return;
    setLogsLoading(true);
    const params = new URLSearchParams({ take: '120' });
    if (logQuery) params.set('q', logQuery);
    if (logType) params.set('type', logType);
    fetch(`/api/admin/email-logs?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setLogs(Array.isArray(data) ? data : []);
        setSelectedLogId((current) => current || (Array.isArray(data) && data[0]?.id) || null);
      })
      .catch(() => setLogs([]))
      .finally(() => setLogsLoading(false));
  }, [tab, logQuery, logType]);

  useEffect(() => {
    if (tab !== 'cesty') return;
    setJourneysLoading(true);
    fetch('/api/admin/journeys')
      .then((r) => r.json())
      .then((data) => {
        setJourneys(data.journeys || []);
        setJourneyStats(data.stats || []);
        setSelectedJourneyId((current) => current || data.journeys?.[0]?.id || null);
      })
      .catch(() => setJourneys([]))
      .finally(() => setJourneysLoading(false));
  }, [tab]);

  const previewSrc = useMemo(() => {
    if (tab === 'odeslane' && selectedLogId) return `/api/admin/email-preview?logId=${selectedLogId}`;
    return `/api/admin/email-preview?type=${selectedId}`;
  }, [tab, selectedLogId, selectedId]);

  const handleSelectTemplate = (id: EmailType) => {
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

  const toggleJourney = async (journey: Journey) => {
    const res = await fetch(`/api/admin/journeys/${journey.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !journey.isActive }),
    });
    if (res.ok) {
      const updated = await res.json();
      setJourneys((prev) => prev.map((item) => (item.id === updated.id ? { ...item, isActive: updated.isActive } : item)));
    }
  };

  const toggleTemplate = async () => {
    let method = 'POST';
    let url = '/api/admin/email-templates';
    let body: any = { type: selectedId, subject: selected.label, body: selected.description, isActive: !isTemplateActive };
    
    if (selectedTemplate) {
      method = 'PATCH';
      url = `/api/admin/email-templates/${selectedTemplate.id}`;
      body = { isActive: !isTemplateActive };
    }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const updated = await res.json();
      setTemplates((prev) => {
        const exists = prev.find((t) => t.id === updated.id);
        if (exists) return prev.map((t) => (t.id === updated.id ? updated : t));
        return [...prev, updated];
      });
    }
  };

  const runNow = async () => {
    setRunningCron(true);
    setCronResult(null);
    try {
      const res = await fetch('/api/admin/journeys/run', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setCronResult(
          `Hotovo · odesláno ${data.journeys?.sent ?? 0} · přeskočeno ${data.journeys?.skipped ?? 0} · chyby ${data.journeys?.failed ?? 0}`
        );
      } else {
        setCronResult(data.error || 'Spuštění selhalo.');
      }
    } catch {
      setCronResult('Chyba připojení.');
    } finally {
      setRunningCron(false);
    }
  };

  const countFor = (journeyId: string, status: string) =>
    journeyStats.find((s) => s.journeyId === journeyId && s.status === status)?._count._all || 0;

  const transactional = EMAIL_CATALOG.filter((item) => item.category === 'transactional');
  const journeyMails = EMAIL_CATALOG.filter((item) => item.category === 'journey');

  return (
    <div className="space-y-[24px]">
      <div className="flex items-start justify-between gap-4 flex-wrap border-b border-black pb-4">
        <div>
          <h1 className="admin-title">E-maily a cesty</h1>
          <p className="admin-sub">Šablony, odeslané zprávy a automatické customer journeys</p>
        </div>
        {serviceStatus && (
          <span className="text-[10px] font-bold uppercase tracking-widest border border-black px-3 py-2">
            {serviceStatus.configured ? 'Resend aktivní' : 'Resend není nastaven'}
          </span>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {([
          { id: 'sablony', label: 'Šablony' },
          { id: 'odeslane', label: 'Odeslané' },
          { id: 'cesty', label: 'Cesty' },
        ] as const).map((item) => (
          <button
            key={item.id}
            onClick={() => { setTab(item.id); setPreviewLoading(true); }}
            className={`admin-tab ${tab === item.id ? 'is-active' : ''}`}
          >
            {item.label}
          </button>
        ))}
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

      {tab === 'sablony' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[16px]">
          <div className="lg:col-span-3">
            <div className="admin-card overflow-hidden">
              <div className="px-[16px] py-[12px] border-b border-black">
                <p className="admin-label" style={{ margin: 0 }}>Transakční</p>
              </div>
              {transactional.map((type, idx) => (
                <button
                  key={type.id}
                  onClick={() => handleSelectTemplate(type.id)}
                  className={`w-full text-left px-[16px] py-[12px] transition-colors ${
                    idx !== transactional.length - 1 ? 'border-b border-black' : ''
                  } ${type.id === selectedId ? 'bg-black text-white' : 'bg-white hover:bg-black hover:text-white'}`}
                >
                  <p className="text-xs font-bold uppercase tracking-wider">{type.label}</p>
                  <span className="inline-block mt-1 text-[10px] uppercase tracking-wider opacity-70">{type.trigger}</span>
                </button>
              ))}
              <div className="px-[16px] py-[12px] border-y border-black">
                <p className="admin-label" style={{ margin: 0 }}>Cesty</p>
              </div>
              {journeyMails.map((type, idx) => (
                <button
                  key={type.id}
                  onClick={() => handleSelectTemplate(type.id)}
                  className={`w-full text-left px-[16px] py-[12px] transition-colors ${
                    idx !== journeyMails.length - 1 ? 'border-b border-black' : ''
                  } ${type.id === selectedId ? 'bg-black text-white' : 'bg-white hover:bg-black hover:text-white'}`}
                >
                  <p className="text-xs font-bold uppercase tracking-wider">{type.label}</p>
                  <span className="inline-block mt-1 text-[10px] uppercase tracking-wider opacity-70">{type.triggerDetail}</span>
                </button>
              ))}
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
                      <span className="normal-case tracking-normal">UFO Sport &lt;noreply@ufosport.cz&gt;</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-[10px] font-bold text-[#666666] shrink-0">Spouštěč</span>
                      <span className="text-[10px] font-bold border border-black px-2 py-[2px]">{selected.triggerDetail}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <button onClick={toggleTemplate} className={`admin-btn ${isTemplateActive ? 'admin-btn-secondary' : ''}`}>
                        {isTemplateActive ? 'Pozastavit e-mail' : 'Aktivovat e-mail'}
                      </button>
                      {!isTemplateActive && <span className="text-[10px] font-bold text-red-600 ml-2">POZASTAVENO</span>}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2">
                  {!showTestPanel ? (
                    <button onClick={() => { setShowTestPanel(true); setTestResult(null); }} className="admin-btn">
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
                      <button onClick={() => { setShowTestPanel(false); setTestResult(null); }} className="admin-btn admin-btn-secondary" style={{ padding: 10 }}>
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
            <PreviewFrame
              src={previewSrc}
              title={selected.label}
              viewMode={viewMode}
              setViewMode={setViewMode}
              previewLoading={previewLoading}
              setPreviewLoading={setPreviewLoading}
              frameKey={selectedId}
            />
          </div>
        </div>
      )}

      {tab === 'odeslane' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[16px]">
          <div className="lg:col-span-4 flex flex-col gap-[16px]">
            <div className="flex gap-2">
              <input
                value={logQuery}
                onChange={(e) => setLogQuery(e.target.value)}
                placeholder="Hledat e-mail nebo předmět"
                className="admin-input"
                style={{ textTransform: 'none' }}
              />
              <select value={logType} onChange={(e) => setLogType(e.target.value)} className="admin-select" style={{ width: 180 }}>
                <option value="">Všechny typy</option>
                {EMAIL_CATALOG.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </div>
            <div className="admin-card overflow-hidden">
              {logsLoading ? (
                <div className="admin-empty">Načítám odeslané e-maily…</div>
              ) : logs.length === 0 ? (
                <div className="admin-empty">Zatím žádné odeslané e-maily.</div>
              ) : (
                logs.map((log, idx) => (
                  <button
                    key={log.id}
                    onClick={() => { setSelectedLogId(log.id); setPreviewLoading(true); }}
                    className={`w-full text-left px-[16px] py-[12px] ${idx !== logs.length - 1 ? 'border-b border-black' : ''} ${
                      selectedLogId === log.id ? 'bg-black text-white' : 'bg-white hover:bg-black hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold uppercase tracking-wider truncate">{catalogLabel(log.type)}</p>
                      <span className="text-[10px] uppercase tracking-wider shrink-0">
                        {log.status === 'sent' ? 'Odesláno' : 'Chyba'}
                      </span>
                    </div>
                    <p className="text-[11px] mt-1 truncate normal-case tracking-normal opacity-80">{log.toEmail}</p>
                    <p className="text-[10px] uppercase tracking-wider mt-1 opacity-70">{formatDateTime(log.sentAt)}</p>
                  </button>
                ))
              )}
            </div>
          </div>
          <div className="lg:col-span-8 flex flex-col gap-[16px]">
            {selectedLog ? (
              <>
                <div className="admin-card p-[20px]">
                  <h2 className="admin-title" style={{ fontSize: 14 }}>{selectedLog.subject}</h2>
                  <p className="admin-sub">{selectedLog.toEmail} · {catalogLabel(selectedLog.type)}</p>
                  {selectedLog.error && (
                    <p className="mt-3 text-xs border border-black p-3">{selectedLog.error}</p>
                  )}
                </div>
                <PreviewFrame
                  src={previewSrc}
                  title={selectedLog.subject}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  previewLoading={previewLoading}
                  setPreviewLoading={setPreviewLoading}
                  frameKey={selectedLog.id}
                />
              </>
            ) : (
              <div className="admin-card admin-empty">Vyberte e-mail vlevo pro náhled.</div>
            )}
          </div>
        </div>
      )}

      {tab === 'cesty' && (
        <div className="space-y-[16px]">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="admin-sub" style={{ margin: 0 }}>
              Cesty běží každou hodinu. Slevové kódy jsou jednorázové a vázané na e-mail zákazníka.
            </p>
            <button onClick={runNow} disabled={runningCron} className="admin-btn">
              {runningCron ? 'Spouštím…' : 'Spustit teď'}
            </button>
          </div>
          {cronResult && (
            <div className="border border-black px-4 py-3 text-xs uppercase tracking-wider">{cronResult}</div>
          )}

          {journeysLoading ? (
            <div className="admin-empty">Načítám cesty…</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-[16px]">
              <div className="lg:col-span-4">
                <div className="admin-card overflow-hidden">
                  {journeys.map((journey, idx) => (
                    <button
                      key={journey.id}
                      onClick={() => setSelectedJourneyId(journey.id)}
                      className={`w-full text-left px-[16px] py-[14px] ${idx !== journeys.length - 1 ? 'border-b border-black' : ''} ${
                        selectedJourney?.id === journey.id ? 'bg-black text-white' : 'bg-white hover:bg-black hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold uppercase tracking-wider">{journey.name}</p>
                        <span className="text-[10px] uppercase tracking-wider">
                          {journey.isActive ? 'Aktivní' : 'Vypnuto'}
                        </span>
                      </div>
                      <p className="text-[10px] uppercase tracking-wider mt-1 opacity-70">
                        {TRIGGER_LABELS[journey.trigger] || journey.trigger} · {journey.steps.length} kroků
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-8 space-y-[20px]">
                {selectedJourney && (
                  <>
                    <div className="admin-card p-[20px] space-y-[20px]">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <h2 className="admin-title" style={{ fontSize: 14 }}>{selectedJourney.name}</h2>
                          <p className="admin-sub">{selectedJourney.description}</p>
                        </div>
                        <button onClick={() => toggleJourney(selectedJourney)} className="admin-btn admin-btn-secondary">
                          {selectedJourney.isActive ? 'Vypnout' : 'Zapnout'}
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-px bg-black border border-black">
                        {[
                          ['Aktivní', countFor(selectedJourney.id, 'ACTIVE')],
                          ['Dokončené', countFor(selectedJourney.id, 'COMPLETED')],
                          ['Zrušené', countFor(selectedJourney.id, 'CANCELLED')],
                        ].map(([label, value]) => (
                          <div key={String(label)} className="bg-white p-4">
                            <p className="admin-label">{label}</p>
                            <p className="admin-title" style={{ fontSize: 23 }}>{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <JourneySequencePanel
                      journey={selectedJourney}
                      triggerLabel={TRIGGER_LABELS[selectedJourney.trigger] || selectedJourney.trigger}
                      onUpdateJourney={(updated) => {
                        setJourneys((prev) =>
                          prev.map((item) => (item.id === updated.id ? updated : item))
                        );
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PreviewFrame({
  src,
  title,
  viewMode,
  setViewMode,
  previewLoading,
  setPreviewLoading,
  frameKey,
}: {
  src: string;
  title: string;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  previewLoading: boolean;
  setPreviewLoading: (v: boolean) => void;
  frameKey: string;
}) {
  return (
    <div className="admin-card overflow-hidden flex flex-col">
      <div className="px-[20px] py-[12px] border-b border-black flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs uppercase tracking-wider truncate max-w-[360px]">{title}</p>
        <div className="flex gap-2">
          <button onClick={() => setViewMode('desktop')} className={`admin-tab ${viewMode === 'desktop' ? 'is-active' : ''}`}>Desktop</button>
          <button onClick={() => setViewMode('mobile')} className={`admin-tab ${viewMode === 'mobile' ? 'is-active' : ''}`}>Mobil</button>
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
            key={frameKey}
            src={src}
            onLoad={() => setPreviewLoading(false)}
            className={`w-full border-0 ${previewLoading ? 'opacity-0' : 'opacity-100'}`}
            style={{ height: 680, display: 'block', border: viewMode === 'mobile' ? '1px solid #000' : 'none' }}
            title={`Náhled: ${title}`}
          />
        </div>
      </div>
      <div className="px-[20px] py-[12px] border-t border-black flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wider text-[#666666]">
          Náhled · {viewMode === 'mobile' ? 'Mobil (390 px)' : 'Desktop'} · font Roboto / Arial (čeština)
        </p>
        <a href={src} target="_blank" rel="noopener noreferrer" className="text-[11px] uppercase tracking-wider hover:underline">
          Otevřít v nové záložce →
        </a>
      </div>
    </div>
  );
}
