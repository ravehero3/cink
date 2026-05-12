'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCartStore, useCartHydration } from '@/lib/cart-store';
import { calculateShippingCost, getShippingLabel, getAmountToFreeShipping } from '@/lib/shipping';
import Image from 'next/image';
import AnimatedButton from '@/components/AnimatedButton';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, getTotal, clearCart } = useCartStore();
  const hasHydrated = useCartHydration();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  // Flag to prevent empty cart redirect when order is being processed
  const isNavigatingToPayment = useRef(false);

  const [formData, setFormData] = useState({
    email: session?.user?.email || '',
    name: '',
    phone: '',
    shippingMethod: 'zasilkovna',
    zasilkovnaId: '',
    zasilkovnaName: '',
    pplId: '',
    pplName: '',
    shippingStreet: '',
    shippingCity: '',
    shippingZip: '',
    promoCode: '',
  });

  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [showManualZasilkovnaForm, setShowManualZasilkovnaForm] = useState(false);

  useEffect(() => {
    // Don't redirect if we're intentionally navigating to payment page
    if (isNavigatingToPayment.current) return;
    
    if (hasHydrated && items.length === 0) {
      router.push('/kosik');
    }
  }, [items, router, hasHydrated]);

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

  useEffect(() => {
    // PPL Widget selection listener
    const handlePplSelect = (event: any) => {
      const point = event.detail;
      if (point) {
        setFormData(prev => ({
          ...prev,
          pplId: point.code,
          pplName: `${point.name}, ${point.street} ${point.houseNumber}, ${point.zipCode} ${point.city}`,
        }));
      }
    };

    document.addEventListener('ppl-accesspointwidget-select', handlePplSelect);
    return () => document.removeEventListener('ppl-accesspointwidget-select', handlePplSelect);
  }, []);

  const openPplWidget = () => {
    const widget = document.querySelector('ppl-access-point-widget') as any;
    if (widget && typeof widget.open === 'function') {
      widget.open();
    } else {
      console.error('PPL widget not found or not initialized');
      alert('PPL widget se nepodařilo načíst. Zkuste to prosím znovu.');
    }
  };

  const rawSubtotal = getTotal();
  const subtotal = typeof rawSubtotal === 'number' && !isNaN(rawSubtotal) ? rawSubtotal : 0;
  const shippingCost = calculateShippingCost(subtotal, formData.shippingMethod);
  const amountToFreeShipping = getAmountToFreeShipping(subtotal);
  const safeDiscount = typeof discount === 'number' && !isNaN(discount) ? discount : 0;
  const total = Math.max(0, subtotal + shippingCost - safeDiscount);

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

    if (formData.shippingMethod === 'ppl_address' && (!formData.shippingStreet || !formData.shippingCity || !formData.shippingZip)) {
      alert('Vyplňte prosím doručovací adresu');
      return;
    }

    if (formData.shippingMethod === 'ppl_parcelshop' && !formData.pplId) {
      alert('Vyberte prosím výdejní místo PPL ParcelShop');
      return;
    }

    setLoading(true);

    try {
      const finalTotal = Number(total);
      if (isNaN(finalTotal) || finalTotal <= 0) {
        alert('Chyba při výpočtu ceny. Zkuste obnovit stránku.');
        setLoading(false);
        return;
      }

      const orderItems = items.map(item => ({
        ...item,
        price: Number(item.price),
        quantity: Number(item.quantity)
      }));

      // Create order
      const orderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderItems,
          customerEmail: formData.email,
          customerName: formData.name,
          customerPhone: formData.phone,
          shippingMethod: formData.shippingMethod,
          zasilkovnaId: formData.zasilkovnaId,
          zasilkovnaName: formData.zasilkovnaName,
          pplId: formData.pplId,
          pplName: formData.pplName,
          shippingStreet: formData.shippingStreet,
          shippingCity: formData.shippingCity,
          shippingZip: formData.shippingZip,
          promoCode: formData.promoCode,
          totalPrice: finalTotal,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        alert(orderData.error || 'Chyba při vytváření objednávky');
        setLoading(false);
        return;
      }

      // Set flag to prevent empty cart redirect
      isNavigatingToPayment.current = true;
      
      // Clear cart and cleanup
      clearCart();
      sessionStorage.removeItem('checkoutEmail');
      sessionStorage.removeItem('checkoutData');

      // Redirect to payment page where customer can review order and select payment method
      window.location.href = `/platba?order=${orderData.orderNumber}&token=${orderData.securityToken}`;
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

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-body">Načítám...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="max-w-7xl mx-auto px-4 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-full border-b border-black">
          <div className="lg:col-span-2 h-full flex flex-col">
            <form onSubmit={handleSubmit} className="lg:border-l border-black p-4 lg:p-8 flex flex-col h-full">
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
                {/* Zásilkovna Option */}
                <label className={`flex items-start p-3 sm:p-4 cursor-pointer border rounded-md mb-2 ${formData.shippingMethod === 'zasilkovna' ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    name="shipping"
                    value="zasilkovna"
                    checked={formData.shippingMethod === 'zasilkovna'}
                    onChange={(e) => setFormData({ ...formData, shippingMethod: e.target.value })}
                    className="mr-3 sm:mr-4 mt-1"
                  />
                  <div className="flex-1 flex justify-between items-start gap-2">
                    <div>
                      <p className="text-body font-bold leading-tight">Zásilkovna</p>
                      <p className="text-body text-xs sm:text-sm">Doručení na výdejní místo</p>
                    </div>
                    <p className="text-body font-bold whitespace-nowrap" style={{ color: calculateShippingCost(subtotal, 'zasilkovna') === 0 ? '#24e053' : 'inherit' }}>
                      {calculateShippingCost(subtotal, 'zasilkovna') === 0 ? 'ZDARMA' : `${calculateShippingCost(subtotal, 'zasilkovna')} Kč`}
                    </p>
                  </div>
                </label>

                {formData.shippingMethod === 'zasilkovna' && (
                  <button
                    type="button"
                    onClick={openZasilkovnaWidget}
                    className="w-full border border-black bg-white text-black px-4 py-2 text-body uppercase hover:bg-gray-100 transition-colors mb-4"
                    style={{ borderRadius: '4px', marginTop: '4px', borderWidth: '1px' }}
                  >
                    {formData.zasilkovnaName ? `Změnit: ${formData.zasilkovnaName}` : 'VYBRAT VÝDEJNÍ MÍSTO ZÁSILKOVNY'}
                  </button>
                )}

                {/* PPL Home Delivery Option */}
                <label className={`flex items-start p-3 sm:p-4 cursor-pointer border rounded-md mb-2 ${formData.shippingMethod === 'ppl_address' ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    name="shipping"
                    value="ppl_address"
                    checked={formData.shippingMethod === 'ppl_address'}
                    onChange={(e) => setFormData({ ...formData, shippingMethod: e.target.value })}
                    className="mr-3 sm:mr-4 mt-1"
                  />
                  <div className="flex-1 flex justify-between items-start gap-2">
                    <div>
                      <p className="text-body font-bold leading-tight">PPL - Doručení na adresu</p>
                      <p className="text-body text-xs sm:text-sm">Kurýr doručí zásilku až k vám domů</p>
                    </div>
                    <p className="text-body font-bold whitespace-nowrap" style={{ color: calculateShippingCost(subtotal, 'ppl_address') === 0 ? '#24e053' : 'inherit' }}>
                      {calculateShippingCost(subtotal, 'ppl_address') === 0 ? 'ZDARMA' : `${calculateShippingCost(subtotal, 'ppl_address')} Kč`}
                    </p>
                  </div>
                </label>

                {formData.shippingMethod === 'ppl_address' && (
                  <div className="space-y-2 mt-2 p-4 border border-black rounded-md bg-white">
                    <p className="text-xs font-bold uppercase mb-2">Doručovací adresa</p>
                    <input
                      type="text"
                      placeholder="Ulice a číslo popisné *"
                      required={formData.shippingMethod === 'ppl_address'}
                      value={formData.shippingStreet}
                      onChange={(e) => setFormData({ ...formData, shippingStreet: e.target.value })}
                      className="w-full border border-black px-2 py-1 text-body focus:outline-none"
                      style={{ borderRadius: '4px' }}
                    />
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Město *"
                        required={formData.shippingMethod === 'ppl_address'}
                        value={formData.shippingCity}
                        onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
                        className="w-full sm:flex-1 border border-black px-2 py-1 text-body focus:outline-none"
                        style={{ borderRadius: '4px' }}
                      />
                      <input
                        type="text"
                        placeholder="PSČ *"
                        required={formData.shippingMethod === 'ppl_address'}
                        value={formData.shippingZip}
                        onChange={(e) => setFormData({ ...formData, shippingZip: e.target.value })}
                        className="w-full sm:w-24 border border-black px-2 py-1 text-body focus:outline-none"
                        style={{ borderRadius: '4px' }}
                      />
                    </div>
                  </div>
                )}

                {/* PPL ParcelShop Option (Placeholder for widget) */}
                <label className={`flex items-start p-3 sm:p-4 cursor-pointer border rounded-md mb-2 ${formData.shippingMethod === 'ppl_parcelshop' ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    name="shipping"
                    value="ppl_parcelshop"
                    checked={formData.shippingMethod === 'ppl_parcelshop'}
                    onChange={(e) => setFormData({ ...formData, shippingMethod: e.target.value })}
                    className="mr-3 sm:mr-4 mt-1"
                  />
                  <div className="flex-1 flex justify-between items-start gap-2">
                    <div>
                      <p className="text-body font-bold leading-tight">PPL ParcelShop</p>
                      <p className="text-body text-xs sm:text-sm">Vyzvednutí na výdejním místě PPL</p>
                    </div>
                    <p className="text-body font-bold whitespace-nowrap" style={{ color: calculateShippingCost(subtotal, 'ppl_parcelshop') === 0 ? '#24e053' : 'inherit' }}>
                      {calculateShippingCost(subtotal, 'ppl_parcelshop') === 0 ? 'ZDARMA' : `${calculateShippingCost(subtotal, 'ppl_parcelshop')} Kč`}
                    </p>
                  </div>
                </label>

                {formData.shippingMethod === 'ppl_parcelshop' && (
                  <button
                    type="button"
                    onClick={openPplWidget}
                    className="w-full border border-black bg-white text-black px-4 py-2 text-body uppercase hover:bg-gray-100 transition-colors mb-4"
                    style={{ borderRadius: '4px', marginTop: '4px', borderWidth: '1px' }}
                  >
                    {formData.pplName ? `Změnit: ${formData.pplName}` : 'VYBRAT VÝDEJNÍ MÍSTO PPL'}
                  </button>
                )}

                {/* PPL Widget Web Component */}
                <div style={{ display: 'none' }}>
                  {/* @ts-ignore */}
                  <ppl-access-point-widget api-key={process.env.NEXT_PUBLIC_PPL_API_KEY || 'demo'}></ppl-access-point-widget>
                </div>
              </div>

              <div className="mt-4">
                <AnimatedButton 
                  text="PŘEJÍT K PLATBĚ" 
                  loading={loading}
                  disabled={
                    !formData.email || 
                    !formData.name || 
                    !formData.phone || 
                    (formData.shippingMethod === 'zasilkovna' && !formData.zasilkovnaId) ||
                    (formData.shippingMethod === 'ppl_address' && (!formData.shippingStreet || !formData.shippingCity || !formData.shippingZip)) ||
                    (formData.shippingMethod === 'ppl_parcelshop' && !formData.pplId)
                  }
                  type="submit"
                  className="w-full"
                />
              </div>
            </form>
          </div>

          <div className="lg:col-span-1 h-full">
            <div className="lg:border-l lg:border-r border-black h-full flex flex-col">
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
                  <span style={{ color: shippingCost === 0 ? '#24e053' : 'inherit' }}>
                    {shippingCost === 0 ? 'ZDARMA' : `${shippingCost} Kč`}
                  </span>
                </div>
                {amountToFreeShipping > 0 && (
                  <p style={{ fontSize: '11px', color: '#24e053', marginTop: '4px' }}>
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
