'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegisteredMessage, setShowRegisteredMessage] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [hasGoogleProvider, setHasGoogleProvider] = useState(false);

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setShowRegisteredMessage(true);
      setTimeout(() => setShowRegisteredMessage(false), 5000);
    }

    fetch('/api/auth/providers')
      .then(res => res.json())
      .then(providers => {
        setHasGoogleProvider('google' in providers);
      })
      .catch(() => setHasGoogleProvider(false));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Nesprávný e-mail nebo heslo');
        setLoading(false);
      } else {
        // Check if user is admin
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();
        
        if (session?.user?.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/ucet');
        }
        router.refresh();
      }
    } catch (err) {
      setError('Došlo k chybě. Zkuste to prosím znovu.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/ucet' });
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Došlo k chybě');
        setLoading(false);
        return;
      }

      setResetSuccess(true);
      setTimeout(() => {
        setShowPasswordReset(false);
        setResetSuccess(false);
        setResetEmail('');
        setLoading(false);
      }, 3000);
    } catch (err) {
      setError('Došlo k chybě. Zkuste to prosím znovu.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Horizontal line at 50% */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-black z-0" />
      
      {/* Left vertical line - starts at top (header padding handled by body) */}
      <div className="absolute left-1/4 w-px bg-black z-0" style={{ top: 0, bottom: 0 }} />
      
      {/* Right vertical line - starts at top (header padding handled by body) */}
      <div className="absolute right-1/4 w-px bg-black z-0" style={{ top: 0, bottom: 0 }} />

      {/* Main content above the line */}
      <div className="relative z-10 flex flex-col items-center pt-12">
        <h1 
          className="uppercase text-center" 
          style={{ 
            fontFamily: '"Roboto Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '20px',
            fontWeight: 700,
            letterSpacing: '0.05em',
            marginBottom: '8px'
          }}
        >
          Login
        </h1>

        <div className="w-full flex flex-col items-center">
          {showRegisteredMessage && (
            <div className="mb-6 p-3 text-sm border text-center" style={{ width: '33.33%', backgroundColor: '#00FF00', color: '#000000', borderColor: '#00FF00' }}>
              Registrace byla úspěšná! Nyní se můžete přihlásit.
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-800 text-sm border border-red-200 text-center" style={{ width: '33.33%' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col items-center" style={{ width: '33.33%' }}>
            <div className="w-full relative" style={{ marginBottom: '8px' }}>
              <label 
                className="block text-xs mb-[2px]"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  color: '#000000'
                }}
              >
                E-mail *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
                className="w-full border border-black text-sm focus:outline-none focus:border-black bg-white"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  padding: '13.8px 25.6px',
                  borderRadius: '4px',
                  color: '#000000'
                }}
              />
            </div>

            <div className="w-full relative" style={{ marginBottom: '8px' }}>
              <label 
                className="block text-xs mb-[2px]"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  color: '#000000'
                }}
              >
                Heslo *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Heslo"
                className="w-full border border-black text-sm focus:outline-none focus:border-black bg-white"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  padding: '13.8px 25.6px',
                  borderRadius: '4px',
                  color: '#000000'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white uppercase hover:bg-gray-800 transition-colors disabled:bg-gray-400"
              style={{
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '13px',
                padding: '13.8px 25.6px',
                borderRadius: '4px',
                letterSpacing: '0.05em',
                marginBottom: '8px'
              }}
            >
              {loading ? 'NAČÍTÁNÍ...' : 'POKRAČOVAT'}
            </button>
          </form>

          {hasGoogleProvider && (
            <>
              <div className="flex items-center" style={{ marginBottom: '8px', width: '33.33%' }}>
                <div className="flex-1 h-px bg-black" />
                <span 
                  className="mx-4 text-xs"
                  style={{
                    fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif'
                  }}
                >
                  NEBO
                </span>
                <div className="flex-1 h-px bg-black" />
              </div>

              <button
                onClick={handleGoogleLogin}
                className="border border-black bg-white text-black hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-3"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '13px',
                  padding: '13.8px 25.6px',
                  borderRadius: '4px',
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                  width: '33.33%'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path fill="currentColor" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                </svg>
                PŘIHLÁSIT SE PŘES GOOGLE
              </button>
            </>
          )}

          <div className="flex gap-4 items-center">
            <button
              onClick={() => setShowPasswordReset(true)}
              className="text-xs underline hover:no-underline"
              style={{
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif'
              }}
            >
              Zapomenuté heslo
            </button>
            <span className="text-xs text-gray-400">|</span>
            <Link
              href="/registrace"
              className="text-sm underline hover:no-underline"
              style={{
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif'
              }}
            >
              Vytvořit Můj Profil
            </Link>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showPasswordReset && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
          onClick={() => !resetSuccess && setShowPasswordReset(false)}
        >
          <div 
            className="bg-white p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif' }}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-normal">Reset hesla</h3>
              {!resetSuccess && (
                <button
                  onClick={() => setShowPasswordReset(false)}
                  className="text-2xl leading-none hover:opacity-70"
                >
                  ×
                </button>
              )}
            </div>

            {!resetSuccess ? (
              <>
                <p className="text-sm mb-6 text-gray-700">
                  Zadejte prosím svou e-mailovou adresu, na kterou vám zašleme odkaz pro obnovení hesla.
                </p>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-800 text-sm border border-red-200">
                    {error}
                  </div>
                )}

                <form onSubmit={handlePasswordReset}>
                  <div className="mb-6">
                    <label className="block text-xs mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full border border-black px-4 py-2 text-sm focus:outline-none focus:border-black bg-white"
                      style={{ borderRadius: '50px' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white py-3 text-sm uppercase hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                    style={{ borderRadius: '50px' }}
                  >
                    {loading ? 'ODESÍLÁNÍ...' : 'Odeslat'}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm mb-4" style={{ color: '#00FF00' }}>
                  E-mail s odkazem pro obnovení hesla byl úspěšně odeslán!
                </p>
                <p className="text-xs text-gray-600">
                  Zkontrolujte prosím svou e-mailovou schránku.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-body animate-pulse-color">načítá se</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
