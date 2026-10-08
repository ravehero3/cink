'use client';

import { useEffect, useMemo, useState } from 'react';
import { EMAIL_CATALOG, type EmailType } from '@/lib/email-catalog';
import type { EmailTemplateCustomization, LinkedProduct } from '@/lib/email-layout';
import JourneySequencePanel from '@/components/admin/JourneySequencePanel';
import ProductPickerModal, { type PickedProduct } from '@/components/admin/ProductPickerModal';
import ImageUploadModal from '@/components/admin/ImageUploadModal';

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

interface DbEmailTemplate {
  id: string;
  type: string;
  subject: string;
  body: string;
  variables: EmailTemplateCustomization | any;
  isActive: boolean;
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

const EMAIL_SECTIONS: { id: string; label: string; desc: string; isPhoto?: boolean }[] = [
  { id: 'header1', label: '1. Horní logo', desc: 'UFO SPORT (výška 72 px)' },
  { id: 'header2', label: '2. Nadpis a text', desc: 'Hlavní sdělení e-mailu (136 px)' },
  { id: 'heroImage', label: '3. Hlavní fotka (Hero)', desc: 'Velký obrázek / produkt (600 px)', isPhoto: true },
  { id: 'info', label: '4. Informační blok', desc: 'Položky objednávky, slevový kód, text' },
  { id: 'photoGrid', label: '5. Mřížka produktů 2x2', desc: '4 fotky produktů vedle sebe', isPhoto: true },
  { id: 'actionButton', label: '6. Tlačítko akce', desc: 'Černé tlačítko s výzvou k akci' },
  { id: 'browseAll', label: '7. Tlačítko „Zobrazit vše“', desc: 'Odkaz do e-shopu na všechny produkty' },
  { id: 'footerLinks', label: '8. Odkazy v patičce', desc: 'Kolekce, novinky, služby, kontakt' },
  { id: 'footerSocial', label: '9. Sociální sítě a patička', desc: 'Ikony sítí, adresa a odhlášení' },
];

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
  const [previewNonce, setPreviewNonce] = useState(0);

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

  const [templates, setTemplates] = useState<DbEmailTemplate[]>([]);

  // Product Picker Modal State
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'hero' | 'grid'>('hero');
  const [pickerSlotIndex, setPickerSlotIndex] = useState<number | undefined>(undefined);
  const [pickerTitle, setPickerTitle] = useState('');
  const [pickerDescription, setPickerDescription] = useState('');
  const [pickerMaxSelect, setPickerMaxSelect] = useState(1);

  // Image Upload Modal State
  const [imageUploadOpen, setImageUploadOpen] = useState(false);
  const [imageUploadTarget, setImageUploadTarget] = useState<'photoGrid' | 'hero'>('photoGrid');

  // Section manager panel state & feedback toast
  const [showSectionManager, setShowSectionManager] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [undoSection, setUndoSection] = useState<string | null>(null);

  const selected = EMAIL_CATALOG.find((t) => t.id === selectedId)!;
  const selectedLog = logs.find((log) => log.id === selectedLogId) || null;
  const selectedJourney = journeys.find((j) => j.id === selectedJourneyId) || journeys[0] || null;
  const selectedTemplate = templates.find((t) => t.type === selectedId);
  const isTemplateActive = selectedTemplate ? selectedTemplate.isActive : true;

  const currentCustomization: EmailTemplateCustomization = useMemo(() => {
    return (selectedTemplate?.variables as EmailTemplateCustomization) || {};
  }, [selectedTemplate]);

  const hiddenSections = currentCustomization.hiddenSections || [];
  const heroProduct = currentCustomization.heroProduct || null;
  const gridProducts = currentCustomization.gridProducts || [];

  useEffect(() => {
    fetch('/api/admin/email-status')
      .then((r) => r.json())
      .then((d) => setServiceStatus(d))
      .catch(() => setServiceStatus({ configured: false, fromEmail: 'noreply@ufosport.cz' }));

    loadTemplates();
  }, []);

  const loadTemplates = () => {
    fetch('/api/admin/email-templates')
      .then((r) => r.json())
      .then((d) => setTemplates(Array.isArray(d) ? d : []))
      .catch(console.error);
  };

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

  // Handle postMessages from iframe (Hover "+" and "X" buttons)
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== 'object') return;

      if (e.data.type === 'DELETE_SECTION') {
        const sectionId = e.data.sectionId;
        if (sectionId) {
          handleDeleteSection(sectionId);
        }
      } else if (e.data.type === 'OPEN_PRODUCT_PICKER') {
        const { target, slotIndex } = e.data;
        handleOpenProductPicker(target || 'hero', slotIndex);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [selectedId, selectedTemplate]);

  const previewSrc = useMemo(() => {
    if (tab === 'odeslane' && selectedLogId) return `/api/admin/email-preview?logId=${selectedLogId}`;
    return `/api/admin/email-preview?type=${selectedId}&adminInteractive=1&_t=${previewNonce}`;
  }, [tab, selectedLogId, selectedId, previewNonce]);

  const handleSelectTemplate = (id: EmailType) => {
    if (id === selectedId) return;
    setSelectedId(id);
    setPreviewLoading(true);
    setTestResult(null);
    setShowTestPanel(false);
    setShowSectionManager(false);
    setToastMessage(null);
    setUndoSection(null);
  };

  const saveTemplateCustomization = async (customization: EmailTemplateCustomization) => {
    try {
      const res = await fetch('/api/admin/email-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedId,
          customization,
          isActive: isTemplateActive,
        }),
      });

      if (res.ok) {
        const saved: DbEmailTemplate = await res.json();
        setTemplates((prev) => {
          const exists = prev.find((t) => t.type === selectedId);
          if (exists) return prev.map((t) => (t.type === selectedId ? saved : t));
          return [...prev, saved];
        });
        setPreviewNonce((n) => n + 1);
        return true;
      }
    } catch (err) {
      console.error('Failed to save customization:', err);
    }
    return false;
  };

  const handleDeleteSection = async (sectionId: string) => {
    const hidden = new Set(hiddenSections);
    hidden.add(sectionId);

    const updated: EmailTemplateCustomization = {
      ...currentCustomization,
      hiddenSections: Array.from(hidden),
    };

    await saveTemplateCustomization(updated);
    setUndoSection(sectionId);
    const secObj = EMAIL_SECTIONS.find((s) => s.id === sectionId);
    setToastMessage(`Sekce „${secObj?.label || sectionId}“ byla odstraněna.`);
  };

  const handleRestoreSection = async (sectionId: string) => {
    const hidden = new Set(hiddenSections);
    hidden.delete(sectionId);

    const updated: EmailTemplateCustomization = {
      ...currentCustomization,
      hiddenSections: Array.from(hidden),
    };

    await saveTemplateCustomization(updated);
    if (undoSection === sectionId) setUndoSection(null);
    const secObj = EMAIL_SECTIONS.find((s) => s.id === sectionId);
    setToastMessage(`Sekce „${secObj?.label || sectionId}“ byla obnovena.`);
  };

  const handleRestoreAllSections = async () => {
    const updated: EmailTemplateCustomization = {
      ...currentCustomization,
      hiddenSections: [],
    };

    await saveTemplateCustomization(updated);
    setUndoSection(null);
    setToastMessage('Všechny sekce byly obnoveny.');
  };

  const handleResetTemplate = async () => {
    if (!confirm('Opravdu chcete resetovat šablonu do výchozího stavu? Budou smazány všechny vlastní odkazy a obnoveny skryté sekce.')) {
      return;
    }

    const updated: EmailTemplateCustomization = {
      hiddenSections: [],
      heroProduct: null,
      gridProducts: [],
    };

    await saveTemplateCustomization(updated);
    setToastMessage('Šablona byla resetována do výchozího stavu.');
  };

  const handleOpenProductPicker = (target: 'hero' | 'grid', slotIndex?: number) => {
    setPickerTarget(target);
    setPickerSlotIndex(slotIndex);

    if (target === 'hero') {
      setPickerTitle('Vybrat produkt pro hlavní fotku (Hero)');
      setPickerDescription('Vyberte produkt z obchodu. Fotka produktu se vloží do hlavní sekce e-mailu a po kliknutí odkáže zákazníka na URL produktu.');
      setPickerMaxSelect(1);
    } else {
      if (slotIndex !== undefined) {
        setPickerTitle(`Vybrat produkt pro pozici #${slotIndex + 1} v mřížce 2x2`);
        setPickerDescription(`Vyberte produkt pro pozici #${slotIndex + 1}. Obrázek se automaticky propojí s odkazem do obchodu.`);
        setPickerMaxSelect(1);
      } else {
        setPickerTitle('Vybrat produkty pro mřížku 2x2');
        setPickerDescription('Vyberte až 4 produkty z obchodu pro zobrazení v mřížce. Všechny fotky budou klikatelné a odkážou na daný produkt.');
        setPickerMaxSelect(4);
      }
    }

    setPickerOpen(true);
  };

  const handleProductsPicked = async (products: PickedProduct[]) => {
    if (products.length === 0) return;

    if (pickerTarget === 'hero') {
      const p = products[0];
      const updated: EmailTemplateCustomization = {
        ...currentCustomization,
        heroProduct: {
          id: p.id,
          name: p.name,
          slug: p.slug,
          image: p.image,
          price: p.price,
        },
      };
      await saveTemplateCustomization(updated);
      setToastMessage(`Hlavní fotka propojena s produktem „${p.name}“.`);
    } else {
      // Grid
      if (pickerSlotIndex !== undefined) {
        // Single slot updated
        const p = products[0];
        const newGrid = [...(currentCustomization.gridProducts || [])];
        newGrid[pickerSlotIndex] = {
          id: p.id,
          name: p.name,
          slug: p.slug,
          image: p.image,
          price: p.price,
        };
        const updated: EmailTemplateCustomization = {
          ...currentCustomization,
          gridProducts: newGrid,
        };
        await saveTemplateCustomization(updated);
        setToastMessage(`Pozice #${pickerSlotIndex + 1} v mřížce propojena s produktem „${p.name}“.`);
      } else {
        // Multi slots updated
        const newGrid: LinkedProduct[] = products.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          image: p.image,
          price: p.price,
        }));
        const updated: EmailTemplateCustomization = {
          ...currentCustomization,
          gridProducts: newGrid,
        };
        await saveTemplateCustomization(updated);
        setToastMessage(`${products.length} produkty propojeny v mřížce 2x2.`);
      }
    }
  };

  const handleRemoveHeroProduct = async () => {
    const updated: EmailTemplateCustomization = {
      ...currentCustomization,
      heroProduct: null,
    };
    await saveTemplateCustomization(updated);
    setToastMessage('Vlastní produkt byl z hlavní fotky odebrán.');
  };

  const handleRemoveGridProduct = async (idx: number) => {
    const newGrid = [...(currentCustomization.gridProducts || [])];
    newGrid.splice(idx, 1);
    const updated: EmailTemplateCustomization = {
      ...currentCustomization,
      gridProducts: newGrid,
    };
    await saveTemplateCustomization(updated);
    setToastMessage(`Produkt na pozici #${idx + 1} byl odebrán z mřížky.`);
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
            {/* Template Header Card */}
            <div className="admin-card p-[20px]">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="admin-title" style={{ fontSize: 14 }}>{selected.label}</h2>
                    {isTemplateActive ? (
                      <span className="text-[9px] font-bold uppercase tracking-widest bg-black text-white px-2 py-0.5">Aktivní</span>
                    ) : (
                      <span className="text-[9px] font-bold uppercase tracking-widest bg-red-600 text-white px-2 py-0.5">Pozastaveno</span>
                    )}
                  </div>
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

            {/* Email Visual Editor Toolbar */}
            <div className="admin-card p-[16px] bg-[#fafafa]">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-black text-white px-2 py-1">
                    Vizuální editor
                  </span>
                  <button
                    onClick={() => handleOpenProductPicker('hero')}
                    className="admin-btn text-xs"
                    title="Vybrat produkt pro hlavní fotku"
                  >
                    + Produkt Hero
                  </button>
                  <button
                    onClick={() => handleOpenProductPicker('grid')}
                    className="admin-btn text-xs"
                    title="Vybrat produkty pro mřížku 2x2"
                  >
                    + Produkty Mřížka (2x2)
                  </button>
                  <button
                    onClick={() => {
                      setImageUploadTarget('photoGrid');
                      setImageUploadOpen(true);
                    }}
                    className="admin-btn text-xs"
                    title="Nahrát obrázky do mřížky"
                  >
                    + Nahrát fotky
                  </button>
                  <button
                    onClick={() => setShowSectionManager(!showSectionManager)}
                    className={`admin-btn admin-btn-secondary text-xs ${showSectionManager ? 'bg-black text-white' : ''}`}
                  >
                    Sekce ({EMAIL_SECTIONS.length - hiddenSections.length}/{EMAIL_SECTIONS.length}) {showSectionManager ? '▲' : '▼'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {hiddenSections.length > 0 && (
                    <button
                      onClick={handleRestoreAllSections}
                      className="text-[11px] font-bold uppercase tracking-wider text-black underline hover:opacity-70"
                    >
                      Obnovit skryté sekce ({hiddenSections.length})
                    </button>
                  )}
                  {(hiddenSections.length > 0 || heroProduct || gridProducts.length > 0) && (
                    <button
                      onClick={handleResetTemplate}
                      className="text-[11px] uppercase tracking-wider text-[#666666] hover:text-black border border-black/20 hover:border-black px-2 py-1"
                    >
                      Resetovat
                    </button>
                  )}
                </div>
              </div>

              {/* Toast Feedback */}
              {toastMessage && (
                <div className="mt-3 p-3 bg-black text-white text-xs uppercase tracking-wider flex items-center justify-between gap-3 animate-fade-in">
                  <span>{toastMessage}</span>
                  <div className="flex items-center gap-3">
                    {undoSection && (
                      <button
                        onClick={() => handleRestoreSection(undoSection)}
                        className="underline font-bold text-white hover:opacity-80"
                      >
                        Vrátit zpět
                      </button>
                    )}
                    <button onClick={() => setToastMessage(null)} className="text-white/70 hover:text-white">✕</button>
                  </div>
                </div>
              )}

              {/* Expandable Sections Manager */}
              {showSectionManager && (
                <div className="mt-4 pt-4 border-t border-black space-y-3 bg-white p-4 border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider">Viditelnost sekcí e-mailu</h3>
                    <span className="text-[10px] text-[#666666]">
                      Tip: Sekci můžete smazat i přímo v náhledu najetím myší a kliknutím na symbol ✕.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {EMAIL_SECTIONS.map((sec) => {
                      const isHidden = hiddenSections.includes(sec.id);
                      return (
                        <div
                          key={sec.id}
                          className={`p-2.5 border flex items-center justify-between gap-2 transition-colors ${
                            isHidden ? 'bg-[#f4f4f4] border-black/20 opacity-60' : 'bg-white border-black'
                          }`}
                        >
                          <div className="min-w-0">
                            <p className={`text-xs font-bold uppercase tracking-wider truncate ${isHidden ? 'line-through' : ''}`}>
                              {sec.label}
                            </p>
                            <p className="text-[10px] text-[#777777] truncate">{sec.desc}</p>
                          </div>
                          {isHidden ? (
                            <button
                              onClick={() => handleRestoreSection(sec.id)}
                              className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-black text-white px-2 py-1 hover:opacity-80"
                            >
                              + Obnovit
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDeleteSection(sec.id)}
                              className="shrink-0 text-xs font-bold text-black hover:text-red-600 px-2 py-1"
                              title="Odstranit sekci"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Linked Products Summary */}
              {(heroProduct || gridProducts.length > 0) && (
                <div className="mt-3 pt-3 border-t border-black/10 flex items-center gap-4 flex-wrap text-xs">
                  {heroProduct && (
                    <div className="flex items-center gap-2 bg-white border border-black px-2.5 py-1.5 shadow-sm">
                      {heroProduct.image && (
                        <img src={heroProduct.image} alt={heroProduct.name} className="w-6 h-6 object-cover border border-black" />
                      )}
                      <div>
                        <span className="text-[9px] uppercase font-bold text-[#666666] block">Hero produkt</span>
                        <a
                          href={`/produkt/${heroProduct.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold underline hover:opacity-70 truncate max-w-[140px] block"
                        >
                          {heroProduct.name}
                        </a>
                      </div>
                      <button
                        onClick={handleRemoveHeroProduct}
                        className="text-xs text-red-600 hover:text-red-800 ml-1 font-bold"
                        title="Odebrat propojení"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {gridProducts.length > 0 && (
                    <div className="flex items-center gap-2 bg-white border border-black px-2.5 py-1.5 shadow-sm">
                      <div className="flex -space-x-1 overflow-hidden">
                        {gridProducts.map((p, idx) => (
                          <img
                            key={idx}
                            src={p.image}
                            alt={p.name}
                            className="inline-block w-6 h-6 object-cover border border-black ring-1 ring-white"
                          />
                        ))}
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-[#666666] block">Mřížka 2x2</span>
                        <span className="font-bold">{gridProducts.length} propojených produktů</span>
                      </div>
                      <button
                        onClick={() => handleOpenProductPicker('grid')}
                        className="text-[10px] uppercase font-bold underline ml-1 hover:opacity-70"
                      >
                        Upravit
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Interactive Help Hint */}
              <div className="mt-3 pt-2 text-[11px] text-[#666666] flex items-center gap-2 border-t border-black/5">
                <span className="font-bold text-black uppercase tracking-wider text-[10px] bg-white border border-black px-1.5 py-0.5">
                  Interaktivní ovládání
                </span>
                <span>
                  V náhledu níže najeďte myší na jakoukoliv sekci: tlačítkem <strong>✕</strong> vlevo nahoře sekci smažete, tlačítkem <strong>+</strong> na fotkách vyberete a propojíte produkt z obchodu.
                </span>
              </div>
            </div>

            {/* Email Preview Frame */}
            <PreviewFrame
              src={previewSrc}
              title={selected.label}
              viewMode={viewMode}
              setViewMode={setViewMode}
              previewLoading={previewLoading}
              setPreviewLoading={setPreviewLoading}
              frameKey={`${selectedId}-${previewNonce}`}
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
              Sekvence e-mailů s časovými rozestupy a automatickými spouštěči
            </p>
            <div className="flex items-center gap-3">
              {cronResult && <span className="text-xs border border-black px-3 py-1 font-mono">{cronResult}</span>}
              <button onClick={runNow} disabled={runningCron} className="admin-btn">
                {runningCron ? 'Zpracovávám…' : 'Spustit kontrolu teď'}
              </button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {journeys.map((j) => (
              <button
                key={j.id}
                onClick={() => setSelectedJourneyId(j.id)}
                className={`admin-tab ${selectedJourney?.id === j.id ? 'is-active' : ''}`}
              >
                {j.name} {!j.isActive && '· POZASTAVENO'}
              </button>
            ))}
          </div>

          {journeysLoading ? (
            <div className="admin-card admin-empty">Načítám automatické cesty…</div>
          ) : selectedJourney ? (
            <div className="space-y-[16px]">
              <div className="admin-card p-[20px]">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="admin-title" style={{ fontSize: 14 }}>{selectedJourney.name}</h2>
                      {selectedJourney.isActive ? (
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-black text-white px-2 py-0.5">Aktivní</span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-red-600 text-white px-2 py-0.5">Pozastaveno</span>
                      )}
                    </div>
                    <p className="admin-sub">{selectedJourney.description}</p>
                    <div className="flex items-center gap-2 mt-3 text-xs uppercase tracking-wider">
                      <span className="text-[#666666] font-bold">Spouštěč:</span>
                      <span className="border border-black px-2 py-[2px]">{TRIGGER_LABELS[selectedJourney.trigger] || selectedJourney.trigger}</span>
                    </div>
                  </div>
                  <button onClick={() => toggleJourney(selectedJourney)} className={`admin-btn ${selectedJourney.isActive ? 'admin-btn-secondary' : ''}`}>
                    {selectedJourney.isActive ? 'Pozastavit cestu' : 'Aktivovat cestu'}
                  </button>
                </div>
              </div>

              {/* Visual Curved Sequence Panel */}
              <JourneySequencePanel
                journey={selectedJourney}
                triggerLabel={TRIGGER_LABELS[selectedJourney.trigger] || selectedJourney.trigger}
                onUpdateJourney={(updated) => {
                  setJourneys((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
                }}
              />
            </div>
          ) : (
            <div className="admin-card admin-empty">Žádná cesta nebyla nalezena.</div>
          )}
        </div>
      )}

      {/* Product Picker Modal */}
      <ProductPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleProductsPicked}
        title={pickerTitle}
        description={pickerDescription}
        maxSelect={pickerMaxSelect}
        initialSelectedSlugs={
          pickerTarget === 'hero' && heroProduct?.slug
            ? [heroProduct.slug]
            : pickerTarget === 'grid'
            ? gridProducts.map((p) => p.slug)
            : []
        }
      />

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={imageUploadOpen}
        onClose={() => setImageUploadOpen(false)}
        onImagesSelected={(urls) => {
          // Handle uploaded images - can be extended for custom functionality
          console.log('Uploaded images:', urls, 'for target:', imageUploadTarget);
          // Future: integrate with email builder to add images to sections
        }}
        maxImages={imageUploadTarget === 'photoGrid' ? 4 : 1}
        title={imageUploadTarget === 'photoGrid' ? 'Nahrání fotografií do mřížky' : 'Nahrání hlavní fotografie'}
        description={imageUploadTarget === 'photoGrid' ? 'Přetáhněte až 4 fotografie do pole' : 'Přetáhněte fotku do pole'}
      />
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
          Náhled · {viewMode === 'mobile' ? 'Mobil (390 px)' : 'Desktop'} · font Inter / Arial (čeština)
        </p>
        <a href={src} target="_blank" rel="noopener noreferrer" className="text-[11px] uppercase tracking-wider hover:underline">
          Otevřít v nové záložce →
        </a>
      </div>
    </div>
  );
}
