'use client';

import { useState } from 'react';

export default function CookieSettingsPage() {
  const [necessary, setNecessary] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const handleSave = () => {
    console.log('Cookie preferences saved:', { necessary, analytics, marketing });
    alert('Nastavení cookies bylo uloženo');
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 uppercase tracking-wider">NASTAVENÍ COOKIES</h1>
      
      <div className="max-w-3xl">
        <p className="text-base mb-8 leading-relaxed">
          Zde můžete upravit své preference ohledně používání cookies na našich stránkách. Vaše volba bude uložena a použita při vašich dalších návštěvách.
        </p>

        <div className="space-y-6 mb-8">
          <div className="border border-black p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2 uppercase">Nezbytné cookies</h3>
                <p className="text-base leading-relaxed">
                  Tyto cookies jsou nutné pro správné fungování webu a nemohou být vypnuty.
                </p>
              </div>
              <div className="ml-4">
                <input
                  type="checkbox"
                  checked={necessary}
                  disabled
                  className="w-6 h-6"
                />
              </div>
            </div>
            <p className="text-sm text-gray-600">Vždy aktivní</p>
          </div>

          <div className="border border-black p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2 uppercase">Analytické cookies</h3>
                <p className="text-base leading-relaxed">
                  Pomáhají nám pochopit, jak návštěvníci používají náš web, abychom mohli vylepšit uživatelský zážitek.
                </p>
              </div>
              <div className="ml-4">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="w-6 h-6"
                />
              </div>
            </div>
          </div>

          <div className="border border-black p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2 uppercase">Marketingové cookies</h3>
                <p className="text-base leading-relaxed">
                  Používají se k zobrazování relevantních reklam na základě vašich zájmů.
                </p>
              </div>
              <div className="ml-4">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="w-6 h-6"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            className="flex-1 bg-black text-white py-3 text-sm uppercase tracking-wider font-bold hover:opacity-90 transition-opacity"
          >
            ULOŽIT NASTAVENÍ
          </button>
          <button
            onClick={() => {
              setAnalytics(true);
              setMarketing(true);
            }}
            className="flex-1 border border-black text-black py-3 text-sm uppercase tracking-wider font-bold hover:bg-black hover:text-white transition-colors"
          >
            POVOLIT VŠE
          </button>
        </div>

        <p className="text-sm text-gray-600 mt-6">
          Více informací o našem používání cookies najdete v{' '}
          <a href="/cookies" className="underline hover:text-black">
            Zásadách používání souborů cookie
          </a>
          .
        </p>
      </div>
    </div>
  );
}
