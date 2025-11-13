import { ReactNode } from 'react';

interface PageFrameProps {
  children: ReactNode;
}

export default function PageFrame({ children }: PageFrameProps) {
  return (
    <div className="relative min-h-screen bg-white">
      {/* Left vertical line - positioned 40px left from 1/3 width, from header to footer */}
      <div 
        className="absolute w-px bg-black z-0" 
        style={{ 
          left: 'calc(33.33% - 40px)',
          top: '0px',
          bottom: '0px'
        }} 
      />
      
      {/* Right vertical line - positioned 40px right from 2/3 width, from header to footer */}
      <div 
        className="absolute w-px bg-black z-0" 
        style={{ 
          left: 'calc(66.66% + 40px)',
          top: '0px',
          bottom: '0px'
        }} 
      />

      {/* Content wrapper */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
