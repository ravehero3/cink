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
      className="block bg-white border border-black relative"
      style={{ marginRight: '-1px', marginBottom: '-1px' }}
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
      
      <div className="text-center" style={{ position: 'absolute', bottom: '64px', left: 0, right: 0 }}>
        <h3 
          className="mb-xs uppercase"
          style={{
            fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.03em',
            fontStretch: 'condensed',
            lineHeight: '1.4'
          }}
        >
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
