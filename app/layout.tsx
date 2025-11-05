import type { Metadata } from "next";
import "./globals.css";
import Header1 from "@/components/Header1";
import Header2 from "@/components/Header2";
import Footer from "@/components/Footer";
import SessionProvider from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "UFO Sport - Minimalistický e-shop",
  description: "UFO Sport - Černobílý minimalistický e-shop s oblečením",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body className="min-h-screen flex flex-col">
        <SessionProvider>
          <Header1 />
          <Header2 />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
