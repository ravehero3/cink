'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { X } from 'lucide-react';
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
  isAdmin: isAdminProp,
  onEdit,
  onDelete,
  onAdd,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  isLastSection,
}: HeroCarouselProps) {
  const { data: session } = useSession();
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const downRef = useRef(false);
  const startXRef = useRef(0);
  const startLeftRef = useRef(0);
  const movedRef = useRef(false);
  const userInteractionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  // isAdmin from prop OR session
  const isLoggedInAdmin = isAdminProp || session?.user?.role === 'ADMIN';
  const hasSlides = slides.length > 0 && slides.some(s => s.image);

  useEffect(() => {
    if (isLoggedInAdmin) {
      console.log('✓ Admin detected in HeroCarousel');
    } else {
      console.log('✗ Not admin in HeroCarousel', { isAdminProp, sessionRole: session?.user?.role });
    }
  }, [isLoggedInAdmin, isAdminProp, session]);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch carousel slides
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch('/api/carousel?_t=' + Date.now());
        if (res.ok) {
          const data = await res.json();
          console.log('✓ Fetched carousel slides:', data.slides?.length, 'slides');
          setSlides(data.slides || []);
        }
      } catch (error) {
        console.error('✗ Error fetching carousel slides:', error);
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
    
    // Pause auto-advance on scroll
    setIsUserInteracting(true);
    if (userInteractionTimeoutRef.current) clearTimeout(userInteractionTimeoutRef.current);
    userInteractionTimeoutRef.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, 8000);
  }, []);

  // Handle keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      setIsUserInteracting(true);
      if (userInteractionTimeoutRef.current) clearTimeout(userInteractionTimeoutRef.current);
      userInteractionTimeoutRef.current = setTimeout(() => {
        setIsUserInteracting(false);
      }, 8000);
    }
    if (e.key === 'ArrowRight') goTo(active + 1);
    if (e.key === 'ArrowLeft') goTo(active - 1);
  };

  // Handle mouse drag
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    if (!trackRef.current) return;
    downRef.current = true;
    movedRef.current = false;
    startXRef.current = e.clientX;
    startLeftRef.current = trackRef.current.scrollLeft;
    
    // Pause auto-advance on user interaction
    setIsUserInteracting(true);
    if (userInteractionTimeoutRef.current) clearTimeout(userInteractionTimeoutRef.current);
    userInteractionTimeoutRef.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, 8000);
  };

  // Auto-advance carousel every 6 seconds, pause on user interaction
  useEffect(() => {
    if (!hasSlides || slides.length <= 1 || isUserInteracting) return;

    const interval = setInterval(() => {
      setActive((prev) => {
        const next = (prev + 1) % slides.length;
        setTimeout(() => {
          if (!trackRef.current) return;
          trackRef.current.scrollTo({
            left: next * trackRef.current.clientWidth,
            behavior: 'smooth',
          });
        }, 0);
        return next;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [hasSlides, slides.length, isUserInteracting]);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!downRef.current || !trackRef.current) return;
      const dx = e.clientX - startXRef.current;
      if (Math.abs(dx) > 5) {
        movedRef.current = true;
        trackRef.current.classList.add('is-dragging');
      }
      if (movedRef.current) {
        trackRef.current.scrollLeft = startLeftRef.current - dx;
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!downRef.current || !trackRef.current) return;
      downRef.current = false;
      trackRef.current.classList.remove('is-dragging');
      if (movedRef.current) {
        const dx = e.clientX - startXRef.current;
        const w = trackRef.current.clientWidth;
        let target = Math.round(startLeftRef.current / w);
        if (Math.abs(dx) > w * 0.12) target += dx < 0 ? 1 : -1;
        goTo(target);
        movedRef.current = false;
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [goTo]);

  const handleRemoveSlide = async (slideId: string) => {
    if (slides.length <= 1) return;

    try {
      const res = await fetch(`/api/carousel/${slideId}`, { method: 'DELETE' });
      if (res.ok) {
        const newSlides = slides.filter((s) => s.id !== slideId);
        setSlides(newSlides);
        setActive(Math.max(0, active - 1));
      }
    } catch (error) {
      console.error('Error removing slide:', error);
    }
  };

  const handlePickerClose = () => {
    console.log('Picker closed, refreshing slides...');
    setShowPicker(false);
    // Refresh slides immediately
    const refreshSlides = async () => {
      try {
        const res = await fetch('/api/carousel?_t=' + Date.now());
        if (res.ok) {
          const data = await res.json();
          console.log('✓ Refreshed carousel slides:', data.slides?.length, 'slides');
          setSlides(data.slides || []);
          // Auto-navigate to the new slide
          if (data.slides && data.slides.length > 0) {
            setTimeout(() => goTo(data.slides.length - 1), 100);
          }
        }
      } catch (error) {
        console.error('✗ Error refreshing slides:', error);
      }
    };
    refreshSlides();
  };

  if (loading) {
    return <div className="w-full bg-gray-100 flex items-center justify-center border-b border-black" style={{ aspectRatio: isMobile ? '1.2 / 1' : '2576 / 584' }}>Vítejte na ufosport.cz</div>;
  }

  return (
    <section className="w-full relative bg-white border-b border-black overflow-hidden">
      {/* Admin watermark */}
      {isLoggedInAdmin && (
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
          ✓ ADMIN | Desktop: 2576×584 | Mobile: 4:5
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
          aspectRatio: isMobile ? '1.2 / 1' : '2576 / 584',
        }}
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {!hasSlides ? (
          // Empty state - show + button for admin
          <div
            className="flex-shrink-0 w-full h-full flex items-center justify-center bg-gray-100"
            style={{ aspectRatio: isMobile ? '16 / 9' : '2576 / 584', scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
          >
            {isLoggedInAdmin ? (
              <button
                type="button"
                className="flex flex-col items-center justify-center gap-4 cursor-pointer hover:opacity-70 transition-opacity"
                onClick={() => {
                  console.log('✓ + button clicked, opening picker');
                  setShowPicker(true);
                }}
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
                <span style={{ fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, color: '#000' }}>
                  Add Carousel Image
                </span>
              </button>
            ) : (
              <span style={{ color: '#999', fontSize: '14px' }}>No carousel images</span>
            )}
          </div>
        ) : (
          slides.map((slide, i) => (
            <div
              key={slide.id}
              className="flex-shrink-0 w-full relative overflow-hidden bg-white group"
              style={{ aspectRatio: isMobile ? '1.2 / 1' : '2576 / 584', scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slides.length}`}
            >
              {/* Image */}
              {slide.image && (
                <a
                  href={slide.link || '#'}
                  className="absolute inset-0 block"
                  style={{ textDecoration: 'none' }}
                >
                  <img
                    src={slide.image}
                    alt="Carousel slide"
                    className="w-full h-full object-cover"
                    style={{ transition: 'transform 1.2s cubic-bezier(.22, 1, .36, 1)' }}
                    draggable={false}
                    loading={i > 0 ? 'lazy' : 'eager'}
                    onMouseEnter={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      img.style.transform = 'scale(1.015)';
                    }}
                    onMouseLeave={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      img.style.transform = 'scale(1)';
                    }}
                  />
                </a>
              )}

              {/* Remove button */}
              {isLoggedInAdmin && (
                <button
                  type="button"
                  className="absolute right-12 bottom-11 z-10 w-7 h-7 bg-white border border-black hover:bg-black hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!confirm('Remove this slide?')) return;
                    handleRemoveSlide(slide.id);
                  }}
                  disabled={slides.length === 1}
                  title={slides.length === 1 ? 'At least one slide required' : 'Remove slide'}
                >
                  <X size={14} strokeWidth={1.5} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination dots */}
      {hasSlides && (
        <div className="absolute left-1/2 bottom-3 z-10 flex items-center" style={{ transform: 'translateX(-50%)', gap: '4px' }}>
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className="flex items-center justify-center hover:scale-150 transition-transform"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === active ? 'true' : 'false'}
              style={{ width: '12px', height: '12px', padding: '0', margin: '0' }}
            >
              <div
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  border: '1.5px solid white',
                  backgroundColor: i === active ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
                  transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              />
            </button>
          ))}
          {isLoggedInAdmin && (
            <button
              type="button"
              className="ml-1 text-white hover:scale-125 transition-transform"
              onClick={() => {
                console.log('✓ + dot clicked, opening picker');
                setShowPicker(true);
              }}
              style={{ fontSize: '15px', lineHeight: '1', fontWeight: 300 }}
            >
              +
            </button>
          )}
        </div>
      )}

      {/* Admin controls */}
      {isLoggedInAdmin && (
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          {onMoveUp && canMoveUp && (
            <button
              onClick={onMoveUp}
              className="px-3 py-1.5 bg-white border border-black text-black text-xs uppercase tracking-wide hover:bg-black hover:text-white transition-all"
              title="Move up"
            >
              ↑
            </button>
          )}
          {onMoveDown && canMoveDown && (
            <button
              onClick={onMoveDown}
              className="px-3 py-1.5 bg-white border border-black text-black text-xs uppercase tracking-wide hover:bg-black hover:text-white transition-all"
              title="Move down"
            >
              ↓
            </button>
          )}
        </div>
      )}

      {/* Image Picker Modal */}
      {showPicker && <CarouselImagePicker onSelect={() => {}} onClose={handlePickerClose} />}
    </section>
  );
}
