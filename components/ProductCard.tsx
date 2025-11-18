'use client';

import Link from 'next/link';
import { getCzechColorPlural } from '@/lib/czech-pluralization';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  colorCount?: number;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}

export default function ProductCard({
  id,
  name,
  slug,
  price,
  image,
  colorCount = 1,
  isSaved = false,
  onToggleSave,
}: ProductCardProps) {
  return (
    <Link
      href={`/produkty/${slug}`}
      className="block bg-white"
    >
      <div className="relative overflow-hidden aspect-product">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          style={{ 
            filter: 'grayscale(1) contrast(1.2)',
          }}
        />
      </div>
      
      <div className="pt-sm text-center">
        <h3 className="text-product-name mb-xs uppercase tracking-normal">
          {name}
        </h3>
        <p className="text-small mb-xs">
          {colorCount} {getCzechColorPlural(colorCount)}
        </p>
        <p className="text-small">{price} Kč</p>
      </div>
    </Link>
  );
}
