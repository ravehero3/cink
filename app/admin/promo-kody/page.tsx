'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/store/toastStore';
import ConfirmModal from '@/components/admin/ConfirmModal';

interface PromoCode {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  currentUses: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export default function AdminPromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const toast = useToast();
  const [deleteModal, setDeleteModal] = useState<{ id: string; code: string } | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxUses: '',
    validFrom: '',
    validUntil: '',
    isActive: true,
  });

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      const response = await fetch('/api/admin/promo-codes');
      if (response.ok) {
        const data = await response.json();
        setPromoCodes(data);
      }
    } catch (error) {
      console.error('Failed to fetch promo codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderAmount: '',
      maxUses: '',
      validFrom: '',
      validUntil: '',
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (promoCode: PromoCode) => {
    setFormData({
      code: promoCode.code,
      discountType: promoCode.discountType,
      discountValue: promoCode.discountValue.toString(),
      minOrderAmount: promoCode.minOrderAmount?.toString() || '',
      maxUses: promoCode.maxUses?.toString() || '',
      validFrom: new Date(promoCode.validFrom).toISOString().split('T')[0],
      validUntil: new Date(promoCode.validUntil).toISOString().split('T')[0],
      isActive: promoCode.isActive,
    });
    setEditingId(promoCode.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      code: formData.code.toUpperCase(),
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue),
      minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
      validFrom: new Date(formData.validFrom).toISOString(),
      validUntil: new Date(formData.validUntil).toISOString(),
      isActive: formData.isActive,
    };

    try {
      const url = editingId
        ? `/api/admin/promo-codes/${editingId}`
        : '/api/admin/promo-codes';
      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(editingId ? 'Promo kód byl aktualizován' : 'Promo kód byl vytvořen');
        resetForm();
        fetchPromoCodes();
      } else {
        const error = await response.json();
        toast.error(`Chyba: ${error.error || 'Operace se nezdařila'}`);
      }
    } catch (error) {
      console.error('Failed to save promo code:', error);
      toast.error('Došlo k chybě při ukládání');
    }
  };

  const handleDelete = (id: string, code: string) => {
    setDeleteModal({ id, code });
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    try {
      const response = await fetch(`/api/admin/promo-codes/${deleteModal.id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Promo kód byl smazán');
        fetchPromoCodes();
      } else {
        toast.error('Nepodařilo se smazat promo kód');
      }
    } catch {
      toast.error('Došlo k chybě při mazání');
    } finally {
      setDeleteModal(null);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/promo-codes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchPromoCodes();
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const inputCls = "w-full text-sm bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-300";
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Načítám promo kódy…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Promo kódy</h1>
          <p className="mt-1 text-sm text-gray-400">{promoCodes.length} kódů celkem</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-700 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Přidat promo kód
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-gray-900">
              {editingId ? 'Upravit promo kód' : 'Nový promo kód'}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Kód *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className={inputCls + " font-mono uppercase tracking-widest"}
                  placeholder="např. SLEVA20"
                />
              </div>
              <div>
                <label className={labelCls}>Typ slevy *</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className={inputCls}
                >
                  <option value="percentage">Procenta (%)</option>
                  <option value="fixed">Pevná částka (Kč)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Hodnota {formData.discountType === 'percentage' ? '(%)' : '(Kč)'} *</label>
                <input type="number" required step="0.01" value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Min. částka (Kč)</label>
                <input type="number" step="0.01" value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  className={inputCls} placeholder="Nepovinné" />
              </div>
              <div>
                <label className={labelCls}>Max. použití</label>
                <input type="number" value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  className={inputCls} placeholder="Neomezeno" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Platnost od *</label>
                <input type="date" required value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Platnost do *</label>
                <input type="date" required value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className={inputCls} />
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded accent-gray-900"
              />
              <span className="text-sm font-medium text-gray-700">Kód je aktivní</span>
            </label>

            <div className="flex gap-3 pt-1">
              <button type="submit"
                className="bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-700 transition-colors">
                {editingId ? 'Uložit změny' : 'Vytvořit kód'}
              </button>
              <button type="button" onClick={resetForm}
                className="text-sm font-semibold text-gray-500 px-5 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:text-gray-700 transition-colors">
                Zrušit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Kód', 'Sleva', 'Použití', 'Platnost od', 'Platnost do', 'Status', 'Akce'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {promoCodes.map((pc) => (
                <tr key={pc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-gray-900 tracking-widest text-xs">{pc.code}</td>
                  <td className="px-4 py-3 text-gray-700">
                    <span className="font-semibold">
                      {pc.discountType === 'percentage' ? `${pc.discountValue}%` : `${pc.discountValue} Kč`}
                    </span>
                    {pc.minOrderAmount && (
                      <p className="text-[10px] text-gray-400 mt-0.5">min. {pc.minOrderAmount} Kč</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <span className="font-semibold">{pc.currentUses}</span>
                    <span className="text-gray-400">{pc.maxUses ? ` / ${pc.maxUses}` : ' / ∞'}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{new Date(pc.validFrom).toLocaleDateString('cs-CZ')}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{new Date(pc.validUntil).toLocaleDateString('cs-CZ')}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(pc.id, pc.isActive)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                        pc.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {pc.isActive ? 'Aktivní' : 'Neaktivní'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleEdit(pc)}
                        className="text-xs font-medium text-gray-500 hover:text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">
                        Upravit
                      </button>
                      <button onClick={() => handleDelete(pc.id, pc.code)}
                        className="text-xs font-medium text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                        Smazat
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {promoCodes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500">Žádné promo kódy</p>
            <p className="text-xs text-gray-400 mt-1">Vytvořte první promo kód tlačítkem výše.</p>
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={!!deleteModal}
        title="Smazat promo kód"
        message={`Opravdu chcete smazat kód „${deleteModal?.code}"? Tuto akci nelze vrátit zpět.`}
        confirmLabel="Smazat"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal(null)}
      />
    </div>
  );
}
