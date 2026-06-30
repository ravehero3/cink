'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface OrderItem {
  productId: string;
  productName: string;
  size: string;
  quantity: number;
  price: number;
  image?: string;
  color?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  totalPrice: number;
  status: string;
  paymentStatus: string;
  paymentId: string | null;
  shippingMethod: string;
  zasilkovnaId: string | null;
  zasilkovnaName: string | null;
  pplId: string | null;
  pplName: string | null;
  shippingStreet: string | null;
  shippingCity: string | null;
  shippingZip: string | null;
  packetaPacketId: string | null;
  packetaError: string | null;
  trackingNumber: string | null;
  invoiceUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_OPTIONS = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [nextOrderId, setNextOrderId] = useState<string | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);

  useEffect(() => {
    fetchOrder();
    fetchAllOrders();
  }, [params.id]);

  const fetchAllOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      if (response.ok) {
        const data = await response.json();
        setAllOrders(data);
        
        // Find next order
        const currentIndex = data.findIndex((o: Order) => o.id === params.id);
        if (currentIndex !== -1 && currentIndex < data.length - 1) {
          setNextOrderId(data[currentIndex + 1].id);
        } else {
          setNextOrderId(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch all orders:', error);
    }
  };

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
        setTrackingNumber(data.trackingNumber || '');
      } else {
        alert('Objednávka nenalezena');
        router.push('/admin/objednavky');
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
      alert('Došlo k chybě při načítání objednávky');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!confirm(`Změnit status objednávky na ${newStatus}?`)) return;

    try {
      const response = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        alert('Status byl úspěšně změněn');
        fetchOrder();
      } else {
        alert('Nepodařilo se změnit status');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Došlo k chybě při změně statusu');
    }
  };

  const updateTrackingNumber = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber }),
      });

      if (response.ok) {
        alert('Číslo zásilky bylo úspěšně uloženo');
        fetchOrder();
      } else {
        alert('Nepodařilo se uložit číslo zásilky');
      }
    } catch (error) {
      console.error('Failed to update tracking number:', error);
      alert('Došlo k chybě při ukládání');
    }
  };

  const retryPacketaCreation = async () => {
    if (!confirm('Zkusit znovu vytvořit zásilku v Zásilkovně?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${params.id}/create-packet`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        alert('Zásilka byla úspěšně vytvořena v Zásilkovně!');
        fetchOrder();
      } else {
        alert(`Nepodařilo se vytvořit zásilku: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to create Packeta packet:', error);
      alert('Došlo k chybě při vytváření zásilky');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!order?.paymentId) {
      alert('Tato objednávka nemá přiřazené ID platby v GoPay');
      return;
    }

    setCheckingPayment(true);
    try {
      const response = await fetch(`/api/admin/orders/${params.id}/check-payment`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Status platby byl aktualizován');
        fetchOrder();
      } else {
        alert(`Chyba: ${data.error || 'Nepodařilo se zkontrolovat status platby'}`);
      }
    } catch (error) {
      console.error('Failed to check payment status:', error);
      alert('Došlo k chybě při kontrole stavu platby');
    } finally {
      setCheckingPayment(false);
    }
  };

  const STATUS_LABELS: Record<string, string> = {
    PENDING: 'Čeká', PAID: 'Zaplaceno', PROCESSING: 'Zpracovává se',
    SHIPPED: 'Odesláno', COMPLETED: 'Dokončeno', CANCELLED: 'Zrušeno',
  };
  const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    PAID: 'bg-blue-50 text-blue-700 border-blue-200',
    PROCESSING: 'bg-purple-50 text-purple-700 border-purple-200',
    SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Načítám objednávku…</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return <div className="text-sm text-gray-500 py-16 text-center">Objednávka nenalezena.</div>;
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">#{order.orderNumber}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
              <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('cs-CZ')}</span>
            </div>
          </div>
        </div>
        {nextOrderId && (
          <button onClick={() => router.push(`/admin/objednavky/${nextOrderId}`)}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors">
            Další objednávka
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Left column */}
        <div className="space-y-5">

          {/* Customer */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Zákazník</p>
            <div className="space-y-2.5">
              {[
                { label: 'Jméno', value: order.customerName },
                { label: 'Email', value: order.customerEmail },
                { label: 'Telefon', value: order.customerPhone },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-baseline gap-3">
                  <span className="text-xs text-gray-400 w-14 shrink-0">{label}</span>
                  <span className="text-sm font-medium text-gray-800">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Doprava</p>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-baseline gap-3">
                <span className="text-xs text-gray-400 w-14 shrink-0">Metoda</span>
                <span className="font-semibold text-gray-800 uppercase text-xs tracking-wide">{order.shippingMethod}</span>
              </div>
              {order.shippingMethod === 'zasilkovna' && order.zasilkovnaId && (
                <>
                  <div className="flex items-baseline gap-3"><span className="text-xs text-gray-400 w-14 shrink-0">ID pobočky</span><span className="font-medium text-gray-700">{order.zasilkovnaId}</span></div>
                  <div className="flex items-baseline gap-3"><span className="text-xs text-gray-400 w-14 shrink-0">Pobočka</span><span className="font-medium text-gray-700">{order.zasilkovnaName}</span></div>
                </>
              )}
              {order.shippingMethod === 'ppl_address' && (
                <>
                  <div className="flex items-baseline gap-3"><span className="text-xs text-gray-400 w-14 shrink-0">Ulice</span><span className="font-medium text-gray-700">{order.shippingStreet}</span></div>
                  <div className="flex items-baseline gap-3"><span className="text-xs text-gray-400 w-14 shrink-0">Město</span><span className="font-medium text-gray-700">{order.shippingCity}</span></div>
                  <div className="flex items-baseline gap-3"><span className="text-xs text-gray-400 w-14 shrink-0">PSČ</span><span className="font-medium text-gray-700">{order.shippingZip}</span></div>
                </>
              )}
              {order.shippingMethod === 'ppl_parcelshop' && (
                <>
                  <div className="flex items-baseline gap-3"><span className="text-xs text-gray-400 w-14 shrink-0">ParcelShop</span><span className="font-medium text-gray-700">{order.pplId}</span></div>
                  <div className="flex items-baseline gap-3"><span className="text-xs text-gray-400 w-14 shrink-0">Název</span><span className="font-medium text-gray-700">{order.pplName}</span></div>
                </>
              )}
            </div>
            {order.packetaPacketId && (
              <div className="mt-4 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Zásilka vytvořena · ID {order.packetaPacketId}
              </div>
            )}
            {order.packetaError && !order.packetaPacketId && order.shippingMethod === 'zasilkovna' && (
              <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3">
                <p className="text-xs font-semibold text-red-700 mb-1">Chyba zásilkovny</p>
                <p className="text-xs text-red-600 mb-2">{order.packetaError}</p>
                <button onClick={retryPacketaCreation} disabled={loading}
                  className="text-xs font-semibold bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
                  {loading ? 'Zkouším…' : 'Zkusit znovu'}
                </button>
              </div>
            )}
            {!order.packetaPacketId && !order.packetaError && order.shippingMethod === 'zasilkovna' && order.zasilkovnaId && (
              <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3">
                <p className="text-xs font-semibold text-amber-700 mb-1">Zásilka nevytvořena</p>
                <p className="text-xs text-amber-600 mb-2">Zásilka v systému Zásilkovny zatím nebyla vytvořena.</p>
                <button onClick={retryPacketaCreation} disabled={loading}
                  className="text-xs font-semibold bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors">
                  {loading ? 'Vytvářím…' : 'Vytvořit zásilku'}
                </button>
              </div>
            )}
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Číslo zásilky (tracking)</p>
              <div className="flex gap-2">
                <input type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)}
                  className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                  placeholder="Zadejte číslo zásilky" />
                <button onClick={updateTrackingNumber}
                  className="text-sm font-semibold bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors whitespace-nowrap">
                  Uložit
                </button>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Platba</p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">Celková cena</span>
              <span className="text-xl font-bold text-gray-900">{Number(order.totalPrice).toFixed(0)} Kč</span>
            </div>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-xs text-gray-400 w-20 shrink-0">Status platby</span>
              <span className="text-sm font-semibold text-gray-800">{order.paymentStatus}</span>
            </div>
            {order.paymentId && (
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-xs text-gray-400 w-20 shrink-0">ID platby</span>
                <span className="text-xs font-mono text-gray-600">{order.paymentId}</span>
              </div>
            )}
            {order.paymentId ? (
              <button onClick={checkPaymentStatus} disabled={checkingPayment}
                className="w-full text-sm font-semibold bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:border-gray-300 hover:bg-gray-100 disabled:opacity-50 transition-colors">
                {checkingPayment ? 'Kontroluji…' : 'Obnovit stav platby'}
              </button>
            ) : (
              <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2">Objednávka nemá přiřazené ID platby z GoPay.</p>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Status manager */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Status objednávky</p>
            <p className="text-xs text-gray-400 mb-3">Aktuální stav</p>
            <span className={`inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-xl border mb-4 ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-500 border-gray-200'}`}>
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
            <p className="text-xs text-gray-400 mb-2">Změnit na</p>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((status) => (
                <button key={status} onClick={() => updateStatus(status)} disabled={status === order.status}
                  className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${
                    status === order.status
                      ? `${STATUS_COLORS[status]} cursor-default opacity-80`
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900 hover:bg-white'
                  }`}>
                  {STATUS_LABELS[status] ?? status}
                </button>
              ))}
            </div>
          </div>

          {/* Order items */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Položky · {order.items.length}
            </p>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-3 items-start pb-3 last:pb-0 border-b border-gray-50 last:border-0">
                  {item.image && (
                    <img src={item.image} alt={item.productName} className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.productName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.size}{item.color ? ` · ${item.color}` : ''} · {item.quantity}×
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-gray-500">{Number(item.price).toFixed(0)} Kč / ks</span>
                      <span className="text-sm font-bold text-gray-900">{(Number(item.price) * item.quantity).toFixed(0)} Kč</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Celkem</span>
              <span className="text-lg font-bold text-gray-900">{Number(order.totalPrice).toFixed(0)} Kč</span>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Časové údaje</p>
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-xs text-gray-400 w-28 shrink-0">Vytvořeno</span>
                <span className="text-sm text-gray-700">{new Date(order.createdAt).toLocaleString('cs-CZ')}</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-xs text-gray-400 w-28 shrink-0">Poslední aktualizace</span>
                <span className="text-sm text-gray-700">{new Date(order.updatedAt).toLocaleString('cs-CZ')}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
