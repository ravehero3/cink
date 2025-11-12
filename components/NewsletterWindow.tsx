'use client';

import { useState } from 'react';
import Link from 'next/link';

interface NewsletterWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewsletterWindow({ isOpen, onClose }: NewsletterWindowProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage({ type: 'error', text: 'E-mail je povinný' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Úspěšně jste se přihlásili k odběru newsletteru' });
        setEmail('');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Došlo k chybě' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Došlo k chybě při přihlášení' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-white z-40"
        onClick={onClose}
      />
      
      <div 
        className={`fixed top-0 right-0 h-full bg-white border-l border-black z-50 transition-transform duration-300 w-full md:w-[400px] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="bg-white border-b border-black flex items-center justify-between px-6 py-4">
            <h2 className="text-lg font-bold uppercase tracking-wider">PŘIHLASTE SE K ODBĚRU NAŠEHO NEWSLETTERU</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center border border-black hover:opacity-70 transition-opacity"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6">
            <div style={{ marginTop: '20px' }}>
              <p className="text-sm mb-6">
                Přihlaste se k odběru našeho newsletteru a získejte přístup k nejnovějším kolekcím, exkluzivním nabídkám a novinkám ze světa sportu.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">
                    E-mail*
                  </label>
                  <span className="text-xs text-gray-500">*požadovaný</span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-black px-3 py-2 text-base"
                  placeholder="vas@email.cz"
                />
              </div>

              <div style={{ marginTop: '42px', marginBottom: '42px' }}>
                <p className="text-xs text-gray-600">
                  Odesláním tohoto formuláře souhlasíte se zpracováním vašich{' '}
                  <Link href="/ochrana-osobnich-udaju" className="underline hover:text-black">
                    osobních údajů
                  </Link>
                  {' '}za účelem zasílání newsletteru.
                </p>
              </div>

              <div className="border-t border-black" style={{ marginBottom: '8px' }}></div>

              {message && (
                <div className={`p-3 mb-4 border ${message.type === 'success' ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50'}`}>
                  <p className="text-sm">{message.text}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 text-sm uppercase tracking-wider font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'PŘIHLAŠOVÁNÍ...' : 'PŘIHLÁSIT'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
