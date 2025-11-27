'use client';

interface CategoryHeroProps {
  title: string;
  imageUrl?: string;
}

export default function CategoryHero({ title, imageUrl }: CategoryHeroProps) {
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

      {/* Hero Image - 50vh height */}
      {imageUrl && (
        <div 
          className="w-full border-b border-black"
          style={{ height: '50vh' }}
        >
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
            style={{ 
              filter: 'grayscale(1) contrast(1.2)',
            }}
          />
        </div>
      )}
    </div>
  );
}
