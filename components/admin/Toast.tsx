'use client';

import { useEffect, useRef } from 'react';
import { useToastStore, Toast as ToastType } from '@/store/toastStore';

function ToastItem({ toast }: { toast: ToastType }) {
  const removeToast = useToastStore((s) => s.removeToast);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    timerRef.current = setTimeout(() => removeToast(toast.id), 4500);
    return () => clearTimeout(timerRef.current);
  }, [toast.id, removeToast]);

  return (
    <div
      className="flex items-start gap-3 bg-black text-white border border-black px-4 py-3 w-[340px] max-w-[calc(100vw-2rem)] pointer-events-auto shadow-none"
      role="alert"
      style={{
        fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
      }}
    >
      <div className="flex-1 pt-0.5">
        <p className="text-[10px] uppercase tracking-widest text-[#999999] mb-0.5">
          {toast.type === 'error' ? 'CHYBA' : toast.type === 'warning' ? 'UPOZORNĚNÍ' : 'OZNÁMENÍ'}
        </p>
        <p className="text-xs uppercase tracking-wide leading-snug font-medium text-white">
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-[#999999] hover:text-white transition-colors shrink-0 mt-0.5"
        aria-label="Zavřít"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

export default function ToastRenderer() {
  const toasts = useToastStore((s) => s.toasts);
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2 pointer-events-none" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
