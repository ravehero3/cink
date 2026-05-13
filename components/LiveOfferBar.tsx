'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function LiveOfferBar({ onVisibilityChange }: { onVisibilityChange: (visible: boolean) => void }) {
  const [offer, setOffer] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleSearch = (e: any) => setIsSearchOpen(e.detail);
    window.addEventListener('search-bar-status', handleSearch);
    return () => window.removeEventListener('search-bar-status', handleSearch);
  }, []);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const response = await fetch('/api/admin/live-offer');
        const data = await response.json();
        if (data.isActive) {
          // Check if it should appear on this page
          const isTargetPage = data.targetPages.some((p: string) => 
            p === '*' || pathname === p || (p !== '/' && pathname.startsWith(p))
          );

          if (isTargetPage) {
            setOffer(data);
            handleUserWindow(data);
            onVisibilityChange(true);
          } else {
            setOffer(null);
            onVisibilityChange(false);
          }
        } else {
          setOffer(null);
          onVisibilityChange(false);
        }
      } catch (error) {
        console.error('Error fetching live offer:', error);
        onVisibilityChange(false);
      }
    };

    fetchOffer();
    
    const handleCheck = () => {
      fetchOffer();
    };
    window.addEventListener('check-live-offer', handleCheck);
    return () => window.removeEventListener('check-live-offer', handleCheck);
  }, [pathname]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('live-offer-status', { detail: !!offer }));
  }, [offer]);

  const handleUserWindow = async (data: any) => {
    const offerKey = `live_offer_${data.id}_${data.percentage}`;
    let startTime = localStorage.getItem(`${offerKey}_start`);
    let code = localStorage.getItem(`${offerKey}_code`);

    if (!startTime) {
      startTime = Date.now().toString();
      localStorage.setItem(`${offerKey}_start`, startTime);
      
      // Generate unique code (UFO + 4 random digits)
      const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();
      const uniqueCode = `UFO${randomDigits}`;
      localStorage.setItem(`${offerKey}_code`, uniqueCode);
      code = uniqueCode;

      // Register code in DB
      try {
        await fetch('/api/promo-codes/create-temporary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: uniqueCode,
            discountValue: data.percentage,
            durationMin: data.durationMin
          })
        });
      } catch (error) {
        console.error('Error creating temporary code:', error);
      }
    }

    setPromoCode(code);
    
    const durationMs = data.durationMin * 60 * 1000;
    const elapsed = Date.now() - parseInt(startTime);
    const remaining = Math.max(0, durationMs - elapsed);

    if (remaining > 0) {
      setTimeLeft(remaining);
    } else {
      setOffer(null);
      onVisibilityChange(false);
    }
  };

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev && prev > 1000) return prev - 1000;
        clearInterval(timer);
        setOffer(null);
        onVisibilityChange(false);
        return 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  if (!offer || !timeLeft || timeLeft <= 0) return null;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <div 
      className="fixed left-0 right-0 z-20 bg-white text-black h-header px-3 flex items-center justify-center gap-3 text-center overflow-hidden animate-slide-in border-b border-black"
      style={{ 
        top: isSearchOpen ? '88px' : '44px',
        transition: 'top 0.4s ease-in-out'
      }}
    >
      <div 
        className="whitespace-nowrap uppercase flex items-center"
        style={{
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: 'clamp(9px, 2.8vw, 12px)',
          fontWeight: 400,
          letterSpacing: '0.03em'
        }}
      >
        {offer.text.replace('15', offer.percentage)} 
        <span className="mx-1.5 bg-black text-white px-2 py-0.5 rounded-full font-bold select-all tracking-normal inline-block align-middle leading-none" style={{ fontSize: 'inherit' }}>
          {promoCode}
        </span>
        Váš unikátní kód vyprší za: 
      </div>
      <div 
        className="whitespace-nowrap uppercase flex items-center"
        style={{
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: 'clamp(9px, 2.8vw, 12px)',
          fontWeight: 400,
          letterSpacing: '0.03em'
        }}
      >
        <span className="font-mono bg-black/5 px-1 py-0.5 rounded tabular-nums leading-none">
          {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </span>
      </div>
      
      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
