'use client';

import { useFilterStore } from '@/lib/filter-store';

interface InfobarProps {
  productCount: number;
  currentSort: string;
  onSortChange: (sort: string) => void;
}

export default function Infobar({ productCount, currentSort, onSortChange }: InfobarProps) {
  const { open } = useFilterStore();

  const sortOptions = [
    { value: 'newest', label: 'Nejnovější' },
    { value: 'oldest', label: 'Nejstarší' },
    { value: 'price-low', label: 'Cena: Nejnižší' },
    { value: 'price-high', label: 'Cena: Nejvyšší' },
    { value: 'name-az', label: 'Název: A-Z' },
    { value: 'name-za', label: 'Název: Z-A' },
  ];

  return (
    <div className="h-header border-b border-black bg-white">
      <div className="h-full flex items-center justify-between px-8">
        <div className="text-body">
          {productCount} {productCount === 1 ? 'produkt' : productCount < 5 ? 'produkty' : 'produktů'}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={open}
            className="text-body uppercase border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
          >
            FILTROVAT
          </button>

          <div className="flex items-center gap-2">
            <span className="text-body uppercase">SEŘADIT PODLE</span>
            <select
              value={currentSort}
              onChange={(e) => onSortChange(e.target.value)}
              className="text-body border border-black px-3 py-2 bg-white hover:bg-black hover:text-white transition-colors cursor-pointer"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
