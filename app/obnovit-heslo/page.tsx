'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      setTokenValid(false);
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Vyplňte prosím všechna pole');
      return;
    }

    if (password !== confirmPassword) {
      setError('Hesla se neshodují');
      return;
    }

    if (password.length < 6) {
      setError('Heslo musí obsahovat alespoň 6 znaků');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          email,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Došlo k chybě');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/prihlaseni');
      }, 3000);
    } catch (err) {
      setError('Došlo k chybě. Zkuste to prosím znovu.');
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center" style={{ width: '33.33%' }}>
          <h1 className="text-2xl mb-4" style={{ fontFamily: '"Roboto Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            Neplatný odkaz
          </h1>
          <p className="text-sm mb-6" style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            Odkaz pro obnovení hesla je neplatný nebo vypršel.
          </p>
          <Link
            href="/prihlaseni"
            className="text-sm underline hover:no-underline"
            style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif' }}
          >
            Zpět na přihlášení
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      <div className="absolute top-1/2 left-0 right-0 h-px bg-black z-0" />
      <div className="absolute left-1/4 w-px bg-black z-0" style={{ top: 0, bottom: 0 }} />
      <div className="absolute right-1/4 w-px bg-black z-0" style={{ top: 0, bottom: 0 }} />

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
          Obnovit Heslo
        </h1>

        <div className="w-full flex flex-col items-center">
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-800 text-sm border border-red-200 text-center" style={{ width: '33.33%' }}>
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center" style={{ width: '33.33%' }}>
              <div className="mb-6 p-3 bg-green-50 text-green-800 text-sm border border-green-200 text-center">
                Heslo bylo úspěšně obnoveno! Nyní vás přesmerujeme na přihlášení...
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col items-center" style={{ width: '33.33%' }}>
              <div className="w-full relative" style={{ marginBottom: '8px' }}>
                <label 
                  className="block text-xs mb-[2px]"
                  style={{
                    fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    color: '#000000'
                  }}
                >
                  Nové heslo *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nové heslo"
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
                  Potvrdit heslo *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Potvrdit heslo"
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
                {loading ? 'OBNOVUJI...' : 'OBNOVIT HESLO'}
              </button>

              <Link
                href="/prihlaseni"
                className="text-xs underline hover:no-underline"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif'
                }}
              >
                Zpět na přihlášení
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-body animate-pulse-color">načítá se</p>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
