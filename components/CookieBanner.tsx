'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'cookieConsent';

export function getConsent(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setConsent(value: 'accepted' | 'essential-only'): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, value);
}

const copy = {
  text: 'Tento web používá soubory cookie pro analýzu a správnou funkci webu.',
  more: 'Více informací',
  accept: 'Povolit vše',
  essential: 'Pouze nezbytné',
};

type Phase = 'hidden' | 'entering' | 'visible' | 'exiting';

export default function CookieBanner() {
  const [phase, setPhase] = useState<Phase>('hidden');

  useEffect(() => {
    if (getConsent()) return;

    const timer = setTimeout(() => {
      setPhase('entering');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPhase('visible'));
      });
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  function handleChoice(value: 'accepted' | 'essential-only') {
    setConsent(value);
    setPhase('exiting');
    setTimeout(() => setPhase('hidden'), 380);
  }

  if (phase === 'hidden') return null;

  const isExiting = phase === 'exiting';

  return (
    <>
      <style>{`
        @keyframes cb-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cb-out {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(10px); }
        }
        .cb-enter { animation: cb-in 0.35s cubic-bezier(0.22,1,0.36,1) forwards; }
        .cb-exit  { animation: cb-out 0.35s cubic-bezier(0.55,0,1,0.45) forwards; }
        .cb-btn-accept:hover  { background: rgb(30,30,30) !important; }
        .cb-btn-ghost:hover   { background: rgba(0,0,0,0.06) !important; }
      `}</style>

      <div
        className={isExiting ? 'cb-exit' : 'cb-enter'}
        style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          width: 'calc(100vw - 40px)',
          maxWidth: 340,
          background: '#f0f0f0',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 12,
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
          zIndex: 9999,
          padding: '14px 16px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
        role="dialog"
        aria-label="Souhlas s cookies"
        aria-modal="true"
      >
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.55, color: 'rgba(0,0,0,0.55)' }}>
          {copy.text}{' '}
          <Link
            href="/cookies"
            style={{ color: 'rgba(0,0,0,0.55)', textDecoration: 'underline', textUnderlineOffset: 2 }}
          >
            {copy.more}
          </Link>
        </p>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="cb-btn-accept"
            onClick={() => handleChoice('accepted')}
            style={{
              flex: 1,
              fontSize: 11.5,
              fontWeight: 500,
              borderRadius: 7,
              border: 'none',
              cursor: 'pointer',
              padding: '8px 0',
              background: '#111',
              color: '#fff',
              transition: 'background 0.18s',
            }}
          >
            {copy.accept}
          </button>

          <button
            className="cb-btn-ghost"
            onClick={() => handleChoice('essential-only')}
            style={{
              flex: 1,
              fontSize: 11.5,
              fontWeight: 500,
              borderRadius: 7,
              border: '1px solid rgba(0,0,0,0.18)',
              cursor: 'pointer',
              padding: '8px 0',
              background: 'transparent',
              color: 'rgba(0,0,0,0.5)',
              transition: 'background 0.18s',
            }}
          >
            {copy.essential}
          </button>
        </div>
      </div>
    </>
  );
}
