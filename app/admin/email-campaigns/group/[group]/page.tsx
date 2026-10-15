'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Clock,
  Mail,
  Eye,
  Edit2,
  ArrowUp,
  ArrowDown,
  Trash2,
  Send,
  Zap,
  Users,
  Check,
  X,
  Smartphone,
  Monitor,
  Tag,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import ProductPickerModal, { type PickedProduct } from '@/components/admin/ProductPickerModal';
import ImageUploadModal from '@/components/admin/ImageUploadModal';
import ConfirmModal from '@/components/admin/ConfirmModal';
import type { EmailTemplateCustomization, LinkedProduct } from '@/lib/email-layout';

interface CampaignStep {
  id: string;
  name: string;
  subject: string;
  content: string;
  targetAudience: string;
  position: number;
  delayHours: number;
  customization?: EmailTemplateCustomization | null;
  status: string;
  sentAt?: string | null;
  sentCount?: number;
}

interface GroupMeta {
  id: string;
  title: string;
  subtitle: string;
  triggerLabel: string;
  triggerDesc: string;
}

const GROUPS_META: Record<string, GroupMeta> = {
  customers: {
    id: 'customers',
    title: 'Kampaň pro zákazníky',
    subtitle: 'Newsletter subscribers z e-shopu',
    triggerLabel: 'Přihlášení k newsletteru na webu',
    triggerDesc: 'Sekvence začíná automaticky nebo hromadným odesláním všem odběratelům newsletteru.',
  },
  free: {
    id: 'free',
    title: 'Kampaň pro FREE',
    subtitle: 'Free Download publikum (BeatStars)',
    triggerLabel: 'Stažení bezplatného obsahu (BeatStars)',
    triggerDesc: 'Sekvence navržená pro konverzi 5 000+ kontaktů ze stahování zdarma na platící zákazníky.',
  },
};

const SECTIONS_CATALOG = [
  { id: 'header1', label: '1. Horní logo UFO SPORT' },
  { id: 'header2', label: '2. Nadpis a text' },
  { id: 'storyImage', label: '2.5. Příběhový obrázek', isPhoto: true },
  { id: 'heroImage', label: '3. Hlavní fotka (Hero produkt)', isPhoto: true },
  { id: 'info', label: '4. Text e-mailu / sdělení' },
  { id: 'photoGrid', label: '5. Mřížka produktů 2x2', isPhoto: true },
  { id: 'actionButton', label: '6. Tlačítko akce (CTA)' },
  { id: 'browseAll', label: '7. Tlačítko „Zobrazit vše“' },
  { id: 'footerLinks', label: '8. Odkazy v patičce' },
  { id: 'footerSocial', label: '9. Sociální sítě a patička' },
];

function formatDelayText(hours: number): string {
  if (hours === 0) return 'Ihned';
  if (hours % 24 === 0) {
    const days = hours / 24;
    return days === 1 ? '1 den' : `${days} dní`;
  }
  if (hours === 1) return '1 hodina';
  if (hours < 5) return `${hours} hodiny`;
  return `${hours} hodin`;
}

export default function CampaignGroupSequencePage() {
  const params = useParams();
  const router = useRouter();
  const group = (params.group as string) || 'customers';
  const groupMeta = GROUPS_META[group] || {
    id: group,
    title: `Kampaň pro ${group}`,
    subtitle: 'Audience group',
    triggerLabel: 'Spuštění sekvence',
    triggerDesc: 'Sekvence pro vybranou skupinu kontaktů.',
  };

  const [campaigns, setCampaigns] = useState<CampaignStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

  // Quick Delay Inline Editor State
  const [delayEditingId, setDelayEditingId] = useState<string | null>(null);
  const [quickDelayVal, setQuickDelayVal] = useState<number>(0);
  const [quickDelayUnit, setQuickDelayUnit] = useState<'hours' | 'days'>('hours');

  // Preview Modal State
  const [previewStep, setPreviewStep] = useState<CampaignStep | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);

  // Visual Editor Modal State
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Partial<CampaignStep>>({});
  const [editorDelayUnit, setEditorDelayUnit] = useState<'hours' | 'days'>('hours');
  const [editorDelayValue, setEditorDelayValue] = useState<number>(0);
  const [editorCustomization, setEditorCustomization] = useState<EmailTemplateCustomization>({});
  const [editorSaving, setEditorSaving] = useState(false);
  const [editorPreviewHtml, setEditorPreviewHtml] = useState<string>('');
  const [editorPreviewMode, setEditorPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showSectionManager, setShowSectionManager] = useState(false);

  // Test Email Inside Editor / In Sequence
  const [testEmailAddr, setTestEmailAddr] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testFeedback, setTestFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Send to entire group confirmation
  const [sendGroupCandidate, setSendGroupCandidate] = useState<CampaignStep | null>(null);
  const [sendGroupSending, setSendGroupSending] = useState(false);

  // Delete confirmation
  const [deleteCandidate, setDeleteCandidate] = useState<CampaignStep | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Product Picker Modal
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'hero' | 'grid'>('hero');

  // Image Upload Modal
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<'photoGrid' | 'hero' | 'story'>('photoGrid');

  // Feedback Toast
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Load campaigns and group count
  const loadData = async () => {
    try {
      const [resCamps, resGroups] = await Promise.all([
        fetch(`/api/admin/email-campaigns?group=${group}`),
        fetch('/api/admin/newsletter/groups'),
      ]);

      if (resCamps.ok) {
        const data = await resCamps.json();
        setCampaigns(Array.isArray(data) ? data : []);
      }

      if (resGroups.ok) {
        const groupsData: { group: string; count: number }[] = await resGroups.json();
        const found = groupsData.find((g) => g.group === group);
        setSubscriberCount(found ? found.count : 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [group]);

  // Open Preview Modal
  const handleOpenPreview = async (step: CampaignStep) => {
    setPreviewStep(step);
    setPreviewLoading(true);
    try {
      const res = await fetch('/api/admin/email-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignPreview: true,
          subject: step.subject,
          content: step.content,
          customization: step.customization,
          adminMode: false,
        }),
      });
      if (res.ok) {
        setPreviewHtml(await res.text());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Live render inside Visual Editor
  useEffect(() => {
    if (!editorOpen) return;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/admin/email-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignPreview: true,
            subject: editingCampaign.subject || 'UFO SPORT',
            content: editingCampaign.content || '',
            customization: editorCustomization,
            adminMode: false,
          }),
        });
        if (res.ok) {
          setEditorPreviewHtml(await res.text());
        }
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [editorOpen, editingCampaign.subject, editingCampaign.content, editorCustomization]);

  // Open Visual Editor for new or existing step
  const handleOpenEditor = (step?: CampaignStep) => {
    setTestFeedback(null);
    setShowSectionManager(false);
    if (step) {
      setEditingCampaign({ ...step });
      const hours = step.delayHours || 0;
      if (hours > 0 && hours % 24 === 0) {
        setEditorDelayUnit('days');
        setEditorDelayValue(hours / 24);
      } else {
        setEditorDelayUnit('hours');
        setEditorDelayValue(hours);
      }
      setEditorCustomization((step.customization as EmailTemplateCustomization) || {});
    } else {
      setEditingCampaign({
        name: `E-mail #${campaigns.length + 1} (${groupMeta.title})`,
        subject: 'Exkluzivní novinka od UFO SPORT',
        content: 'Zde napište hlavní sdělení pro vaše odběratele...',
        targetAudience: group,
        delayHours: campaigns.length === 0 ? 0 : 24,
      });
      setEditorDelayUnit(campaigns.length === 0 ? 'hours' : 'days');
      setEditorDelayValue(campaigns.length === 0 ? 0 : 1);
      setEditorCustomization({
        hiddenSections: [],
      });
    }
    setEditorOpen(true);
  };

  // Save from Visual Editor
  const handleSaveEditor = async () => {
    setEditorSaving(true);
    try {
      const computedHours = editorDelayUnit === 'days' ? (editorDelayValue || 0) * 24 : (editorDelayValue || 0);

      const payload = {
        name: editingCampaign.name || 'E-mail v sekvenci',
        subject: editingCampaign.subject || 'Novinka UFO SPORT',
        content: editingCampaign.content || '',
        targetAudience: group,
        delayHours: computedHours,
        customization: editorCustomization,
      };

      if (editingCampaign.id) {
        // Update existing
        const res = await fetch(`/api/admin/email-campaigns/${editingCampaign.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          showFeedback('success', 'E-mail byl úspěšně upraven a uložen.');
          setEditorOpen(false);
          loadData();
        } else {
          showFeedback('error', 'Uložení selhalo.');
        }
      } else {
        // Create new
        const res = await fetch('/api/admin/email-campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            position: campaigns.length,
          }),
        });
        if (res.ok) {
          showFeedback('success', 'Nový e-mail byl přidán do sekvence.');
          setEditorOpen(false);
          loadData();
        } else {
          showFeedback('error', 'Vytvoření e-mailu selhalo.');
        }
      }
    } catch (e) {
      showFeedback('error', 'Chyba připojení k serveru.');
    } finally {
      setEditorSaving(false);
    }
  };

  // Quick Delay Inline Save
  const handleSaveQuickDelay = async (stepId: string) => {
    const computedHours = quickDelayUnit === 'days' ? (quickDelayVal || 0) * 24 : (quickDelayVal || 0);
    try {
      const res = await fetch(`/api/admin/email-campaigns/${stepId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delayHours: computedHours }),
      });
      if (res.ok) {
        setCampaigns((prev) =>
          prev.map((c) => (c.id === stepId ? { ...c, delayHours: computedHours } : c))
        );
        showFeedback('success', `Prodleva byla nastavena na ${formatDelayText(computedHours)}.`);
      }
    } catch {
      showFeedback('error', 'Nepodařilo se uložit prodlevu.');
    } finally {
      setDelayEditingId(null);
    }
  };

  // Move step up or down
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= campaigns.length) return;

    const reordered = [...campaigns];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    setCampaigns(reordered);

    try {
      await fetch('/api/admin/email-campaigns/sequence', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps: reordered.map((c, idx) => ({ id: c.id, position: idx })) }),
      });
      showFeedback('success', 'Pořadí v sekvenci bylo uloženo.');
    } catch {
      showFeedback('error', 'Chyba při ukládání pořadí.');
      loadData();
    }
  };

  // Delete step
  const handleDelete = async () => {
    if (!deleteCandidate) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/email-campaigns/${deleteCandidate.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCampaigns((prev) => prev.filter((c) => c.id !== deleteCandidate.id));
        showFeedback('success', 'E-mail byl ze sekvence úspěšně odstraněn.');
      }
    } catch {
      showFeedback('error', 'Smazání selhalo.');
    } finally {
      setDeleteLoading(false);
      setDeleteCandidate(null);
    }
  };

  // Send Test Email
  const handleSendTest = async (htmlToSend?: string, subjectToSend?: string) => {
    if (!testEmailAddr || !testEmailAddr.includes('@')) {
      setTestFeedback({ type: 'error', msg: 'Zadejte platnou e-mailovou adresu.' });
      return;
    }
    setTestSending(true);
    setTestFeedback(null);
    try {
      const res = await fetch('/api/admin/email-campaigns/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testEmail: testEmailAddr,
          html: htmlToSend || editorPreviewHtml,
          subject: subjectToSend || editingCampaign.subject || 'Testovací e-mail UFO SPORT',
        }),
      });
      if (res.ok) {
        setTestFeedback({ type: 'success', msg: `Testovací e-mail byl úspěšně odeslán na ${testEmailAddr}.` });
      } else {
        const err = await res.json().catch(() => ({}));
        setTestFeedback({ type: 'error', msg: err.error || 'Odeslání testu selhalo.' });
      }
    } catch {
      setTestFeedback({ type: 'error', msg: 'Chyba sítě při odesílání.' });
    } finally {
      setTestSending(false);
    }
  };

  // Send to entire group
  const handleSendToGroup = async () => {
    if (!sendGroupCandidate) return;
    setSendGroupSending(true);
    try {
      const res = await fetch(`/api/admin/email-campaigns/${sendGroupCandidate.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduled: false }),
      });
      if (res.ok) {
        const data = await res.json();
        showFeedback(
          'success',
          `Kampaň byla úspěšně odeslána ${data.sentCount || subscriberCount || ''} příjemcům ve skupině ${groupMeta.title}!`
        );
        loadData();
      } else {
        const err = await res.json().catch(() => ({}));
        showFeedback('error', err.error || 'Odeslání kampaně selhalo.');
      }
    } catch {
      showFeedback('error', 'Chyba serveru při odesílání kampaně.');
    } finally {
      setSendGroupSending(false);
      setSendGroupCandidate(null);
    }
  };

  // Product Selection Handlers
  const handleProductsSelected = (picked: PickedProduct[]) => {
    if (pickerTarget === 'hero' && picked[0]) {
      setEditorCustomization((prev) => ({
        ...prev,
        heroProduct: {
          id: picked[0].id,
          name: picked[0].name,
          slug: picked[0].slug,
          image: picked[0].image,
          price: picked[0].price,
        },
      }));
    } else if (pickerTarget === 'grid') {
      setEditorCustomization((prev) => ({
        ...prev,
        gridProducts: picked.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          image: p.image,
          price: p.price,
        })),
      }));
    }
    setPickerOpen(false);
  };

  // Image Upload Handlers
  const handleImagesUploaded = (urls: string[]) => {
    if (urls.length === 0) return;
    if (uploadTarget === 'story') {
      setEditorCustomization((prev) => ({
        ...prev,
        storyImage: urls[0],
      }));
    } else if (uploadTarget === 'hero') {
      setEditorCustomization((prev) => ({
        ...prev,
        heroProduct: {
          slug: 'kolekce',
          image: urls[0],
          name: 'Nová kolekce',
        },
      }));
    } else if (uploadTarget === 'photoGrid') {
      setEditorCustomization((prev) => ({
        ...prev,
        gridProducts: urls.slice(0, 4).map((url, i) => ({
          slug: 'kolekce',
          image: url,
          name: `Produkt ${i + 1}`,
        })),
      }));
    }
    setUploadOpen(false);
  };

  // Toggle Section Visibility
  const toggleSection = (sectionId: string) => {
    const hidden = new Set(editorCustomization.hiddenSections || []);
    if (hidden.has(sectionId)) {
      hidden.delete(sectionId);
    } else {
      hidden.add(sectionId);
    }
    setEditorCustomization((prev) => ({
      ...prev,
      hiddenSections: Array.from(hidden),
    }));
  };

  return (
    <div className="space-y-[24px]">
      {/* Top Bar with Navigation */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-black pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/email-campaigns"
            className="p-2 border border-black hover:bg-black hover:text-white transition-colors"
            title="Zpět na přehled kampaní"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="admin-title">{groupMeta.title}</h1>
              <span className="rounded-full border border-black bg-black text-white px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                {subscriberCount !== null ? `${subscriberCount.toLocaleString('cs-CZ')} příjemců` : 'Načítám…'}
              </span>
            </div>
            <p className="admin-sub">{groupMeta.subtitle}</p>
          </div>
        </div>

        <button
          onClick={() => handleOpenEditor()}
          className="admin-btn flex items-center gap-2"
        >
          <Plus size={14} />
          <span>Přidat e-mail do sekvence</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3 border text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-black text-white border-black'
              : 'bg-red-50 text-red-700 border-red-500'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Mapped Out Visual Journey Flow */}
      <div className="admin-card p-6 space-y-4">
        {/* Top Trigger Node */}
        <div className="max-w-md mx-auto">
          <div className="rounded-2xl border-2 border-black bg-black text-white p-5 shadow-sm text-center">
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#aaaaaa] mb-1">
              <Zap size={14} className="text-white" />
              <span>Spouštěč sekvence kampaně</span>
            </div>
            <p className="text-sm font-bold uppercase tracking-wider">{groupMeta.triggerLabel}</p>
            <p className="text-[11px] text-[#cccccc] uppercase tracking-wider mt-1">{groupMeta.triggerDesc}</p>
          </div>
        </div>

        {/* Empty State */}
        {campaigns.length === 0 && !loading && (
          <div className="text-center py-16 space-y-4">
            <div className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center mx-auto">
              <Mail size={20} className="text-black" />
            </div>
            <p className="text-xs uppercase tracking-wider text-[#666666] font-bold">
              Tato kampaň zatím nemá žádné naplánované e-maily.
            </p>
            <p className="text-xs text-[#888888] max-w-sm mx-auto">
              Začněte přidáním prvního e-mailu. Můžete nastavit obsah ve vizuálním editoru a zvolit časovou prodlevu.
            </p>
            <button
              onClick={() => handleOpenEditor()}
              className="admin-btn mt-2 inline-flex items-center gap-2"
            >
              <Plus size={14} />
              <span>Vytvořit první e-mail v sekvenci</span>
            </button>
          </div>
        )}

        {/* Steps Flow with connecting lines and clickable delays */}
        <div className="space-y-0">
          {campaigns.map((step, index) => {
            const isEditingDelay = delayEditingId === step.id;

            return (
              <div key={step.id || index} className="flex flex-col items-center">
                {/* Connecting Line and Time Delay Container */}
                <div className="flex flex-col items-center my-1.5">
                  <div className="w-0.5 h-6 bg-black" />

                  {/* Clickable Delay Container with curved corners */}
                  {!isEditingDelay ? (
                    <button
                      onClick={() => {
                        setDelayEditingId(step.id);
                        const h = step.delayHours || 0;
                        if (h > 0 && h % 24 === 0) {
                          setQuickDelayUnit('days');
                          setQuickDelayVal(h / 24);
                        } else {
                          setQuickDelayUnit('hours');
                          setQuickDelayVal(h);
                        }
                      }}
                      title="Klikněte pro změnu časové prodlevy"
                      className="rounded-full border border-black bg-white hover:bg-neutral-100 px-5 py-2 shadow-sm flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black transition-all cursor-pointer group"
                    >
                      <Clock size={13} className="text-black shrink-0 group-hover:scale-110 transition-transform" />
                      <span>Čekání {formatDelayText(step.delayHours || 0)}</span>
                      <span className="text-[10px] text-[#888888] ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        (upravit)
                      </span>
                    </button>
                  ) : (
                    <div className="rounded-2xl border-2 border-black bg-white p-3 shadow-md flex items-center gap-2 flex-wrap text-xs">
                      <Clock size={13} className="text-black shrink-0" />
                      <span className="font-bold uppercase tracking-wider text-[11px]">Prodleva:</span>
                      <input
                        type="number"
                        min="0"
                        value={quickDelayVal}
                        onChange={(e) => setQuickDelayVal(Number(e.target.value))}
                        className="admin-input w-16 text-center py-1 text-xs"
                      />
                      <select
                        value={quickDelayUnit}
                        onChange={(e) => setQuickDelayUnit(e.target.value as any)}
                        className="admin-input py-1 text-xs uppercase"
                      >
                        <option value="hours">Hodin</option>
                        <option value="days">Dní</option>
                      </select>
                      <button
                        onClick={() => handleSaveQuickDelay(step.id)}
                        className="admin-btn py-1 px-3 text-xs"
                      >
                        Uložit
                      </button>
                      <button
                        onClick={() => setDelayEditingId(null)}
                        className="admin-btn admin-btn-secondary py-1 px-2 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Downward line with arrowhead */}
                  <div className="w-0.5 h-6 bg-black relative flex flex-col items-center justify-end">
                    <svg
                      className="w-3.5 h-3.5 text-black -mb-1 shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 18l-6-6h12z" />
                    </svg>
                  </div>
                </div>

                {/* Email Container with Curved Corners */}
                <div className="w-full max-w-2xl rounded-2xl border-2 border-black bg-white p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-full border border-black bg-black text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                        E-mail #{index + 1}
                      </span>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-black">
                        {step.subject}
                      </h3>
                      {step.status === 'sent' ? (
                        <span className="rounded-full border border-black bg-black text-white px-2 py-0.5 text-[10px] uppercase tracking-wider">
                          Odesláno ({step.sentCount || 0})
                        </span>
                      ) : (
                        <span className="rounded-full border border-neutral-300 bg-neutral-100 text-neutral-700 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                          Návrh
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenPreview(step)}
                        title="Zobrazit náhled"
                        className="p-1.5 rounded-lg border border-black hover:bg-black hover:text-white transition-colors"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => handleOpenEditor(step)}
                        title="Otevřít vizuální editor"
                        className="p-1.5 rounded-lg border border-black hover:bg-black hover:text-white transition-colors"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0}
                        title="Posunout nahoru"
                        className="p-1.5 rounded-lg border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-black"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === campaigns.length - 1}
                        title="Posunout dolů"
                        className="p-1.5 rounded-lg border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-black"
                      >
                        <ArrowDown size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteCandidate(step)}
                        title="Smazat e-mail"
                        className="p-1.5 rounded-lg border border-black text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#666666] leading-relaxed mt-2 line-clamp-2">
                    {step.content || 'Bez doplňujícího textu.'}
                  </p>

                  {/* Badges for configured visual sections */}
                  <div className="flex items-center gap-2 flex-wrap pt-3 mt-3 border-t border-black/10 text-xs">
                    <span className="text-[10px] uppercase font-bold text-[#666666]">
                      {step.name}
                    </span>
                    {step.customization?.heroProduct && (
                      <span className="rounded-full border border-black bg-neutral-100 text-black px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <ImageIcon size={10} />
                        <span>Hero produkt</span>
                      </span>
                    )}
                    {step.customization?.gridProducts && step.customization.gridProducts.length > 0 && (
                      <span className="rounded-full border border-black bg-neutral-100 text-black px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <ImageIcon size={10} />
                        <span>Mřížka {step.customization.gridProducts.length} fotek</span>
                      </span>
                    )}
                    {step.customization?.storyImage && (
                      <span className="rounded-full border border-green-600 bg-green-50 text-green-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        Příběhová fotka
                      </span>
                    )}

                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={() => {
                          handleOpenPreview(step);
                          setTestEmailAddr('');
                        }}
                        className="text-[11px] font-bold uppercase tracking-wider border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors"
                      >
                        Odeslat test
                      </button>
                      <button
                        onClick={() => setSendGroupCandidate(step)}
                        className="text-[11px] font-bold uppercase tracking-wider bg-black text-white px-3 py-1 hover:bg-neutral-800 transition-colors flex items-center gap-1"
                      >
                        <Send size={11} />
                        <span>Odeslat skupině</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Email Editor Modal */}
      {editorOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border-2 border-black w-full max-w-5xl my-auto p-6 shadow-2xl flex flex-col gap-5 max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-black">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-black">
                  {editingCampaign.id ? 'Vizuální editor e-mailu' : 'Nový e-mail v sekvenci'}
                </h2>
                <p className="text-xs text-[#666666] uppercase tracking-wider mt-0.5">
                  {groupMeta.title} · Černý profesionální design s dynamickými sekcemi
                </p>
              </div>
              <button
                onClick={() => setEditorOpen(false)}
                className="p-1 border border-black hover:bg-black hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Editor Grid: Left Form Controls, Right Live Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Form and Section Pickers */}
              <div className="space-y-4">
                <div>
                  <label className="admin-label">Interní název e-mailu</label>
                  <input
                    type="text"
                    value={editingCampaign.name || ''}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, name: e.target.value })}
                    className="admin-input w-full"
                    placeholder="např. E-mail 1 – Uvítání a představení novinek"
                  />
                </div>

                <div>
                  <label className="admin-label">Předmět e-mailu (Subject)</label>
                  <input
                    type="text"
                    value={editingCampaign.subject || ''}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, subject: e.target.value })}
                    className="admin-input w-full font-bold"
                    placeholder="Předmět viditelný pro zákazníka ve schránce"
                  />
                </div>

                {/* Delay Picker */}
                <div>
                  <label className="admin-label">Časová prodleva před odesláním</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={editorDelayValue}
                      onChange={(e) => setEditorDelayValue(Number(e.target.value))}
                      className="admin-input w-24 text-center"
                    />
                    <select
                      value={editorDelayUnit}
                      onChange={(e) => setEditorDelayUnit(e.target.value as any)}
                      className="admin-input uppercase"
                    >
                      <option value="hours">Hodin</option>
                      <option value="days">Dní</option>
                    </select>
                    <span className="text-xs text-[#666666] uppercase">
                      (= {formatDelayText(editorDelayUnit === 'days' ? editorDelayValue * 24 : editorDelayValue)})
                    </span>
                  </div>
                </div>

                {/* Content Message */}
                <div>
                  <label className="admin-label">Text e-mailu / sdělení</label>
                  <textarea
                    rows={4}
                    value={editingCampaign.content || ''}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, content: e.target.value })}
                    className="admin-input w-full text-xs"
                    placeholder="Zde napište text, který se zobrazí v informačním bloku e-mailu..."
                  />
                </div>

                {/* Visual Editor Section Controls */}
                <div className="p-4 border border-black bg-neutral-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-black">
                      Vizuální bloky e-mailu
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSectionManager(!showSectionManager)}
                      className="text-[10px] font-bold uppercase tracking-wider border border-black px-2 py-1 bg-white hover:bg-black hover:text-white transition-colors"
                    >
                      Správce sekcí {showSectionManager ? '▲' : '▼'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setPickerTarget('hero');
                        setPickerOpen(true);
                      }}
                      className="admin-btn text-xs py-1.5 px-3"
                    >
                      + Produkt Hero
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPickerTarget('grid');
                        setPickerOpen(true);
                      }}
                      className="admin-btn text-xs py-1.5 px-3"
                    >
                      + Produkty Mřížka (2x2)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadTarget('photoGrid');
                        setUploadOpen(true);
                      }}
                      className="admin-btn text-xs py-1.5 px-3"
                    >
                      + Nahrát fotky
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadTarget('story');
                        setUploadOpen(true);
                      }}
                      className="text-xs font-bold uppercase tracking-wider text-white px-3 py-1.5 border border-black transition-colors"
                      style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}
                    >
                      + Fotka příběhu
                    </button>
                  </div>

                  {/* Section Manager Toggle */}
                  {showSectionManager && (
                    <div className="pt-3 border-t border-black/10 space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1">
                        Zobrazit / skrýt jednotlivé sekce:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {SECTIONS_CATALOG.map((sec) => {
                          const isHidden = (editorCustomization.hiddenSections || []).includes(sec.id);
                          return (
                            <button
                              key={sec.id}
                              type="button"
                              onClick={() => toggleSection(sec.id)}
                              className={`flex items-center justify-between p-2 border text-[11px] font-bold uppercase tracking-wider transition-colors ${
                                isHidden
                                  ? 'bg-neutral-200 text-neutral-400 border-neutral-300 line-through'
                                  : 'bg-white text-black border-black'
                              }`}
                            >
                              <span>{sec.label}</span>
                              <span>{isHidden ? 'Skryto' : 'Viditelné'}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Test Email Box inside Editor */}
                <div className="p-4 border border-black bg-white space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-black block">
                    Odeslat testovací e-mail
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={testEmailAddr}
                      onChange={(e) => setTestEmailAddr(e.target.value)}
                      placeholder="vas-email@example.com"
                      className="admin-input flex-1 text-xs"
                      style={{ textTransform: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleSendTest()}
                      disabled={testSending}
                      className="admin-btn text-xs py-2 px-3 whitespace-nowrap"
                    >
                      {testSending ? 'Odesílám…' : 'Odeslat test'}
                    </button>
                  </div>
                  {testFeedback && (
                    <p
                      className={`text-xs uppercase tracking-wider font-bold mt-1 ${
                        testFeedback.type === 'success' ? 'text-black' : 'text-red-600'
                      }`}
                    >
                      {testFeedback.msg}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Live Black Preview */}
              <div className="space-y-3 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-black text-white px-2 py-0.5">
                      Živý náhled (Černé pozadí)
                    </span>
                  </div>
                  <div className="flex items-center gap-1 border border-black p-0.5">
                    <button
                      type="button"
                      onClick={() => setEditorPreviewMode('desktop')}
                      className={`p-1 text-xs ${editorPreviewMode === 'desktop' ? 'bg-black text-white' : 'text-black'}`}
                      title="Desktop zobrazení"
                    >
                      <Monitor size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorPreviewMode('mobile')}
                      className={`p-1 text-xs ${editorPreviewMode === 'mobile' ? 'bg-black text-white' : 'text-black'}`}
                      title="Mobilní zobrazení"
                    >
                      <Smartphone size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 min-h-[480px] bg-black border-2 border-black flex items-center justify-center p-2 overflow-hidden">
                  <iframe
                    title="Live Email Preview"
                    srcDoc={editorPreviewHtml}
                    className="w-full h-[520px] bg-black border-0 transition-all"
                    style={{
                      maxWidth: editorPreviewMode === 'mobile' ? '375px' : '620px',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-black">
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="admin-btn admin-btn-secondary"
              >
                Zrušit
              </button>
              <button
                type="button"
                onClick={handleSaveEditor}
                disabled={editorSaving}
                className="admin-btn"
              >
                {editorSaving ? 'Ukládám…' : 'Uložit e-mail do sekvence'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Preview Modal */}
      {previewStep && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white border-2 border-black w-full max-w-4xl p-5 shadow-2xl flex flex-col gap-4 max-h-[92vh]">
            <div className="flex items-center justify-between pb-3 border-b border-black">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-black">
                  Náhled: {previewStep.subject}
                </h3>
                <p className="text-[10px] text-[#666666] uppercase tracking-wider">
                  {previewStep.name} · Časová prodleva: {formatDelayText(previewStep.delayHours || 0)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 border border-black p-0.5">
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`p-1 text-xs ${previewMode === 'desktop' ? 'bg-black text-white' : 'text-black'}`}
                  >
                    <Monitor size={14} />
                  </button>
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`p-1 text-xs ${previewMode === 'mobile' ? 'bg-black text-white' : 'text-black'}`}
                  >
                    <Smartphone size={14} />
                  </button>
                </div>
                <button
                  onClick={() => setPreviewStep(null)}
                  className="p-1 border border-black hover:bg-black hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-[460px] bg-black border border-black flex items-center justify-center p-2 overflow-hidden">
              {previewLoading ? (
                <div className="text-white text-xs uppercase tracking-wider font-bold">Generuji náhled…</div>
              ) : (
                <iframe
                  title="Full Email Preview"
                  srcDoc={previewHtml}
                  className="w-full h-[520px] bg-black border-0"
                  style={{
                    maxWidth: previewMode === 'mobile' ? '375px' : '620px',
                  }}
                />
              )}
            </div>

            <div className="flex items-center justify-between gap-4 pt-2 border-t border-black flex-wrap">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <input
                  type="email"
                  value={testEmailAddr}
                  onChange={(e) => setTestEmailAddr(e.target.value)}
                  placeholder="Zadejte e-mail pro test"
                  className="admin-input flex-1 text-xs"
                  style={{ textTransform: 'none' }}
                />
                <button
                  onClick={() => handleSendTest(previewHtml, previewStep.subject)}
                  disabled={testSending}
                  className="admin-btn text-xs py-2 whitespace-nowrap"
                >
                  {testSending ? 'Odesílám…' : 'Odeslat test'}
                </button>
              </div>
              <button
                onClick={() => setPreviewStep(null)}
                className="admin-btn admin-btn-secondary text-xs"
              >
                Zavřít
              </button>
            </div>
            {testFeedback && (
              <p
                className={`text-xs uppercase tracking-wider font-bold ${
                  testFeedback.type === 'success' ? 'text-black' : 'text-red-600'
                }`}
              >
                {testFeedback.msg}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Product Picker Modal */}
      <ProductPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleProductsSelected}
        maxSelect={pickerTarget === 'hero' ? 1 : 4}
        title={pickerTarget === 'hero' ? 'Vybrat Hero produkt' : 'Vybrat 4 produkty do mřížky 2x2'}
      />

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onImagesSelected={handleImagesUploaded}
        maxImages={uploadTarget === 'photoGrid' ? 4 : 1}
        title={uploadTarget === 'story' ? 'Nahrát fotku příběhu' : 'Nahrát fotky produktů'}
      />

      {/* Confirm Send to Group Modal */}
      <ConfirmModal
        isOpen={Boolean(sendGroupCandidate)}
        title="Odeslat e-mail celé skupině?"
        message={`Chystáte se odeslat e-mail „${sendGroupCandidate?.subject}“ všem ${
          subscriberCount?.toLocaleString('cs-CZ') || ''
        } kontaktům ve skupině ${groupMeta.title}. Všechny e-maily budou mít 100% černé pozadí a profesionální design.`}
        confirmLabel="ANO, ODESLAT SKUPINĚ"
        cancelLabel="ZRUŠIT"
        loading={sendGroupSending}
        onConfirm={handleSendToGroup}
        onCancel={() => setSendGroupCandidate(null)}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteCandidate)}
        title="Smazat e-mail ze sekvence?"
        message={`Opravdu si přejete smazat e-mail „${deleteCandidate?.subject}“ ze sekvence? Tato akce je nevratná.`}
        confirmLabel="SMAZAT E-MAIL"
        cancelLabel="ZRUŠIT"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  );
}
