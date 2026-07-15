'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';

interface PricingRule {
  id: string;
  name: string;
  ruleType: string;
  discountType: string;
  discountValue: number;
  minQuantity?: number;
  minOrderAmount?: number;
  applicableProducts: string[];
  applicableCategories: string[];
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
}

const inputCls = "w-full text-sm bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-300";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

const RULE_TYPE_LABELS: Record<string, string> = {
  volume: 'Objem (počet kusů)',
  minOrder: 'Minimální objednávka',
  firstTime: 'První nákup',
  seasonal: 'Sezónní sleva',
};

export default function PricingRulesPage() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    ruleType: 'volume',
    discountType: 'percentage',
    discountValue: '',
    minQuantity: '',
    minOrderAmount: '',
    validFrom: '',
    validUntil: '',
  });

  useEffect(() => { fetchRules(); }, []);

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/admin/pricing-rules');
      if (res.ok) setRules(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', ruleType: 'volume', discountType: 'percentage', discountValue: '', minQuantity: '', minOrderAmount: '', validFrom: '', validUntil: '' });
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/pricing-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          discountValue: parseFloat(formData.discountValue),
          minQuantity: formData.minQuantity ? parseInt(formData.minQuantity) : undefined,
          minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : undefined,
        }),
      });
      if (res.ok) { fetchRules(); resetForm(); }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteRule = async (id: string) => {
    if (!confirm('Opravdu chcete smazat toto pravidlo?')) return;
    try {
      const res = await fetch(`/api/admin/pricing-rules/${id}`, { method: 'DELETE' });
      if (res.ok) setRules((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleRuleStatus = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/pricing-rules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (res.ok) setRules((prev) => prev.map((r) => r.id === id ? { ...r, isActive: !isActive } : r));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Načítám pravidla…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pravidla cen</h1>
          <p className="mt-0.5 text-sm text-gray-400">{rules.length} pravidel celkem</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nové pravidlo
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-gray-900">Nové pravidlo ceny</h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Název pravidla *</label>
                <input type="text" required value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputCls} placeholder="např. Black Friday 30%" />
              </div>
              <div>
                <label className={labelCls}>Typ pravidla</label>
                <select value={formData.ruleType}
                  onChange={(e) => setFormData({ ...formData, ruleType: e.target.value })}
                  className={inputCls}>
                  <option value="volume">Objem (počet kusů)</option>
                  <option value="minOrder">Minimální objednávka</option>
                  <option value="firstTime">První nákup</option>
                  <option value="seasonal">Sezónní sleva</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Typ slevy</label>
                <select value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className={inputCls}>
                  <option value="percentage">Procenta (%)</option>
                  <option value="fixed">Fixní částka (Kč)</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Hodnota slevy *</label>
                <input type="number" step="0.01" required value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  className={inputCls}
                  placeholder={formData.discountType === 'percentage' ? '10' : '100'} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Min. počet kusů (volitelné)</label>
                <input type="number" value={formData.minQuantity}
                  onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                  className={inputCls} placeholder="3" />
              </div>
              <div>
                <label className={labelCls}>Min. objednávka v Kč (volitelné)</label>
                <input type="number" step="0.01" value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  className={inputCls} placeholder="500" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Platné od *</label>
                <input type="date" required value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Platné do *</label>
                <input type="date" required value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className={inputCls} />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="submit"
                className="bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-700 transition-colors">
                Vytvořit pravidlo
              </button>
              <button type="button" onClick={resetForm}
                className="text-sm font-semibold text-gray-500 px-5 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:text-gray-700 transition-colors">
                Zrušit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {rules.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 flex flex-col items-center gap-3 text-center">
          <p className="text-base font-semibold text-gray-700">Zatím žádná pravidla cen</p>
          <p className="text-sm text-gray-400">Vytvořte první pravidlo automatické slevy.</p>
          <button onClick={() => setShowForm(true)}
            className="mt-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors">
            Vytvořit pravidlo
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {rules.map((rule) => (
              <div key={rule.id} className={`px-6 py-5 flex items-start justify-between gap-4 ${!rule.isActive ? 'opacity-50' : 'hover:bg-gray-50'} transition-colors`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-2">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{rule.name}</h3>
                    <button
                      onClick={() => toggleRuleStatus(rule.id, rule.isActive)}
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md border transition-colors ${
                        rule.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}
                    >
                      {rule.isActive ? 'Aktivní' : 'Neaktivní'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span>Typ: <span className="text-gray-700 font-medium">{RULE_TYPE_LABELS[rule.ruleType] || rule.ruleType}</span></span>
                    <span>Sleva: <span className="text-gray-700 font-medium">{rule.discountValue} {rule.discountType === 'percentage' ? '%' : 'Kč'}</span></span>
                    {rule.minQuantity && <span>Min. ks: <span className="text-gray-700 font-medium">{rule.minQuantity}</span></span>}
                    {rule.minOrderAmount && <span>Min. objednávka: <span className="text-gray-700 font-medium">{rule.minOrderAmount} Kč</span></span>}
                    <span>Platnost: <span className="text-gray-700 font-medium">{new Date(rule.validFrom).toLocaleDateString('cs-CZ')} – {new Date(rule.validUntil).toLocaleDateString('cs-CZ')}</span></span>
                  </div>
                </div>
                <button
                  onClick={() => deleteRule(rule.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                  title="Smazat"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
