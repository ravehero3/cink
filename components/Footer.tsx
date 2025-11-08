'use client';

import { useState } from 'react';
import Link from 'next/link';
import NewsletterWindow from './NewsletterWindow';

export default function Footer() {
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);

  return (
    <>
      <footer className="bg-white border-t border-black mt-3xl">
        <div className="max-w-container mx-auto px-lg py-xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-8">
              <button
                onClick={() => setIsNewsletterOpen(true)}
                className="text-small uppercase tracking-wider hover:opacity-70 transition-opacity"
              >
                Newsletter
              </button>
              <Link href="/ucet" className="text-small uppercase tracking-wider hover:opacity-70 transition-opacity">
                Account
              </Link>
              <Link href="/prihlaseni" className="text-small uppercase tracking-wider hover:opacity-70 transition-opacity">
                Login
              </Link>
            </div>
            
            <p className="text-small">© 2026 UFO SPORT</p>
          </div>
        </div>
      </footer>

      <NewsletterWindow 
        isOpen={isNewsletterOpen} 
        onClose={() => setIsNewsletterOpen(false)} 
      />
    </>
  );
}
