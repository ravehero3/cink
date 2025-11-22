'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { useCartStore } from '@/lib/cart-store';
import Link from 'next/link';
import { Mail, Chrome } from 'lucide-react';

export default function CheckoutEmailPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, getTotal } = useCartStore();
  const [email, setEmail] = useState('');
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (items.length === 0) {
      router.push('/kosik');
    }
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [items, router, session]);

  const handleGuestContinue = () => {
    if (!email) {
      setError('Prosím zadejte e-mail');
      return;
    }
    // Store checkout data in sessionStorage
    sessionStorage.setItem('checkoutEmail', email);
    sessionStorage.setItem('checkoutIsGuest', 'true');
    router.push('/checkout/doprava');
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signIn('google', { 
        redirect: false,
        callbackUrl: '/checkout/doprava'
      });
      if (result?.ok) {
        sessionStorage.setItem('checkoutEmail', result?.error || email);
        router.push('/checkout/doprava');
      } else {
        setError('Chyba při přihlášení přes Google');
      }
    } catch (err) {
      setError('Chyba při přihlášení');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getTotal();

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left: Form */}
      <div className="flex-[2] border-r border-black p-12 flex flex-col justify-center">
        <div className="mb-12">
          <h1 
            className="uppercase mb-2"
            style={{
              fontFamily: '"Helvetica Neue Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '24px',
              fontWeight: 400,
              letterSpacing: '1px'
            }}
          >
            E-MAIL
          </h1>
          <p
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              color: '#666'
            }}
          >
            Krok 1 ze 3
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 mb-8">
            <p style={{ fontSize: '14px', color: '#dc2626' }}>{error}</p>
          </div>
        )}

        {session?.user ? (
          <div className="mb-8 p-6 border border-black bg-black text-white">
            <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
              Přihlášeni jako:
            </p>
            <p style={{ fontSize: '14px' }}>{session.user.email}</p>
            <button
              onClick={() => router.push('/checkout/doprava')}
              className="mt-6 w-full bg-white text-black py-3 uppercase hover:bg-gray-100 transition-colors"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                letterSpacing: '0.5px'
              }}
            >
              Pokračovat
            </button>
          </div>
        ) : (
          <>
            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full mb-6 py-4 px-6 border-2 border-black flex items-center justify-center gap-3 hover:bg-black hover:text-white transition-colors"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                letterSpacing: '0.5px'
              }}
            >
              <Chrome size={18} />
              PŘIHLÁSIT SE PŘES GOOGLE
            </button>

            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 border-t border-black"></div>
              <span style={{ fontSize: '12px', color: '#999' }}>NEBO</span>
              <div className="flex-1 border-t border-black"></div>
            </div>

            {/* Guest Checkout */}
            <div className="mb-8">
              <label
                style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '12px'
                }}
              >
                POKRAČOVAT JAKO HOST
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="Váš e-mail"
                className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-black"
                style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px'
                }}
              />
              <p
                style={{
                  fontSize: '12px',
                  color: '#999',
                  marginTop: '8px'
                }}
              >
                Budete moci vytvořit účet a sledovat svou objednávku
              </p>

              <button
                onClick={handleGuestContinue}
                disabled={loading}
                className="w-full mt-6 bg-black text-white py-3 uppercase hover:bg-gray-900 transition-colors disabled:opacity-50"
                style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  letterSpacing: '0.5px'
                }}
              >
                {loading ? 'NAČÍTÁM...' : 'POKRAČOVAT'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Right: Order Summary */}
      <div className="flex-1 border-l border-black bg-white flex flex-col justify-between sticky top-0 h-screen overflow-y-auto">
        {/* Header Panel */}
        <div className="border-b border-black p-12">
          <h2
            className="uppercase"
            style={{
              fontFamily: '"Helvetica Neue Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '16px',
              fontWeight: 400,
              letterSpacing: '1px'
            }}
          >
            SOUHRN OBJEDNÁVKY
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-12 flex flex-col justify-between">
          <div>
            <div className="space-y-4 mb-8 border-b border-black pb-8">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="flex justify-between text-sm">
                <span>{item.name} × {item.quantity}</span>
                <span style={{ fontWeight: 600 }}>{item.price * item.quantity} Kč</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex justify-between text-sm">
              <span>Mezisoučet</span>
              <span>{subtotal} Kč</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Doprava</span>
              <span>Vypočítáno dále</span>
            </div>
            </div>
          </div>

          <div className="border-t border-black pt-6">
            <div className="flex justify-between mb-6">
              <span style={{ fontSize: '16px', fontWeight: 600 }}>CELKEM</span>
              <span style={{ fontSize: '16px', fontWeight: 600 }}>{subtotal} Kč</span>
            </div>

            <Link
              href="/kosik"
              className="block text-center py-2 text-xs uppercase underline hover:no-underline"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '12px'
              }}
            >
              Zpět do košíku
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
