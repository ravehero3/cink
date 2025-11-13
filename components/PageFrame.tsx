import { ReactNode } from 'react';

interface PageFrameProps {
  children: ReactNode;
}

export default function PageFrame({ children }: PageFrameProps) {
  return (
    <div className="relative min-h-screen bg-white">
      {/* Left vertical line - positioned at 1/3 width, from 40px to 50% height */}
      <div 
        className="absolute w-px bg-black z-0" 
        style={{ 
          left: '33.33%',
          top: '40px',
          height: 'calc(50% - 40px)'
        }} 
      />
      
      {/* Right vertical line - positioned at 2/3 width, from 40px to 50% height */}
      <div 
        className="absolute w-px bg-black z-0" 
        style={{ 
          left: '66.66%',
          top: '40px',
          height: 'calc(50% - 40px)'
        }} 
      />

      {/* Content wrapper */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
