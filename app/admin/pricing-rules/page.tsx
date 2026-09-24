'use client';

import { useEffect, useState } from 'react';

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
      <div className="flex items-center gap-3 py-12">
        <div className="admin-spinner" />
        <span className="admin-sub" style={{ margin: 0 }}>Načítám pravidla…</span>
      </div>
    );
  }

  return (
    <div className="space-y-[24px]">
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-black pb-4">
        <div>
          <h1 className="admin-title">Pravidla cen</h1>
          <p className="admin-sub">{rules.length} pravidel celkem</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="admin-btn">
            + Nové pravidlo
          </button>
        )}
      </div>

      {showForm && (
        <div className="admin-card p-[24px]">
          <div className="flex items-center justify-between mb-[24px] border-b border-black pb-4">
            <h2 className="admin-title" style={{ fontSize: 14 }}>Nové pravidlo ceny</h2>
            <button onClick={resetForm} className="hover:opacity-60 transition-opacity" aria-label="Zavřít">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-[16px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
              <div>
                <label className="admin-label">Název pravidla *</label>
                <input type="text" required value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="admin-input" placeholder="např. Black Friday 30%" />
              </div>
              <div>
                <label className="admin-label">Typ pravidla</label>
                <select value={formData.ruleType}
                  onChange={(e) => setFormData({ ...formData, ruleType: e.target.value })}
                  className="admin-select">
                  <option value="volume">Objem (počet kusů)</option>
                  <option value="minOrder">Minimální objednávka</option>
                  <option value="firstTime">První nákup</option>
                  <option value="seasonal">Sezónní sleva</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
              <div>
                <label className="admin-label">Typ slevy</label>
                <select value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="admin-select">
                  <option value="percentage">Procenta (%)</option>
                  <option value="fixed">Fixní částka (Kč)</option>
                </select>
              </div>
              <div>
                <label className="admin-label">Hodnota slevy *</label>
                <input type="number" step="0.01" required value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  className="admin-input"
                  placeholder={formData.discountType === 'percentage' ? '10' : '100'} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
              <div>
                <label className="admin-label">Min. počet kusů (volitelné)</label>
                <input type="number" value={formData.minQuantity}
                  onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                  className="admin-input" placeholder="3" />
              </div>
              <div>
                <label className="admin-label">Min. objednávka v Kč (volitelné)</label>
                <input type="number" step="0.01" value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  className="admin-input" placeholder="500" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
              <div>
                <label className="admin-label">Platné od *</label>
                <input type="date" required value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Platné do *</label>
                <input type="date" required value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="admin-input" />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" className="admin-btn">Vytvořit pravidlo</button>
              <button type="button" onClick={resetForm} className="admin-btn admin-btn-secondary">Zrušit</button>
            </div>
          </form>
        </div>
      )}

      {rules.length === 0 ? (
        <div className="admin-card admin-empty">
          <p>Zatím žádná pravidla cen</p>
          <button onClick={() => setShowForm(true)} className="admin-btn mt-[16px]">
            Vytvořit pravidlo
          </button>
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          {rules.map((rule, idx) => (
            <div
              key={rule.id}
              className={`px-[24px] py-[20px] flex items-start justify-between gap-4 ${
                idx !== rules.length - 1 ? 'border-b border-black' : ''
              } ${!rule.isActive ? 'opacity-50' : 'hover:bg-black/5'} transition-colors`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider">{rule.name}</h3>
                  <button
                    onClick={() => toggleRuleStatus(rule.id, rule.isActive)}
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-[4px] border border-black transition-colors ${
                      rule.isActive ? 'bg-black text-white' : 'bg-white text-black'
                    }`}
                  >
                    {rule.isActive ? 'Aktivní' : 'Neaktivní'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] uppercase tracking-wider text-[#666666]">
                  <span>Typ: <span className="text-black font-medium">{RULE_TYPE_LABELS[rule.ruleType] || rule.ruleType}</span></span>
                  <span>Sleva: <span className="text-black font-medium">{rule.discountValue} {rule.discountType === 'percentage' ? '%' : 'Kč'}</span></span>
                  {rule.minQuantity && <span>Min. ks: <span className="text-black font-medium">{rule.minQuantity}</span></span>}
                  {rule.minOrderAmount && <span>Min. objednávka: <span className="text-black font-medium">{rule.minOrderAmount} Kč</span></span>}
                  <span>Platnost: <span className="text-black font-medium">{new Date(rule.validFrom).toLocaleDateString('cs-CZ')} – {new Date(rule.validUntil).toLocaleDateString('cs-CZ')}</span></span>
                </div>
              </div>
              <button
                onClick={() => deleteRule(rule.id)}
                className="admin-btn admin-btn-secondary shrink-0"
                style={{ padding: '6px 12px', fontSize: 10 }}
              >
                Smazat
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
