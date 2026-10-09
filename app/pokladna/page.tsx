'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCartStore, useCartHydration } from '@/lib/cart-store';
import { calculateShippingCost, getAmountToFreeShipping } from '@/lib/shipping';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, getTotal, clearCart } = useCartStore();
  const hasHydrated = useCartHydration();
  const isNavigatingToPayment = useRef(false);

  const [step, setStep] = useState(1);
  const [reached, setReached] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: session?.user?.email || '',
    name: '',
    phone: '',
    prefix: '+420',
    shippingMethod: 'ppl_parcelshop',
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
        clearInterval(checkInterval);
      } else if (checkCount > 100) {
        clearInterval(checkInterval);
      }
    }, 100);
    return () => clearInterval(checkInterval);
  }, []);

  useEffect(() => {
    const handlePplSelect = (event: any) => {
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

  const rawSubtotal = getTotal();
  const subtotal = typeof rawSubtotal === 'number' && !isNaN(rawSubtotal) ? rawSubtotal : 0;
  const shippingCost = calculateShippingCost(subtotal, formData.shippingMethod);
  const amountToFreeShipping = getAmountToFreeShipping(subtotal);
  const safeDiscount = typeof discount === 'number' && !isNaN(discount) ? discount : 0;
  const total = Math.max(0, subtotal + shippingCost - safeDiscount);

  const goToStep = (newStep: number) => {
    if (newStep <= reached) {
      setStep(newStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const validateEmail = () => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return formData.email && emailRegex.test(formData.email);
  };

  const validateContact = () => {
    return formData.name && formData.phone;
  };

  const nextStep = (nextNum: number) => {
    if (nextNum === 2 && !validateEmail()) {
      alert('Zadejte platný e-mail');
      return;
    }
    if (nextNum === 3) {
      if (!validateContact()) {
        alert('Vyplňte jméno a telefonní číslo');
        return;
      }
      if (formData.shippingMethod === 'zasilkovna' && !formData.zasilkovnaId) {
        alert('Vyberte výdejní místo Zásilkovny');
        return;
      }
      if (formData.shippingMethod === 'ppl_parcelshop' && !formData.pplId) {
        alert('Vyberte výdejní místo PPL');
        return;
      }
    }
    setReached(Math.max(reached, nextNum));
    setStep(nextNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

    if (!validateEmail() || !validateContact()) {
      alert('Vyplňte všechny povinné údaje');
      return;
    }

    if (formData.shippingMethod === 'zasilkovna' && !formData.zasilkovnaId) {
      alert('Vyberte výdejní místo Zásilkovny');
      return;
    }

    if (formData.shippingMethod === 'ppl_parcelshop' && !formData.pplId) {
      alert('Vyberte výdejní místo PPL');
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
          customerPhone: formData.prefix + ' ' + formData.phone,
          shippingMethod: formData.shippingMethod,
          zasilkovnaId: formData.zasilkovnaId,
          zasilkovnaName: formData.zasilkovnaName,
          pplId: formData.pplId,
          pplName: formData.pplName,
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
              setFormData(prev => ({
                ...prev,
                zasilkovnaId: point.id,
                zasilkovnaName: `${point.name}, ${point.street}, ${point.zip} ${point.place}`,
              }));
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
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '13px' }}>Načítám...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @media (min-width: 1024px) {
          .checkout-grid {
            display: grid !important;
            grid-template-columns: 1fr 33% !important;
          }
          .checkout-aside {
            border-left: 1px solid #000 !important;
            border-top: none !important;
            margin-top: 0 !important;
          }
          .checkout-main {
            border-right: 1px solid #000 !important;
          }
        }
      `}</style>
      {/* Single Header */}
      <header style={{
        height: '42px',
        borderBottom: '1px solid #000',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        padding: '0 16px'
      }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'none',
            border: 'none',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            padding: 0
          }}
          aria-label="Zpět"
        >
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none" stroke="#000" strokeWidth="1.4">
            <path d="M8.5 1L1.5 8l7 7"/>
          </svg>
        </button>
        <a href="/" style={{ 
          fontFamily: '"Helvetica Neue Condensed Bold", "Arial Narrow", Impact, sans-serif', 
          fontWeight: 800, 
          fontSize: '22px', 
          letterSpacing: '.02em', 
          textTransform: 'uppercase', 
          textDecoration: 'none', 
          color: '#000',
          fontStretch: 'condensed'
        }}>
          UFO SPORT
        </a>
        <div></div>
      </header>

      {/* Main Layout */}
      <div className="checkout-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        minHeight: 'calc(100vh - 42px)'
      }}>
        {/* Left Column - Form */}
        <main className="checkout-main" style={{
          padding: '32px 16px 80px',
          display: 'flex',
          justifyContent: 'center',
          borderRight: 'none'
        }}>
          <form style={{ width: '100%', maxWidth: '416px' }} onSubmit={handleSubmit}>
            {/* Stepper */}
            <nav style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '36px',
              gap: '8px'
            }}>
              {[1, 2, 3].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => goToStep(num)}
                  disabled={num > reached}
                  style={{
                    background: 'none',
                    border: '0',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '.03em',
                    color: num === step ? '#000' : num < step ? '#000' : '#8a8a8a',
                    padding: '0 0 3px',
                    fontWeight: 400,
                    borderBottom: num === step ? '1px solid #000' : num < step ? '1px solid #000' : '1px solid transparent',
                    cursor: num > reached ? 'default' : 'pointer',
                    flex: 1,
                    textAlign: 'left',
                    fontFamily: '"Helvetica Neue Condensed Bold", "Arial Narrow", Impact, sans-serif',
                    fontStretch: 'condensed'
                  }}
                >
                  {num}. {num === 1 ? 'EMAIL' : num === 2 ? 'DOPRAVA' : 'PLATBA'}
                </button>
              ))}
            </nav>

            {/* Step 1: Email */}
            {step === 1 && (
              <section>
                <p style={{ textAlign: 'center', marginBottom: '28px', fontSize: '13px' }}>
                  Zadejte svůj e-mail a pokračujte v objednávce. Účet si můžete vytvořit později.
                </p>

                <div style={{ marginBottom: '22px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: '#8a8a8a',
                    marginBottom: '4px'
                  }}>
                    <span style={{ fontWeight: 600 }}>EMAIL *</span>
                  </div>
                  <div style={{
                    borderBottom: '1px solid #000',
                    display: 'inline-block',
                    marginBottom: '12px'
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: 600 }}>EMAIL *</span>
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      height: '36px',
                      border: '1px solid #000',
                      borderRadius: '4px',
                      padding: '0 12px',
                      font: 'inherit',
                      fontSize: '13px',
                      background: '#fff',
                      color: '#000',
                      outline: 'none'
                    }}
                  />
                </div>

                <label style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  fontSize: '12px',
                  cursor: 'pointer',
                  margin: '6px 0 28px'
                }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <input
                      type="checkbox"
                      checked={formData.newsletterSubscribed}
                      onChange={(e) => setFormData({ ...formData, newsletterSubscribed: e.target.checked })}
                      style={{ position: 'absolute', opacity: 0 }}
                    />
                    <div style={{
                      flex: '0 0 16px',
                      height: '16px',
                      border: '1px solid #000',
                      borderRadius: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: '1px',
                      background: formData.newsletterSubscribed ? '#000' : '#fff'
                    }}>
                      {formData.newsletterSubscribed && (
                        <svg width="8" height="4" viewBox="0 0 8 4" fill="none" stroke="#fff" strokeWidth="1.5">
                          <path d="M1 2.5L3 0.5L7 3.5"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  <span>Chci dostávat informace o novinkách, slevách a akcích e-mailem.</span>
                </label>

                {/* Google Button */}
                <button
                  type="button"
                  onClick={() => {}}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '40px',
                    borderRadius: '4px',
                    border: '1px solid #000',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    letterSpacing: '.04em',
                    textDecoration: 'none',
                    background: '#fff',
                    color: '#000',
                    cursor: 'pointer',
                    fontWeight: 400,
                    gap: '8px',
                    marginBottom: '12px'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  PŘIHLÁSIT SE PŘES GOOGLE
                </button>

                {/* NEBO Divider */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  margin: '20px 0',
                  fontSize: '12px',
                  textTransform: 'uppercase'
                }}>
                  <div style={{ flex: 1, height: '1px', background: '#d9d9d9' }}></div>
                  <span style={{ color: '#999', fontWeight: 400 }}>NEBO</span>
                  <div style={{ flex: 1, height: '1px', background: '#d9d9d9' }}></div>
                </div>

                {/* Continue Button */}
                <button
                  type="button"
                  onClick={() => nextStep(2)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '40px',
                    borderRadius: '4px',
                    border: '1px solid #000',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    letterSpacing: '.06em',
                    textDecoration: 'none',
                    background: '#000',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 400
                  }}
                >
                  Pokračovat v objednávce
                </button>
              </section>
            )}

            {/* Step 2: Shipping & Contact */}
            {step === 2 && (
              <section>
                <div style={{
                  textAlign: 'center',
                  fontSize: '13px',
                  lineHeight: '1.9',
                  marginBottom: '28px'
                }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.04em',
                    display: 'block',
                    lineHeight: '1.4',
                    color: '#000'
                  }}>
                    E-mail
                  </span>
                  <span style={{ color: '#8a8a8a' }}>{formData.email}</span>
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    style={{
                      background: 'none',
                      border: 'none',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      marginLeft: '2px',
                      color: '#000',
                      fontSize: '13px'
                    }}
                  >
                    Upravit
                  </button>
                </div>

                <h2 style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '.04em',
                  margin: '36px 0 12px'
                }}>
                  Doprava
                </h2>
                <p style={{ color: '#8a8a8a', fontSize: '12px', marginBottom: '16px' }}>
                  Doručení zboží může trvat několik pracovních dnů v závislosti na zvolené službě.
                </p>

                {/* Shipping Options */}
                <div style={{ border: '1px solid #000', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px' }}>
                  {/* Zasilkovna */}
                  <label style={{ display: 'block', borderTop: '1px solid #000', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 12px' }}>
                      <div style={{
                        flex: '0 0 14px',
                        height: '14px',
                        border: '1px solid #000',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {formData.shippingMethod === 'zasilkovna' && (
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#000'
                          }}/>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, display: 'block' }}>Zásilkovna</div>
                        <div style={{ display: 'block', color: '#8a8a8a', fontSize: '11px' }}>Doručení na výdejní místo</div>
                      </div>
                      <div style={{ whiteSpace: 'nowrap' }}>
                        {calculateShippingCost(subtotal, 'zasilkovna') === 0 ? 'Zdarma' : calculateShippingCost(subtotal, 'zasilkovna') + ' Kč'}
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="shipping"
                      value="zasilkovna"
                      checked={formData.shippingMethod === 'zasilkovna'}
                      onChange={(e) => setFormData({ ...formData, shippingMethod: e.target.value })}
                      style={{ position: 'absolute', opacity: 0 }}
                    />
                    {formData.shippingMethod === 'zasilkovna' && (
                      <div style={{ padding: '0 12px 12px', minHeight: '60px', display: 'flex', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={openZasilkovnaWidget}
                          style={{
                            width: '100%',
                            height: '36px',
                            border: '1px solid #000',
                            borderRadius: '4px',
                            padding: '0',
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            letterSpacing: '.06em',
                            background: '#fff',
                            color: '#000',
                            cursor: 'pointer',
                            fontWeight: 400
                          }}
                        >
                          {formData.zasilkovnaName ? `Změnit: ${formData.zasilkovnaName}` : 'Vybrat výdejní místo'}
                        </button>
                      </div>
                    )}
                  </label>

                  {/* PPL ParcelShop */}
                  <label style={{ display: 'block', borderTop: '1px solid #000', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 12px' }}>
                      <div style={{
                        flex: '0 0 14px',
                        height: '14px',
                        border: '1px solid #000',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {formData.shippingMethod === 'ppl_parcelshop' && (
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#000'
                          }}/>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, display: 'block' }}>PPL ParcelShop</div>
                        <div style={{ display: 'block', color: '#8a8a8a', fontSize: '11px' }}>Vyzvednutí na výdejním místě PPL</div>
                      </div>
                      <div style={{ whiteSpace: 'nowrap' }}>
                        {calculateShippingCost(subtotal, 'ppl_parcelshop') === 0 ? 'Zdarma' : calculateShippingCost(subtotal, 'ppl_parcelshop') + ' Kč'}
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="shipping"
                      value="ppl_parcelshop"
                      checked={formData.shippingMethod === 'ppl_parcelshop'}
                      onChange={(e) => setFormData({ ...formData, shippingMethod: e.target.value })}
                      style={{ position: 'absolute', opacity: 0 }}
                    />
                    {formData.shippingMethod === 'ppl_parcelshop' && (
                      <div style={{ padding: '0 12px 12px', minHeight: '60px', display: 'flex', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setIsPplModalOpen(true)}
                          style={{
                            width: '100%',
                            height: '36px',
                            border: '1px solid #000',
                            borderRadius: '4px',
                            padding: '0',
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            letterSpacing: '.06em',
                            background: '#fff',
                            color: '#000',
                            cursor: 'pointer',
                            fontWeight: 400
                          }}
                        >
                          {formData.pplName ? `Změnit: ${formData.pplName}` : 'Vybrat výdejní místo'}
                        </button>
                      </div>
                    )}
                  </label>
                </div>

                <h2 style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '.04em',
                  margin: '36px 0 12px'
                }}>
                  Kontaktní údaje
                </h2>

                <div style={{ marginBottom: '22px' }}>
                  <label style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: '#8a8a8a',
                    marginBottom: '4px'
                  }}>
                    <span style={{ fontWeight: 600 }}>Jméno a příjmení *</span>
                    <span style={{ fontWeight: 600 }}>*povinné</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      height: '36px',
                      border: '1px solid #000',
                      borderRadius: '4px',
                      padding: '0 12px',
                      font: 'inherit',
                      fontSize: '13px',
                      background: '#fff',
                      color: '#000',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: '12px', marginBottom: '22px' }}>
                  <div>
                    <label style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      color: '#8a8a8a',
                      marginBottom: '4px'
                    }}>
                      <span style={{ fontWeight: 600 }}>Předvolba *</span>
                    </label>
                    <select
                      value={formData.prefix}
                      onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                      style={{
                        width: '100%',
                        height: '36px',
                        border: '1px solid #000',
                        borderRadius: '4px',
                        padding: '0 12px',
                        font: 'inherit',
                        fontSize: '13px',
                        background: '#fff url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%278%27 fill=%27none%27 stroke=%27%23000%27 stroke-width=%271.4%27%3E%3Cpath d=%27M1 1.5l5 5 5-5%27/%3E%3C/svg%3E") right 12px center no-repeat',
                        backgroundSize: '12px 8px',
                        color: '#000',
                        outline: 'none',
                        appearance: 'none',
                        paddingRight: '32px'
                      }}
                    >
                      <option value="+420">+420</option>
                      <option value="+421">+421</option>
                      <option value="+48">+48</option>
                      <option value="+49">+49</option>
                      <option value="+43">+43</option>
                    </select>
                  </div>
                  <div>
                    <label style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      color: '#8a8a8a',
                      marginBottom: '4px'
                    }}>
                      <span style={{ fontWeight: 600 }}>Telefon *</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{
                        width: '100%',
                        height: '36px',
                        border: '1px solid #000',
                        borderRadius: '4px',
                        padding: '0 12px',
                        font: 'inherit',
                        fontSize: '13px',
                        background: '#fff',
                        color: '#000',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => nextStep(3)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '40px',
                    borderRadius: '4px',
                    border: '1px solid #000',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    letterSpacing: '.06em',
                    textDecoration: 'none',
                    background: '#000',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 400
                  }}
                >
                  Uložit a pokračovat
                </button>
              </section>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <section>
                <h2 style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '.04em',
                  marginTop: 0,
                  marginBottom: '12px'
                }}>
                  Shrnutí
                </h2>

                <div style={{
                  border: '1px solid #000',
                  borderRadius: '4px',
                  marginBottom: '24px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '16px',
                    padding: '12px',
                    fontSize: '12px'
                  }}>
                    <span>E-mail</span>
                    <span style={{ textAlign: 'right' }}>
                      {formData.email}
                      <button
                        type="button"
                        onClick={() => goToStep(1)}
                        style={{
                          background: 'none',
                          border: 'none',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          marginLeft: '8px',
                          color: '#000',
                          fontSize: '12px'
                        }}
                      >
                        Upravit
                      </button>
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '16px',
                    padding: '12px',
                    borderTop: '1px solid #d9d9d9',
                    fontSize: '12px'
                  }}>
                    <span>Kontakt</span>
                    <span style={{ textAlign: 'right' }}>
                      {formData.name}<br/>{formData.prefix} {formData.phone}
                      <button
                        type="button"
                        onClick={() => goToStep(2)}
                        style={{
                          background: 'none',
                          border: 'none',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          marginLeft: '8px',
                          color: '#000',
                          fontSize: '12px'
                        }}
                      >
                        Upravit
                      </button>
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '16px',
                    padding: '12px',
                    borderTop: '1px solid #d9d9d9',
                    fontSize: '12px'
                  }}>
                    <span>Doprava</span>
                    <span style={{ textAlign: 'right' }}>
                      {formData.shippingMethod === 'zasilkovna' ? 'Zásilkovna' : formData.shippingMethod === 'ppl_parcelshop' ? 'PPL ParcelShop' : 'Doprava'} – {shippingCost === 0 ? 'Zdarma' : shippingCost + ' Kč'}
                      <button
                        type="button"
                        onClick={() => goToStep(2)}
                        style={{
                          background: 'none',
                          border: 'none',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          marginLeft: '8px',
                          color: '#000',
                          fontSize: '12px'
                        }}
                      >
                        Upravit
                      </button>
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '40px',
                    borderRadius: '4px',
                    border: '1px solid #000',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    letterSpacing: '.06em',
                    textDecoration: 'none',
                    background: loading ? '#808080' : '#000',
                    color: '#fff',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 400
                  }}
                >
                  {loading ? 'Zpracovávám...' : 'Přejít k platbě'}
                </button>
              </section>
            )}
          </form>
        </main>

        {/* Right Column - Order Summary */}
        <aside className="checkout-aside" style={{
          borderLeft: 'none',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'auto',
          borderTop: '1px solid #000',
          marginTop: '32px'
        }}>
          <div style={{
            height: '41px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '.04em',
            borderBottom: '1px solid #000',
            background: '#f5f5f5'
          }}>
            Souhrn objednávky
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {/* Cart Items */}
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}`} style={{
                display: 'grid',
                gridTemplateColumns: '107px 1fr',
                borderBottom: '1px solid #000'
              }}>
                <div style={{
                  background: '#f2f2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px'
                }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block'
                    }}
                  />
                </div>
                <div style={{
                  padding: '14px 12px',
                  fontSize: '12px',
                  lineHeight: '1.7'
                }}>
                  <div style={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.03em',
                    fontSize: '12px',
                    marginBottom: '4px'
                  }}>
                    {item.name}
                  </div>
                  <div>{item.size} × {item.quantity}</div>
                  <div style={{ marginTop: '8px', fontWeight: 600 }}>
                    {(item.price * item.quantity).toLocaleString('cs-CZ')} Kč
                  </div>
                </div>
              </div>
            ))}

            {/* Promo Code */}
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-end',
              padding: '20px 12px',
              borderBottom: '1px solid #000'
            }}>
              <div style={{ flex: 1, marginBottom: 0 }}>
                <label style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  color: '#8a8a8a',
                  marginBottom: '4px'
                }}>
                  Promo kód
                </label>
                <input
                  type="text"
                  value={formData.promoCode}
                  onChange={(e) => {
                    setFormData({ ...formData, promoCode: e.target.value });
                    setPromoError('');
                  }}
                  placeholder="KÓD"
                  style={{
                    width: '100%',
                    height: '36px',
                    border: '1px solid #000',
                    borderRadius: '4px',
                    padding: '0 12px',
                    font: 'inherit',
                    fontSize: '13px',
                    background: '#fff',
                    color: '#000',
                    outline: 'none'
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleApplyPromo}
                disabled={loading}
                style={{
                  background: 'none',
                  border: '0',
                  height: '36px',
                  padding: '0 8px',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '.06em',
                  textDecoration: 'underline',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                Použít
              </button>
            </div>
            {promoError && (
              <div style={{
                color: '#d00',
                fontSize: '11px',
                padding: '8px 12px',
                borderBottom: '1px solid #000'
              }}>
                {promoError}
              </div>
            )}

            {/* Summary Lines */}
            <div style={{
              padding: '16px 12px',
              borderBottom: '1px solid #000'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '.03em',
                padding: '5px 0'
              }}>
                <span>Mezisoučet</span>
                <span>{subtotal.toLocaleString('cs-CZ')} Kč</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '.03em',
                padding: '5px 0'
              }}>
                <span>Doprava</span>
                <span style={{ color: shippingCost === 0 ? '#2ecc40' : '#000' }}>
                  {shippingCost === 0 ? 'Zdarma' : shippingCost.toLocaleString('cs-CZ') + ' Kč'}
                </span>
              </div>
              {amountToFreeShipping > 0 && (
                <div style={{
                  color: '#2ecc40',
                  fontSize: '11px',
                  padding: '5px 0',
                  textTransform: 'none',
                  letterSpacing: 0
                }}>
                  Přidejte zboží za {amountToFreeShipping.toLocaleString('cs-CZ')} Kč pro dopravu zdarma!
                </div>
              )}
              {discount > 0 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '.03em',
                  padding: '5px 0'
                }}>
                  <span>Sleva</span>
                  <span>-{discount.toLocaleString('cs-CZ')} Kč</span>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                fontWeight: 700,
                padding: '5px 0'
              }}>
                <span>Celkem</span>
                <span>{total.toLocaleString('cs-CZ')} Kč</span>
              </div>
            </div>

            <div style={{
              padding: '16px 12px',
              borderBottom: '1px solid #000',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '.03em',
                margin: '0 0 8px 0',
                color: '#000'
              }}>
                BEZPEČNĚ PŘIJÍMÁME
              </p>
              <img 
                src="/payment-methods.jpg" 
                alt="Payment Methods: Visa, Mastercard, GoPay, PayPal, Apple Pay" 
                style={{
                  height: '64px',
                  width: 'auto',
                  display: 'inline-block'
                }}
              />
            </div>

            {/* Customer Support */}
            <div style={{
              padding: '16px 12px',
              textAlign: 'center',
              borderBottom: '1px solid #000'
            }}>
              <p style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '.03em',
                margin: '0 0 8px 0',
                color: '#000'
              }}>
                ZÁKAZNICKÁ PODPORA
              </p>
              <p style={{
                fontSize: '11px',
                margin: '0 0 12px 0',
                color: '#666',
                lineHeight: '1.4'
              }}>
                Naše klientská podpora je k dispozici od pondělí do soboty 9:30 - 19:00
              </p>

              {/* WhatsApp Button */}
              <a 
                href="https://wa.me/420775181107" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  border: '1px solid #000',
                  borderRadius: '2px',
                  padding: '8px 12px',
                  fontSize: '11px',
                  textDecoration: 'underline',
                  color: '#000',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  fontWeight: 500
                }}
              >
                WHATSAPP +420775181107
              </a>

              {/* Phone Button */}
              <a 
                href="tel:+420775181107"
                style={{
                  display: 'inline-block',
                  border: '1px solid #000',
                  borderRadius: '2px',
                  padding: '8px 12px',
                  fontSize: '11px',
                  textDecoration: 'underline',
                  color: '#000',
                  textTransform: 'uppercase',
                  fontWeight: 500
                }}
              >
                ZAVOLEJTE NÁM NA +420775181107
              </a>
            </div>

            {/* Bullets */}
            <ul style={{
              padding: '16px 12px 24px',
              listStyle: 'disc inside',
              fontSize: '12px',
              lineHeight: '1.9',
              margin: 0
            }}>
              <li>Bezpečná platba</li>
              <li>Rychlé doručení</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* PPL Modal */}
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          backgroundColor: isPplModalOpen ? 'rgba(0,0,0,0.5)' : 'transparent',
          pointerEvents: isPplModalOpen ? 'auto' : 'none',
          opacity: isPplModalOpen ? 1 : 0,
          transition: 'opacity 0.3s'
        }}
      >
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 101,
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            opacity: isPplModalOpen ? 1 : 0,
            pointerEvents: isPplModalOpen ? 'auto' : 'none',
            transition: 'opacity 0.3s'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            borderBottom: '1px solid #000',
            backgroundColor: '#000'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#fff'
            }}>
              Vyberte výdejní místo PPL
            </h2>
            <button 
              onClick={() => setIsPplModalOpen(false)}
              style={{
                background: 'none',
                border: '1px solid #fff',
                color: '#fff',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'uppercase',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              Zavřít
            </button>
          </div>
          <div 
            id="ppl-parcelshop-map" 
            data-language="cs" 
            data-mode="default"
            style={{ flex: 1, minHeight: '500px', width: '100%' }}
          ></div>
        </div>
      </div>
    </div>
  );
}
