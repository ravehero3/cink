'use client';

import type { Metadata } from "next";
import { usePathname } from "next/navigation";
import "./globals.css";
import Header1 from "@/components/Header1";
import Footer from "@/components/Footer";
import SessionProvider from "@/components/SessionProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPokladna = pathname === '/pokladna';

  return (
    <html lang="cs">
      <body className="min-h-screen flex flex-col" style={{paddingTop: '44px'}}>
        <SessionProvider>
          <Header1 />
          <main className="flex-1">{children}</main>
          {!isPokladna && <Footer />}
        </SessionProvider>
      </body>
    </html>
  );
}
