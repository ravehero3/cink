'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/lib/cart-store';
import { calculateShippingCost, getShippingLabel, getAmountToFreeShipping } from '@/lib/shipping';
import Image from 'next/image';

function AnimatedCheckoutButton({ 
  text, 
  loading, 
  disabled 
}: { 
  text: string; 
  loading: boolean;
  disabled: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="submit"
      disabled={disabled || loading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full bg-black text-white uppercase font-bold border border-black relative overflow-hidden disabled:opacity-50"
      style={{ borderRadius: '4px', padding: '8px 0', height: '32px', fontSize: '12px', textAlign: 'center' }}
    >
      <span
        className="block transition-all duration-300"
        style={{
          transform: isHovered ? 'translateY(-150%)' : 'translateY(0)',
          opacity: isHovered ? 0 : 1,
          width: '100%',
          textAlign: 'center'
        }}
      >
        {loading ? 'ZPRACOVÁNÍ...' : text}
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{
          transform: isHovered ? 'translateY(0)' : 'translateY(150%)',
          opacity: isHovered ? 1 : 0,
        }}
      >
        {text}
      </span>
    </button>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, getTotal } = useCartStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: session?.user?.email || '',
    name: '',
    phone: '',
    shippingMethod: 'zasilkovna',
    zasilkovnaId: '',
    zasilkovnaName: '',
    promoCode: '',
  });

  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [showManualZasilkovnaForm, setShowManualZasilkovnaForm] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      router.push('/kosik');
    }
  }, [items, router]);

  useEffect(() => {
    if (session?.user?.email) {
      setFormData(prev => ({ ...prev, email: session.user.email || '' }));
    }
  }, [session?.user?.email]);

  useEffect(() => {
    // Script is loaded globally in layout.tsx
    // Just verify it's available
    if (typeof window === 'undefined') return;
    
    let checkCount = 0;
    const checkInterval = setInterval(() => {
      checkCount++;
      if ((window as any).Packeta?.Widget?.pick) {
        console.log('Zasilkovna widget is ready');
        clearInterval(checkInterval);
      } else if (checkCount > 100) {
        console.error('Zasilkovna widget failed to load');
        clearInterval(checkInterval);
      }
    }, 100);
    
    return () => clearInterval(checkInterval);
  }, []);

  const subtotal = getTotal();
  const shippingCost = calculateShippingCost(subtotal);
  const amountToFreeShipping = getAmountToFreeShipping(subtotal);
  const total = subtotal + shippingCost - discount;

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
          orderAmount: subtotal,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.name || !formData.phone) {
      alert('Vyplňte prosím všechny povinné údaje');
      return;
    }

    if (formData.shippingMethod === 'zasilkovna' && !formData.zasilkovnaId) {
      alert('Vyberte prosím výdejní místo Zásilkovny');
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customerEmail: formData.email,
          customerName: formData.name,
          customerPhone: formData.phone,
          shippingMethod: formData.shippingMethod,
          zasilkovnaId: formData.zasilkovnaId,
          zasilkovnaName: formData.zasilkovnaName,
          promoCode: formData.promoCode,
          totalPrice: total,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        alert(orderData.error || 'Chyba při vytváření objednávky');
        setLoading(false);
        return;
      }

      // Create GoPay payment
      const paymentResponse = await fetch('/api/gopay/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: orderData.orderNumber,
          amount: total,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          items,
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        // Even if payment creation fails, order was created, so show confirmation
        alert('Objednávka byla vytvořena, ale tvorba platby selhala. Přejděte prosím do svého účtu.');
      }

      // Clear cart and cleanup
      clearCart();
      sessionStorage.removeItem('checkoutEmail');
      sessionStorage.removeItem('checkoutData');

      // Redirect to payment or confirmation
      if (paymentResponse.ok && paymentData.gatewayUrl) {
        window.location.href = paymentData.gatewayUrl;
      } else {
        router.push(`/potvrzeni/${orderData.orderNumber}`);
      }
    } catch (error) {
      alert('Došlo k chybě. Zkuste to prosím znovu.');
      setLoading(false);
    }
  };

  const openZasilkovnaWidget = () => {
    if (typeof window === 'undefined') return;
    
    let retries = 0;
    const maxRetries = 20;
    
    const openWidget = () => {
      if ((window as any).Packeta?.Widget?.pick) {
        try {
          (window as any).Packeta.Widget.pick(process.env.NEXT_PUBLIC_ZASILKOVNA_API_KEY || 'demo', (point: any) => {
            if (point) {
              setFormData({
                ...formData,
                zasilkovnaId: point.id,
                zasilkovnaName: `${point.name}, ${point.street}, ${point.zip} ${point.place}`,
              });
            }
          }, {
            country: 'cz',
            language: 'cs',
          });
        } catch (err) {
          console.error('Error opening widget:', err);
          setShowManualZasilkovnaForm(true);
        }
      } else {
        retries++;
        if (retries < maxRetries) {
          setTimeout(openWidget, 50);
        } else {
          console.error('Widget not available, showing manual form');
          setShowManualZasilkovnaForm(true);
        }
      }
    };
    
    openWidget();
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="max-w-7xl mx-auto px-4 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-full border-b border-black">
          <div className="lg:col-span-2 h-full flex flex-col">
            <form onSubmit={handleSubmit} className="border-l border-black p-8 flex flex-col h-full">
              <h2 
                className="font-bold mb-4 uppercase"
                style={{
                  fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 700,
                  lineHeight: '16.1px'
                }}
              >
                KONTAKTNÍ ÚDAJE
              </h2>

              <div className="mb-1">
                <label 
                  className="block"
                  style={{
                    fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '10px',
                    fontWeight: 400,
                    lineHeight: '14.1px',
                    paddingLeft: '2px',
                    paddingRight: '2px',
                    color: '#999',
                    marginBottom: '2px'
                  }}
                >
                  E-mail *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-black px-2 py-1 text-body focus:outline-none"
                  style={{ borderRadius: '4px' }}
                />
              </div>

              <div className="mb-1">
                <label 
                  className="block"
                  style={{
                    fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '10px',
                    fontWeight: 400,
                    lineHeight: '14.1px',
                    paddingLeft: '2px',
                    paddingRight: '2px',
                    color: '#999',
                    marginBottom: '2px'
                  }}
                >
                  Jméno a příjmení *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-black px-2 py-1 text-body focus:outline-none"
                  style={{ borderRadius: '4px' }}
                />
              </div>

              <div className="mb-1">
                <label 
                  className="block"
                  style={{
                    fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '10px',
                    fontWeight: 400,
                    lineHeight: '14.1px',
                    paddingLeft: '2px',
                    paddingRight: '2px',
                    color: '#999',
                    marginBottom: '2px'
                  }}
                >
                  Telefon *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-black px-2 py-1 text-body focus:outline-none"
                  style={{ borderRadius: '4px' }}
                />
              </div>

              <h2 
                className="font-bold mb-4 uppercase pt-4"
                style={{
                  fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '16.1px'
                }}
              >
                DOPRAVA
              </h2>

              <div className="mb-4">
                <label className="flex items-start p-4 cursor-pointer">
                  <input
                    type="radio"
                    name="shipping"
                    value="zasilkovna"
                    checked={formData.shippingMethod === 'zasilkovna'}
                    onChange={(e) => setFormData({ ...formData, shippingMethod: e.target.value })}
                    className="mr-4 mt-1"
                  />
                  <div className="flex-1">
                    <p className="text-body font-bold">Zásilkovna</p>
                    <p className="text-body">Doručení na výdejní místo</p>
                  </div>
                  <p className="text-body font-bold" style={{ color: shippingCost === 0 ? '#6bdc66' : 'inherit' }}>
                    {shippingCost === 0 ? 'ZDARMA' : `${shippingCost} Kč`}
                  </p>
                </label>

                {formData.shippingMethod === 'zasilkovna' && (
                  <button
                    type="button"
                    onClick={openZasilkovnaWidget}
                    className="w-full border border-black bg-white text-black px-4 py-2 text-body uppercase hover:bg-gray-100 transition-colors"
                    style={{ borderRadius: '4px', marginTop: '4px', borderWidth: '1px' }}
                  >
                    {formData.zasilkovnaName ? `Změnit: ${formData.zasilkovnaName}` : 'VYBRAT VÝDEJNÍ MÍSTO'}
                  </button>
                )}
              </div>

              <div className="mt-4">
                <AnimatedCheckoutButton 
                  text="PŘEJÍT K PLATBĚ" 
                  loading={loading}
                  disabled={!formData.email || !formData.name || !formData.phone || (formData.shippingMethod === 'zasilkovna' && !formData.zasilkovnaId)}
                />
              </div>
            </form>
          </div>

          <div className="lg:col-span-1 h-full">
            <div className="border-l border-r border-black h-full flex flex-col">
              <div className="h-header flex items-center justify-center px-6">
                <h2 
                  className="font-bold uppercase"
                  style={{
                    fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '9.33px',
                    fontWeight: 400,
                    lineHeight: '10.7px'
                  }}
                >
                  SOUHRN OBJEDNÁVKY
                </h2>
              </div>
              <div className="border-b border-black"></div>
              <div className="p-6 overflow-auto flex flex-col flex-1">

              <div className="mb-4 pb-4">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex gap-4 mb-4">
                    <div className="w-16 h-16 border border-black flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ borderRadius: '4px' }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{item.name}</p>
                      <p style={{ fontSize: '14px' }}>{item.size} / {item.quantity}x</p>
                      <p style={{ fontSize: '14px' }}>{item.price * item.quantity} Kč</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-4 mt-4">
                <label 
                  className="block font-bold text-body"
                  style={{
                    fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '10px',
                    fontWeight: 400,
                    lineHeight: '14.1px',
                    paddingLeft: '2px',
                    paddingRight: '2px',
                    color: '#999',
                    marginBottom: '2px'
                  }}
                >
                  Promo kód
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.promoCode}
                    onChange={(e) => {
                      setFormData({ ...formData, promoCode: e.target.value });
                      setPromoError('');
                    }}
                    className="flex-1 border border-black px-2 py-1 text-body focus:outline-none"
                    placeholder="KÓD"
                    style={{ borderRadius: '4px' }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="border border-black px-4 py-1 text-body uppercase hover:bg-black hover:text-white transition-colors"
                    style={{ borderRadius: '4px' }}
                  >
                    POUŽÍT
                  </button>
                </div>
                {promoError && <p className="text-body mt-2 text-black">{promoError}</p>}
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between" style={{ fontSize: '14px' }}>
                  <span>Mezisoučet</span>
                  <span>{subtotal} Kč</span>
                </div>
                <div className="flex justify-between" style={{ fontSize: '14px' }}>
                  <span>Doprava</span>
                  <span style={{ color: shippingCost === 0 ? '#6bdc66' : 'inherit' }}>
                    {shippingCost === 0 ? 'ZDARMA' : `${shippingCost} Kč`}
                  </span>
                </div>
                {amountToFreeShipping > 0 && (
                  <p style={{ fontSize: '11px', color: '#6bdc66', marginTop: '4px' }}>
                    Přidejte zboží za {amountToFreeShipping} Kč pro dopravu zdarma!
                  </p>
                )}
                {discount > 0 && (
                  <div className="flex justify-between" style={{ fontSize: '14px' }}>
                    <span>Sleva</span>
                    <span>-{discount} Kč</span>
                  </div>
                )}
                <div className="pt-4">
                  <div className="flex justify-between font-bold" style={{ fontSize: '14px' }}>
                    <span>CELKEM</span>
                    <span>{total} Kč</span>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
