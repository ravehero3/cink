'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';

export default function ReturnsPage() {
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [errors, setErrors] = useState<{ email?: string; orderNumber?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; orderNumber?: string } = {};
    
    if (!email) {
      newErrors.email = 'E-mail je povinný';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Neplatný formát e-mailu';
    }
    
    if (!orderNumber) {
      newErrors.orderNumber = 'Číslo objednávky je povinné';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setSubmitted(true);
      console.log('Return request submitted:', { email, orderNumber });
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setEmail('');
        setOrderNumber('');
        setSubmitted(false);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Left vertical line - starts at top */}
      <div className="hidden md:block absolute left-1/4 w-px bg-black z-0" style={{ top: 0, bottom: 0 }} />
      
      {/* Right vertical line - starts at top */}
      <div className="hidden md:block absolute right-1/4 w-px bg-black z-0" style={{ top: 0, bottom: 0 }} />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center" style={{ paddingTop: '64px', paddingBottom: '80px' }}>
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
          VRÁCENÍ ZBOŽÍ DO 14 DNŮ
        </h1>

        <p 
          className="text-center mb-8 w-full px-4 md:w-1/3 md:px-0"
          style={{
            fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '1.6',
            color: '#000000'
          }}
        >
          Podle zákona č. 89/2012 Sb. (občanský zákoník) máte právo odstoupit od kupní smlouvy bez udání důvodu do 14 dnů od převzetí zboží. Vyplňte formulář níže pro registraci vrácení.
        </p>

        <div className="w-full flex flex-col items-center">
          {submitted && (
            <div 
              className="mb-6 p-3 text-sm border text-center w-full px-4 md:w-1/3 md:px-0"
              style={{
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                backgroundColor: '#24e053',
                color: '#000000',
                borderColor: '#24e053'
              }}
            >
              Žádost o vrácení byla úspěšně odeslána. Brzy vás budeme kontaktovat s podrobnými instrukcemi.
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col items-center w-full px-4 md:w-1/3 md:px-0">
            <div className="w-full relative" style={{ marginBottom: '8px' }}>
              <label 
                className="block text-xs mb-[2px]"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  color: '#000000'
                }}
              >
                E-mail *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-black text-sm focus:outline-none focus:border-black bg-white"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  padding: '13.8px 25.6px',
                  borderRadius: '4px',
                  color: '#000000',
                  fontSize: '14px'
                }}
                placeholder="miluju@ufosport.cz"
              />
              {errors.email && (
                <p 
                  className="mt-2 text-xs"
                  style={{
                    fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    color: '#dc2626'
                  }}
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div className="w-full relative" style={{ marginBottom: '8px' }}>
              <label 
                className="block text-xs mb-[2px]"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  color: '#000000'
                }}
              >
                Číslo objednávky *
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full border border-black text-sm focus:outline-none focus:border-black bg-white"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  padding: '13.8px 25.6px',
                  borderRadius: '4px',
                  color: '#000000',
                  fontSize: '14px'
                }}
                placeholder="UFO1234567"
              />
              {errors.orderNumber && (
                <p 
                  className="mt-2 text-xs"
                  style={{
                    fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    color: '#dc2626'
                  }}
                >
                  {errors.orderNumber}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white uppercase hover:bg-gray-800 transition-colors"
              style={{
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '13px',
                padding: '13.8px 25.6px',
                borderRadius: '4px',
                letterSpacing: '0.05em',
                marginBottom: '8px'
              }}
            >
              REGISTROVAT VRÁCENÍ
            </button>
          </form>

          {/* Detailed Instructions & Legal compliance */}
          <div className="w-full px-4 md:w-1/3 md:px-0 mt-10 space-y-6" style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '13px', lineHeight: '1.7', color: '#000000' }}>
            <div className="border border-black p-5 bg-[#fafafa]">
              <h2 className="text-xs uppercase font-bold tracking-wider mb-3">Podmínky a pravidla pro vrácení zboží</h2>
              <ul className="space-y-2 list-disc list-inside text-gray-800">
                <li><strong>Lhůta 14 dnů:</strong> Jako spotřebitel máte právo odstoupit od smlouvy bez udání důvodu do <strong>14 dnů</strong> ode dne převzetí zboží.</li>
                <li><strong>Náklady na vrácení:</strong> Náklady spojené s vrácením zboží zpět prodávajícímu <strong>nese v plné výši kupující</strong> (§ 1820 odst. 1 písm. g) občanského zákoníku).</li>
                <li><strong>Zásilky na dobírku:</strong> Zboží nikdy nezasílejte na dobírku. Zásilky zaslané na dobírku nebudou převzaty a vrátí se vám zpět na vaše náklady.</li>
                <li><strong>Stav zboží:</strong> Zboží musí být vráceno čisté, nenošené, neprané, nepoškozené a ideálně v původním obalu včetně všech visaček a štítků. Kupující odpovídá za snížení hodnoty zboží v případě, že s ním bylo nakládáno jinak, než je nutné k seznámení se s jeho povahou a vlastnostmi.</li>
                <li><strong>Vrácení peněz:</strong> Finanční prostředky vám vrátíme nejpozději do 14 dnů od doručení odstoupení od smlouvy, ne však dříve, než nám vrácené zboží doručíte zpět (nebo prokážete jeho odeslání), a to stejnou platební metodou, jakou byla objednávka uhrazena.</li>
              </ul>
            </div>

            <div className="border border-black p-5">
              <h2 className="text-xs uppercase font-bold tracking-wider mb-2">Kam zboží odeslat?</h2>
              <p className="mb-2">Po vyplnění formuláře výše zboží pečlivě zabalte a odešlete na naši adresu:</p>
              <div className="bg-[#f0f0f0] p-3 text-xs font-mono space-y-0.5">
                <p><strong>UFO SPORT – Vojtěch Vojkovský</strong></p>
                <p>Bědovická 193E</p>
                <p>503 46 Třebechovice pod Orebem</p>
                <p>Česká republika</p>
                <p>E-mail: miluju@ufosport.cz</p>
              </div>
              <p className="mt-3 text-xs text-gray-600">
                Podrobné podmínky a vzorový formulář pro odstoupení od smlouvy naleznete také v našich{' '}
                <Link href="/obchodni-podminky" className="underline font-medium text-black">Obchodních podmínkách</Link>.
              </p>
            </div>
          </div>

          {/* Horizontal line */}
          <div className="w-full h-px bg-black" style={{ marginTop: '64px' }} />
        </div>
      </div>
    </div>
  );
}
