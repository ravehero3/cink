'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronUp, ChevronDown, X, Plus } from 'lucide-react';
import CarouselImagePicker from './CarouselImagePicker';

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
  const [showPicker, setShowPicker] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
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
      if (moved) {
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

  const handlePickerClose = () => {
    setShowPicker(false);
    // Refresh slides
    const refreshSlides = async () => {
      try {
        const res = await fetch('/api/carousel?_t=' + Date.now());
        if (res.ok) {
          const data = await res.json();
          setSlides(data.slides || []);
        }
      } catch (error) {
        console.error('Error refreshing slides:', error);
      }
    };
    refreshSlides();
  };

  if (loading) {
    return <div className="w-full h-80 bg-gray-100 flex items-center justify-center">Loading carousel...</div>;
  }

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
          cursor: moved ? 'grabbing' : 'grab',
          aspectRatio: '2576 / 584',
        }}
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {slides.length === 0 ? (
          // Empty state
          <div
            className="flex-shrink-0 w-full h-full relative overflow-hidden bg-gray-100 flex items-center justify-center"
            style={{ aspectRatio: '2576 / 584', scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
          >
            <button
              type="button"
              className="flex flex-col items-center justify-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => isAdmin && setShowPicker(true)}
              disabled={!isAdmin}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  border: '3px solid #000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  fontWeight: 300,
                  color: '#000',
                  backgroundColor: '#fff',
                }}
              >
                +
              </div>
              <span
                style={{
                  fontSize: '13px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  color: '#000',
                }}
              >
                Add Carousel Image
              </span>
            </button>
          </div>
        ) : (
          slides.map((slide, i) => (
            <div
              key={slide.id}
              className="flex-shrink-0 w-full relative overflow-hidden bg-white group"
              style={{ aspectRatio: '2576 / 584', scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slides.length}`}
            >
              {slide.image ? (
                <a
                  href={slide.link || '#'}
                  className="absolute inset-0 block"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <img
                    src={slide.image}
                    alt="Carousel slide"
                    className="w-full h-full object-cover transition-transform duration-1200 group-hover:scale-[1.015]"
                    draggable={false}
                    loading={i > 0 ? 'lazy' : 'eager'}
                  />
                </a>
              ) : null}

              {/* Remove button - only show for admin */}
              {isAdmin && (
                <button
                  type="button"
                  className="absolute right-12 bottom-11 z-10 w-7 h-7 bg-white border border-black hover:bg-black hover:text-white transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!confirm('Remove this slide?')) return;
                    handleRemoveSlide(slide.id);
                  }}
                  disabled={slides.length === 1 || slide.isProtected}
                  title={slide.isProtected ? 'Protected slides cannot be removed' : slides.length === 1 ? 'At least one slide required' : 'Remove slide'}
                  aria-label={`Remove slide ${i + 1}`}
                >
                  <X size={14} strokeWidth={1.5} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination dots */}
      {slides.length > 0 && (
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
          {isAdmin && (
            <button
              type="button"
              className="ml-1 text-white hover:scale-125 transition-transform"
              onClick={() => setShowPicker(true)}
              aria-label="Add a new slide"
              style={{ fontSize: '15px', lineHeight: '1', fontWeight: 300 }}
            >
              +
            </button>
          )}
        </div>
      )}

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

      {/* Image Picker Modal */}
      {showPicker && (
        <CarouselImagePicker onSelect={() => {}} onClose={handlePickerClose} />
      )}
    </section>
  );
}
