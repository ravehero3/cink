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
    <div className="min-h-screen bg-white relative">
      {/* Left vertical line - starts at top (header padding handled by body) */}
      <div className="absolute left-1/4 w-px bg-black z-0" style={{ top: 0, bottom: 0 }} />
      
      {/* Right vertical line - starts at top (header padding handled by body) */}
      <div className="absolute right-1/4 w-px bg-black z-0" style={{ top: 0, bottom: 0 }} />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
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

          <div className="space-y-8 mb-12">
            <div className="border-2 border-black p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 text-left">
                  <h3 
                    className="uppercase mb-2"
                    style={{
                      fontFamily: '"Roboto Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '14px',
                      fontWeight: 700,
                      letterSpacing: '0.05em'
                    }}
                  >
                    Nezbytné cookies
                  </h3>
                  <p 
                    style={{
                      fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '1.6'
                    }}
                  >
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
              <p 
                className="text-left"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '12px',
                  fontWeight: 400,
                  lineHeight: '1.6',
                  color: '#4b5563'
                }}
              >
                Vždy aktivní
              </p>
            </div>

            <div className="border-2 border-black p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 text-left">
                  <h3 
                    className="uppercase mb-2"
                    style={{
                      fontFamily: '"Roboto Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '14px',
                      fontWeight: 700,
                      letterSpacing: '0.05em'
                    }}
                  >
                    Analytické cookies
                  </h3>
                  <p 
                    style={{
                      fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '1.6'
                    }}
                  >
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

            <div className="border-2 border-black p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 text-left">
                  <h3 
                    className="uppercase mb-2"
                    style={{
                      fontFamily: '"Roboto Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '14px',
                      fontWeight: 700,
                      letterSpacing: '0.05em'
                    }}
                  >
                    Marketingové cookies
                  </h3>
                  <p 
                    style={{
                      fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '1.6'
                    }}
                  >
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

          <div className="flex gap-4 mb-8">
            <button
              onClick={handleSave}
              className="flex-1 bg-black text-white hover:opacity-90 transition-opacity"
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
              ULOŽIT NASTAVENÍ
            </button>
            <button
              onClick={() => {
                setAnalytics(true);
                setMarketing(true);
              }}
              className="flex-1 border-2 border-black text-black hover:bg-black hover:text-white transition-colors"
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
