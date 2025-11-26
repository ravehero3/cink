'use client';

import type { Metadata } from "next";
import { usePathname } from "next/navigation";
import "./globals.css";
import Header1 from "@/components/Header1";
import Footer from "@/components/Footer";
import SessionProvider from "@/components/SessionProvider";
import { useEffect } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPokladna = pathname === '/pokladna';
  const isAdmin = pathname.startsWith('/admin');

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
  }, []);

  return (
    <html lang="cs">
      <body className="min-h-screen flex flex-col" style={{paddingTop: '44px'}}>
        <SessionProvider>
          <Header1 />
          <main className="flex-1">{children}</main>
          {!isPokladna && !isAdmin && <Footer />}
        </SessionProvider>
      </body>
    </html>
  );
}
