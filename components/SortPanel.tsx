'use client';

import { useSortPanelStore } from '@/lib/sort-panel-store';
import { useEffect, useState } from 'react';

const sortOptions = [
  { value: 'newest', label: 'Od Nejnovějšího' },
  { value: 'price-low', label: 'Od Nejlevnějšího' },
  { value: 'price-high', label: 'Od Nejdražšího' },
];

export default function SortPanel() {
  const { isOpen, tempSelectedSort, setTempSort, apply, cancel, close } = useSortPanelStore();
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      <div
        className="fixed inset-0 bg-black z-40 transition-opacity duration-300"
        style={{ opacity: isOpen ? 0.5 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
        onClick={close}
      />

      <div
        className={`fixed top-0 right-0 h-full bg-white border-l border-black z-50 transition-transform duration-300 ease-in-out w-full md:w-1/3 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="bg-white border-b border-black relative flex items-center justify-center px-6" style={{ height: '44px' }}>
            <h2 
              className="uppercase tracking-wider"
              style={{ 
                fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif', 
                fontSize: '14px', 
                fontWeight: 700, 
                fontStretch: 'condensed' 
              }}
            >
              SEŘADIT PODLE
            </h2>
            <button
              onClick={close}
              className="absolute hover:opacity-70 transition-opacity"
              style={{ 
                width: '22px', 
                height: '22px', 
                top: '50%', 
                right: '8px', 
                transform: 'translateY(-50%)', 
                padding: '0', 
                border: 'none', 
                background: 'none' 
              }}
              aria-label="Close"
            >
              <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', paddingTop: '24px', paddingBottom: '24px' }} className="flex-1">
              <p 
                className="text-center w-full" 
                style={{ 
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', 
                  fontSize: '14px', 
                  fontWeight: 400, 
                  lineHeight: '19.6px' 
                }}
              >
                Vyberte, jak chcete produkty seřadit
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '8px' }}>
                <label 
                  style={{ 
                    fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', 
                    fontSize: '12px', 
                    fontWeight: 400, 
                    lineHeight: '12px', 
                    letterSpacing: '0.12px' 
                  }}
                >
                  Řazení
                </label>
              </div>
              
              <div className="space-y-2">
                {sortOptions.map((option) => {
                  const isSelected = tempSelectedSort === option.value;
                  const isHovered = hoveredOption === option.value;
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => setTempSort(option.value)}
                      onMouseEnter={() => setHoveredOption(option.value)}
                      onMouseLeave={() => setHoveredOption(null)}
                      className="w-full text-left px-4 py-3 transition-all duration-200"
                      style={{
                        fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                        fontSize: '12px',
                        borderRadius: '4px',
                        border: isSelected ? '1px solid black' : '1px solid #d1d5db',
                        backgroundColor: isSelected ? '#000000' : (isHovered ? '#f3f4f6' : '#FFFFFF'),
                        color: isSelected ? '#FFFFFF' : '#000000',
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: 'auto', marginBottom: '24px' }}>
              <p 
                className="text-center" 
                style={{ 
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', 
                  fontSize: '12px', 
                  fontWeight: 400, 
                  lineHeight: '12px', 
                  letterSpacing: '0.12px', 
                  color: '#4b5563' 
                }}
              >
                Vybrané řazení se uloží pro celý váš prohlížeč.
              </p>
            </div>

            <div className="border-t border-black" style={{ marginLeft: '-8px', marginRight: '-8px', marginBottom: '8px' }}></div>

            <div className="flex gap-2" style={{ marginBottom: '8px' }}>
              <button
                onClick={cancel}
                className="flex-1 bg-white text-black uppercase tracking-wider font-bold hover:opacity-70 transition-opacity border border-black"
                style={{ 
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', 
                  fontSize: '12px', 
                  padding: '12px',
                  borderRadius: '4px'
                }}
              >
                ZRUŠIT
              </button>
              <button
                onClick={apply}
                className="flex-1 bg-black text-white uppercase tracking-wider font-bold hover:opacity-90 transition-opacity"
                style={{ 
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', 
                  fontSize: '12px', 
                  padding: '12px',
                  borderRadius: '4px'
                }}
              >
                ULOŽIT
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
