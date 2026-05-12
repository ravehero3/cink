'use client';

import { useState, useEffect } from 'react';

export default function LiveOfferAdminPage() {
  const [offer, setOffer] = useState<any>({
    isActive: false,
    text: 'VYUŽIJTE LIMITOVANÝ SLEVOVÝ KUPÓN -10 PROCENT NA VŠE!',
    percentage: 10,
    durationMin: 10,
    targetPages: ['*'],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOffer();
  }, []);

  const fetchOffer = async () => {
    try {
      const response = await fetch('/api/admin/live-offer');
      const data = await response.json();
      if (data && (data.id || data.isActive !== undefined)) {
        setOffer({
          ...data,
          targetPages: data.targetPages || ['*'],
          text: data.text || 'VYUŽIJTE LIMITOVANÝ SLEVOVÝ KUPÓN -10 PROCENT NA VŠE!',
          percentage: data.percentage || 10,
          durationMin: data.durationMin || 10,
        });
      }
    } catch (error) {
      console.error('Error fetching offer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: any) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch('/api/admin/live-offer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offer),
      });

      if (response.ok) {
        const updated = await response.json();
        setOffer(updated);
        alert('Nabídka byla uložena');
      }
    } catch (error) {
      console.error('Error saving offer:', error);
      alert('Chyba při ukládání');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = () => {
    setOffer(prev => ({ ...prev, isActive: !prev.isActive }));
  };

  if (loading) return <div className="p-8 tracking-widest uppercase text-xs">Načítání...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 uppercase tracking-widest">Správa Live Nabídek</h1>

      <div className="space-y-8 bg-white border border-black p-8">
        {/* Simplified Toggle */}
        <div className="flex items-center justify-between p-6 bg-gray-50 border border-black/10">
          <div>
            <h2 className="font-bold uppercase text-sm">Aktivní stav</h2>
            <p className="text-[10px] text-gray-500 uppercase">Zapnout/vypnout zobrazení lišty na webu</p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${offer.isActive ? 'text-black' : 'text-gray-400'}`}>
              {offer.isActive ? 'AKTIVNÍ' : 'NEAKTIVNÍ'}
            </span>
            <button
              type="button"
              onClick={toggleActive}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors border border-black ${
                offer.isActive ? 'bg-black' : 'bg-white'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                  offer.isActive ? 'translate-x-10 bg-white' : 'translate-x-2 bg-black'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold mb-1 tracking-widest">Text nabídky</label>
              <textarea
                value={offer.text}
                onChange={e => setOffer({ ...offer, text: e.target.value })}
                className="w-full border border-black p-3 text-sm focus:outline-none min-h-[100px]"
                placeholder="VYUŽIJTE LIMITOVANÝ SLEVOVÝ KUPÓN..."
              />
              <p className="text-[9px] mt-1 text-gray-400 uppercase">Číslo '10' bude nahrazeno výší slevy</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase font-bold mb-1 tracking-widest">Výše slevy (%)</label>
              <input
                type="number"
                value={offer.percentage}
                onChange={e => setOffer({ ...offer, percentage: parseInt(e.target.value) || 0 })}
                className="w-full border border-black p-3 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold mb-1 tracking-widest">Doba trvání (minuty)</label>
              <input
                type="number"
                value={offer.durationMin}
                onChange={e => setOffer({ ...offer, durationMin: parseInt(e.target.value) || 0 })}
                className="w-full border border-black p-3 text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold mb-1 tracking-widest">Cílové stránky</label>
          <input
            type="text"
            value={offer.targetPages?.join(', ')}
            onChange={e => setOffer({ ...offer, targetPages: e.target.value.split(',').map(p => p.trim()) })}
            className="w-full border border-black p-3 text-sm focus:outline-none"
            placeholder="*, /produkty, /kosik"
          />
          <p className="text-[9px] mt-1 text-gray-400 uppercase">* = Všechny stránky (výchozí)</p>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="w-full bg-black text-white p-4 text-xs font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? 'Ukládání...' : 'Uložit nastavení nabídky'}
        </button>
      </div>

      <div className="mt-12">
        <h3 className="text-[10px] uppercase font-bold mb-4 opacity-50 tracking-[0.1em]">Náhled lišty</h3>
        <div className="bg-black text-white py-3 px-4 flex flex-col sm:flex-row items-center justify-center gap-2 text-center overflow-hidden border border-white/20">
          <div className="text-xs sm:text-sm font-bold tracking-tight uppercase">
            {offer.text.replace('10', offer.percentage)} 
            <span className="mx-2 bg-white text-black px-2 py-0.5 rounded text-sm">
              UFO-{offer.percentage}-XXXXX
            </span>
          </div>
          <div className="text-xs sm:text-sm font-medium flex items-center gap-1 opacity-90">
            Máte na to ještě: <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded">{offer.durationMin}:00</span>
          </div>
        </div>
      </div>
    </div>
  );
}
