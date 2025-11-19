'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCzechColorPlural } from '@/lib/czech-pluralization';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  sizes?: Record<string, number>;
  colorCount?: number;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}

export default function ProductCard({
  id,
  name,
  slug,
  price,
  images,
  sizes = {},
  colorCount = 1,
  isSaved = false,
  onToggleSave,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const availableSizes = Object.entries(sizes)
    .filter(([_, stock]) => stock > 0)
    .map(([size, _]) => size);

  const handleSizeClick = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/produkty/${slug}?size=${size}`);
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleSave) {
      onToggleSave(id);
    }
  };

  const displayImage = isHovered && images.length > 1 ? images[1] : images[0];

  return (
    <Link
      href={`/produkty/${slug}`}
      className="block bg-white border border-black relative"
      style={{ marginRight: '-1px', marginBottom: '-1px', marginTop: '-1px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden aspect-product">
        <img
          src={displayImage}
          alt={name}
          className="w-full h-full object-cover"
          style={{ 
            filter: 'grayscale(1) contrast(1.2)',
          }}
        />
        
        {onToggleSave && (
          <button
            onClick={handleHeartClick}
            className="absolute z-10"
            style={{ top: '4px', right: '4px' }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={isSaved ? 'white' : 'none'}
              stroke="white"
              strokeWidth="1"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="text-center" style={{ position: 'absolute', bottom: '64px', left: 0, right: 0 }}>
        <h3 
          className="uppercase"
          style={{
            fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.03em',
            fontStretch: 'condensed',
            lineHeight: '1.4',
            marginBottom: '4px'
          }}
        >
          {name}
        </h3>
        
        {isHovered && availableSizes.length > 0 ? (
          <div 
            className="flex justify-center gap-1 flex-wrap px-2"
            style={{ marginBottom: '4px' }}
          >
            {availableSizes.map((size) => (
              <button
                key={size}
                onClick={(e) => handleSizeClick(e, size)}
                className="bg-white border border-black hover:bg-black hover:text-white transition-colors"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '11px',
                  fontWeight: 400,
                  padding: '2px 6px',
                  minWidth: '28px'
                }}
              >
                {size}
              </button>
            ))}
          </div>
        ) : (
          <p 
            className="text-small"
            style={{ marginBottom: '4px' }}
          >
            {colorCount} {getCzechColorPlural(colorCount)}
          </p>
        )}
        
        <p className="text-small">{price} Kč</p>
      </div>
    </Link>
  );
}
