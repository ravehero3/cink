'use client';

import type { Metadata } from "next";
import { usePathname } from "next/navigation";
import "./globals.css";
import Header1 from "@/components/Header1";
import Footer from "@/components/Footer";
import SessionProvider from "@/components/SessionProvider";
import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPokladna = pathname === '/pokladna';
  const isAdmin = pathname.startsWith('/admin');

  return (
    <html lang="cs">
      <head>
        <Script 
          src="https://widget.packeta.com/v6/www/js/packetaWidget.js" 
          strategy="afterInteractive"
          onError={() => console.error('Failed to load Zasilkovna widget')}
          onLoad={() => console.log('Zasilkovna widget loaded successfully')}
        />
      </head>
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
