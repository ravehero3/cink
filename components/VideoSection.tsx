'use client';

import { useState, useRef, useEffect } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';

interface VideoSectionProps {
  videoUrl: string;
  headerText?: string;
  button1Text?: string;
  button2Text?: string;
  button1Link?: string;
  button2Link?: string;
  isAdmin?: boolean;
  onEdit?: () => void;
  sectionId: string;
}

export default function VideoSection({ videoUrl, headerText, button1Text, button2Text, button1Link, button2Link, isAdmin, onEdit, sectionId }: VideoSectionProps) {
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
          
          <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center px-4">
            {headerText && (
              <h2 className="uppercase tracking-tighter text-white mb-[8px]" style={{
                fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '22px',
                fontWeight: 700,
                lineHeight: '1.1'
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

function AnimatedButton({ text, link }: { text: string; link: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={link}
      className="relative overflow-hidden bg-white text-black font-normal uppercase tracking-tight transition-all border border-black text-sm"
      style={{ borderRadius: '4px', padding: '13.8px 25.6px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        className="block transition-all duration-300"
        style={{
          transform: isHovered ? 'translateY(-150%)' : 'translateY(0)',
          opacity: isHovered ? 0 : 1,
        }}
      >
        {text}
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
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
