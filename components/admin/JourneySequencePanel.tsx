'use client';

import { useState } from 'react';
import { EMAIL_CATALOG, type EmailType } from '@/lib/email-catalog';
import ConfirmModal from '@/components/admin/ConfirmModal';
import {
  Clock,
  Mail,
  Edit2,
  Trash2,
  Plus,
  Eye,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Tag,
  Zap,
} from 'lucide-react';

export interface JourneyStep {
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

export interface Journey {
  id: string;
  key: string;
  name: string;
  description: string;
  trigger: string;
  isActive: boolean;
  steps: JourneyStep[];
  _count?: { enrollments: number };
}

interface JourneySequencePanelProps {
  journey: Journey;
  triggerLabel: string;
  onUpdateJourney: (updated: Journey) => void;
}

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

function catalogInfo(type: string) {
  return EMAIL_CATALOG.find((item) => item.id === type) || {
    id: type as EmailType,
    label: type,
    description: 'Automatický e-mail',
    marketing: true,
    trigger: 'Cesta',
    triggerDetail: '',
  };
}

export default function JourneySequencePanel({
  journey,
  triggerLabel,
  onUpdateJourney,
}: JourneySequencePanelProps) {
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<JourneyStep>>({});
  const [delayUnit, setDelayUnit] = useState<'hours' | 'days'>('hours');
  const [delayValue, setDelayValue] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<JourneyStep | null>(null);
  const [previewStep, setPreviewStep] = useState<JourneyStep | null>(null);
  const [previewViewMode, setPreviewViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [previewLoading, setPreviewLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const sortedSteps = [...journey.steps].sort((a, b) => a.position - b.position);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const startEdit = (step: JourneyStep) => {
    setEditingStepId(step.id);
    setEditForm({ ...step });
    if (step.delayHours % 24 === 0 && step.delayHours > 0) {
      setDelayUnit('days');
      setDelayValue(step.delayHours / 24);
    } else {
      setDelayUnit('hours');
      setDelayValue(step.delayHours);
    }
  };

  const cancelEdit = () => {
    setEditingStepId(null);
    setEditForm({});
  };

  const saveStepEdit = async (stepId: string) => {
    const computedHours = delayUnit === 'days' ? (delayValue || 0) * 24 : (delayValue || 0);

    const updatedSteps = sortedSteps.map((s) => {
      if (s.id !== stepId) return s;
      return {
        ...s,
        ...editForm,
        delayHours: computedHours,
      };
    });

    await persistSteps(updatedSteps, 'Krok byl úspěšně upraven a uložen.');
    setEditingStepId(null);
  };

  const persistSteps = async (steps: JourneyStep[], successMsg: string) => {
    setSaving(true);
    try {
      const payloadSteps = steps.map((s, idx) => ({
        id: s.id,
        position: idx,
        delayHours: Number(s.delayHours || 0),
        emailType: s.emailType,
        generatePromo: Boolean(s.generatePromo),
        promoDiscountType: 'PERCENTAGE',
        promoDiscountValue: Number(s.promoDiscountValue ?? 10),
        promoValidDays: Number(s.promoValidDays ?? 14),
        promoMaxUses: 1,
        skipIfPurchased: Boolean(s.skipIfPurchased),
        skipIfPaid: Boolean(s.skipIfPaid),
      }));

      const res = await fetch(`/api/admin/journeys/${journey.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps: payloadSteps }),
      });

      if (res.ok) {
        const updated = await res.json();
        onUpdateJourney(updated);
        showFeedback('success', successMsg);
      } else {
        const err = await res.json().catch(() => ({}));
        showFeedback('error', err.error || 'Uložení kroků cesty selhalo.');
      }
    } catch {
      showFeedback('error', 'Chyba připojení k serveru.');
    } finally {
      setSaving(false);
    }
  };

  const handleMoveStep = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedSteps.length) return;

    const newSteps = [...sortedSteps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIndex];
    newSteps[targetIndex] = temp;

    await persistSteps(newSteps, 'Pořadí kroků bylo aktualizováno.');
  };

  const handleDeleteStep = async () => {
    if (!deleteCandidate) return;
    const remaining = sortedSteps.filter((s) => s.id !== deleteCandidate.id);
    await persistSteps(remaining, 'Krok byl úspěšně odstraněn ze sekvence.');
    setDeleteCandidate(null);
  };

  const handleAddStep = async () => {
    const defaultType = EMAIL_CATALOG.find((c) => c.category === 'journey')?.id || 'ABANDONED_CART';
    const newStep: JourneyStep = {
      id: `temp-${Date.now()}`,
      position: sortedSteps.length,
      delayHours: 24,
      emailType: defaultType,
      generatePromo: false,
      promoDiscountValue: 10,
      promoValidDays: 14,
      skipIfPurchased: true,
      skipIfPaid: true,
    };

    const newSteps = [...sortedSteps, newStep];
    await persistSteps(newSteps, 'Nový krok byl přidán do sekvence.');
    startEdit(newStep);
  };

  return (
    <div className="admin-card p-6 space-y-6">
      {/* Panel Top Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-black">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-black">
              Plán sekvence
            </h3>
            <span className="rounded-full border border-black bg-black text-white px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
              {sortedSteps.length} {sortedSteps.length === 1 ? 'e-mail' : sortedSteps.length < 5 ? 'e-maily' : 'e-mailů'}
            </span>
          </div>
          <p className="text-xs text-[#666666] uppercase tracking-wider mt-1">
            Vizuální schéma automatické cesty s časovými prodlevami a podmínkami
          </p>
        </div>

        <button
          onClick={handleAddStep}
          disabled={saving}
          className="admin-btn flex items-center gap-2"
        >
          <Plus size={14} />
          <span>Přidat e-mail do sekvence</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs font-bold uppercase tracking-wider ${
            feedback.type === 'success'
              ? 'bg-black text-white border-black'
              : 'bg-red-50 text-red-700 border-red-500'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Visual Sequence Flow */}
      <div className="py-4">
        {/* Trigger Node (Top) */}
        <div className="max-w-md mx-auto">
          <div className="rounded-2xl border-2 border-black bg-black text-white p-4 shadow-sm text-center">
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#aaaaaa] mb-1">
              <Zap size={14} className="text-white" />
              <span>Spouštěč sekvence</span>
            </div>
            <p className="text-sm font-bold uppercase tracking-wider">
              {triggerLabel}
            </p>
            <p className="text-[11px] text-[#cccccc] uppercase tracking-wider mt-1">
              {journey.description}
            </p>
          </div>
        </div>

        {/* Steps Flow */}
        {sortedSteps.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xs uppercase tracking-wider text-[#666666]">
              Tato cesta zatím nemá žádné kroky.
            </p>
            <button
              onClick={handleAddStep}
              className="admin-btn mt-4 inline-flex items-center gap-2"
            >
              <Plus size={14} />
              <span>Vytvořit první e-mail</span>
            </button>
          </div>
        ) : (
          <div className="space-y-0">
            {sortedSteps.map((step, index) => {
              const info = catalogInfo(step.emailType);
              const isEditing = editingStepId === step.id;

              return (
                <div key={step.id || index} className="flex flex-col items-center">
                  {/* Arrow & Delay Container */}
                  <div className="flex flex-col items-center my-1">
                    {/* Top connecting line */}
                    <div className="w-0.5 h-6 bg-black" />

                    {/* Smaller Container with Curved Corners: Time Delay */}
                    <div className="rounded-full border border-black bg-white px-5 py-2 shadow-sm flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-neutral-50 transition-colors">
                      <Clock size={13} className="text-black shrink-0" />
                      <span>Čekání {formatDelayText(step.delayHours)}</span>
                    </div>

                    {/* Bottom connecting line with arrowhead */}
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

                  {/* Main Email Container with Curved Corners */}
                  <div
                    className={`w-full max-w-xl rounded-2xl border-2 border-black bg-white p-5 shadow-sm transition-all ${
                      isEditing ? 'ring-2 ring-black bg-neutral-50/50' : 'hover:shadow-md'
                    }`}
                  >
                    {!isEditing ? (
                      /* Read-only view of Email Container */
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="rounded-full border border-black bg-black text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                              E-mail #{index + 1}
                            </span>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-black">
                              {info.label}
                            </h4>
                            <span className="rounded-full border border-neutral-300 bg-neutral-100 text-neutral-700 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                              {info.marketing ? 'Marketing' : 'Transakční'}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                setPreviewStep(step);
                                setPreviewLoading(true);
                              }}
                              title="Zobrazit náhled e-mailu"
                              className="p-1.5 rounded-lg border border-black hover:bg-black hover:text-white transition-colors"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              onClick={() => startEdit(step)}
                              title="Upravit e-mail v sekvenci"
                              className="p-1.5 rounded-lg border border-black hover:bg-black hover:text-white transition-colors"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleMoveStep(index, 'up')}
                              disabled={index === 0}
                              title="Posunout nahoru"
                              className="p-1.5 rounded-lg border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-black"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              onClick={() => handleMoveStep(index, 'down')}
                              disabled={index === sortedSteps.length - 1}
                              title="Posunout dolů"
                              className="p-1.5 rounded-lg border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-black"
                            >
                              <ArrowDown size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteCandidate(step)}
                              title="Odstranit ze sekvence"
                              className="p-1.5 rounded-lg border border-black text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-[#666666] leading-relaxed">
                          {info.description}
                        </p>

                        {/* Curved pills for conditions & promo settings */}
                        <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                          {step.generatePromo ? (
                            <span className="rounded-full border border-black bg-neutral-100 text-black px-3 py-1 font-semibold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                              <Tag size={12} />
                              <span>Sleva {step.promoDiscountValue} % · platnost {step.promoValidDays} dní</span>
                            </span>
                          ) : (
                            <span className="rounded-full border border-neutral-300 text-neutral-500 px-3 py-1 text-[11px] uppercase tracking-wider">
                              Bez slevového kódu
                            </span>
                          )}

                          {step.skipIfPurchased && (
                            <span className="rounded-full border border-neutral-300 bg-white text-neutral-800 px-3 py-1 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                              <Check size={11} className="text-black" />
                              <span>Přeskočit po nákupu</span>
                            </span>
                          )}

                          {step.skipIfPaid && (
                            <span className="rounded-full border border-neutral-300 bg-white text-neutral-800 px-3 py-1 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                              <Check size={11} className="text-black" />
                              <span>Přeskočit po platbě</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Editable Form inside the Curved Container */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-black">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full border border-black bg-black text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                              Úprava E-mailu #{index + 1}
                            </span>
                          </div>
                          <button
                            onClick={cancelEdit}
                            className="text-black hover:opacity-60 transition-opacity"
                            title="Zavřít úpravy"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        {/* Email Template Select */}
                        <div>
                          <label className="admin-label">Šablona e-mailu</label>
                          <select
                            value={editForm.emailType || step.emailType}
                            onChange={(e) =>
                              setEditForm({ ...editForm, emailType: e.target.value })
                            }
                            className="admin-input w-full cursor-pointer"
                          >
                            {EMAIL_CATALOG.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.label} ({item.category === 'journey' ? 'Cesta' : 'Transakční'})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Delay Settings */}
                        <div>
                          <label className="admin-label">Časová prodleva před odesláním</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              min="0"
                              value={delayValue}
                              onChange={(e) => setDelayValue(Math.max(0, parseInt(e.target.value, 10) || 0))}
                              className="admin-input"
                              placeholder="Hodnota"
                            />
                            <select
                              value={delayUnit}
                              onChange={(e) => setDelayUnit(e.target.value as 'hours' | 'days')}
                              className="admin-input cursor-pointer"
                            >
                              <option value="hours">Hodin</option>
                              <option value="days">Dní</option>
                            </select>
                          </div>
                        </div>

                        {/* Promo Code Generation */}
                        <div className="rounded-xl border border-black p-3.5 bg-white space-y-3">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-wider">
                            <input
                              type="checkbox"
                              checked={editForm.generatePromo ?? step.generatePromo}
                              onChange={(e) =>
                                setEditForm({ ...editForm, generatePromo: e.target.checked })
                              }
                              className="rounded border-black text-black focus:ring-0 w-4 h-4"
                            />
                            <span>Vygenerovat osobní slevový kód pro zákazníka</span>
                          </label>

                          {(editForm.generatePromo ?? step.generatePromo) && (
                            <div className="grid grid-cols-2 gap-3 pt-1">
                              <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-[#666666] block mb-1">
                                  Výše slevy (%)
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={editForm.promoDiscountValue ?? step.promoDiscountValue}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      promoDiscountValue: parseInt(e.target.value, 10) || 10,
                                    })
                                  }
                                  className="admin-input w-full text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-[#666666] block mb-1">
                                  Platnost (dny)
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={editForm.promoValidDays ?? step.promoValidDays}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      promoValidDays: parseInt(e.target.value, 10) || 14,
                                    })
                                  }
                                  className="admin-input w-full text-xs"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Skip Conditions */}
                        <div className="space-y-2 pt-1">
                          <label className="flex items-center gap-2 cursor-pointer text-xs uppercase tracking-wider text-black">
                            <input
                              type="checkbox"
                              checked={editForm.skipIfPurchased ?? step.skipIfPurchased}
                              onChange={(e) =>
                                setEditForm({ ...editForm, skipIfPurchased: e.target.checked })
                              }
                              className="rounded border-black text-black focus:ring-0 w-4 h-4"
                            />
                            <span>Přeskočit tento krok, pokud zákazník mezitím nakoupil</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-xs uppercase tracking-wider text-black">
                            <input
                              type="checkbox"
                              checked={editForm.skipIfPaid ?? step.skipIfPaid}
                              onChange={(e) =>
                                setEditForm({ ...editForm, skipIfPaid: e.target.checked })
                              }
                              className="rounded border-black text-black focus:ring-0 w-4 h-4"
                            />
                            <span>Přeskočit tento krok, pokud je objednávka již zaplacena</span>
                          </label>
                        </div>

                        {/* Form Action Buttons */}
                        <div className="flex items-center gap-2 pt-3 border-t border-black">
                          <button
                            onClick={() => saveStepEdit(step.id)}
                            disabled={saving}
                            className="admin-btn flex-1"
                          >
                            {saving ? 'Ukládám…' : 'Uložit změny'}
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={saving}
                            className="admin-btn admin-btn-secondary"
                          >
                            Zrušit
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Bottom Add Step Action Flow */}
            <div className="flex flex-col items-center mt-1">
              <div className="w-0.5 h-6 bg-black" />
              <button
                onClick={handleAddStep}
                disabled={saving}
                className="rounded-full border-2 border-dashed border-black bg-white hover:bg-black hover:text-white px-6 py-2.5 shadow-sm text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
              >
                <Plus size={14} />
                <span>Přidat další e-mail na konec sekvence</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteCandidate)}
        title="Odstranit krok ze sekvence"
        message={
          deleteCandidate
            ? `Opravdu si přejete odebrat e-mail „${catalogInfo(deleteCandidate.emailType).label}“ ze sekvence této cesty?`
            : ''
        }
        confirmLabel="Odstranit"
        cancelLabel="Zrušit"
        isDestructive={true}
        loading={saving}
        onConfirm={handleDeleteStep}
        onCancel={() => setDeleteCandidate(null)}
      />

      {/* Email Preview Modal */}
      {previewStep && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-2 border-black rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-black flex items-center justify-between gap-4 flex-wrap bg-white">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
                  Náhled e-mailu v sekvenci
                </p>
                <h3 className="text-sm font-bold uppercase tracking-wider text-black">
                  {catalogInfo(previewStep.emailType).label}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex gap-1 border border-black p-0.5 rounded-lg">
                  <button
                    onClick={() => setPreviewViewMode('desktop')}
                    className={`px-3 py-1 rounded text-xs uppercase font-bold tracking-wider transition-colors ${
                      previewViewMode === 'desktop'
                        ? 'bg-black text-white'
                        : 'bg-white text-black hover:bg-neutral-100'
                    }`}
                  >
                    Desktop (600px)
                  </button>
                  <button
                    onClick={() => setPreviewViewMode('mobile')}
                    className={`px-3 py-1 rounded text-xs uppercase font-bold tracking-wider transition-colors ${
                      previewViewMode === 'mobile'
                        ? 'bg-black text-white'
                        : 'bg-white text-black hover:bg-neutral-100'
                    }`}
                  >
                    Mobil (600px)
                  </button>
                </div>

                <button
                  onClick={() => setPreviewStep(null)}
                  className="p-1.5 rounded-lg border border-black hover:bg-black hover:text-white transition-colors"
                  aria-label="Zavřít náhled"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body / Iframe */}
            <div className="flex-1 overflow-y-auto bg-neutral-100 p-6 flex justify-center items-start min-h-[500px]">
              <div
                style={{
                  width: '600px',
                  maxWidth: '100%',
                }}
                className="bg-white shadow-md relative"
              >
                {previewLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                    <span className="text-xs uppercase font-bold tracking-wider text-black">
                      Načítám náhled šablony…
                    </span>
                  </div>
                )}
                <iframe
                  src={`/api/admin/email-preview?type=${previewStep.emailType}`}
                  onLoad={() => setPreviewLoading(false)}
                  className="w-full border-0"
                  style={{ height: '640px', display: 'block' }}
                  title={`Náhled ${previewStep.emailType}`}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-black bg-white flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wider text-[#666666]">
                Šířka e-mailu je pevně 600px a záhlaví je 600×72px.
              </p>
              <button
                onClick={() => setPreviewStep(null)}
                className="admin-btn admin-btn-secondary"
              >
                Zavřít
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
