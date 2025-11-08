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
        <div className="p-xl flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-xl">
            <h2 className="text-section-header font-bold uppercase tracking-tighter">Filters</h2>
            <button
              onClick={close}
              className="w-10 h-10 flex items-center justify-center border border-black hover:opacity-70 transition-opacity"
            >
              ✕
            </button>
          </div>

          <div className="mb-xl">
            <h3 className="text-product-name font-bold uppercase mb-md tracking-wider">Colors</h3>
            <div className="space-y-sm">
              {availableColors.map((color) => (
                <label key={color} className="flex items-center gap-sm cursor-pointer">
                  <div
                    className="w-6 h-6 border border-black flex items-center justify-center"
                    style={{
                      backgroundColor: colors.includes(color) ? '#000000' : '#FFFFFF',
                    }}
                  >
                    {colors.includes(color) && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 16 16">
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
                  <span className="text-base uppercase tracking-wider">{color}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-xl">
            <h3 className="text-product-name font-bold uppercase mb-md tracking-wider">Size</h3>
            <div className="space-y-sm">
              {availableSizes.map((size) => (
                <label key={size} className="flex items-center gap-sm cursor-pointer">
                  <div
                    className="w-6 h-6 border border-black flex items-center justify-center"
                    style={{
                      backgroundColor: sizes.includes(size) ? '#000000' : '#FFFFFF',
                    }}
                  >
                    {sizes.includes(size) && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 16 16">
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
                  <span className="text-base uppercase tracking-wider">{size}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="p-xl border-t border-black flex gap-sm">
          <button
            onClick={() => {
              reset();
            }}
            className="flex-1 px-lg py-sm text-small uppercase tracking-wider border border-black bg-white text-black hover:opacity-70 transition-opacity"
          >
            Reset
          </button>
          <button
            onClick={apply}
            className="flex-1 px-lg py-sm text-small uppercase tracking-wider bg-black text-white border border-black hover:opacity-90 transition-opacity"
          >
            Apply
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
