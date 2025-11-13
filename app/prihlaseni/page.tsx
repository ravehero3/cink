'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
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

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setShowRegisteredMessage(true);
      setTimeout(() => setShowRegisteredMessage(false), 5000);
    }
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
        router.push('/ucet');
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

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSuccess(true);
    setTimeout(() => {
      setShowPasswordReset(false);
      setResetSuccess(false);
      setResetEmail('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Horizontal line at 50% */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-black z-0" />
      
      {/* Left vertical line - starts after header (44px) and extends to footer1 */}
      <div className="absolute left-1/4 w-px bg-black z-0" style={{ top: '44px', bottom: 0 }} />
      
      {/* Right vertical line - starts after header (44px) and extends to footer1 */}
      <div className="absolute right-1/4 w-px bg-black z-0" style={{ top: '44px', bottom: 0 }} />

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
            <div className="mb-6 p-3 bg-green-50 text-green-800 text-sm border border-green-200 text-center" style={{ width: '33.33%' }}>
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
                  borderRadius: '2px',
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
                  borderRadius: '2px',
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
                borderRadius: '2px',
                letterSpacing: '0.05em',
                marginBottom: '8px'
              }}
            >
              {loading ? 'NAČÍTÁNÍ...' : 'POKRAČOVAT'}
            </button>
          </form>

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
              borderRadius: '2px',
              letterSpacing: '0.05em',
              marginBottom: '8px',
              width: '33.33%'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
              <path d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z" fill="currentColor"/>
              <path d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z" fill="currentColor"/>
              <path d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z" fill="currentColor"/>
              <path d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z" fill="currentColor"/>
            </svg>
            PŘIHLÁSIT SE PŘES GOOGLE
          </button>

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
                    className="w-full bg-black text-white py-3 text-sm uppercase hover:bg-gray-800 transition-colors"
                    style={{ borderRadius: '50px' }}
                  >
                    Odeslat
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-green-700 mb-4">
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
