'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function LiveOfferBar({ onVisibilityChange }: { onVisibilityChange: (visible: boolean) => void }) {
  const [offer, setOffer] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [endTimeMs, setEndTimeMs] = useState<number | null>(null);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAllowedOnPage, setIsAllowedOnPage] = useState(true);
  const initializingRef = useRef(false);
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
        if (!response.ok) return;
        const data = await response.json();
        if (data.isActive) {
          const isTargetPage = data.targetPages.some((p: string) =>
            p === '*' || pathname === p || (p !== '/' && pathname.startsWith(p))
          );

          if (isTargetPage) {
            setOffer(data);
            await handleUserWindow(data);
          } else {
            setOffer(null);
          }
        } else {
          setOffer(null);
        }
      } catch (error) {
        console.error('Error fetching live offer:', error);
        setOffer(null);
      }
    };

    fetchOffer();

    const handleCheck = () => {
      fetchOffer();
    };
    window.addEventListener('check-live-offer', handleCheck);
    return () => window.removeEventListener('check-live-offer', handleCheck);
  }, []);

  useEffect(() => {
    if (!offer) return;
    const allowed = offer.targetPages.some((p: string) =>
      p === '*' || pathname === p || (p !== '/' && pathname.startsWith(p))
    );
    setIsAllowedOnPage(allowed);
  }, [pathname, offer]);

  const isVisible = !!offer && !!promoCode && !!timeLeft && timeLeft > 0 && isAllowedOnPage;

  useEffect(() => {
    onVisibilityChange(isVisible);
    window.dispatchEvent(new CustomEvent('live-offer-status', { detail: isVisible }));
  }, [isVisible, onVisibilityChange]);

  const syncCodeWithServer = async (offerKey: string, durationMin: number, percentage: number, codeToSync?: string) => {
    const res = await fetch('/api/promo-codes/create-temporary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...(codeToSync ? { code: codeToSync } : {}),
        discountValue: percentage,
        durationMin,
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to create temporary promo code');
    }

    const result = await res.json();
    if (!result.code || !result.validUntil) {
      throw new Error('Invalid temporary promo response');
    }

    const validUntilMs = new Date(result.validUntil).getTime();
    const now = Date.now();
    if (!codeToSync) {
      localStorage.setItem(`${offerKey}_start`, now.toString());
    }
    localStorage.setItem(`${offerKey}_end`, validUntilMs.toString());
    localStorage.setItem(`${offerKey}_code`, result.code);
    localStorage.setItem(`${offerKey}_synced`, '1');

    setPromoCode(result.code);
    setEndTimeMs(validUntilMs);
    setTimeLeft(Math.max(0, validUntilMs - now));
  };

  const handleUserWindow = async (data: any) => {
    if (initializingRef.current) return;
    initializingRef.current = true;

    try {
      const offerKey = `live_offer_${data.id}_${data.percentage}`;
      const startTime = localStorage.getItem(`${offerKey}_start`);
      const storedEnd = localStorage.getItem(`${offerKey}_end`);
      const storedCode = localStorage.getItem(`${offerKey}_code`);
      const isSynced = localStorage.getItem(`${offerKey}_synced`) === '1';

      if (startTime && storedCode) {
        const elapsed = Date.now() - parseInt(startTime, 10);

        // Rule: If more than 7 days passed, reset the offer for the user
        if (elapsed > 7 * 24 * 60 * 60 * 1000) {
          localStorage.removeItem(`${offerKey}_start`);
          localStorage.removeItem(`${offerKey}_end`);
          localStorage.removeItem(`${offerKey}_code`);
          localStorage.removeItem(`${offerKey}_synced`);
          await syncCodeWithServer(offerKey, data.durationMin, data.percentage);
          return;
        }

        const durationMs = data.durationMin * 60 * 1000;
        const estimatedEnd = storedEnd ? parseInt(storedEnd, 10) : parseInt(startTime, 10) + durationMs;
        const remaining = Math.max(0, estimatedEnd - Date.now());

        if (remaining <= 0) {
          setOffer(null);
          setTimeLeft(0);
          setEndTimeMs(null);
          return;
        }

        if (isSynced) {
          try {
            const checkRes = await fetch(`/api/promo-codes/create-temporary?code=${encodeURIComponent(storedCode)}`);
            if (checkRes.ok) {
              const checkData = await checkRes.json();
              if (checkData.used) {
                setOffer(null);
                setTimeLeft(0);
                setEndTimeMs(null);
                return;
              }
              if (checkData.valid && checkData.validUntil) {
                const dbEnd = new Date(checkData.validUntil).getTime();
                localStorage.setItem(`${offerKey}_end`, dbEnd.toString());
                setPromoCode(storedCode);
                setEndTimeMs(dbEnd);
                setTimeLeft(Math.max(0, dbEnd - Date.now()));
                return;
              }
              if (!checkData.exists) {
                const remMin = Math.max(1, Math.ceil(remaining / 60000));
                await syncCodeWithServer(offerKey, remMin, data.percentage, storedCode);
                return;
              }
              setOffer(null);
              setTimeLeft(0);
              setEndTimeMs(null);
              return;
            }
          } catch {
            setPromoCode(storedCode);
            setEndTimeMs(estimatedEnd);
            setTimeLeft(remaining);
            return;
          }
        } else {
          const remMin = Math.max(1, Math.ceil(remaining / 60000));
          await syncCodeWithServer(offerKey, remMin, data.percentage, storedCode);
          return;
        }
      }

      await syncCodeWithServer(offerKey, data.durationMin, data.percentage);
    } catch (error) {
      console.error('Error initializing live offer code:', error);
      setOffer(null);
      setTimeLeft(0);
    } finally {
      initializingRef.current = false;
    }
  };

  useEffect(() => {
    if (!endTimeMs) return;

    const updateRemaining = () => {
      const rem = Math.max(0, endTimeMs - Date.now());
      if (rem <= 0) {
        setOffer(null);
        setTimeLeft(0);
        setEndTimeMs(null);
        return false;
      }
      setTimeLeft(rem);
      return true;
    };

    const timer = setInterval(() => {
      if (!updateRemaining()) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTimeMs]);

  if (!isVisible) return null;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <div 
      className="fixed left-0 right-0 z-[15] bg-white text-black min-h-[40px] md:h-header px-2 md:px-3 flex flex-wrap md:flex-nowrap items-center justify-center gap-1 md:gap-3 text-center overflow-hidden animate-slide-in border-b border-black"
      style={{ 
        top: isSearchOpen ? '88px' : '44px',
        transition: 'top 0.4s ease-in-out',
        display: !isVisible ? 'none' : 'flex',
        paddingTop: '2px',
        paddingBottom: '2px'
      }}
    >
      <div 
        className="uppercase flex items-center justify-center flex-wrap shrink-0"
        style={{
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: 'clamp(8px, 2.5vw, 12px)',
          fontWeight: 400,
          letterSpacing: '0.02em',
          lineHeight: '1.2'
        }}
      >
        <span>{offer.text.replace('15', offer.percentage)}</span>
        <span className="mx-1 bg-black text-white px-[12px] py-[2px] rounded-full font-bold select-all tracking-normal inline-block align-middle leading-none" style={{ fontSize: 'inherit' }}>
          {promoCode}
        </span>
        <span className="xs-hidden-helper">VÁŠ UNIKÁTNÍ KÓD VYPRŠÍ ZA:</span>
      </div>
      <style jsx>{`
        @media (max-width: 450px) {
          .xs-hidden-helper { display: none; }
        }
      `}</style>
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
