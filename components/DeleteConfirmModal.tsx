'use client';

import { useState } from 'react';
import AnimatedButton from './AnimatedButton';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
  productSize: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
  productSize
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black z-40 opacity-50"
        onClick={onClose}
      />
      
      <div className="fixed top-1/2 z-50 bg-white border border-black" style={{ width: '33.33%', left: 'calc(50% + 6px)', transform: 'translate(-50%, -50%)' }}>
        <div className="border-b border-black" style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
          <h2 style={{
            fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '14px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            fontStretch: 'condensed',
            color: '#000000'
          }}>
            Odebrat položku z mého košíku
          </h2>
        </div>

        <div style={{ padding: '16px' }}>
          <p style={{
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '19.6px',
            color: '#000000',
            marginBottom: '16px'
          }}>
            Jste si jisti, že chcete odebrat {productName} ({productSize}) z košíku?
          </p>
        </div>

        <div style={{
          borderTop: '1px solid #000'
        }} />

        <div style={{
          padding: '12px',
          display: 'flex',
          gap: '8px'
        }}>
          <AnimatedButton
            text="ZRUŠIT"
            onClick={onClose}
            type="button"
            style={{
              flex: 1,
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '12px',
              fontWeight: 400,
              padding: '12px',
              backgroundColor: '#fff',
              border: '1px solid #000',
              borderRadius: '4px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              color: '#000'
            }}
          />
          <AnimatedButton
            text="ANO"
            onClick={onConfirm}
            type="button"
            style={{
              flex: 1,
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '12px',
              fontWeight: 400,
              padding: '12px',
              borderRadius: '4px'
            }}
          />
        </div>
      </div>
    </>
  );
}
