'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/lib/cart-store';
import Image from 'next/image';

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

  useEffect(() => {
    if (items.length === 0) {
      router.push('/kosik');
    }
  }, [items, router]);

  const subtotal = getTotal();
  const shippingCost = 79;
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
      const response = await fetch('/api/orders/create', {
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

      const data = await response.json();

      if (response.ok) {
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          router.push(`/potvrzeni/${data.orderNumber}`);
        }
      } else {
        alert(data.error || 'Chyba při vytváření objednávky');
        setLoading(false);
      }
    } catch (error) {
      alert('Došlo k chybě. Zkuste to prosím znovu.');
      setLoading(false);
    }
  };

  const openZasilkovnaWidget = () => {
    if (typeof window !== 'undefined' && (window as any).Packeta) {
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
    } else {
      alert('Zásilkovna widget není k dispozici. Použijte placeholder výdejní místo pro testování.');
      setFormData({
        ...formData,
        zasilkovnaId: 'TEST123',
        zasilkovnaName: 'Test Výdejní Místo - Praha 1, 110 00 Praha',
      });
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="border border-black p-8">
              <h2 className="text-title font-bold mb-6 uppercase">KONTAKTNÍ ÚDAJE</h2>

              <div className="mb-6">
                <label className="block text-title font-bold mb-2 uppercase">E-mail *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-black px-4 py-2 text-body focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="mb-6">
                <label className="block text-title font-bold mb-2 uppercase">Jméno a příjmení *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-black px-4 py-2 text-body focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="mb-8">
                <label className="block text-title font-bold mb-2 uppercase">Telefon *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-black px-4 py-2 text-body focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <h2 className="text-title font-bold mb-6 uppercase border-t border-black pt-8">DOPRAVA</h2>

              <div className="mb-6">
                <label className="flex items-start border border-black p-4 cursor-pointer">
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
                  <p className="text-body font-bold">79 Kč</p>
                </label>

                {formData.shippingMethod === 'zasilkovna' && (
                  <button
                    type="button"
                    onClick={openZasilkovnaWidget}
                    className="mt-4 w-full border border-black px-4 py-2 text-body uppercase hover:bg-black hover:text-white transition-colors"
                  >
                    {formData.zasilkovnaName ? `Změnit: ${formData.zasilkovnaName}` : 'VYBRAT VÝDEJNÍ MÍSTO'}
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-4 text-body uppercase font-bold border border-black hover:bg-white hover:text-black transition-colors disabled:bg-white disabled:text-black mt-8"
              >
                {loading ? 'ZPRACOVÁNÍ...' : 'PŘEJÍT K PLATBĚ'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="border border-black p-6 sticky top-24">
              <h2 className="text-title font-bold mb-6 uppercase">SOUHRN</h2>

              <div className="mb-6 border-b border-black pb-6">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex gap-4 mb-4">
                    <div className="w-16 h-16 border border-black relative flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-body font-bold">{item.name}</p>
                      <p className="text-[12px]">{item.size} / {item.quantity}x</p>
                      <p className="text-body">{item.price * item.quantity} Kč</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <label className="block text-title font-bold mb-2 uppercase text-[12px]">Promo kód</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.promoCode}
                    onChange={(e) => {
                      setFormData({ ...formData, promoCode: e.target.value });
                      setPromoError('');
                    }}
                    className="flex-1 border border-black px-3 py-2 text-body focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="KÓD"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="border border-black px-4 py-2 text-body uppercase hover:bg-black hover:text-white transition-colors"
                  >
                    POUŽÍT
                  </button>
                </div>
                {promoError && <p className="text-[12px] mt-2 text-black">{promoError}</p>}
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-body">
                  <span>Mezisoučet</span>
                  <span>{subtotal} Kč</span>
                </div>
                <div className="flex justify-between text-body">
                  <span>Doprava</span>
                  <span>{shippingCost} Kč</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-body">
                    <span>Sleva</span>
                    <span>-{discount} Kč</span>
                  </div>
                )}
                <div className="border-t border-black pt-4">
                  <div className="flex justify-between text-product-name font-bold">
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
  );
}
