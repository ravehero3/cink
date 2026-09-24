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

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-12">
        <div className="admin-spinner" />
        <span className="admin-sub" style={{ margin: 0 }}>Načítám promo kódy…</span>
      </div>
    );
  }

  return (
    <div className="space-y-[24px]">
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-black pb-4">
        <div>
          <h1 className="admin-title">Promo kódy</h1>
          <p className="admin-sub">{promoCodes.length} kódů celkem</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="admin-btn">
            + Přidat promo kód
          </button>
        )}
      </div>

      {showForm && (
        <div className="admin-card p-[24px]">
          <div className="flex items-center justify-between mb-[24px] border-b border-black pb-4">
            <h2 className="admin-title" style={{ fontSize: 14 }}>
              {editingId ? 'Upravit promo kód' : 'Nový promo kód'}
            </h2>
            <button onClick={resetForm} className="hover:opacity-60 transition-opacity" aria-label="Zavřít">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-[16px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
              <div>
                <label className="admin-label">Kód *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="admin-input"
                  placeholder="např. SLEVA20"
                />
              </div>
              <div>
                <label className="admin-label">Typ slevy *</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="admin-select"
                >
                  <option value="percentage">Procenta (%)</option>
                  <option value="fixed">Pevná částka (Kč)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-[16px]">
              <div>
                <label className="admin-label">Hodnota {formData.discountType === 'percentage' ? '(%)' : '(Kč)'} *</label>
                <input type="number" required step="0.01" value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Min. částka (Kč)</label>
                <input type="number" step="0.01" value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  className="admin-input" placeholder="Nepovinné" />
              </div>
              <div>
                <label className="admin-label">Max. použití</label>
                <input type="number" value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  className="admin-input" placeholder="Neomezeno" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
              <div>
                <label className="admin-label">Platnost od *</label>
                <input type="date" required value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Platnost do *</label>
                <input type="date" required value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="admin-input" />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="accent-black w-4 h-4"
              />
              <span className="text-xs uppercase tracking-wider">Kód je aktivní</span>
            </label>

            <div className="flex gap-2 pt-2">
              <button type="submit" className="admin-btn">
                {editingId ? 'Uložit změny' : 'Vytvořit kód'}
              </button>
              <button type="button" onClick={resetForm} className="admin-btn admin-btn-secondary">
                Zrušit
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-black">
              <tr>
                {['Kód', 'Sleva', 'Použití', 'Platnost od', 'Platnost do', 'Status', 'Akce'].map((h) => (
                  <th key={h} className="admin-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {promoCodes.map((pc) => (
                <tr key={pc.id} className="hover:bg-black/5 transition-colors">
                  <td className="admin-td font-bold tracking-widest">{pc.code}</td>
                  <td className="admin-td">
                    <span className="font-bold">
                      {pc.discountType === 'percentage' ? `${pc.discountValue}%` : `${pc.discountValue} Kč`}
                    </span>
                    {pc.minOrderAmount && (
                      <p className="text-[10px] uppercase text-[#666666] mt-[4px]">min. {pc.minOrderAmount} Kč</p>
                    )}
                  </td>
                  <td className="admin-td">
                    <span className="font-bold">{pc.currentUses}</span>
                    <span className="text-[#666666]">{pc.maxUses ? ` / ${pc.maxUses}` : ' / ∞'}</span>
                  </td>
                  <td className="admin-td text-[#666666] whitespace-nowrap">{new Date(pc.validFrom).toLocaleDateString('cs-CZ')}</td>
                  <td className="admin-td text-[#666666] whitespace-nowrap">{new Date(pc.validUntil).toLocaleDateString('cs-CZ')}</td>
                  <td className="admin-td">
                    <button
                      onClick={() => toggleActive(pc.id, pc.isActive)}
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-[4px] border border-black transition-colors ${
                        pc.isActive
                          ? 'bg-black text-white hover:bg-white hover:text-black'
                          : 'bg-white text-black hover:bg-black hover:text-white'
                      }`}
                    >
                      {pc.isActive ? 'Aktivní' : 'Neaktivní'}
                    </button>
                  </td>
                  <td className="admin-td">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(pc)} className="admin-btn admin-btn-secondary" style={{ padding: '6px 12px', fontSize: 10 }}>
                        Upravit
                      </button>
                      <button onClick={() => handleDelete(pc.id, pc.code)} className="admin-btn admin-btn-secondary" style={{ padding: '6px 12px', fontSize: 10 }}>
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
          <div className="admin-empty">Žádné promo kódy. Vytvořte první kód tlačítkem výše.</div>
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
