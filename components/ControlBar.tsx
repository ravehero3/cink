'use client';

import { useFilterStore } from '@/lib/filter-store';
import { useSortPanelStore } from '@/lib/sort-panel-store';
import { getCzechProductPlural } from '@/lib/czech-pluralization';

interface ControlBarProps {
  productCount: number;
  currentSort: string;
  onSortChange: (sort: string) => void;
}

export default function ControlBar({ productCount, currentSort, onSortChange }: ControlBarProps) {
  const { open } = useFilterStore();
  const { open: openSortPanel } = useSortPanelStore();

  return (
    <div className="border-b border-black bg-white h-header">
      <div className="h-full flex items-center justify-between md:justify-between" style={{ paddingLeft: '12px', paddingRight: '12px' }}>
        {/* Left: Product count - 12px from left edge */}
        <div className="text-sm uppercase tracking-tight font-normal">
          {productCount} {getCzechProductPlural(productCount)}
        </div>

        {/* Mobile: Center - Filter button */}
        <div className="md:hidden flex items-center justify-center flex-1">
          <button
            onClick={open}
            className="text-sm uppercase tracking-tight font-normal border border-black px-lg py-sm hover:opacity-70 transition-opacity"
          >
            FILTROVAT
          </button>
        </div>

        {/* Right: Sort button - aligned right on mobile, Sort and Filter on desktop */}
        <div className="flex items-center" style={{ gap: '12px', justifyContent: 'flex-end', paddingRight: '0px' }}>
          <button
            onClick={openSortPanel}
            className="flex items-center text-sm uppercase tracking-tight font-normal hover:opacity-70 transition-opacity"
            style={{ gap: '8px' }}
          >
            <span>SEŘADIT PODLE</span>
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor">
              <path d="M1 1L6 6L11 1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Desktop: Filter button */}
          <button
            onClick={open}
            className="hidden md:block text-sm uppercase tracking-tight font-normal border border-black px-lg py-sm hover:opacity-70 transition-opacity"
            style={{ marginLeft: '8px' }}
          >
            FILTROVAT
          </button>
        </div>
      </div>
    </div>
  );
}
