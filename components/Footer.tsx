'use client';

import { useState } from 'react';
import NewsletterWindow from './NewsletterWindow';

export default function Footer() {
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);

  const handleNewsletterClick = () => {
    setIsNewsletterOpen(true);
  };

  return (
    <>
      <footer className="bg-white">
        <div className="border-t border-black py-10">
          <div className="text-center">
            <button
              onClick={handleNewsletterClick}
              className="text-product-name underline hover:no-underline"
            >
              Přihlašte se k odběru newsletteru
            </button>
          </div>
        </div>

        <div className="h-header border-t border-black flex items-center justify-center">
          <p className="text-[12px] text-black">©2026 ufosport.cz</p>
        </div>
      </footer>

      <NewsletterWindow 
        isOpen={isNewsletterOpen} 
        onClose={() => setIsNewsletterOpen(false)} 
      />
    </>
  );
}
