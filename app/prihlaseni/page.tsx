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
  const [rememberMe, setRememberMe] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
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
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 
          className="text-center mb-8 uppercase tracking-wider" 
          style={{ 
            fontSize: '28px', 
            fontWeight: 400,
            letterSpacing: '2px',
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
          }}
        >
          Login
        </h1>

        {showRegisteredMessage && (
          <div className="mb-6 p-4 bg-green-50 text-green-800 text-sm text-center border border-green-200">
            Registrace byla úspěšná! Nyní se můžete přihlásit.
          </div>
        )}

        <div 
          className="mb-8 pb-8 border-b border-gray-300"
          style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
        >
          <h2 className="text-sm mb-6 font-normal">Sign In</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-800 text-sm border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-xs mb-2 font-normal">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-black px-0 py-2 text-sm focus:outline-none focus:border-black bg-transparent"
                style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs mb-2 font-normal">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-black px-0 py-2 text-sm focus:outline-none focus:border-black bg-transparent"
                style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
              />
            </div>

            <div className="mb-6">
              <label className="flex items-center text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2 w-4 h-4"
                />
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:bg-gray-400"
              style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
            >
              {loading ? 'Loading...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-xs underline hover:no-underline"
            >
              Need help signing in?
            </button>

            {showHelp && (
              <div className="mt-4 pl-4 border-l-2 border-gray-300">
                <button
                  onClick={() => {
                    setShowPasswordReset(true);
                    setShowHelp(false);
                  }}
                  className="block text-xs underline hover:no-underline mb-2"
                >
                  Forgot Password
                </button>
                <Link
                  href="/registrace"
                  className="block text-xs underline hover:no-underline mb-2"
                >
                  Activate my account
                </Link>
                <Link
                  href="/kontakt"
                  className="block text-xs underline hover:no-underline"
                >
                  Help
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="text-center">
          <div className="mb-6 text-xs text-gray-500 uppercase tracking-wider">OR</div>
          
          <Link
            href="/registrace"
            className="inline-block w-full border border-black text-black py-3 text-sm uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
            style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
          >
            Create My Profile
          </Link>
        </div>
      </div>

      {showPasswordReset && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
          onClick={() => !resetSuccess && setShowPasswordReset(false)}
        >
          <div 
            className="bg-white p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-normal">Reset password</h3>
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
                  Please enter your account email address to receive an email to reset your password.
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
                      className="w-full border-b border-black px-0 py-2 text-sm focus:outline-none focus:border-black bg-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-black text-white py-3 text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors"
                  >
                    Submit
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-green-700 mb-4">
                  Password reset email has been sent successfully!
                </p>
                <p className="text-xs text-gray-600">
                  Please check your email inbox.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
