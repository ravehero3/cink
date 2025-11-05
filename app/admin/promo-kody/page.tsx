'use client';

import { useEffect, useState } from 'react';

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
        alert(editingId ? 'Promo kód byl aktualizován' : 'Promo kód byl vytvořen');
        resetForm();
        fetchPromoCodes();
      } else {
        const error = await response.json();
        alert(`Chyba: ${error.error || 'Operace se nezdařila'}`);
      }
    } catch (error) {
      console.error('Failed to save promo code:', error);
      alert('Došlo k chybě při ukládání');
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Opravdu chcete smazat promo kód "${code}"?`)) return;

    try {
      const response = await fetch(`/api/admin/promo-codes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Promo kód byl smazán');
        fetchPromoCodes();
      } else {
        alert('Nepodařilo se smazat promo kód');
      }
    } catch (error) {
      console.error('Failed to delete promo code:', error);
      alert('Došlo k chybě při mazání');
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
    return <div className="text-body">Načítání promo kódů...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-title font-bold">PROMO KÓDY</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-black text-white px-6 py-3 text-body uppercase hover:bg-white hover:text-black border border-black transition-colors"
          >
            + Přidat promo kód
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="border border-black p-6 mb-8">
          <h2 className="text-header font-bold mb-6">
            {editingId ? 'UPRAVIT PROMO KÓD' : 'NOVÝ PROMO KÓD'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-body uppercase mb-2">Kód *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full border border-black p-3 text-body uppercase"
                  placeholder="např. SLEVA20"
                />
              </div>

              <div>
                <label className="block text-body uppercase mb-2">Typ slevy *</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="w-full border border-black p-3 text-body"
                >
                  <option value="percentage">Procenta (%)</option>
                  <option value="fixed">Pevná částka (Kč)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-body uppercase mb-2">
                  Hodnota slevy * {formData.discountType === 'percentage' ? '(%)' : '(Kč)'}
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  className="w-full border border-black p-3 text-body"
                />
              </div>

              <div>
                <label className="block text-body uppercase mb-2">Min. částka objednávky (Kč)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  className="w-full border border-black p-3 text-body"
                  placeholder="Nepovinné"
                />
              </div>

              <div>
                <label className="block text-body uppercase mb-2">Max. počet použití</label>
                <input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  className="w-full border border-black p-3 text-body"
                  placeholder="Neomezeno"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-body uppercase mb-2">Platnost od *</label>
                <input
                  type="date"
                  required
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  className="w-full border border-black p-3 text-body"
                />
              </div>

              <div>
                <label className="block text-body uppercase mb-2">Platnost do *</label>
                <input
                  type="date"
                  required
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="w-full border border-black p-3 text-body"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-body uppercase">Kód je aktivní</span>
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-black text-white px-8 py-3 text-body uppercase hover:bg-white hover:text-black border border-black transition-colors"
              >
                {editingId ? 'Uložit změny' : 'Vytvořit kód'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-8 py-3 text-body uppercase border border-black hover:bg-black hover:text-white transition-colors"
              >
                Zrušit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Promo Codes Table */}
      <div className="border border-black">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black">
              <th className="text-left p-4 text-body uppercase">Kód</th>
              <th className="text-left p-4 text-body uppercase">Sleva</th>
              <th className="text-left p-4 text-body uppercase">Použití</th>
              <th className="text-left p-4 text-body uppercase">Platnost od</th>
              <th className="text-left p-4 text-body uppercase">Platnost do</th>
              <th className="text-left p-4 text-body uppercase">Status</th>
              <th className="text-left p-4 text-body uppercase">Akce</th>
            </tr>
          </thead>
          <tbody>
            {promoCodes.map((promoCode) => (
              <tr key={promoCode.id} className="border-b border-black last:border-b-0">
                <td className="p-4 text-body font-bold">{promoCode.code}</td>
                <td className="p-4 text-body">
                  {promoCode.discountType === 'percentage'
                    ? `${promoCode.discountValue}%`
                    : `${promoCode.discountValue} Kč`}
                  {promoCode.minOrderAmount && (
                    <div className="text-body opacity-60">
                      Min: {promoCode.minOrderAmount} Kč
                    </div>
                  )}
                </td>
                <td className="p-4 text-body">
                  {promoCode.currentUses}
                  {promoCode.maxUses ? ` / ${promoCode.maxUses}` : ' / ∞'}
                </td>
                <td className="p-4 text-body">
                  {new Date(promoCode.validFrom).toLocaleDateString('cs-CZ')}
                </td>
                <td className="p-4 text-body">
                  {new Date(promoCode.validUntil).toLocaleDateString('cs-CZ')}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => toggleActive(promoCode.id, promoCode.isActive)}
                    className={`px-3 py-1 text-body uppercase border border-black ${
                      promoCode.isActive ? 'bg-black text-white' : 'bg-white text-black'
                    }`}
                  >
                    {promoCode.isActive ? 'Aktivní' : 'Neaktivní'}
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(promoCode)}
                      className="px-3 py-1 text-body uppercase border border-black hover:bg-black hover:text-white"
                    >
                      Upravit
                    </button>
                    <button
                      onClick={() => handleDelete(promoCode.id, promoCode.code)}
                      className="px-3 py-1 text-body uppercase border border-black hover:bg-black hover:text-white"
                    >
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
        <div className="text-center py-12 text-body">
          Žádné promo kódy nebyly nalezeny.
        </div>
      )}
    </div>
  );
}
