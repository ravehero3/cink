'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronUp, ChevronDown, X, Plus } from 'lucide-react';

interface CarouselSlide {
  id: string;
  image: string;
  link: string;
  order: number;
  isProtected: boolean;
}

interface HeroCarouselProps {
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onAdd?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  isLastSection?: boolean;
}

export default function HeroCarousel({
  isAdmin,
  onEdit,
  onDelete,
  onAdd,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  isLastSection,
}: HeroCarouselProps) {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [moved, setMoved] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const downRef = useRef(false);
  const startXRef = useRef(0);
  const startLeftRef = useRef(0);

  // Fetch carousel slides
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch('/api/carousel?_t=' + Date.now());
        if (res.ok) {
          const data = await res.json();
          setSlides(data.slides || []);
          if (data.slides.length === 0) {
            setSlides([{ id: 'empty-1', image: '', link: '', order: 0, isProtected: false }]);
          }
        }
      } catch (error) {
        console.error('Error fetching carousel slides:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  const goTo = useCallback((index: number) => {
    if (!trackRef.current) return;
    const i = Math.max(0, Math.min(slides.length - 1, index));
    trackRef.current.scrollTo({
      left: i * trackRef.current.clientWidth,
      behavior: 'smooth',
    });
  }, [slides.length]);

  // Handle scroll
  const handleScroll = useCallback(() => {
    if (!trackRef.current) return;
    const i = Math.round(trackRef.current.scrollLeft / trackRef.current.clientWidth);
    setActive(i);
  }, []);

  // Handle keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') goTo(active + 1);
    if (e.key === 'ArrowLeft') goTo(active - 1);
  };

  // Handle mouse drag
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    if (!trackRef.current) return;
    downRef.current = true;
    setMoved(false);
    startXRef.current = e.clientX;
    startLeftRef.current = trackRef.current.scrollLeft;
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!downRef.current || !trackRef.current) return;
      const dx = e.clientX - startXRef.current;
      if (Math.abs(dx) > 5) {
        setMoved(true);
        trackRef.current.classList.add('is-dragging');
      }
      if (setMoved) {
        trackRef.current.scrollLeft = startLeftRef.current - dx;
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!downRef.current || !trackRef.current) return;
      downRef.current = false;
      trackRef.current.classList.remove('is-dragging');
      if (moved) {
        const dx = e.clientX - startXRef.current;
        const w = trackRef.current.clientWidth;
        let target = Math.round(startLeftRef.current / w);
        if (Math.abs(dx) > w * 0.12) target += dx < 0 ? 1 : -1;
        goTo(target);
        setMoved(false);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [moved, goTo]);

  const handleSlotClick = (i: number) => {
    setPendingIndex(i);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.currentTarget.files?.[0];
    if (!f || pendingIndex === null) return;

    const formData = new FormData();
    formData.append('file', f);

    try {
      const res = await fetch('/api/carousel/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setPendingIndex(null);
        // Refresh slides
        const refreshRes = await fetch('/api/carousel?_t=' + Date.now());
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          setSlides(refreshData.slides);
          goTo(refreshData.slides.length - 1);
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleRemoveSlide = async (slideId: string) => {
    if (slides.length <= 1) return;

    try {
      const res = await fetch(`/api/carousel/${slideId}`, { method: 'DELETE' });
      if (res.ok) {
        const newSlides = slides.filter((s) => s.id !== slideId);
        setSlides(newSlides);
        setActive(Math.max(0, active - 1));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to remove slide');
      }
    } catch (error) {
      console.error('Error removing slide:', error);
    }
  };

  const handleAddSlide = async () => {
    try {
      const res = await fetch('/api/carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: slides.length }),
      });

      if (res.ok) {
        const data = await res.json();
        setSlides([...slides, data.slide]);
        goTo(slides.length);
      }
    } catch (error) {
      console.error('Error adding slide:', error);
    }
  };

  if (loading) {
    return <div className="w-full h-80 bg-gray-100 flex items-center justify-center">Loading carousel...</div>;
  }

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <section className="w-full relative bg-white border-b border-black overflow-hidden">
      {/* Admin dimensions watermark */}
      {isAdmin && (
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: '#fff',
            padding: '4px 8px',
            fontSize: '10px',
            fontFamily: 'monospace',
            zIndex: 20,
            pointerEvents: 'none',
            borderRadius: '2px',
          }}
        >
          Desktop: 2576×584 | Mobile: 4:5
        </div>
      )}

      {/* Track */}
      <div
        ref={trackRef}
        className="flex overflow-x-auto scroll-snap-mandatory bg-white"
        style={{
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          overscrollBehavior: 'contain',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          cursor: 'grab',
          aspectRatio: '2576 / 584',
        }}
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className="flex-shrink-0 w-full relative overflow-hidden bg-white"
            style={{ aspectRatio: '2576 / 584', scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
          >
            {slide.image ? (
              <a
                href={slide.link || '#'}
                className="absolute inset-0 block group"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <img
                  src={slide.image}
                  alt="Carousel slide"
                  className="w-full h-full object-cover transition-transform duration-1200"
                  style={{ transform: 'scale(1)', groupHover: { transform: 'scale(1.015)' } }}
                  draggable={false}
                  loading={i > 0 ? 'lazy' : 'eager'}
                />
              </a>
            ) : (
              <button
                type="button"
                className="w-full h-full bg-gray-100 hover:bg-gray-50 transition-colors relative cursor-pointer"
                onClick={() => handleSlotClick(i)}
                aria-label={`Add content to slide ${i + 1}`}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div style={{ width: '34px', height: '34px', position: 'relative' }}>
                    <div style={{ width: '100%', height: '1px', background: '#000', position: 'absolute', top: '50%', left: '0' }} />
                    <div style={{ width: '1px', height: '100%', background: '#000', position: 'absolute', left: '50%', top: '0' }} />
                  </div>
                  <span style={{ fontSize: '11px', letterSpacing: '0.28em', textTransform: 'uppercase' }}>
                    Add slide
                  </span>
                </div>
                <span style={{ position: 'absolute', top: '44px', left: '48px', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8c8c8c' }}>
                  {pad(i + 1)} / {pad(slides.length)}
                </span>
              </button>
            )}

            {/* Remove button */}
            <button
              type="button"
              className="absolute right-12 bottom-11 z-10 w-7 h-7 bg-white border border-black hover:bg-black hover:text-white transition-all"
              onClick={(e) => {
                e.stopPropagation();
                if (slide.image && !confirm('Remove this slide?')) return;
                handleRemoveSlide(slide.id);
              }}
              disabled={slides.length === 1 || slide.isProtected}
              title={slide.isProtected ? 'Protected slides cannot be removed' : slides.length === 1 ? 'At least one slide required' : 'Remove slide'}
              aria-label={`Remove slide ${i + 1}`}
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>

      {/* Pagination dots */}
      <div className="absolute left-1/2 bottom-3 z-10 flex items-center gap-1" style={{ transform: 'translateX(-50%)' }}>
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            className="w-5 h-5 flex items-center justify-center hover:scale-150 transition-transform"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === active ? 'true' : 'false'}
          >
            <div
              style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                border: '1px solid white',
                backgroundColor: i === active ? 'white' : 'transparent',
                mixBlendMode: 'difference',
                transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            />
          </button>
        ))}
        <button
          type="button"
          className="ml-1 text-white hover:scale-125 transition-transform"
          onClick={handleAddSlide}
          aria-label="Add a new slide"
          style={{ fontSize: '15px', lineHeight: '1', fontWeight: 300 }}
        >
          +
        </button>
      </div>

      {/* Admin controls */}
      {isAdmin && (
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          {onMoveUp && canMoveUp && (
            <button
              onClick={onMoveUp}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-black text-black text-xs uppercase tracking-wide hover:bg-black hover:text-white transition-all duration-200"
              title="Move section up"
              aria-label="Move up"
            >
              ↑
            </button>
          )}
          {onMoveDown && canMoveDown && (
            <button
              onClick={onMoveDown}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-black text-black text-xs uppercase tracking-wide hover:bg-black hover:text-white transition-all duration-200"
              title="Move section down"
              aria-label="Move down"
            >
              ↓
            </button>
          )}
          {isLastSection && onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs uppercase tracking-wide hover:bg-gray-800 transition-all duration-200"
            >
              + Add section
            </button>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </section>
  );
}
