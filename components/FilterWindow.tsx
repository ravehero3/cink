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

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-white z-40 cursor-pointer"
        onClick={close}
      />

      <div
        className="fixed top-0 right-0 bottom-0 w-[400px] bg-white border-l border-black z-50 flex flex-col animate-slide-in"
        style={{
          animation: 'slideIn 0.3s ease-out',
        }}
      >
        <div className="p-8 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-header font-bold uppercase">FILTRY</h2>
            <button
              onClick={close}
              className="w-8 h-8 flex items-center justify-center border border-black hover:bg-black hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="mb-8">
            <h3 className="text-product-name font-bold uppercase mb-4">BARVY</h3>
            <div className="space-y-3">
              {availableColors.map((color) => (
                <label key={color} className="flex items-center gap-3 cursor-pointer">
                  <div
                    className="w-5 h-5 border border-black flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: colors.includes(color) ? '#000000' : '#FFFFFF',
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
                  <span className="text-body">{color}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-product-name font-bold uppercase mb-4">VELIKOST</h3>
            <div className="space-y-3">
              {availableSizes.map((size) => (
                <label key={size} className="flex items-center gap-3 cursor-pointer">
                  <div
                    className="w-5 h-5 border border-black flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: sizes.includes(size) ? '#000000' : '#FFFFFF',
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
                  <span className="text-body">{size}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-black flex gap-4">
          <button
            onClick={() => {
              reset();
            }}
            className="flex-1 px-6 py-3 text-body uppercase border border-black bg-white text-black hover:bg-black hover:text-white transition-colors"
          >
            OBNOVIT
          </button>
          <button
            onClick={apply}
            className="flex-1 px-6 py-3 text-body uppercase bg-black text-white hover:opacity-80 transition-opacity"
          >
            ULOŽIT
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
