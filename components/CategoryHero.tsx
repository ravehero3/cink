'use client';

import { useState, useRef, useEffect } from 'react';

interface CategoryHeroProps {
  title: string;
  imageUrl?: string;
}

function isVideoUrl(url: string): boolean {
  if (!url) return false;
  
  const lowercaseUrl = url.toLowerCase();
  
  const urlWithoutQuery = lowercaseUrl.split('?')[0];
  const videoExtensions = ['.mp4', '.webm', '.mov', '.m4v'];
  const hasVideoExtension = videoExtensions.some(ext => urlWithoutQuery.endsWith(ext));
  
  const isCloudinaryVideo = lowercaseUrl.includes('/video/upload/');
  
  return hasVideoExtension || isCloudinaryVideo;
}

export default function CategoryHero({ title, imageUrl }: CategoryHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isVideo = imageUrl ? isVideoUrl(imageUrl) : false;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setVideoError(false);
    setVideoLoaded(false);
  }, [imageUrl]);

  useEffect(() => {
    if (isVideo && videoRef.current) {
      const timer = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.defaultMuted = true;
          videoRef.current.muted = true;
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [imageUrl, isVideo]);

  const showVideo = isVideo && !videoError;

  return (
    <div>
      {/* White Title Bar - 5x header height (44px * 5 = 220px) */}
      <div 
        className="bg-white border-b border-black flex items-center justify-center"
        style={{ height: 'calc(5 * 44px)' }}
      >
        <h1 
          className="uppercase text-center"
          style={{ 
            fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '22px',
            fontWeight: 700,
            lineHeight: '1.2',
            letterSpacing: '0.03em',
            fontStretch: 'condensed',
            color: '#000000',
            margin: '0',
            padding: '0',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          {title}
        </h1>
      </div>

      {/* Hero Media - square on mobile, 50vh on desktop */}
      {imageUrl && (
        <div 
          className="w-full border-b border-black relative overflow-hidden"
          style={{ 
            height: isMobile ? '100vw' : '50vh',
            maxHeight: isMobile ? '100vw' : 'none',
            backgroundColor: 'transparent',
          }}
        >
          <div 
            className="absolute inset-0 overflow-hidden"
            style={{ backgroundColor: 'transparent' }}
          >
            {showVideo && (
              <video
                key={imageUrl}
                ref={videoRef}
                className="absolute"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) translateZ(0)',
                  WebkitTransform: 'translate(-50%, -50%) translateZ(0)',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
                loop
                autoPlay
                muted
                playsInline
                preload="auto"
                onError={() => setVideoError(true)}
                onLoadedData={() => setVideoLoaded(true)}
                onCanPlay={() => setVideoLoaded(true)}
              >
                <source src={imageUrl} />
              </video>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
