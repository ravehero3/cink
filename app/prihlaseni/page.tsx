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

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-black">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-title font-bold text-center uppercase">PŘIHLÁŠENÍ</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="border border-black p-8">
          {showRegisteredMessage && (
            <div className="mb-6 p-4 border border-black bg-white text-body">
              Registrace byla úspěšná! Nyní se můžete přihlásit.
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 border border-black bg-white text-body">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-body font-bold mb-2 uppercase">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-black px-4 py-2 text-body focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="mb-8">
            <label className="block text-body font-bold mb-2 uppercase">
              Heslo
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-black px-4 py-2 text-body focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 text-body uppercase hover:bg-opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'NAČÍTÁNÍ...' : 'PŘIHLÁSIT SE'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-body">
              Nemáte ještě účet?{' '}
              <Link href="/registrace" className="underline hover:no-underline">
                Registrovat se
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
