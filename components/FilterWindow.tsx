'use client';

import { useFilterStore } from '@/lib/filter-store';
import { useEffect } from 'react';

const availableColors = ['Černá', 'Bílá'];
const availableSizes = ['S', 'M', 'L', 'XL', '2XL'];

export default function FilterWindow() {
  const { isOpen, colors, sizes, toggleColor, toggleSize, reset, close, apply } = useFilterStore();

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
        className="fixed inset-0 bg-black transition-opacity duration-300 z-40"
        style={{ opacity: isOpen ? 0.5 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
        onClick={close}
      />

      <div
        className={`fixed top-0 right-0 h-full bg-white border-l border-black z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: 'calc(100vw / 3)' }}
      >
        <div className="h-full flex flex-col">
          <div className="bg-white border-b border-black relative flex items-center justify-center px-6" style={{ height: '44px' }}>
            <h2 className="uppercase tracking-wider" style={{ fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 700, fontStretch: 'condensed' }}>FILTRY</h2>
            <button
              onClick={close}
              className="absolute hover:opacity-70 transition-opacity"
              style={{ width: '22px', height: '22px', top: '50%', right: '8px', transform: 'translateY(-50%)', padding: '0', border: 'none', background: 'none' }}
              aria-label="Close"
            >
              <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 
                className="uppercase"
                style={{ 
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', 
                  fontSize: '12px', 
                  fontWeight: 400, 
                  letterSpacing: '0.12px',
                  marginBottom: '12px'
                }}
              >
                Barva
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {availableColors.map((color) => (
                  <label key={color} className="flex items-center gap-2 cursor-pointer">
                    <div
                      className="w-5 h-5 border border-black flex items-center justify-center"
                      style={{
                        backgroundColor: colors.includes(color) ? '#000000' : '#FFFFFF',
                        borderRadius: '2px'
                      }}
                    >
                      {colors.includes(color) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={colors.includes(color)}
                      onChange={() => toggleColor(color)}
                      className="hidden"
                    />
                    <span 
                      style={{ 
                        fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', 
                        fontSize: '14px', 
                        fontWeight: 400
                      }}
                    >
                      {color}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 
                className="uppercase"
                style={{ 
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', 
                  fontSize: '12px', 
                  fontWeight: 400, 
                  letterSpacing: '0.12px',
                  marginBottom: '12px'
                }}
              >
                Velikost
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {availableSizes.map((size) => (
                  <label key={size} className="flex items-center gap-2 cursor-pointer">
                    <div
                      className="w-5 h-5 border border-black flex items-center justify-center"
                      style={{
                        backgroundColor: sizes.includes(size) ? '#000000' : '#FFFFFF',
                        borderRadius: '2px'
                      }}
                    >
                      {sizes.includes(size) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={sizes.includes(size)}
                      onChange={() => toggleSize(size)}
                      className="hidden"
                    />
                    <span 
                      style={{ 
                        fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', 
                        fontSize: '14px', 
                        fontWeight: 400
                      }}
                    >
                      {size}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-black" style={{ marginLeft: '-8px', marginRight: '-8px' }}></div>
          
          <div style={{ padding: '8px', display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                reset();
              }}
              className="flex-1 uppercase tracking-wider border border-black bg-white text-black hover:opacity-70 transition-opacity"
              style={{ 
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', 
                fontSize: '12px', 
                padding: '12px'
              }}
            >
              RESETOVAT
            </button>
            <button
              onClick={apply}
              className="flex-1 uppercase tracking-wider bg-black text-white border border-black hover:opacity-90 transition-opacity"
              style={{ 
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', 
                fontSize: '12px', 
                padding: '12px'
              }}
            >
              POUŽÍT
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
