'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  category: string;
}

interface VideoSectionProps {
  videoUrl: string;
  mobileVideoUrl?: string;
  headerText?: string;
  button1Text?: string;
  button2Text?: string;
  button1Link?: string;
  button2Link?: string;
  isAdmin?: boolean;
  onEdit?: () => void;
  onEditCategory?: () => void;
  sectionId: string;
  showProducts?: boolean;
  products?: Product[];
  isLoading?: boolean;
}

export default function VideoSection({ videoUrl, mobileVideoUrl, headerText, button1Text, button2Text, button1Link, button2Link, isAdmin, onEdit, onEditCategory, sectionId, showProducts, products = [], isLoading = false }: VideoSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.load();
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          video.muted = true;
          video.play().catch(() => setVideoError(true));
        });
      }
    }
  }, [videoUrl, mobileVideoUrl, isMobile]);

  const currentVideoUrl = isMobile && mobileVideoUrl ? mobileVideoUrl : videoUrl;

  const hasVideo = currentVideoUrl && !videoError;

  return (
    <>
      <section className={`w-full relative border-b border-black min-h-[50vh] md:h-[80vh] ${hasVideo ? 'bg-black' : 'bg-white'}`}>
        {hasVideo ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              style={{
                WebkitTransform: 'translateZ(0)',
                transform: 'translateZ(0)',
                objectFit: 'cover'
              }}
              loop
              autoPlay
              muted
              playsInline
              preload="auto"
              webkit-playsinline="true"
              onError={() => setVideoError(true)}
            >
              <source src={currentVideoUrl} type="video/mp4; codecs=avc1.42E01E,mp4a.40.2" />
              <source src={currentVideoUrl} type="video/mp4" />
              {currentVideoUrl.includes('.mp4') && (
                <source src={currentVideoUrl.replace('.mp4', '.webm')} type="video/webm" />
              )}
            </video>
            
            <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center px-4">
              {headerText && (
                <h2 className="uppercase text-white mb-[8px]" style={{
                  fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '22px',
                  fontWeight: 700,
                  lineHeight: '22px',
                  letterSpacing: '0.03em',
                  fontStretch: 'condensed'
                }}>
                  {headerText}
                </h2>
              )}
              {button1Text && button2Text && (
                <div className="flex gap-1">
                  <AnimatedButton text={button1Text} link={button1Link || '#'} />
                  <AnimatedButton text={button2Text} link={button2Link || '#'} />
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="w-full h-full flex items-center justify-center text-white">
              <p className="text-xl text-white">No video uploaded</p>
            </div>
            {headerText && (
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
                {button1Text && button2Text && (
                  <div className="flex gap-1">
                    <AnimatedButton text={button1Text} link={button1Link || '#'} />
                    <AnimatedButton text={button2Text} link={button2Link || '#'} />
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {isAdmin && (
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={onEdit}
              className={`px-2 py-1 text-xs uppercase transition-colors border ${hasVideo ? 'bg-white text-black border-white hover:bg-black hover:text-white' : 'bg-black text-white border-black hover:bg-white hover:text-black'}`}
            >
              Edit Video
            </button>
            {onEditCategory && (
              <button
                onClick={onEditCategory}
                className={`px-2 py-1 text-xs uppercase transition-colors border ${hasVideo ? 'bg-white text-black border-white hover:bg-black hover:text-white' : 'bg-black text-white border-black hover:bg-white hover:text-black'}`}
              >
                Edit Section
              </button>
            )}
          </div>
        )}
      </section>
      
      {showProducts && (
        <section className="w-full border-b border-black" style={{ minHeight: '50vh' }}>
          <div className="w-full overflow-x-auto bg-white scrollbar-hide" style={{ height: '50vh' }}>
            <div className="flex gap-0 h-full">
              {isLoading ? (
                <div className="w-full py-2xl text-center text-sm">Loading...</div>
              ) : products.length === 0 ? (
                <div className="w-full py-2xl text-center text-sm">No products in this category</div>
              ) : (
                products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/produkty/${product.slug}`}
                    className="flex-shrink-0 w-[300px] border-r border-black hover:bg-gray-50 transition-colors group h-full flex flex-col"
                  >
                    <div className="flex-1 relative bg-gray-100 border-b border-black overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="300px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="p-sm flex-shrink-0">
                      <h3 className="text-product-name font-bold uppercase tracking-tighter mb-1">
                        {product.name}
                      </h3>
                      <p className="text-sm">{product.price} Kč</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function AnimatedButton({ text, link }: { text: string; link: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={link}
      className="relative overflow-hidden bg-white text-black font-normal uppercase tracking-tight transition-all border border-black text-sm"
      style={{ borderRadius: '4px', padding: '11.8px 25.6px' }}
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
