'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export default function CheckoutShippingPage() {
  const router = useRouter();
  const { items, getTotal } = useCartStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    shippingMethod: 'zasilkovna',
    zasilkovnaId: '',
    zasilkovnaName: '',
    zasilkovnaCity: '',
    promoCode: '',
  });

  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [selectedZasilkovnaPoint, setSelectedZasilkovnaPoint] = useState<any>(null);

  useEffect(() => {
    if (items.length === 0) {
      router.push('/kosik');
    }
    const storedEmail = sessionStorage.getItem('checkoutEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      router.push('/checkout/email');
    }
  }, [items, router]);

  useEffect(() => {
    // Load Zasilkovna widget
    const script = document.createElement('script');
    script.src = 'https://widget.packeta.com/v6/www/js/packetaWidget.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleApplyPromo = async () => {
    if (!formData.promoCode) return;

    setLoading(true);
    setPromoError('');

    try {
      const response = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.promoCode,
          orderAmount: getTotal(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setDiscount(data.discountAmount);
      } else {
        setPromoError(data.error || 'Neplatný promo kód');
      }
    } catch (error) {
      setPromoError('Chyba při ověřování promo kódu');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectZasilkovnaPoint = () => {
    if (typeof window !== 'undefined' && (window as any).Packeta) {
      (window as any).Packeta.Widget.pick(process.env.NEXT_PUBLIC_ZASILKOVNA_API_KEY || 'demo', (point: any) => {
        if (point) {
          setFormData({
            ...formData,
            zasilkovnaId: point.id,
            zasilkovnaName: point.name,
            zasilkovnaCity: point.city,
          });
          setSelectedZasilkovnaPoint(point);
        }
      });
    }
  };

  const handleContinue = async () => {
    if (!formData.name || !formData.phone) {
      setError('Vyplňte prosím všechny povinné údaje');
      return;
    }

    if (formData.shippingMethod === 'zasilkovna' && !formData.zasilkovnaId) {
      setError('Vyberte prosím výdejní místo Zásilkovny');
      return;
    }

    // Store checkout data
    sessionStorage.setItem('checkoutData', JSON.stringify({
      email,
      ...formData,
    }));

    router.push('/checkout/platba');
  };

  const subtotal = getTotal();
  const shippingCost = 79;
  const total = subtotal + shippingCost - discount;

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left: Form */}
      <div className="flex-[2] border-r border-black p-12 flex flex-col justify-center overflow-y-auto">
        <div className="mb-12">
          <h1 
            className="uppercase mb-2"
            style={{
              fontFamily: '"Helvetica Neue Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '24px',
              fontWeight: 400,
              letterSpacing: '1px'
            }}
          >
            DOPRAVA
          </h1>
          <p
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              color: '#666'
            }}
          >
            Krok 2 ze 3
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 mb-8">
            <p style={{ fontSize: '14px', color: '#dc2626' }}>{error}</p>
          </div>
        )}

        {/* Contact Information */}
        <div className="mb-12">
          <h3
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Osobní údaje
          </h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Jméno a příjmení"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-black focus:outline-none"
              style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px' }}
            />
            <input
              type="tel"
              placeholder="Telefonní číslo"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border-2 border-black focus:outline-none"
              style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px' }}
            />
          </div>
        </div>

        {/* Shipping Method */}
        <div className="mb-12">
          <h3
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Způsob doručení
          </h3>

          {formData.shippingMethod === 'zasilkovna' && (
            <div className="mb-6 p-4 border-2 border-black">
              {selectedZasilkovnaPoint ? (
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                    {selectedZasilkovnaPoint.name}
                  </p>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                    {selectedZasilkovnaPoint.city}
                  </p>
                  <button
                    onClick={handleSelectZasilkovnaPoint}
                    className="text-sm underline hover:no-underline"
                    style={{ fontSize: '12px' }}
                  >
                    Vybrat jiné místo
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSelectZasilkovnaPoint}
                  className="w-full py-3 border border-black hover:bg-black hover:text-white transition-colors"
                  style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                >
                  Vybrat výdejní místo
                </button>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 p-3 border-2 border-black bg-black text-white">
            <input
              type="radio"
              id="zasilkovna"
              name="shipping"
              value="zasilkovna"
              checked={formData.shippingMethod === 'zasilkovna'}
              onChange={(e) => setFormData({ ...formData, shippingMethod: e.target.value })}
              className="w-4 h-4"
            />
            <label htmlFor="zasilkovna" className="flex-1" style={{ fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              Zásilkovna (79 Kč)
            </label>
          </div>
        </div>

        {/* Promo Code */}
        <div className="mb-12">
          <h3
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Promo kód
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Zadejte promo kód"
              value={formData.promoCode}
              onChange={(e) => {
                setFormData({ ...formData, promoCode: e.target.value });
                setPromoError('');
              }}
              className="flex-1 px-4 py-3 border-2 border-black focus:outline-none"
              style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px' }}
            />
            <button
              onClick={handleApplyPromo}
              disabled={loading}
              className="px-6 py-3 border-2 border-black hover:bg-black hover:text-white transition-colors"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              POUŽÍT
            </button>
          </div>
          {promoError && (
            <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '8px' }}>{promoError}</p>
          )}
          {discount > 0 && (
            <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '8px' }}>
              Sleva uplatnena: -{discount} Kč
            </p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <Link
            href="/checkout/email"
            className="flex-1 py-3 border-2 border-black text-center uppercase hover:bg-black hover:text-white transition-colors"
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            Zpět
          </Link>
          <button
            onClick={handleContinue}
            disabled={loading}
            className="flex-1 py-3 bg-black text-white uppercase hover:bg-gray-900 transition-colors disabled:opacity-50"
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            Pokračovat k platbě
          </button>
        </div>
      </div>

      {/* Right: Order Summary */}
      <div className="flex-1 border-l border-black bg-white flex flex-col justify-between sticky top-0 h-screen overflow-y-auto">
        {/* Header Panel */}
        <div className="border-b border-black p-12">
          <h2
            className="uppercase"
            style={{
              fontFamily: '"Helvetica Neue Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '16px',
              fontWeight: 400,
              letterSpacing: '1px'
            }}
          >
            SOUHRN OBJEDNÁVKY
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-12 flex flex-col justify-between">
          <div>
            <div className="space-y-4 mb-8 border-b border-black pb-8">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="flex justify-between text-sm">
                <span>{item.name} × {item.quantity}</span>
                <span style={{ fontWeight: 600 }}>{item.price * item.quantity} Kč</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex justify-between text-sm">
              <span>Mezisoučet</span>
              <span>{subtotal} Kč</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Doprava</span>
              <span>{shippingCost} Kč</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-700">
                <span>Sleva</span>
                <span>-{discount} Kč</span>
              </div>
            )}
            </div>
          </div>

          <div className="border-t border-black pt-6">
            <div className="flex justify-between mb-6">
              <span style={{ fontSize: '16px', fontWeight: 600 }}>CELKEM</span>
              <span style={{ fontSize: '16px', fontWeight: 600 }}>{total} Kč</span>
            </div>

            <Link
              href="/kosik"
              className="block text-center py-2 text-xs uppercase underline hover:no-underline"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '12px'
              }}
            >
              Zpět do košíku
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
