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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hoveredSize, setHoveredSize] = useState<string | null>(null);
  const router = useRouter();

  const availableSizes = Object.entries(sizes)
    .filter(([_, stock]) => stock > 0)
    .map(([size, _]) => size);
  
  const allSizes = Object.entries(sizes).map(([size, stock]) => ({ size, stock }));

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

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? Math.min(images.length - 1, 2) : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev >= Math.min(images.length - 1, 2) ? 0 : prev + 1));
  };

  const displayImage = images[currentImageIndex] || images[0];
  const maxImages = Math.min(images.length, 3);

  return (
    <Link
      href={`/produkty/${slug}`}
      className="block bg-white border border-black relative"
      style={{ marginRight: '-1px', marginBottom: '-1px', marginTop: '-1px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImageIndex(0);
      }}
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
            style={{ top: '4px', right: '4px', opacity: 1 }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={isSaved ? 'black' : 'none'}
              stroke="black"
              strokeWidth="1"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}

        {/* Navigation Arrows - Show on hover if multiple images */}
        {isHovered && maxImages > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute z-10 hover:opacity-70 transition-opacity"
              style={{ 
                left: '8px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                padding: '4px',
                cursor: 'pointer'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2">
                <path d="M10 12L6 8L10 4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <button
              onClick={handleNextImage}
              className="absolute z-10 hover:opacity-70 transition-opacity"
              style={{ 
                right: '8px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                padding: '4px',
                cursor: 'pointer'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2">
                <path d="M6 4L10 8L6 12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}
      </div>
      
      <div className="text-center" style={{ position: 'absolute', bottom: '64px', left: 0, right: 0 }}>
        {/* Title or Dot Indicators */}
        {isHovered && maxImages > 1 ? (
          <div 
            className="flex justify-center gap-1"
            style={{ marginBottom: '4px', height: '18px', alignItems: 'center' }}
          >
            {Array.from({ length: maxImages }).map((_, index) => (
              <div
                key={index}
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: index === currentImageIndex ? '#000000' : '#999999',
                }}
              />
            ))}
          </div>
        ) : (
          <h3 
            className="uppercase"
            style={{
              fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.03em',
              fontStretch: 'condensed',
              lineHeight: '1.4',
              marginBottom: '2px'
            }}
          >
            {name}
          </h3>
        )}
        
        {isHovered && allSizes.length > 0 ? (
          <div 
            className="flex justify-center gap-1 flex-wrap px-2"
            style={{ marginBottom: '2px' }}
          >
            {allSizes.map(({ size, stock }) => {
              const isAvailable = stock > 0;
              const isHoveredSize = hoveredSize === size;
              return (
                <button
                  key={size}
                  onClick={(e) => isAvailable && handleSizeClick(e, size)}
                  onMouseEnter={() => isAvailable && setHoveredSize(size)}
                  onMouseLeave={() => setHoveredSize(null)}
                  className="transition-colors"
                  style={{
                    fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '11px',
                    fontWeight: 400,
                    padding: '2px 6px',
                    minWidth: '28px',
                    color: isAvailable ? '#000' : '#999',
                    textDecoration: isAvailable ? 'none' : 'line-through',
                    position: 'relative',
                    background: isAvailable && isHoveredSize ? 'white' : 'transparent',
                    border: isAvailable && isHoveredSize ? '1px solid black' : '1px solid transparent',
                    cursor: isAvailable ? 'pointer' : 'default'
                  }}
                >
                  {size}
                </button>
              );
            })}
          </div>
        ) : !isHovered ? (
          <p 
            className="text-small"
            style={{ marginBottom: '2px' }}
          >
            {colorCount} {getCzechColorPlural(colorCount)}
          </p>
        ) : null}
        
        {/* Price or Square Box */}
        {isHovered ? (
          <div className="flex justify-center">
            <div
              style={{
                width: '4px',
                height: '4px',
                border: '1px solid #000000',
                backgroundColor: '#ffffff',
                borderRadius: '2px',
              }}
            />
          </div>
        ) : (
          <p className="text-small">{price} Kč</p>
        )}
      </div>
    </Link>
  );
}
