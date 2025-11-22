'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import Link from 'next/link';
import Image from 'next/image';

interface CheckoutData {
  email: string;
  name: string;
  phone: string;
  shippingMethod: string;
  zasilkovnaId: string;
  zasilkovnaName: string;
  zasilkovnaCity: string;
  promoCode: string;
}

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (items.length === 0) {
      router.push('/kosik');
      return;
    }

    const stored = sessionStorage.getItem('checkoutData');
    if (!stored) {
      router.push('/checkout/email');
      return;
    }

    setCheckoutData(JSON.parse(stored));
  }, [items, router]);

  const handleProcessPayment = async () => {
    if (!checkoutData) return;

    setLoading(true);
    setError('');

    try {
      const subtotal = getTotal();
      const shippingCost = 79;
      const discount = checkoutData.promoCode ? 0 : 0; // Will be calculated by backend
      const totalPrice = subtotal + shippingCost - discount;

      // Create order
      const orderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customerEmail: checkoutData.email,
          customerName: checkoutData.name,
          customerPhone: checkoutData.phone,
          shippingMethod: checkoutData.shippingMethod,
          zasilkovnaId: checkoutData.zasilkovnaId,
          zasilkovnaName: checkoutData.zasilkovnaName,
          promoCode: checkoutData.promoCode,
          totalPrice,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Chyba při vytváření objednávky');
      }

      // Create GoPay payment
      const paymentResponse = await fetch('/api/gopay/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: orderData.orderNumber,
          amount: totalPrice,
          customerName: checkoutData.name,
          customerEmail: checkoutData.email,
          customerPhone: checkoutData.phone,
          items,
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(paymentData.error || 'Chyba při vytváření platby');
      }

      // Clear cart and redirect to GoPay
      clearCart();
      sessionStorage.removeItem('checkoutEmail');
      sessionStorage.removeItem('checkoutData');

      if (paymentData.paymentUrl) {
        window.location.href = paymentData.paymentUrl;
      } else {
        router.push(`/potvrzeni/${orderData.orderNumber}`);
      }
    } catch (err: any) {
      setError(err.message || 'Došlo k chybě. Zkuste to prosím znovu.');
      setLoading(false);
    }
  };

  if (!checkoutData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p style={{ fontSize: '14px' }}>Načítám...</p>
      </div>
    );
  }

  const subtotal = getTotal();
  const shippingCost = 79;
  const total = subtotal + shippingCost;

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left: Payment Info */}
      <div className="flex-1 border-r border-black p-12 flex flex-col justify-center max-w-2xl overflow-y-auto">
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
            PLATBA
          </h1>
          <p
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              color: '#666'
            }}
          >
            Krok 3 ze 3
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 mb-8">
            <p style={{ fontSize: '14px', color: '#dc2626' }}>{error}</p>
          </div>
        )}

        {/* Order Summary */}
        <div className="mb-12 border border-black p-6">
          <h3
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '16px',
              textTransform: 'uppercase'
            }}
          >
            Souhrn objednávky
          </h3>

          <div className="space-y-4 mb-6 border-b border-black pb-6">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="flex justify-between text-sm">
                <div>
                  <p style={{ fontWeight: 600 }}>{item.name}</p>
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    Velikost: {item.size} × {item.quantity}
                  </p>
                </div>
                <p style={{ fontWeight: 600 }}>{item.price * item.quantity} Kč</p>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm mb-6">
            <div className="flex justify-between">
              <span>Mezisoučet</span>
              <span>{subtotal} Kč</span>
            </div>
            <div className="flex justify-between">
              <span>Doprava (Zásilkovna)</span>
              <span>{shippingCost} Kč</span>
            </div>
          </div>

          <div className="border-t border-black pt-6 flex justify-between text-lg">
            <span style={{ fontWeight: 600 }}>CELKEM</span>
            <span style={{ fontWeight: 600 }}>{total} Kč</span>
          </div>
        </div>

        {/* Shipping Details */}
        <div className="mb-12">
          <h3
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '16px',
              textTransform: 'uppercase'
            }}
          >
            Doručovací údaje
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <p style={{ fontSize: '12px', color: '#666' }}>KONTAKTNÍ OSOBA</p>
              <p style={{ fontWeight: 600 }}>{checkoutData.name}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#666' }}>TELEFON</p>
              <p style={{ fontWeight: 600 }}>{checkoutData.phone}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#666' }}>E-MAIL</p>
              <p style={{ fontWeight: 600 }}>{checkoutData.email}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#666' }}>VÝDEJNÍ MÍSTO</p>
              <p style={{ fontWeight: 600 }}>{checkoutData.zasilkovnaName}</p>
              <p style={{ fontSize: '12px' }}>{checkoutData.zasilkovnaCity}</p>
            </div>
          </div>
        </div>

        {/* GoPay Info */}
        <div className="mb-12 p-6 bg-gray-50 border border-gray-200">
          <h3
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '12px',
              textTransform: 'uppercase'
            }}
          >
            GoPay Platba
          </h3>
          <p style={{ fontSize: '13px', lineHeight: '1.6' }}>
            Po kliknutí na tlačítko "Zaplatit" budete přesměrováni na bezpečný platební server GoPay. 
            Akceptujeme všechny hlavní platební metody.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <Link
            href="/checkout/doprava"
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
            onClick={handleProcessPayment}
            disabled={loading}
            className="flex-1 py-3 bg-black text-white uppercase hover:bg-gray-900 transition-colors disabled:opacity-50"
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            {loading ? 'ZPRACUJI...' : 'ZAPLATIT'}
          </button>
        </div>
      </div>

      {/* Right: Payment Methods */}
      <div className="w-96 border-l border-black p-12 bg-white sticky top-0 h-screen overflow-y-auto">
        <h2
          className="uppercase mb-8"
          style={{
            fontFamily: '"Helvetica Neue Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '16px',
            fontWeight: 400,
            letterSpacing: '1px'
          }}
        >
          Platební metody
        </h2>

        <div className="space-y-4">
          <div className="p-4 border-2 border-black bg-black text-white">
            <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>GoPay</p>
            <p style={{ fontSize: '12px', color: '#f0f0f0' }}>
              Platba kartou, bankovním převodem a dalšími metodami
            </p>
          </div>

          <div style={{ borderTop: '1px solid #ccc', paddingTop: '16px', marginTop: '16px' }}>
            <p style={{ fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
              Vaše osobní údaje budou použity k zpracování objednávky. Podrobnosti najdete v našich{' '}
              <Link href="/podminky" className="underline hover:no-underline">
                podmínkách
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
