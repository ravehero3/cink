'use client';

import { X } from 'lucide-react';

interface StatusMessageProps {
  type: 'success' | 'error';
  message: string;
  onDismiss?: () => void;
}

export default function StatusMessage({ type, message, onDismiss }: StatusMessageProps) {
  if (!message) return null;

  return (
    <div
      className="flex items-start gap-3 p-4 border border-black bg-white text-black text-xs uppercase tracking-wider mb-6"
      style={{
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      }}
    >
      <span className="font-bold shrink-0">
        {type === 'success' ? '[ OK ]' : '[ CHYBA ]'}
      </span>
      <p className="flex-1 font-medium">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 hover:opacity-60 transition-opacity"
          aria-label="Zavřít"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
