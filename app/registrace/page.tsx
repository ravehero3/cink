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
    <div className="min-h-screen bg-white relative">
      {/* Horizontal line at 50% */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-black z-0" />
      
      {/* Left vertical line - starts after header (44px) and extends to footer1 */}
      <div className="absolute left-1/4 w-px bg-black z-0" style={{ top: '44px', bottom: 0 }} />
      
      {/* Right vertical line - starts after header (44px) and extends to footer1 */}
      <div className="absolute right-1/4 w-px bg-black z-0" style={{ top: '44px', bottom: 0 }} />

      {/* Main content above the line */}
      <div className="relative z-10 flex flex-col items-center pt-12 pb-16">
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
          Vytvořit Můj Profil
        </h1>

        <div className="w-full flex flex-col items-center">
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
                Oslovení
              </label>
              <div className="flex gap-4">
                {['Mr', 'Miss', 'Mrs', 'Ms', 'Mx'].map((option) => (
                  <label 
                    key={option} 
                    className="flex items-center text-xs"
                    style={{
                      fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif'
                    }}
                  >
                    <input
                      type="radio"
                      name="civility"
                      value={option}
                      checked={formData.civility === option}
                      onChange={(e) => setFormData({ ...formData, civility: e.target.value })}
                      className="mr-1"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className="w-full relative" style={{ marginBottom: '8px' }}>
              <label 
                className="block text-xs mb-[2px]"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  color: '#000000'
                }}
              >
                Jméno a příjmení
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Jméno a příjmení"
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
                E-mail *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                Telefon
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Telefon"
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
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

            <div className="w-full relative" style={{ marginBottom: '8px' }}>
              <label 
                className="block text-xs mb-[2px]"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  color: '#000000'
                }}
              >
                Potvrzení hesla *
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Potvrzení hesla"
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
                className="flex items-center text-xs"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif'
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.newsletterSubscribed}
                  onChange={(e) => setFormData({ ...formData, newsletterSubscribed: e.target.checked })}
                  className="mr-2"
                />
                <span>Přihlásit se k odběru newsletteru</span>
              </label>
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
              {loading ? 'NAČÍTÁNÍ...' : 'REGISTROVAT SE'}
            </button>
          </form>

          <div className="flex gap-4 items-center">
            <span 
              className="text-xs"
              style={{
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif'
              }}
            >
              Již máte účet?
            </span>
            <Link
              href="/prihlaseni"
              className="text-sm underline hover:no-underline"
              style={{
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif'
              }}
            >
              Přihlásit se
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
