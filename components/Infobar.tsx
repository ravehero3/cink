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
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name-az', label: 'Name: A-Z' },
    { value: 'name-za', label: 'Name: Z-A' },
  ];

  return (
    <div className="border-b border-black bg-white">
      <div className="max-w-container mx-auto px-lg py-md flex items-center justify-between">
        <div className="text-small uppercase tracking-wider">
          {productCount} {productCount === 1 ? 'Product' : 'Products'}
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={open}
            className="text-small uppercase tracking-wider border border-black px-lg py-sm hover:opacity-70 transition-opacity"
          >
            Filter
          </button>

          <div className="flex items-center gap-3">
            <span className="text-small uppercase tracking-wider">Sort by</span>
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
        </div>
      </div>
    </div>
  );
}
