'use client';

import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface StatusMessageProps {
  type: 'success' | 'error';
  message: string;
  onDismiss?: () => void;
}

export default function StatusMessage({ type, message, onDismiss }: StatusMessageProps) {
  if (!message) return null;

  return (
    <div
      className={`flex items-start gap-3 p-4 border text-sm mb-6 ${
        type === 'success'
          ? 'border-green-600 bg-green-50 text-green-800'
          : 'border-red-500 bg-red-50 text-red-800'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle size={18} className="shrink-0 mt-0.5 text-green-600" />
      ) : (
        <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
      )}
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="shrink-0 opacity-60 hover:opacity-100">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
