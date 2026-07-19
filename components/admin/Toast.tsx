'use client';

import { useEffect, useRef } from 'react';
import { useToastStore, Toast as ToastType } from '@/store/toastStore';

const ICONS: Record<ToastType['type'], React.ReactNode> = {
  success: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  error: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  warning: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

const STYLES: Record<ToastType['type'], string> = {
  success: 'bg-gray-900 text-white',
  error:   'bg-red-600 text-white',
  warning: 'bg-amber-500 text-white',
  info:    'bg-blue-600 text-white',
};

const ICON_BG: Record<ToastType['type'], string> = {
  success: 'bg-white/15',
  error:   'bg-white/15',
  warning: 'bg-white/20',
  info:    'bg-white/15',
};

function ToastItem({ toast }: { toast: ToastType }) {
  const removeToast = useToastStore((s) => s.removeToast);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    timerRef.current = setTimeout(() => removeToast(toast.id), 4500);
    return () => clearTimeout(timerRef.current);
  }, [toast.id, removeToast]);

  return (
    <div
      className={`flex items-start gap-3 ${STYLES[toast.type]} rounded-xl px-4 py-3 shadow-xl w-[340px] max-w-[calc(100vw-3rem)] pointer-events-auto`}
      role="alert"
    >
      <span className={`w-6 h-6 rounded-lg ${ICON_BG[toast.type]} flex items-center justify-center shrink-0 mt-0.5`}>
        {ICONS[toast.type]}
      </span>
      <p className="text-sm font-medium leading-snug flex-1 pt-0.5">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-white/50 hover:text-white transition-colors shrink-0 mt-0.5 ml-1"
        aria-label="Zavřít"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
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
