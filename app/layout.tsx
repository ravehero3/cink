'use client';

import type { Metadata } from "next";
import { usePathname } from "next/navigation";
import "./globals.css";
import Header1 from "@/components/Header1";
import Footer from "@/components/Footer";
import SessionProvider from "@/components/SessionProvider";
import LiveOfferBar from "@/components/LiveOfferBar";
import { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPokladna = pathname === '/pokladna';
  const isAdmin = pathname.startsWith('/admin');
  const [hasOffer, setHasOffer] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleOffer = (e: any) => setHasOffer(e.detail);
    const handleSearch = (e: any) => setIsSearchOpen(e.detail);
    
    window.addEventListener('live-offer-status', handleOffer);
    window.addEventListener('search-bar-status', handleSearch);
    
    return () => {
      window.removeEventListener('live-offer-status', handleOffer);
      window.removeEventListener('search-bar-status', handleSearch);
    };
  }, []);

  useEffect(() => {
    // Load Zasilkovna widget script
    if (typeof window === 'undefined') return;
    
    if ((window as any).Packeta?.Widget?.pick) {
      return;
    }

    if (document.getElementById('zasilkovna-script')) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'zasilkovna-script';
    script.src = 'https://widget.packeta.com/v6/www/js/library.js';
    script.async = true;
    script.onload = () => console.log('Zasilkovna widget loaded');
    script.onerror = () => console.error('Failed to load Zasilkovna widget');
    document.head.appendChild(script);

    // Load PPL widget script and CSS
    if (!document.getElementById('ppl-widget-script')) {
      const pplScript = document.createElement('script');
      pplScript.id = 'ppl-widget-script';
      pplScript.src = 'https://www.ppl.cz/sources/map/main.js';
      pplScript.async = true;
      pplScript.onload = () => console.log('PPL widget loaded');
      pplScript.onerror = () => console.error('Failed to load PPL widget');
      document.head.appendChild(pplScript);

      const pplStyle = document.createElement('link');
      pplStyle.rel = 'stylesheet';
      pplStyle.href = 'https://www.ppl.cz/sources/map/main.css';
      document.head.appendChild(pplStyle);
    }
  }, []);

  return (
    <html lang="cs">
      <body 
        className="min-h-screen flex flex-col transition-[padding-top] duration-500" 
        style={{paddingTop: isAdmin ? '0' : `${44 + (isSearchOpen ? 44 : 0) + (hasOffer ? 44 : 0)}px`}}
      >
        <SessionProvider>
          <Header1 />
          {!isAdmin && <LiveOfferBar onVisibilityChange={setHasOffer} />}
          <main className="flex-1">{children}</main>
          {!isPokladna && !isAdmin && <Footer />}
        </SessionProvider>
      </body>
    </html>
  );
}
