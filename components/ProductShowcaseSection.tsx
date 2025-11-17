'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductShowcaseSectionProps {
  imageUrl: string;
  headerText: string;
  button1Text: string;
  button2Text: string;
  button1Link: string;
  button2Link: string;
  isAdmin?: boolean;
  onEdit?: () => void;
}

export default function ProductShowcaseSection({
  imageUrl,
  headerText,
  button1Text,
  button2Text,
  button1Link,
  button2Link,
  isAdmin,
  onEdit
}: ProductShowcaseSectionProps) {
  return (
    <section className="w-full relative bg-white" style={{ height: '80vh' }}>
      {imageUrl ? (
        <div className="w-full h-full relative">
          <Image
            src={imageUrl}
            alt="Product Showcase"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-xl text-gray-400">No image uploaded</p>
        </div>
      )}

      <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center px-4">
        <h2 className="uppercase text-black mb-[8px]" style={{
          fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: '22px',
          fontWeight: 700,
          lineHeight: '22px',
          letterSpacing: '0.03em',
          fontStretch: 'condensed'
        }}>
          {headerText}
        </h2>
        <div className="flex gap-1">
          <AnimatedButton text={button1Text} link={button1Link} />
          <AnimatedButton text={button2Text} link={button2Link} />
        </div>
      </div>

      {isAdmin && (
        <div className="absolute top-4 right-4">
          <button
            onClick={onEdit}
            className="px-2 py-1 bg-white text-black text-xs uppercase hover:bg-black hover:text-white transition-colors border border-black"
          >
            Edit Section
          </button>
        </div>
      )}
    </section>
  );
}

function AnimatedButton({ text, link }: { text: string; link: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={link}
      className="relative overflow-hidden bg-white text-black font-normal uppercase tracking-tight transition-all border border-black text-sm"
      style={{ borderRadius: '4px', padding: '13.8px 25.6px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        className="block transition-all duration-300"
        style={{
          transform: isHovered ? 'translateY(-150%)' : 'translateY(0)',
          opacity: isHovered ? 0 : 1,
        }}
      >
        {text}
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
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
