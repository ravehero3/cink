'use client';

import { useEffect, useRef, useState } from 'react';

interface VideoPromoProps {
  videoUrl?: string;
}

export default function VideoPromo({ videoUrl }: VideoPromoProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.5 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  if (!videoUrl) return null;

  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  
  const embedUrl = isYouTube
    ? videoUrl.replace('watch?v=', 'embed/') + '?autoplay=' + (isVisible ? '1' : '0') + '&mute=1&loop=1&controls=0'
    : videoUrl;

  return (
    <div ref={videoRef} className="h-videopromo bg-black border-b border-black relative overflow-hidden">
      {isYouTube ? (
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
          style={{ border: 'none' }}
        />
      ) : (
        <video
          key={videoUrl}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
