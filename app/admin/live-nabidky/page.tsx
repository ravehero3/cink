'use client';

import { useState, useEffect } from 'react';

export default function LiveOfferAdminPage() {
  const [offer, setOffer] = useState<any>({
    isActive: false,
    text: 'Sleva 15 % na vše',
    percentage: 15,
    durationMin: 45,
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
    setOffer((prev: any) => ({ ...prev, isActive: !prev.isActive }));
  };

  const resetTestState = () => {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('live_offer_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    window.dispatchEvent(new CustomEvent('check-live-offer'));
    alert('Váš osobní testovací stav byl restartován. Nyní uvidíte nabídku znovu na webu (pokud je aktivní).');
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-12">
        <div className="admin-spinner" />
        <span className="admin-sub" style={{ margin: 0 }}>Načítám…</span>
      </div>
    );
  }

  return (
    <div className="space-y-[24px] max-w-4xl">
      <div className="border-b border-black pb-4">
        <h1 className="admin-title">Live nabídky</h1>
        <p className="admin-sub">Lišta s limitovanou slevou na e-shopu</p>
      </div>

      <div className="admin-card p-[24px] space-y-[24px]">
        <div className="flex items-center justify-between p-[16px] border border-black">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider">Aktivní stav</h2>
            <p className="admin-sub">Zapnout / vypnout zobrazení lišty na webu</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {offer.isActive ? 'Aktivní' : 'Neaktivní'}
            </span>
            <button
              type="button"
              onClick={toggleActive}
              className={`relative inline-flex items-center border border-black transition-colors ${
                offer.isActive ? 'bg-black' : 'bg-white'
              }`}
              style={{ width: 64, height: 32 }}
              aria-label="Přepnout aktivitu"
            >
              <span
                className="inline-block transition-transform"
                style={{
                  width: 16,
                  height: 16,
                  background: offer.isActive ? '#fff' : '#000',
                  transform: offer.isActive ? 'translateX(40px)' : 'translateX(8px)',
                }}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
          <div>
            <label className="admin-label">Text nabídky</label>
            <textarea
              value={offer.text}
              onChange={e => setOffer({ ...offer, text: e.target.value })}
              className="admin-textarea min-h-[100px]"
              placeholder="VYUŽIJTE LIMITOVANÝ SLEVOVÝ KUPÓN..."
            />
            <p className="admin-sub">Číslo v textu bude nahrazeno výší slevy</p>
          </div>

          <div className="space-y-[16px]">
            <div>
              <label className="admin-label">Výše slevy (%)</label>
              <input
                type="number"
                value={offer.percentage}
                onChange={e => setOffer({ ...offer, percentage: parseInt(e.target.value) || 0 })}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Doba trvání (minuty)</label>
              <input
                type="number"
                value={offer.durationMin}
                onChange={e => setOffer({ ...offer, durationMin: parseInt(e.target.value) || 0 })}
                className="admin-input"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="admin-label">Cílové stránky</label>
          <input
            type="text"
            value={offer.targetPages?.join(', ')}
            onChange={e => setOffer({ ...offer, targetPages: e.target.value.split(',').map((p: string) => p.trim()) })}
            className="admin-input"
            style={{ textTransform: 'none' }}
            placeholder="*, /produkty, /kosik"
          />
          <p className="admin-sub">* = všechny stránky (výchozí)</p>
        </div>

        <button onClick={() => handleSave()} disabled={saving} className="admin-btn w-full">
          {saving ? 'Ukládání…' : 'Uložit nastavení nabídky'}
        </button>

        <div className="pt-4 border-t border-black">
          <button onClick={resetTestState} className="admin-btn admin-btn-secondary w-full">
            Restartovat nabídku pro můj prohlížeč
          </button>
          <p className="admin-sub text-center">
            Smaže lokální data o odpočtu, abyste mohli nabídku otestovat znovu.
          </p>
        </div>
      </div>

      <div>
        <h3 className="admin-label">Náhled lišty</h3>
        <div className="bg-black text-white py-3 px-4 flex flex-col sm:flex-row items-center justify-center gap-2 text-center border border-black">
          <div className="text-xs sm:text-sm font-bold tracking-tight uppercase">
            {offer.text.replace('15', offer.percentage)}{' '}
            <span className="mx-2 bg-white text-black px-4 py-1 text-[11px] font-bold tracking-tight inline-block align-middle">
              UFO{offer.percentage}XXXXX
            </span>
            Váš unikátní kód vyprší za:
          </div>
          <div className="text-xs font-medium flex items-center gap-1">
            <span className="font-mono bg-white/10 px-[6px] py-[2px]">{offer.durationMin}:00</span>
          </div>
        </div>
      </div>
    </div>
  );
}
