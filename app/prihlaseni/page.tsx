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
      
      {/* Left vertical line - starts after header (44px) */}
      <div className="absolute left-1/4 w-px bg-black z-0" style={{ top: '44px', bottom: '50%' }} />
      
      {/* Right vertical line - starts after header (44px) */}
      <div className="absolute right-1/4 w-px bg-black z-0" style={{ top: '44px', bottom: '50%' }} />

      {/* Main content above the line */}
      <div className="relative z-10 flex flex-col items-center pt-32">
        <h1 
          className="uppercase text-center mb-[200px]" 
          style={{ 
            fontFamily: '"Roboto Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '20px',
            fontWeight: 700,
            letterSpacing: '0.05em'
          }}
        >
          Login
        </h1>

        <div className="w-full max-w-[600px] px-4 flex flex-col items-center">
          {showRegisteredMessage && (
            <div className="w-full mb-6 p-3 bg-green-50 text-green-800 text-sm border border-green-200 text-center">
              Registrace byla úspěšná! Nyní se můžete přihlásit.
            </div>
          )}

          {error && (
            <div className="w-full mb-6 p-3 bg-red-50 text-red-800 text-sm border border-red-200 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
            <div className="w-full mb-6 relative">
              <label 
                className="block text-xs mb-2"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  color: '#000000'
                }}
              >
                Email Address *
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
                  borderRadius: '50px',
                  color: '#000000'
                }}
              />
            </div>

            <div className="w-full mb-8 relative">
              <label 
                className="block text-xs mb-2"
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
                  borderRadius: '50px',
                  color: '#000000'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white uppercase hover:bg-gray-800 transition-colors disabled:bg-gray-400 mb-8"
              style={{
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '13px',
                padding: '13.8px 25.6px',
                borderRadius: '50px',
                letterSpacing: '0.05em'
              }}
            >
              {loading ? 'NAČÍTÁNÍ...' : 'POKRAČOVAT'}
            </button>
          </form>

          <div className="w-full flex items-center mb-8">
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
            className="w-full border border-black bg-white text-black hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-3 mb-6"
            style={{
              fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '13px',
              padding: '13.8px 25.6px',
              borderRadius: '50px',
              letterSpacing: '0.05em'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9.003 18z" fill="#34A853"/>
              <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
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
