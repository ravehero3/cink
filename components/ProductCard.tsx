'use client';

import Link from 'next/link';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}

export default function ProductCard({
  id,
  name,
  slug,
  price,
  image,
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
      
      <div className="pt-sm">
        <h3 className="text-product-name mb-xs uppercase tracking-normal">
          {name}
        </h3>
        <p className="text-small">{price} Kč</p>
      </div>
    </Link>
  );
}
