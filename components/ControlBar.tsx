'use client';

import { useFilterStore } from '@/lib/filter-store';
import { getCzechProductPlural } from '@/lib/czech-pluralization';

interface ControlBarProps {
  productCount: number;
  currentSort: string;
  onSortChange: (sort: string) => void;
}

export default function ControlBar({ productCount, currentSort, onSortChange }: ControlBarProps) {
  const { open } = useFilterStore();

  const sortOptions = [
    { value: 'newest', label: 'Nejnovější' },
    { value: 'oldest', label: 'Nejstarší' },
    { value: 'price-low', label: 'Cena: Nízká až Vysoká' },
    { value: 'price-high', label: 'Cena: Vysoká až Nízká' },
    { value: 'name-az', label: 'Název: A-Z' },
    { value: 'name-za', label: 'Název: Z-A' },
  ];

  return (
    <div className="border-b border-black bg-white h-header">
      <div className="max-w-container mx-auto h-full flex items-center justify-between" style={{ paddingLeft: '16px', paddingRight: '16px' }}>
        {/* Left: Product count */}
        <div className="text-small uppercase tracking-wider">
          {productCount} {getCzechProductPlural(productCount)}
        </div>

        {/* Right: Sort and Filter buttons */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-small uppercase tracking-wider">SEŘADIT PODLE</span>
            <select
              value={currentSort}
              onChange={(e) => onSortChange(e.target.value)}
              className="text-small border border-black px-sm py-sm bg-white cursor-pointer hover:opacity-70 transition-opacity"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={open}
            className="text-small uppercase tracking-wider border border-black px-lg py-sm hover:opacity-70 transition-opacity"
          >
            FILTROVAT
          </button>
        </div>
      </div>
    </div>
  );
}
