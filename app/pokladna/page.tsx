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
  const [step, setStep] = useState(2); // 1 = EMAIL, 2 = SHIPPING, 3 = PAYMENT
  const [loading, setLoading] = useState(false);
  const isNavigatingToPayment = useRef(false);

  const [formData, setFormData] = useState({
    email: session?.user?.email || '',
    name: '',
    phone: '',
    civility: 'Mr.',
    shippingMethod: 'zasilkovna',
    zasilkovnaId: '',
    zasilkovnaName: '',
    pplId: '',
    pplName: '',
    shippingStreet: '',
    shippingCity: '',
    shippingZip: '',
    promoCode: '',
    newsletterSubscribed: true,
  });

  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [isPplModalOpen, setIsPplModalOpen] = useState(false);

  useEffect(() => {
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
    const timer = setTimeout(async () => {
      if (formData.email && formData.email.includes('@') && items.length > 0) {
        try {
          await fetch('/api/abandoned-cart/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: formData.email,
              items: items
            })
          });
        } catch (error) {
          console.error('Error tracking abandoned cart:', error);
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData.email, items]);

  useEffect(() => {
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
    const handlePplSelect = (event: any) => {
      console.log('PPL select event received:', event.detail);
      const point = event.detail;
      if (point) {
        setFormData(prev => ({
          ...prev,
          pplId: point.code || point.id,
          pplName: `${point.name}, ${point.address || (point.street + ' ' + point.city)}`,
        }));
        setIsPplModalOpen(false);
      }
    };

    document.addEventListener('ppl-parcelshop-map', handlePplSelect);
    return () => document.removeEventListener('ppl-parcelshop-map', handlePplSelect);
  }, []);

  const openPplWidget = () => {
    setIsPplModalOpen(true);
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
          email: formData.email,
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
          newsletterSubscribed: formData.newsletterSubscribed,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        alert(orderData.error || 'Chyba při vytváření objednávky');
        setLoading(false);
        return;
      }

      isNavigatingToPayment.current = true;
      clearCart();
      sessionStorage.removeItem('checkoutEmail');
      sessionStorage.removeItem('checkoutData');

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
        }
      } else {
        retries++;
        if (retries < maxRetries) {
          setTimeout(openWidget, 50);
        }
      }
    };
    
    openWidget();
  };

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px' }}>Načítám...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with Logo and FAQ */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '20px 40px',
        borderBottom: '1px solid #000',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        <button onClick={() => router.back()} style={{
          fontSize: '20px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0',
          color: '#000'
        }}>
          ←
        </button>
        <h1 style={{
          fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: '16px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.03em',
          margin: '0',
          flex: 1,
          textAlign: 'center'
        }}>
          UFO SPORT
        </h1>
        <a href="#" style={{
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: '12px',
          fontWeight: 400,
          textDecoration: 'none',
          color: '#000',
          textTransform: 'uppercase'
        }}>
          FAQ
        </a>
      </div>

      {/* Step Indicators */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '40px',
        padding: '24px 40px',
        borderBottom: '1px solid #000',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        {[
          { num: '1', label: 'EMAIL', active: step === 1 },
          { num: '2', label: 'SHIPPING', active: step === 2 },
          { num: '3', label: 'PAYMENT', active: step === 3 }
        ].map((s) => (
          <div key={s.num} style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              color: s.active ? '#000' : '#999',
              borderBottom: s.active ? '2px solid #000' : 'none',
              paddingBottom: '4px'
            }}>
              {s.num}. {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', paddingTop: '40px', paddingBottom: '40px', paddingLeft: '40px', paddingRight: '40px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '60px', flexDirection: 'row' }}>
          {/* Left Column - Form */}
          <div style={{ flex: 1, minWidth: '0' }}>
            {/* EMAIL Section */}
            <div style={{ marginBottom: '60px' }}>
              <h2 style={{
                fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                marginBottom: '24px',
                marginTop: 0
              }}>
                EMAIL
              </h2>
              <div style={{ marginBottom: '12px' }}>
                <p style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  marginBottom: '8px',
                  marginTop: 0
                }}>
                  {formData.email}
                </p>
                <a href="#" style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '12px',
                  fontWeight: 400,
                  textDecoration: 'underline',
                  color: '#000'
                }}>
                  Edit
                </a>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <p style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  marginBottom: '8px',
                  marginTop: 0,
                  color: '#666'
                }}>
                  Shipping country/region: <strong>Czechia.</strong>
                </p>
                <a href="#" style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '12px',
                  fontWeight: 400,
                  textDecoration: 'underline',
                  color: '#000'
                }}>
                  Edit
                </a>
              </div>

              <div>
                <p style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  marginBottom: '8px',
                  marginTop: 0,
                  color: '#666'
                }}>
                  ZIP Code: <strong>503 46.</strong>
                </p>
                <a href="#" style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '12px',
                  fontWeight: 400,
                  textDecoration: 'underline',
                  color: '#000'
                }}>
                  Edit
                </a>
              </div>
            </div>

            {/* SHIPPING OPTIONS */}
            <div>
              <h2 style={{
                fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                marginBottom: '12px',
                marginTop: 0
              }}>
                SHIPPING OPTIONS
              </h2>
              <p style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                color: '#666',
                marginBottom: '24px',
                marginTop: 0
              }}>
                Orders containing fragrances or personalized items may require some additional days for processing and delivery.
              </p>

              {/* Zasilkovna Option */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                padding: '16px',
                border: '1px solid #000',
                marginBottom: '12px',
                cursor: 'pointer',
                borderRadius: '4px',
                backgroundColor: formData.shippingMethod === 'zasilkovna' ? '#f5f5f5' : '#fff'
              }}>
                <input
                  type="radio"
                  name="shipping"
                  value="zasilkovna"
                  checked={formData.shippingMethod === 'zasilkovna'}
                  onChange={(e) => setFormData({ ...formData, shippingMethod: e.target.value })}
                  style={{ marginRight: '16px', marginTop: '2px' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{
                        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                        fontSize: '14px',
                        fontWeight: 400,
                        margin: '0',
                        marginBottom: '4px'
                      }}>
                        Express shipping
                      </p>
                    </div>
                    <p style={{
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      margin: '0',
                      color: calculateShippingCost(subtotal, 'zasilkovna') === 0 ? '#24e053' : '#000'
                    }}>
                      {calculateShippingCost(subtotal, 'zasilkovna') === 0 ? 'Free' : `${calculateShippingCost(subtotal, 'zasilkovna')} Kč`}
                    </p>
                  </div>
                  <div style={{ backgroundColor: '#f0f0f0', padding: '12px', marginTop: '12px', textAlign: 'center' }}>
                    <p style={{
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '12px',
                      fontWeight: 400,
                      margin: '0'
                    }}>
                      Guaranteed delivery by: 12/10/2026
                    </p>
                  </div>
                </div>
              </label>

              {/* Pick up in store */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                padding: '16px',
                border: '1px solid #000',
                cursor: 'pointer',
                borderRadius: '4px',
                backgroundColor: formData.shippingMethod === 'ppl_parcelshop' ? '#f5f5f5' : '#fff'
              }}>
                <input
                  type="radio"
                  name="shipping"
                  value="ppl_parcelshop"
                  checked={formData.shippingMethod === 'ppl_parcelshop'}
                  onChange={(e) => setFormData({ ...formData, shippingMethod: e.target.value })}
                  style={{ marginRight: '16px', marginTop: '2px' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <p style={{
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      margin: '0'
                    }}>
                      Pick up in store
                    </p>
                    <p style={{
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      margin: '0',
                      color: calculateShippingCost(subtotal, 'ppl_parcelshop') === 0 ? '#24e053' : '#000'
                    }}>
                      {calculateShippingCost(subtotal, 'ppl_parcelshop') === 0 ? 'Free' : `${calculateShippingCost(subtotal, 'ppl_parcelshop')} Kč`}
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {/* DELIVERY INFORMATION */}
            <div style={{ marginTop: '60px' }}>
              <h2 style={{
                fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                marginBottom: '24px',
                marginTop: 0
              }}>
                DELIVERY INFORMATION
              </h2>

              {/* Civility */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '12px',
                  fontWeight: 400,
                  marginBottom: '8px',
                  color: '#666'
                }}>
                  Civility * <span style={{ color: '#999' }}>*required</span>
                </label>
                <select
                  value={formData.civility}
                  onChange={(e) => setFormData({ ...formData, civility: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #000',
                    borderRadius: '4px',
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400
                  }}
                >
                  <option>Mr.</option>
                  <option>Ms.</option>
                </select>
              </div>

              {/* First Name */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '12px',
                  fontWeight: 400,
                  marginBottom: '8px',
                  color: '#666'
                }}>
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #000',
                    borderRadius: '4px',
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Last Name */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '12px',
                  fontWeight: 400,
                  marginBottom: '8px',
                  color: '#666'
                }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Last Name"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #000',
                    borderRadius: '4px',
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Address */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '12px',
                  fontWeight: 400,
                  marginBottom: '8px',
                  color: '#666'
                }}>
                  Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.shippingStreet}
                  onChange={(e) => setFormData({ ...formData, shippingStreet: e.target.value })}
                  placeholder="Start Typing The First Line Of Your Address"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #000',
                    borderRadius: '4px',
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    boxSizing: 'border-box'
                  }}
                />
                <a href="#" style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '12px',
                  fontWeight: 400,
                  textDecoration: 'underline',
                  color: '#000',
                  display: 'block',
                  marginTop: '8px'
                }}>
                  Clear
                </a>
              </div>

              {/* Prefix and Phone */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ width: '100px' }}>
                  <label style={{
                    display: 'block',
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '12px',
                    fontWeight: 400,
                    marginBottom: '8px',
                    color: '#666'
                  }}>
                    Prefix *
                  </label>
                  <select
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #000',
                      borderRadius: '4px',
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400'
                    }}
                  >
                    <option>+420</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '12px',
                    fontWeight: 400,
                    marginBottom: '8px',
                    color: '#666'
                  }}>
                    Mobile phone number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #000',
                      borderRadius: '4px',
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* GIFT MESSAGE */}
            <div style={{ marginTop: '60px', padding: '24px', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}>
                <input type="checkbox" style={{ marginRight: '12px', marginTop: '2px' }} />
                <span style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400
                }}>
                  Buying a gift? Add a ribbon a personalised gift message
                </span>
              </label>
            </div>

            {/* SAVE AND CONTINUE Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                marginTop: '40px',
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '0',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '12px',
                fontWeight: 400,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Processing...' : 'SAVE AND CONTINUE'}
            </button>
          </div>

          {/* Right Column - Order Summary */}
          <div style={{ width: '320px', paddingTop: '0' }}>
            <div style={{
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              padding: '24px'
            }}>
              <h3 style={{
                fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                marginBottom: '16px',
                marginTop: 0
              }}>
                ORDER SUMMARY
              </h3>

              {items.map((item) => (
                <div key={`${item.productId}-${item.size}`} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e0e0e0' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <div style={{
                      width: '60px',
                      height: '80px',
                      border: '1px solid #000',
                      flexShrink: 0,
                      overflow: 'hidden'
                    }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                        fontSize: '11px',
                        fontWeight: 400,
                        margin: '0 0 4px 0',
                        lineHeight: 1.3
                      }}>
                        {item.name}
                      </p>
                      <p style={{
                        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                        fontSize: '10px',
                        fontWeight: 400,
                        margin: '0 0 4px 0',
                        color: '#666'
                      }}>
                        {item.size} - Qty: {item.quantity}
                      </p>
                      <p style={{
                        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                        fontSize: '11px',
                        fontWeight: 400,
                        margin: '0'
                      }}>
                        {(item.price * item.quantity).toLocaleString('cs-CZ')} Kč
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '11px',
                  fontWeight: 400,
                  marginBottom: '8px',
                  color: '#666'
                }}>
                  Promo code
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={formData.promoCode}
                    onChange={(e) => {
                      setFormData({ ...formData, promoCode: e.target.value });
                      setPromoError('');
                    }}
                    placeholder="CODE"
                    style={{
                      flex: 1,
                      padding: '8px',
                      border: '1px solid #000',
                      borderRadius: '4px',
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '12px',
                      fontWeight: 400,
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #000',
                      borderRadius: '4px',
                      backgroundColor: '#fff',
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '11px',
                      fontWeight: 400,
                      textTransform: 'uppercase',
                      cursor: 'pointer'
                    }}
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '11px',
                  fontWeight: 400,
                  color: '#f00',
                  marginTop: '4px'
                }}>{promoError}</p>}
              </div>

              <div style={{
                borderTop: '1px solid #e0e0e0',
                paddingTop: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '12px',
                    fontWeight: 400
                  }}>
                    Subtotal
                  </span>
                  <span style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '12px',
                    fontWeight: 400
                  }}>
                    {subtotal.toLocaleString('cs-CZ')} Kč
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '12px',
                    fontWeight: 400
                  }}>
                    Shipping
                  </span>
                  <span style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '12px',
                    fontWeight: 400,
                    color: shippingCost === 0 ? '#24e053' : '#000'
                  }}>
                    {shippingCost === 0 ? 'Free' : `${shippingCost.toLocaleString('cs-CZ')} Kč`}
                  </span>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '12px',
                      fontWeight: 400
                    }}>
                      Discount
                    </span>
                    <span style={{
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '12px',
                      fontWeight: 400
                    }}>
                      -{discount.toLocaleString('cs-CZ')} Kč
                    </span>
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  borderTop: '1px solid #e0e0e0'
                }}>
                  <span style={{
                    fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    TOTAL
                  </span>
                  <span style={{
                    fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    {total.toLocaleString('cs-CZ')} Kč <span style={{ fontSize: '10px', fontWeight: 400 }}>(tax included)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* PPL Widget Modal */}
      <div 
        className={`fixed inset-0 z-[100] bg-white flex flex-col transition-all duration-300 ${
          isPplModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-black bg-black text-white">
          <h2 className="font-bold uppercase text-sm tracking-widest">Select PPL ParcelShop</h2>
          <button 
            onClick={() => setIsPplModalOpen(false)} 
            className="px-4 py-2 border border-white uppercase text-xs hover:bg-white hover:text-black transition-colors"
          >
            Close
          </button>
        </div>
        <div className="flex-1 relative bg-gray-100">
          <div 
            id="ppl-parcelshop-map" 
            data-language="cs" 
            data-mode="default"
            style={{ height: '100%', width: '100%', minHeight: '500px' }}
          ></div>
        </div>
      </div>
    </div>
  );
}
