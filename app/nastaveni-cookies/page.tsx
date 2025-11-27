'use client';

import { useState } from 'react';
import Accordion from '@/components/Accordion';
import AnimatedButton from '@/components/AnimatedButton';

export default function CookieSettingsPage() {
  const [necessary, setNecessary] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const handleSave = () => {
    console.log('Cookie preferences saved:', { necessary, analytics, marketing });
    alert('Nastavení cookies bylo uloženo');
  };

  const cookieItems = [
    {
      title: 'Nezbytné cookies',
      content: (
        <div className="space-y-3">
          <p>Tyto cookies jsou nutné pro správné fungování webu a nemohou být vypnuty.</p>
          <div className="flex items-center justify-between mt-4 p-4 border border-black bg-gray-50">
            <p className="text-sm font-bold">Vždy aktivní</p>
            <input
              type="checkbox"
              checked={necessary}
              disabled
              className="w-6 h-6"
            />
          </div>
        </div>
      )
    },
    {
      title: 'Analytické cookies',
      content: (
        <div className="space-y-3">
          <p>Pomáhají nám pochopit, jak návštěvníci používají náš web, abychom mohli vylepšit uživatelský zážitek.</p>
          <div className="flex items-center justify-between mt-4 p-4 border border-black bg-white">
            <p className="text-sm font-bold">Povolit analytické cookies</p>
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
        </div>
      )
    },
    {
      title: 'Marketingové cookies',
      content: (
        <div className="space-y-3">
          <p>Používají se k zobrazování relevantních reklam na základě vašich zájmů.</p>
          <div className="flex items-center justify-between mt-4 p-4 border border-black bg-white">
            <p className="text-sm font-bold">Povolit marketingové cookies</p>
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-white relative">
      {/* Left vertical line - starts at top (header padding handled by body) */}
      <div className="absolute left-1/4 w-px bg-black z-0" style={{ top: 0, bottom: 0 }} />
      
      {/* Right vertical line - starts at top (header padding handled by body) */}
      <div className="absolute right-1/4 w-px bg-black z-0" style={{ top: 0, bottom: 0 }} />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center" style={{ paddingTop: '64px' }}>
        <h1 
          className="uppercase text-center"
          style={{
            fontFamily: '"Roboto Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '20px',
            fontWeight: 700,
            letterSpacing: '0.05em',
            marginBottom: '8px'
          }}
        >
          NASTAVENÍ COOKIES
        </h1>
        
        <div style={{ width: '33.33%' }}>
          <p 
            className="text-center mb-12"
            style={{
              fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '1.6'
            }}
          >
            Zde můžete upravit své preference ohledně používání cookies na našich stránkách. Vaše volba bude uložena a použita při vašich dalších návštěvách.
          </p>

          <Accordion items={cookieItems} />

          <div className="flex gap-4 my-8">
            <AnimatedButton
              text="ULOŽIT NASTAVENÍ"
              onClick={handleSave}
              type="button"
              className="flex-1"
              style={{
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '13px',
                fontWeight: 400,
                letterSpacing: '0.05em',
                padding: '13.8px 25.6px'
              }}
            />
            <button
              onClick={() => {
                setAnalytics(true);
                setMarketing(true);
              }}
              className="flex-1 border border-black text-black hover:bg-white hover:text-black transition-colors"
              style={{
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '13px',
                fontWeight: 400,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                borderRadius: '4px',
                padding: '13.8px 25.6px'
              }}
            >
              POVOLIT VŠE
            </button>
          </div>

          <p 
            className="text-center"
            style={{
              fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '1.6',
              color: '#4b5563'
            }}
          >
            Více informací o našem používání cookies najdete v{' '}
            <a href="/cookies" className="underline hover:text-black">
              Zásadách používání souborů cookie
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
