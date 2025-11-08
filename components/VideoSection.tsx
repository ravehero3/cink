'use client';

import { useState, useRef, useEffect } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';

interface VideoSectionProps {
  videoUrl: string;
  isAdmin?: boolean;
  onEdit?: () => void;
  sectionId: string;
}

export default function VideoSection({ videoUrl, isAdmin, onEdit, sectionId }: VideoSectionProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className="w-full relative bg-black" style={{ height: '80vh' }}>
      {videoUrl ? (
        <>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            loop
            autoPlay
            muted={isMuted}
            playsInline
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
          
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={toggleMute}
              className="w-10 h-10 bg-white/90 hover:bg-white flex items-center justify-center transition-colors"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 bg-white/90 hover:bg-white flex items-center justify-center transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white">
          <p className="text-xl">No video uploaded</p>
        </div>
      )}

      {isAdmin && (
        <div className="absolute top-4 right-4">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-white text-black text-xs uppercase hover:bg-black hover:text-white transition-colors border border-white"
          >
            Edit Video
          </button>
        </div>
      )}
    </section>
  );
}
