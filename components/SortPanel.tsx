'use client';

import { useSortPanelStore } from '@/lib/sort-panel-store';
import { useEffect } from 'react';

const sortOptions = [
  { value: 'newest', label: 'Od Nejnovějšího' },
  { value: 'price-low', label: 'Od Nejlevnějšího' },
  { value: 'price-high', label: 'Od Nejdražšího' },
];

export default function SortPanel() {
  const { isOpen, tempSelectedSort, setTempSort, apply, cancel, close } = useSortPanelStore();

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
        className="fixed inset-0 bg-black z-40 cursor-pointer transition-opacity duration-300"
        style={{ opacity: isOpen ? 0.5 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
        onClick={close}
      />

      <div
        className={`fixed top-0 right-0 bottom-0 bg-white border-l border-black z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          width: 'calc(100vw / 3)',
        }}
      >
        <div className="border-b border-black relative" style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h2 
            style={{
              fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '15px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
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
              padding: '0'
            }}
          >
            <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div style={{ padding: '2px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTempSort(option.value)}
                  className="w-full px-lg py-sm text-small uppercase tracking-wider border border-black bg-white text-black hover:opacity-70 transition-opacity text-left"
                  style={{
                    backgroundColor: tempSelectedSort === option.value ? '#000000' : '#FFFFFF',
                    color: tempSelectedSort === option.value ? '#FFFFFF' : '#000000',
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #000000', marginBottom: '2px', marginLeft: '2px', marginRight: '2px' }} />

        <div className="flex" style={{ gap: '2px', padding: '0 2px 2px 2px' }}>
          <button
            onClick={cancel}
            className="flex-1 px-lg py-sm text-small uppercase tracking-wider border border-black bg-white text-black hover:opacity-70 transition-opacity"
          >
            Zrušit
          </button>
          <button
            onClick={apply}
            className="flex-1 px-lg py-sm text-small uppercase tracking-wider bg-black text-white border border-black hover:opacity-90 transition-opacity"
          >
            Uložit
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
