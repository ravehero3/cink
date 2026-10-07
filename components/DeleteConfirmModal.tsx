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
      
      <div className="fixed top-1/2 z-50 bg-white border border-black" style={{ width: '70%', maxWidth: '480px', left: '50%', transform: 'translate(-50%, -50%)' }}>
        <div className="border-b border-black" style={{ height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#24e053', padding: '0 24px' }}>
          <h2 style={{
            fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '16px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            fontStretch: 'condensed',
            color: '#000000',
            margin: 0,
            lineHeight: '1.2'
          }}>
            Odebrat položku z mého košíku
          </h2>
        </div>

        <div style={{ padding: '32px 28px' }}>
          <p style={{
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '15px',
            fontWeight: 400,
            lineHeight: '1.6',
            color: '#000000',
            margin: '0',
            textAlign: 'center'
          }}>
            Jste si jisti, že chcete odebrat <strong>{productName}</strong> ({productSize}) z košíku?
          </p>
        </div>

        <div style={{
          borderTop: '1px solid #000'
        }} />

        <div style={{
          padding: '20px 24px',
          display: 'flex',
          gap: '12px'
        }}>
          <AnimatedButton
            text="ZRUŠIT"
            onClick={onClose}
            type="button"
            style={{
              flex: 1,
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '13px',
              fontWeight: 400,
              padding: '16px',
              backgroundColor: '#fff',
              border: '1px solid #000',
              borderRadius: '4px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              color: '#000'
            }}
          />
          <AnimatedButton
            text="ANO, ODEBRAT"
            onClick={onConfirm}
            type="button"
            style={{
              flex: 1,
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '13px',
              fontWeight: 400,
              padding: '16px',
              borderRadius: '4px'
            }}
          />
        </div>
      </div>
    </>
  );
}
