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
  const isVideo = imageUrl ? isVideoUrl(imageUrl) : false;

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
      {/* White Title Bar - 6x header height */}
      <div 
        className="bg-white border-b border-black flex items-center justify-center"
        style={{ height: 'calc(6 * 44px)' }}
      >
        <h1 
          className="text-page-title font-bold text-center uppercase tracking-tighter w-full"
          style={{ margin: 0 }}
        >
          {title}
        </h1>
      </div>

      {/* Hero Media - 50vh height */}
      {imageUrl && (
        <div 
          className="w-full border-b border-black bg-black relative"
          style={{ height: '50vh' }}
        >
          {showVideo && (
            <video
              ref={videoRef}
              className="w-full h-full object-cover absolute inset-0"
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
              className={`w-full h-full object-cover ${showVideo && videoLoaded ? 'hidden' : ''}`}
              style={{ 
                filter: 'grayscale(1) contrast(1.2)',
              }}
              onError={() => {}}
            />
          )}
        </div>
      )}
    </div>
  );
}
