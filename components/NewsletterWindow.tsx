'use client';

import { useState } from 'react';

interface NewsletterWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewsletterWindow({ isOpen, onClose }: NewsletterWindowProps) {
  const [email, setEmail] = useState('');
  const [civility, setCivility] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !civility) {
      setMessage({ type: 'error', text: 'Vyplňte prosím všechna pole' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, civility }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Úspěšně jste se přihlásili k odběru newsletteru' });
        setEmail('');
        setCivility('');
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
          <div className="h-header border-b border-black flex items-center justify-between px-4">
            <h2 className="text-product-name font-bold uppercase">NEWSLETTER</h2>
            <button
              onClick={onClose}
              className="text-body"
              aria-label="Zavřít"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-body font-bold mb-3 uppercase text-[12px]">
                  Oslovení *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="civility"
                      value="Pán"
                      checked={civility === 'Pán'}
                      onChange={(e) => setCivility(e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-body">Pán</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="civility"
                      value="Paní/Slečna"
                      checked={civility === 'Paní/Slečna'}
                      onChange={(e) => setCivility(e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-body">Paní/Slečna</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="civility"
                      value="Mx"
                      checked={civility === 'Mx'}
                      onChange={(e) => setCivility(e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-body">Mx</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="civility"
                      value="Raději neuvedu"
                      checked={civility === 'Raději neuvedu'}
                      onChange={(e) => setCivility(e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-body">Raději neuvedu</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-body font-bold mb-2 uppercase text-[12px]">
                  E-mail *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-black px-4 py-2 text-body focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="vas@email.cz"
                />
              </div>

              {message && (
                <div
                  className={`p-4 border ${
                    message.type === 'success'
                      ? 'border-black bg-white'
                      : 'border-black bg-white'
                  }`}
                >
                  <p className="text-body">{message.text}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 text-body uppercase font-bold disabled:bg-white disabled:text-black disabled:border disabled:border-black"
              >
                {loading ? 'ODESÍLÁNÍ...' : 'PŘIHLÁSIT SE'}
              </button>

              <p className="text-[12px] text-black">
                Odesláním souhlasíte se zpracováním osobních údajů pro účely zasílání newsletteru.
                Odhlásit se můžete kdykoli kliknutím na odkaz v e-mailu.
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
