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
    if (isVideo && videoRef.current && !videoError) {
      videoRef.current.load();
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch(() => setVideoError(true));
          }
        });
      }
    }
  }, [imageUrl, isVideo, videoError]);

  const showVideo = isVideo && !videoError;

  return (
    <div>
      {/* White Title Bar - 4x header height (44px * 4 = 176px) */}
      <div 
        className="bg-white border-b border-black grid place-items-center"
        style={{ height: 'calc(4 * 44px)' }}
      >
        <h1 
          className="text-page-title font-bold uppercase tracking-tighter w-full text-center px-0 m-0"
        >
          {title}
        </h1>
      </div>

      {/* Hero Media - square on mobile, 50vh on desktop */}
      {imageUrl && (
        <div 
          className="w-full border-b border-black bg-white relative overflow-hidden"
          style={{ 
            height: isMobile ? '100vw' : '50vh',
            maxHeight: isMobile ? '100vw' : 'none',
          }}
        >
          <div 
            className="absolute inset-0 overflow-hidden"
            style={{ backgroundColor: 'white' }}
          >
            {showVideo && (
              <video
                ref={videoRef}
                className="absolute"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) translateZ(0)',
                  WebkitTransform: 'translate(-50%, -50%) translateZ(0)',
                  minWidth: '100%',
                  minHeight: '100%',
                  width: isMobile ? 'auto' : '100%',
                  height: isMobile ? '100%' : 'auto',
                  objectFit: 'cover',
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
            {(!showVideo || !videoLoaded) && (
              <img
                src={imageUrl}
                alt={title}
                className={`absolute ${showVideo && videoLoaded ? 'hidden' : ''}`}
                style={{
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  minWidth: '100%',
                  minHeight: '100%',
                  width: isMobile ? 'auto' : '100%',
                  height: isMobile ? '100%' : 'auto',
                  objectFit: 'cover',
                }}
                onError={() => {}}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
