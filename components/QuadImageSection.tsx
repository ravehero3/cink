'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Upload, X } from 'lucide-react';
import MediaSelector from './MediaSelector';

interface QuadImageItem {
  image: string;
  hoverImage: string;
  text: string;
  link: string;
}

interface QuadImageSectionProps {
  items: QuadImageItem[];
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onAdd?: () => void;
  isLastSection?: boolean;
}

function QuadImageCard({
  item,
  index,
  isAdmin,
}: {
  item: QuadImageItem;
  index: number;
  isAdmin?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const content = (
    <div
      className="flex flex-col cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative overflow-hidden bg-gray-100"
        style={{ aspectRatio: '3/4', transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)' }}
      >
        {item.image ? (
          <>
            <img
              src={item.image}
              alt={item.text || `Image ${index + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                transition: 'opacity 0.4s ease',
                opacity: isHovered && item.hoverImage ? 0 : 1,
              }}
            />
            {item.hoverImage && (
              <img
                src={item.hoverImage}
                alt={`${item.text || `Image ${index + 1}`} detail`}
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  transition: 'opacity 0.4s ease',
                  opacity: isHovered ? 1 : 0,
                }}
              />
            )}
          </>
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center border border-dashed border-gray-300"
            style={{ transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)', transform: isHovered ? 'scale(1.03)' : 'scale(1)' }}
          >
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mb-2">
              <Upload size={18} className="text-gray-400" />
            </div>
            {isAdmin && (
              <p
                className="text-center px-4"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '11px',
                  color: '#999',
                }}
              >
                Klikněte na upravit pro nahrání
              </p>
            )}
          </div>
        )}
        <div
          className="absolute inset-0"
          style={{
            transform: isHovered ? 'scale(1.03)' : 'scale(1)',
            transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
      {item.text && (
        <p
          className="mt-3 text-center"
          style={{
            fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '13px',
            fontWeight: 400,
            letterSpacing: '0.02em',
            lineHeight: '1.4',
          }}
        >
          {item.text}
        </p>
      )}
      {!item.text && isAdmin && (
        <p
          className="mt-3 text-center"
          style={{
            fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '13px',
            color: '#ccc',
          }}
        >
          Text obrázku
        </p>
      )}
    </div>
  );

  if (item.link) {
    return (
      <Link href={item.link} className="block" style={{ transform: isHovered ? 'translateY(-2px)' : 'translateY(0)', transition: 'transform 0.3s ease' }}>
        {content}
      </Link>
    );
  }

  return <div>{content}</div>;
}

export default function QuadImageSection({
  items,
  isAdmin,
  onEdit,
  onDelete,
  onAdd,
  isLastSection,
}: QuadImageSectionProps) {
  const safeItems: QuadImageItem[] = Array.from({ length: 4 }, (_, i) =>
    items[i] || { image: '', hoverImage: '', text: '', link: '' }
  );

  return (
    <section className="relative w-full bg-white">
      <div
        style={{
          paddingLeft: '88px',
          paddingRight: '88px',
          paddingTop: '56px',
          paddingBottom: '56px',
        }}
        className="max-w-[100vw] overflow-hidden"
      >
        <style jsx>{`
          @media (max-width: 768px) {
            .quad-grid {
              padding-left: 16px !important;
              padding-right: 16px !important;
              gap: 12px !important;
            }
          }
        `}</style>
        <div
          className="grid quad-grid"
          style={{
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px',
          }}
        >
          {safeItems.map((item, i) => (
            <QuadImageCard key={i} item={item} index={i} isAdmin={isAdmin} />
          ))}
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
          {isLastSection && onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs uppercase tracking-wide hover:bg-gray-800 transition-all duration-200"
              style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '10px', letterSpacing: '0.08em' }}
            >
              + Přidat sekci
            </button>
          )}
        </div>
      )}
    </section>
  );
}
