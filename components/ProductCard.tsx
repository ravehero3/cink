'use client';

import Link from 'next/link';
import { useState } from 'react';

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
  const [isHovered, setIsHovered] = useState(false);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onToggleSave) {
      onToggleSave(id);
    }
  };

  return (
    <Link
      href={`/produkty/${slug}`}
      className="block bg-white border border-white hover:border-black transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          style={{ 
            filter: 'grayscale(1) contrast(1.2)',
          }}
        />
        <button
          onClick={handleSaveClick}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center"
          aria-label={isSaved ? 'Odebrat z uložených' : 'Uložit produkt'}
        >
          {isSaved ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>
      </div>
      
      <div className="p-4 text-center">
        <h3 
          className="text-product-name mb-2 line-clamp-2"
          style={{ 
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {name}
        </h3>
        <p className="text-body">{price} Kč</p>
      </div>
    </Link>
  );
}
