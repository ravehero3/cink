'use client';

import { useState, FormEvent } from 'react';
import PageFrame from '@/components/PageFrame';

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
    <PageFrame>
      <div 
        className="py-16"
        style={{
          marginLeft: 'calc(33.33% - 32px)',
          marginRight: 'calc(33.33% - 32px)'
        }}
      >
        <div>
          <h1 
            className="uppercase text-center mb-8"
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '28px',
              fontWeight: 700,
              letterSpacing: '0.05em'
            }}
          >
            VRÁCENÍ OBJEDNÁVKY
          </h1>

          <p 
            className="text-center mb-12"
            style={{
              fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '1.6'
            }}
          >
            Bezplatné vrácení do 30 dnů. Vyplňte formulář níže pro registraci vrácení zboží.
          </p>

          {submitted && (
            <div 
              className="mb-8 p-4 border-2 border-black bg-white text-center"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 400
              }}
            >
              Žádost o vrácení byla úspěšně odeslána. Brzy vás budeme kontaktovat.
            </div>
          )}

          <form onSubmit={handleSubmit} className="border-2 border-black p-8">
            <div className="mb-8">
              <label 
                className="block uppercase mb-2"
                style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.05em'
                }}
              >
                E-mail *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-black px-4 py-3 focus:outline-none bg-white"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  borderRadius: '2px'
                }}
                placeholder="vas@email.cz"
              />
              {errors.email && (
                <p 
                  className="mt-2"
                  style={{
                    fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '12px',
                    color: '#000000'
                  }}
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div className="mb-8">
              <label 
                className="block uppercase mb-2"
                style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.05em'
                }}
              >
                Číslo objednávky *
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full border-2 border-black px-4 py-3 focus:outline-none bg-white"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  borderRadius: '2px'
                }}
                placeholder="ORD-123456"
              />
              {errors.orderNumber && (
                <p 
                  className="mt-2"
                  style={{
                    fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '12px',
                    color: '#000000'
                  }}
                >
                  {errors.orderNumber}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white hover:opacity-90 transition-opacity"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '12px',
                fontWeight: 400,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                borderRadius: '4px',
                padding: '13.8px 25.6px'
              }}
            >
              REGISTROVAT VRÁCENÍ
            </button>
          </form>
        </div>
      </div>
    </PageFrame>
  );
}
