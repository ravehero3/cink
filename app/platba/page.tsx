'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, Building2, Smartphone, Loader2 } from 'lucide-react';
import { getPaymentMethods, PaymentMethod } from '@/lib/payment-methods';
import AnimatedButton from '@/components/AnimatedButton';

interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  size: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  totalPrice: number;
  paymentStatus: string;
  status: string;
  shippingMethod: string;
  zasilkovnaId: string | null;
  zasilkovnaName: string | null;
  createdAt: string;
}

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  CreditCard: CreditCard,
  Building2: Building2,
  Smartphone: Smartphone,
};

function PlatbaPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('PAYMENT_CARD');
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const paymentMethods = getPaymentMethods();

  useEffect(() => {
    if (!orderId) {
      router.push('/kosik');
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error('Objednávka nebyla nalezena');
        }
        const data = await response.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message || 'Chyba při načítání objednávky');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  const handlePayment = async () => {
    if (!order) return;

    setProcessing(true);
    setPaymentError('');

    try {
      const response = await fetch('/api/gopay/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: order.orderNumber,
          amount: order.totalPrice,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          items: order.items,
          paymentMethod: selectedPaymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Nepodařilo se vytvořit platbu');
      }

      if (data.gatewayUrl) {
        window.location.href = data.gatewayUrl;
      } else {
        router.push(`/potvrzeni/${order.orderNumber}`);
      }
    } catch (err: any) {
      setPaymentError(err.message || 'Chyba při zpracování platby');
      setProcessing(false);
    }
  };

  const getSubtotal = () => {
    if (!order) return 0;
    return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getShippingCost = () => {
    const subtotal = getSubtotal();
    return subtotal >= 2000 ? 0 : 79;
  };

  const getDiscount = () => {
    if (!order) return 0;
    const subtotal = getSubtotal();
    const shipping = getShippingCost();
    return subtotal + shipping - Number(order.totalPrice);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div style={{ 
          position: 'relative', 
          width: '995px', 
          maxWidth: '100%',
          margin: '0 auto', 
          height: '226px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '0 16px' 
        }}>
          <h1 className="text-center uppercase" style={{
            fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '22px',
            fontWeight: 700,
            lineHeight: '22px',
            letterSpacing: '0.03em',
            fontStretch: 'condensed',
            margin: 0
          }}>
            PLATBA
          </h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Loader2 className="animate-spin" size={20} />
            <p style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '14px',
              fontWeight: 400
            }}>
              Načítám objednávku...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div style={{ 
          position: 'relative', 
          width: '995px', 
          maxWidth: '100%',
          margin: '0 auto', 
          height: '226px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '0 16px' 
        }}>
          <h1 className="text-center uppercase" style={{
            fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '22px',
            fontWeight: 700,
            lineHeight: '22px',
            letterSpacing: '0.03em',
            fontStretch: 'condensed',
            margin: 0
          }}>
            PLATBA
          </h1>
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="border border-black p-8 bg-white text-center" style={{ maxWidth: '400px', width: '100%' }}>
            <p style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              marginBottom: '24px'
            }}>
              {error || 'Objednávka nebyla nalezena'}
            </p>
            <AnimatedButton
              text="ZPĚT DO KOŠÍKU"
              onClick={() => router.push('/kosik')}
              style={{ width: '100%', padding: '13.8px 25.6px' }}
            />
          </div>
        </div>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const shippingCost = getShippingCost();
  const discount = getDiscount();
  const total = Number(order.totalPrice);

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      <div style={{
        position: 'absolute',
        left: 'calc(50vw - 497.5px)',
        top: 0,
        bottom: 0,
        width: '1px',
        backgroundColor: '#000',
        zIndex: 5
      }} className="hidden lg:block" />
      <div style={{
        position: 'absolute',
        right: 'calc(50vw - 497.5px)',
        top: 0,
        bottom: 0,
        width: '1px',
        backgroundColor: '#000',
        zIndex: 5
      }} className="hidden lg:block" />

      <div style={{ 
        position: 'relative', 
        width: '995px', 
        maxWidth: '100%',
        margin: '0 auto', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '48px 16px 24px' 
      }}>
        <h1 className="text-center uppercase" style={{
          fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: '22px',
          fontWeight: 700,
          lineHeight: '22px',
          letterSpacing: '0.03em',
          fontStretch: 'condensed',
          margin: 0,
          marginBottom: '12px'
        }}>
          PLATBA
        </h1>
        <p style={{
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: '14px',
          fontWeight: 400,
          color: '#000'
        }}>
          Objednávka č. {order.orderNumber}
        </p>
      </div>

      <div style={{
        width: '995px',
        maxWidth: '100%',
        margin: '0 auto',
        borderTop: '1px solid #000'
      }} />

      <div className="flex-1" style={{ width: '995px', maxWidth: '100%', margin: '0 auto' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-6 lg:p-8" style={{ borderRight: '1px solid #000' }}>
            <h2 style={{
              fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '14px',
              fontWeight: 700,
              lineHeight: '16.1px',
              textTransform: 'uppercase',
              marginBottom: '24px'
            }}>
              SOUHRN OBJEDNÁVKY
            </h2>

            <div style={{ marginBottom: '24px' }}>
              {order.items.map((item, index) => (
                <div 
                  key={`${item.productId}-${item.size}`}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    paddingBottom: index < order.items.length - 1 ? '16px' : '0',
                    marginBottom: index < order.items.length - 1 ? '16px' : '0',
                    borderBottom: index < order.items.length - 1 ? '1px solid #000' : 'none'
                  }}
                >
                  <div style={{
                    width: '80px',
                    height: '106px',
                    border: '1px solid #000',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    backgroundColor: '#fff',
                    flexShrink: 0
                  }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '14px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      marginBottom: '4px',
                      lineHeight: '19.6px',
                      letterSpacing: '0.03em',
                      fontStretch: 'condensed'
                    }}>
                      {item.name}
                    </h3>
                    <p style={{
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '12px',
                      fontWeight: 400,
                      color: '#000',
                      marginBottom: '4px'
                    }}>
                      Velikost: {item.size}
                    </p>
                    <p style={{
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '12px',
                      fontWeight: 400,
                      color: '#000',
                      marginBottom: '8px'
                    }}>
                      Množství: {item.quantity}
                    </p>
                    <p style={{
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#000'
                    }}>
                      {(item.price * item.quantity).toLocaleString('cs-CZ')} Kč
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #000', paddingTop: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400
                }}>
                  Mezisoučet
                </span>
                <span style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400
                }}>
                  {subtotal.toLocaleString('cs-CZ')} Kč
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400
                }}>
                  Doprava
                </span>
                <span style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400
                }}>
                  {shippingCost === 0 ? 'ZDARMA' : `${shippingCost} Kč`}
                </span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400
                  }}>
                    Sleva
                  </span>
                  <span style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400
                  }}>
                    -{discount.toLocaleString('cs-CZ')} Kč
                  </span>
                </div>
              )}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                paddingTop: '8px',
                borderTop: '1px solid #000'
              }}>
                <span style={{
                  fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  Celkem
                </span>
                <span style={{
                  fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 700
                }}>
                  {total.toLocaleString('cs-CZ')} Kč
                </span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #000', paddingTop: '16px' }}>
              <h3 style={{
                fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                DODACÍ ÚDAJE
              </h3>
              <p style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                marginBottom: '4px'
              }}>
                {order.customerName}
              </p>
              <p style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                marginBottom: '4px'
              }}>
                {order.customerEmail}
              </p>
              <p style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                marginBottom: '12px'
              }}>
                {order.customerPhone}
              </p>
              {order.zasilkovnaName && (
                <>
                  <h3 style={{
                    fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    marginBottom: '8px'
                  }}>
                    VÝDEJNÍ MÍSTO ZÁSILKOVNY
                  </h3>
                  <p style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400
                  }}>
                    {order.zasilkovnaName}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="p-6 lg:p-8">
            <h2 style={{
              fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '14px',
              fontWeight: 700,
              lineHeight: '16.1px',
              textTransform: 'uppercase',
              marginBottom: '24px'
            }}>
              ZPŮSOB PLATBY
            </h2>

            <div style={{ marginBottom: '24px' }}>
              {paymentMethods.map((method) => {
                const IconComponent = method.icon ? iconMap[method.icon] : null;
                const isSelected = selectedPaymentMethod === method.id;

                return (
                  <label
                    key={method.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px',
                      border: isSelected ? '2px solid #000' : '1px solid #000',
                      marginBottom: '-1px',
                      cursor: 'pointer',
                      backgroundColor: '#fff'
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={isSelected}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      style={{
                        width: '18px',
                        height: '18px',
                        marginRight: '16px',
                        accentColor: '#000',
                        cursor: 'pointer'
                      }}
                    />
                    {IconComponent && (
                      <IconComponent size={24} className="mr-4" />
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                        fontSize: '14px',
                        fontWeight: 700,
                        marginBottom: '2px'
                      }}>
                        {method.name}
                      </p>
                      <p style={{
                        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                        fontSize: '12px',
                        fontWeight: 400,
                        color: '#000'
                      }}>
                        {method.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            {paymentError && (
              <div style={{
                border: '1px solid #000',
                padding: '16px',
                marginBottom: '24px',
                backgroundColor: '#fff'
              }}>
                <p style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#000',
                  marginBottom: '12px'
                }}>
                  {paymentError}
                </p>
                <button
                  onClick={() => setPaymentError('')}
                  style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '12px',
                    fontWeight: 400,
                    textDecoration: 'underline',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Zkusit znovu
                </button>
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={processing}
              style={{
                width: '100%',
                backgroundColor: processing ? '#666' : '#000',
                color: '#fff',
                border: '1px solid #000',
                padding: '16px',
                fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                cursor: processing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {processing && <Loader2 className="animate-spin" size={18} />}
              {processing ? 'ZPRACOVÁNÍ...' : `ZAPLATIT ${total.toLocaleString('cs-CZ')} Kč`}
            </button>

            <p style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '12px',
              fontWeight: 400,
              color: '#000',
              textAlign: 'center',
              marginTop: '16px'
            }}>
              Kliknutím na tlačítko budete přesměrováni na platební bránu
            </p>
          </div>
        </div>
      </div>

      <div style={{
        width: '995px',
        maxWidth: '100%',
        margin: '0 auto',
        borderTop: '1px solid #000'
      }} />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div style={{ 
        position: 'relative', 
        width: '995px', 
        maxWidth: '100%',
        margin: '0 auto', 
        height: '226px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '0 16px' 
      }}>
        <h1 className="text-center uppercase" style={{
          fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: '22px',
          fontWeight: 700,
          lineHeight: '22px',
          letterSpacing: '0.03em',
          fontStretch: 'condensed',
          margin: 0
        }}>
          PLATBA
        </h1>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin" size={20} />
          <p style={{
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '14px',
            fontWeight: 400
          }}>
            Načítám...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PlatbaPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PlatbaPageContent />
    </Suspense>
  );
}
