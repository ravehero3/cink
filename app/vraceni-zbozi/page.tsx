'use client';

import { useState, FormEvent } from 'react';

export default function ReturnsPage() {
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [errors, setErrors] = useState<{ email?: string; orderNumber?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; orderNumber?: string } = {};
    
    if (!email) {
      newErrors.email = 'E-mail je povinný';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Neplatný formát e-mailu';
    }
    
    if (!orderNumber) {
      newErrors.orderNumber = 'Číslo objednávky je povinné';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setSubmitted(true);
      console.log('Return request submitted:', { email, orderNumber });
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setEmail('');
        setOrderNumber('');
        setSubmitted(false);
      }, 3000);
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
          VRÁCENÍ OBJEDNÁVKY
        </h1>

        <p 
          className="text-center mb-8"
          style={{
            fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '1.6',
            width: '33.33%'
          }}
        >
          Bezplatné vrácení do 30 dnů. Vyplňte formulář níže pro registraci vrácení zboží.
        </p>

        <div className="w-full flex flex-col items-center">
          {submitted && (
            <div 
              className="mb-6 p-3 bg-green-50 text-green-800 text-sm border border-green-200 text-center"
              style={{
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                width: '33.33%'
              }}
            >
              Žádost o vrácení byla úspěšně odeslána. Brzy vás budeme kontaktovat.
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-black text-sm focus:outline-none focus:border-black bg-white"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  padding: '13.8px 25.6px',
                  borderRadius: '4px',
                  color: '#000000',
                  fontSize: '14px'
                }}
                placeholder="vas@email.cz"
              />
              {errors.email && (
                <p 
                  className="mt-2 text-xs"
                  style={{
                    fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    color: '#dc2626'
                  }}
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div className="w-full relative" style={{ marginBottom: '8px' }}>
              <label 
                className="block text-xs mb-[2px]"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  color: '#000000'
                }}
              >
                Číslo objednávky *
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full border border-black text-sm focus:outline-none focus:border-black bg-white"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  padding: '13.8px 25.6px',
                  borderRadius: '4px',
                  color: '#000000',
                  fontSize: '14px'
                }}
                placeholder="ORD-123456"
              />
              {errors.orderNumber && (
                <p 
                  className="mt-2 text-xs"
                  style={{
                    fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    color: '#dc2626'
                  }}
                >
                  {errors.orderNumber}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white uppercase hover:bg-gray-800 transition-colors"
              style={{
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '13px',
                padding: '13.8px 25.6px',
                borderRadius: '4px',
                letterSpacing: '0.05em',
                marginBottom: '8px'
              }}
            >
              REGISTROVAT VRÁCENÍ
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
