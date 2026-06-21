'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Plus } from 'lucide-react';

interface ProductShowcaseSectionProps {
  imageUrl: string;
  mobileImageUrl?: string;
  headerText: string;
  button1Text: string;
  button2Text: string;
  button1Link: string;
  button2Link: string;
  textColor?: 'black' | 'white';
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onAdd?: () => void;
  isLastSection?: boolean;
}

export default function ProductShowcaseSection({
  imageUrl,
  mobileImageUrl,
  headerText,
  button1Text,
  button2Text,
  button1Link,
  button2Link,
  textColor = 'black',
  isAdmin,
  onEdit,
  onDelete,
  onAdd,
  isLastSection
}: ProductShowcaseSectionProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const currentImageUrl = isMobile && mobileImageUrl ? mobileImageUrl : imageUrl;

  return (
    <section 
      className="w-full relative bg-white overflow-hidden border-b border-black"
      style={{
        height: isMobile ? '100vw' : '80vh',
        maxHeight: isMobile ? '100vw' : 'none',
      }}
    >
      {currentImageUrl ? (
        <div 
          className="absolute inset-0 overflow-hidden"
          style={{
            backgroundColor: 'white',
          }}
        >
          <Image
            src={currentImageUrl}
            alt="Product Showcase"
            fill
            className="object-cover"
            sizes="100vw"
            priority
            style={{
              WebkitTransform: 'translateZ(0)',
              transform: 'translateZ(0)',
              objectPosition: 'center center',
            }}
          />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-xl">No image uploaded</p>
        </div>
      )}

      <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center px-4">
        <h2 className={`uppercase mb-[8px] ${textColor === 'white' ? 'text-white' : 'text-black'}`} style={{
          fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: '22px',
          fontWeight: 700,
          lineHeight: '22px',
          letterSpacing: '0.03em',
          fontStretch: 'condensed',
          WebkitTextStroke: textColor === 'black' ? '1px white' : 'none',
          paintOrder: 'stroke fill'
        }}>
          {headerText}
        </h2>
        <div className="flex gap-1">
          <AnimatedButton text={button1Text} link={button1Link} textColor={textColor} />
          <AnimatedButton text={button2Text} link={button2Link} textColor={textColor} />
        </div>
      </div>

      {isAdmin && (
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-black text-black text-xs uppercase tracking-wide hover:bg-black hover:text-white transition-all duration-200"
              style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '10px', letterSpacing: '0.08em' }}
            >
              Upravit
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center justify-center w-7 h-7 bg-white border border-black text-black hover:bg-black hover:text-white transition-all duration-200"
              aria-label="Smazat sekci"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          )}
        </div>
      )}

      {isAdmin && onAdd && isLastSection && (
        <button
          onClick={onAdd}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs uppercase tracking-wide hover:bg-gray-800 transition-all duration-200 z-10"
          style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '10px', letterSpacing: '0.08em' }}
        >
          + Přidat sekci
        </button>
      )}
    </section>
  );
}

function AnimatedButton({ text, link, textColor = 'black' }: { text: string; link: string; textColor?: 'black' | 'white' }) {
  const [isHovered, setIsHovered] = useState(false);

  const buttonClasses = textColor === 'white' 
    ? "relative overflow-hidden bg-white text-black font-normal uppercase tracking-tight transition-all border border-white text-sm"
    : "relative overflow-hidden bg-white text-black font-normal uppercase tracking-tight transition-all border border-black text-sm";

  return (
    <a
      href={link}
      className={`${buttonClasses} whitespace-nowrap`}
      style={{ 
        borderRadius: '4px', 
        padding: '11.8px 25.6px',
        fontSize: 'clamp(10px, 3vw, 12px)',
        paddingLeft: 'clamp(12px, 4vw, 25.6px)',
        paddingRight: 'clamp(12px, 4vw, 25.6px)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        className="block transition-all duration-200"
        style={{
          transform: isHovered ? 'translateY(-150%)' : 'translateY(0)',
          opacity: isHovered ? 0 : 1,
        }}
      >
        {text}
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-200"
        style={{
          transform: isHovered ? 'translateY(0)' : 'translateY(150%)',
          opacity: isHovered ? 1 : 0,
        }}
      >
        {text}
      </span>
    </a>
  );
}
