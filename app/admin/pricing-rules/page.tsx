'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, Edit } from 'lucide-react';

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

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await fetch('/api/admin/pricing-rules');
      if (response.ok) {
        const data = await response.json();
        setRules(data);
      }
    } catch (error) {
      console.error('Failed to fetch pricing rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/pricing-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          discountValue: parseFloat(formData.discountValue),
          minQuantity: formData.minQuantity ? parseInt(formData.minQuantity) : undefined,
          minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : undefined,
        }),
      });
      if (response.ok) {
        fetchRules();
        setShowForm(false);
        setFormData({
          name: '',
          ruleType: 'volume',
          discountType: 'percentage',
          discountValue: '',
          minQuantity: '',
          minOrderAmount: '',
          validFrom: '',
          validUntil: '',
        });
      }
    } catch (error) {
      console.error('Failed to create rule:', error);
    }
  };

  const deleteRule = async (id: string) => {
    if (!confirm('Opravdu chcete smazat toto pravidlo?')) return;
    try {
      const response = await fetch(`/api/admin/pricing-rules/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setRules(rules.filter(r => r.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete rule:', error);
    }
  };

  const toggleRuleStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/pricing-rules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (response.ok) {
        setRules(rules.map(r => r.id === id ? { ...r, isActive: !isActive } : r));
      }
    } catch (error) {
      console.error('Failed to toggle rule:', error);
    }
  };

  const ruleTypeLabels: Record<string, string> = {
    volume: 'Objem (počet kusů)',
    minOrder: 'Minimální objednávka',
    firstTime: 'První nákup',
    seasonal: 'Sezónní sleva',
  };

  if (loading) return <div className="p-8">Načítání...</div>;

  return (
    <div className="bg-white min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <h1 
            className="uppercase"
            style={{
              fontFamily: 'BB-CondBold, "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '32px',
              letterSpacing: '0.02em',
            }}
          >
            Pravidla cen
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 border border-black bg-black text-white uppercase text-sm hover:bg-white hover:text-black transition-colors"
          >
            {showForm ? 'Zrušit' : '+ Nové pravidlo'}
          </button>
        </div>

        {showForm && (
          <div className="border border-black p-6 mb-8 bg-gray-50">
            <h2 className="uppercase font-medium mb-6">Nové pravidlo ceny</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-medium mb-2">Název pravidla</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-black p-2 text-sm focus:outline-none"
                    placeholder="např. Black Friday 30%"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-medium mb-2">Typ pravidla</label>
                  <select
                    value={formData.ruleType}
                    onChange={(e) => setFormData({ ...formData, ruleType: e.target.value })}
                    className="w-full border border-black p-2 text-sm focus:outline-none"
                  >
                    <option value="volume">Objem (počet kusů)</option>
                    <option value="minOrder">Minimální objednávka</option>
                    <option value="firstTime">První nákup</option>
                    <option value="seasonal">Sezónní sleva</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-medium mb-2">Typ slevy</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full border border-black p-2 text-sm focus:outline-none"
                  >
                    <option value="percentage">Procenta (%)</option>
                    <option value="fixed">Fixní částka (Kč)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase font-medium mb-2">Hodnota slevy</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full border border-black p-2 text-sm focus:outline-none"
                    placeholder={formData.discountType === 'percentage' ? '10' : '100'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-medium mb-2">Minimální počet kusů (volitelné)</label>
                  <input
                    type="number"
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                    className="w-full border border-black p-2 text-sm focus:outline-none"
                    placeholder="3"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-medium mb-2">Minimální objednávka (Kč, volitelné)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className="w-full border border-black p-2 text-sm focus:outline-none"
                    placeholder="500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-medium mb-2">Platné od</label>
                  <input
                    type="date"
                    required
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full border border-black p-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-medium mb-2">Platné do</label>
                  <input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full border border-black p-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-black text-white border border-black uppercase text-sm hover:bg-white hover:text-black transition-colors"
              >
                Vytvořit pravidlo
              </button>
            </form>
          </div>
        )}

        {rules.length === 0 ? (
          <div className="border border-black p-8 text-center">
            <p className="text-gray-600 mb-4">Zatím žádná pravidla cen</p>
            <button
              onClick={() => setShowForm(true)}
              className="border border-black px-4 py-2 inline-block hover:bg-black hover:text-white transition-colors"
            >
              Vytvořit první pravidlo
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className={`border border-black p-4 flex justify-between items-start ${!rule.isActive ? 'opacity-50 bg-gray-50' : ''}`}>
                <div className="flex-1">
                  <div className="flex gap-3 items-start mb-2">
                    <h3 className="font-medium uppercase">{rule.name}</h3>
                    <button
                      onClick={() => toggleRuleStatus(rule.id, rule.isActive)}
                      className={`text-xs px-2 py-1 ${rule.isActive ? 'bg-black text-white' : 'bg-white border border-black'}`}
                    >
                      {rule.isActive ? 'Aktivní' : 'Neaktivní'}
                    </button>
                  </div>
                  <div className="text-xs space-y-1 text-gray-600">
                    <p><strong>Typ:</strong> {ruleTypeLabels[rule.ruleType] || rule.ruleType}</p>
                    <p><strong>Sleva:</strong> {rule.discountValue} {rule.discountType === 'percentage' ? '%' : 'Kč'}</p>
                    {rule.minQuantity && <p><strong>Min. počet:</strong> {rule.minQuantity} ks</p>}
                    {rule.minOrderAmount && <p><strong>Min. objednávka:</strong> {rule.minOrderAmount} Kč</p>}
                    <p><strong>Platnost:</strong> {new Date(rule.validFrom).toLocaleDateString('cs-CZ')} - {new Date(rule.validUntil).toLocaleDateString('cs-CZ')}</p>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-2 border border-black hover:bg-black hover:text-white transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
