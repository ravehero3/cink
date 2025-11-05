'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    civility: '',
    newsletterSubscribed: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Hesla se neshodují');
      return;
    }

    if (formData.password.length < 6) {
      setError('Heslo musí mít alespoň 6 znaků');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          civility: formData.civility,
          newsletterSubscribed: formData.newsletterSubscribed,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registrace se nezdařila');
        setLoading(false);
        return;
      }

      router.push('/prihlaseni?registered=true');
    } catch (err) {
      setError('Došlo k chybě. Zkuste to prosím znovu.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-black">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-title font-bold text-center uppercase">REGISTRACE</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="border border-black p-8">
          {error && (
            <div className="mb-6 p-4 border border-black bg-white text-body">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-body font-bold mb-2 uppercase">
              Oslovení
            </label>
            <div className="space-y-2">
              {['Mr', 'Miss', 'Mrs', 'Ms', 'Mx'].map((option) => (
                <label key={option} className="flex items-center text-body">
                  <input
                    type="radio"
                    name="civility"
                    value={option}
                    checked={formData.civility === option}
                    onChange={(e) => setFormData({ ...formData, civility: e.target.value })}
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-body font-bold mb-2 uppercase">
              Jméno a příjmení
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-black px-4 py-2 text-body focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="mb-6">
            <label className="block text-body font-bold mb-2 uppercase">
              E-mail *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-black px-4 py-2 text-body focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="mb-6">
            <label className="block text-body font-bold mb-2 uppercase">
              Telefon
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border border-black px-4 py-2 text-body focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="mb-6">
            <label className="block text-body font-bold mb-2 uppercase">
              Heslo *
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full border border-black px-4 py-2 text-body focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="mb-6">
            <label className="block text-body font-bold mb-2 uppercase">
              Potvrzení hesla *
            </label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full border border-black px-4 py-2 text-body focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="mb-8">
            <label className="flex items-start text-body">
              <input
                type="checkbox"
                checked={formData.newsletterSubscribed}
                onChange={(e) => setFormData({ ...formData, newsletterSubscribed: e.target.checked })}
                className="mr-2 mt-1"
              />
              <span>Přihlásit se k odběru newsletteru</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 text-body uppercase hover:bg-opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'NAČÍTÁNÍ...' : 'REGISTROVAT SE'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-body">
              Již máte účet?{' '}
              <Link href="/prihlaseni" className="underline hover:no-underline">
                Přihlásit se
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
