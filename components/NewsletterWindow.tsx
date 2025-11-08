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
          <div className="h-header border-b border-black flex items-center justify-between px-xl">
            <h2 className="text-section-header font-bold uppercase tracking-tighter">Newsletter</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center border border-black hover:opacity-70 transition-opacity"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-xl">
            <form onSubmit={handleSubmit} className="space-y-xl">
              <div>
                <label className="block text-small font-bold mb-md uppercase tracking-wider">
                  Title *
                </label>
                <div className="space-y-sm">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="civility"
                      value="Mr"
                      checked={civility === 'Mr'}
                      onChange={(e) => setCivility(e.target.value)}
                      className="mr-sm w-5 h-5"
                    />
                    <span className="text-base uppercase tracking-wider">Mr</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="civility"
                      value="Ms"
                      checked={civility === 'Ms'}
                      onChange={(e) => setCivility(e.target.value)}
                      className="mr-sm w-5 h-5"
                    />
                    <span className="text-base uppercase tracking-wider">Ms</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="civility"
                      value="Mx"
                      checked={civility === 'Mx'}
                      onChange={(e) => setCivility(e.target.value)}
                      className="mr-sm w-5 h-5"
                    />
                    <span className="text-base uppercase tracking-wider">Mx</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="civility"
                      value="Prefer not to say"
                      checked={civility === 'Prefer not to say'}
                      onChange={(e) => setCivility(e.target.value)}
                      className="mr-sm w-5 h-5"
                    />
                    <span className="text-base uppercase tracking-wider">Prefer not to say</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-small font-bold mb-md uppercase tracking-wider">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-black px-sm py-sm text-base"
                  placeholder="your@email.com"
                />
              </div>

              {message && (
                <div className="p-sm border border-black">
                  <p className="text-base">{message.text}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-sm text-small uppercase tracking-wider font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Subscribe'}
              </button>

              <p className="text-xs">
                By submitting, you agree to receive newsletter emails. You can unsubscribe at any time.
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
