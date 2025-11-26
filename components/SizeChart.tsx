'use client';

interface SizeChartProps {
  imageUrl?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SizeChart({ imageUrl, isOpen, onClose }: SizeChartProps) {
  if (!isOpen || !imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-black p-4 flex justify-between items-center">
          <h2 
            className="uppercase"
            style={{
              fontFamily: 'BB-CondBold, "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '18px',
              letterSpacing: '0.03em',
            }}
          >
            Tabulka velikostí
          </h2>
          <button
            onClick={onClose}
            className="text-2xl leading-none hover:opacity-50"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          <img 
            src={imageUrl} 
            alt="Size Chart" 
            className="w-full h-auto"
            style={{ aspectRatio: '16/9', objectFit: 'cover' }}
          />
        </div>
      </div>
    </div>
  );
}

export type { SizeChartProps };
