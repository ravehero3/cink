'use client';

import { useState } from 'react';

export default function TrackingPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
          SLEDOVÁNÍ OBJEDNÁVKY
        </h1>

        <p 
          className="text-center"
          style={{
            fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '1.6',
            marginBottom: '24px'
          }}
        >
          Zadejte číslo vaší objednávky pro sledování stavu zásilky.
        </p>

        <div className="w-full flex flex-col items-center">
          <form onSubmit={handleSubmit} className="flex flex-col items-center" style={{ width: '33.33%' }}>
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
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Např. ORD-123456"
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vas@email.cz"
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
              SLEDOVAT OBJEDNÁVKU
            </button>
          </form>

          <div 
            className="border border-black p-6 bg-white"
            style={{ 
              borderRadius: '4px',
              width: '33.33%',
              marginTop: '16px'
            }}
          >
            <p 
              style={{
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '1.6'
              }}
            >
              <strong>Tip:</strong> Číslo objednávky a sledovací číslo najdete v potvrzovacím e-mailu, který jsme vám zaslali po vytvoření objednávky.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
