'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/store/toastStore';
import ConfirmModal from '@/components/admin/ConfirmModal';

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
  const toast = useToast();
  const [statusModal, setStatusModal] = useState<{ newStatus: string } | null>(null);
  const [retryModal, setRetryModal] = useState(false);

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
        toast.error('Objednávka nenalezena');
        router.push('/admin/objednavky');
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast.error('Došlo k chybě při načítání objednávky');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = (newStatus: string) => {
    setStatusModal({ newStatus });
  };

  const confirmUpdateStatus = async () => {
    if (!order || !statusModal) return;
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusModal.newStatus }),
      });

      if (response.ok) {
        fetchOrder();
        toast.success(`Status změněn na ${STATUS_LABELS[statusModal.newStatus] ?? statusModal.newStatus}`);
      } else {
        toast.error('Nepodařilo se změnit status');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Došlo k chybě při změně statusu');
    } finally {
      setStatusModal(null);
    }
  };

  const updateTrackingNumber = async () => {
    if (!order) return;
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber }),
      });

      if (response.ok) {
        fetchOrder();
        toast.success('Sledovací číslo bylo uloženo');
      } else {
        toast.error('Nepodařilo se uložit sledovací číslo');
      }
    } catch (error) {
      console.error('Failed to update tracking number:', error);
      toast.error('Došlo k chybě při ukládání sledovacího čísla');
    }
  };

  const retryPacketaCreation = () => {
    setRetryModal(true);
  };

  const confirmRetry = async () => {
    if (!order) return;
    setLoading(true);
    try {
      const response = await fetch('/api/admin/packeta/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });

      const data = await response.json();

      if (response.ok) {
        fetchOrder();
        toast.success(`Zásilka byla úspěšně vytvořena (ID: ${data.packetId})`);
      } else {
        toast.error(`Chyba Zásilkovny: ${data.error || 'Neznámá chyba'}`);
      }
    } catch (error) {
      console.error('Error retrying Packeta packet creation:', error);
      toast.error('Nepodařilo se kontaktovat Zásilkovnu');
    } finally {
      setLoading(false);
      setRetryModal(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!order || !order.paymentId) return;
    setCheckingPayment(true);
    try {
      const response = await fetch(`/api/admin/payments/${order.paymentId}/status`);
      if (response.ok) {
        const data = await response.json();
        fetchOrder();
        toast.info(`Stav platby z GoPay: ${data.status}`);
      } else {
        toast.error('Nepodařilo se ověřit stav platby');
      }
    } catch (error) {
      console.error('Failed to check payment status:', error);
      toast.error('Chyba při komunikaci s platební bránou');
    } finally {
      setCheckingPayment(false);
    }
  };

  const STATUS_LABELS: Record<string, string> = {
    PENDING: 'ČEKÁ',
    PAID: 'ZAPLACENO',
    PROCESSING: 'ZPRACOVÁVÁ SE',
    SHIPPED: 'ODESLÁNO',
    COMPLETED: 'DOKONČENO',
    CANCELLED: 'ZRUŠENO',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
        <div className="w-4 h-4 border border-black border-t-transparent animate-spin" />
        <span className="text-xs uppercase tracking-widest text-[#666666]">Načítám objednávku…</span>
      </div>
    );
  }

  if (!order) {
    return <div className="text-xs uppercase tracking-widest text-[#666666] py-16 text-center">Objednávka nenalezena.</div>;
  }

  return (
    <div className="space-y-8" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-black pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/objednavky"
            className="flex items-center justify-center w-8 h-8 border border-black bg-white text-black hover:bg-black hover:text-white transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </Link>
          <div>
            <h1 className="admin-title">
              #{order.orderNumber}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${order.status === 'COMPLETED' ? 'bg-black text-white border-black' : order.status === 'CANCELLED' ? 'bg-white text-black border-2 border-black' : 'bg-white text-black border border-black'}`}>
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
              <span className="text-xs uppercase text-[#666666]">{new Date(order.createdAt).toLocaleString('cs-CZ')}</span>
            </div>
          </div>
        </div>
        {nextOrderId && (
          <button
            onClick={() => router.push(`/admin/objednavky/${nextOrderId}`)}
            className="text-xs font-bold uppercase tracking-wider text-black hover:opacity-60 flex items-center gap-1.5 transition-opacity"
          >
            Další objednávka
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left column */}
        <div className="space-y-6">

          {/* Customer */}
          <div className="bg-white border border-black p-5">
            <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-4 pb-2 border-b border-black">
              Zákazník
            </p>
            <div className="space-y-2 text-xs uppercase tracking-wider">
              {[
                { label: 'Jméno', value: order.customerName },
                { label: 'Email', value: order.customerEmail },
                { label: 'Telefon', value: order.customerPhone },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-baseline gap-3">
                  <span className="text-[#666666] w-16 shrink-0">{label}</span>
                  <span className="font-medium text-black">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white border border-black p-5">
            <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-4 pb-2 border-b border-black">
              Doprava
            </p>
            <div className="space-y-2 text-xs uppercase tracking-wider">
              <div className="flex items-baseline gap-3">
                <span className="text-[#666666] w-16 shrink-0">Metoda</span>
                <span className="font-bold text-black">{order.shippingMethod}</span>
              </div>
              {order.shippingMethod === 'zasilkovna' && order.zasilkovnaId && (
                <>
                  <div className="flex items-baseline gap-3"><span className="text-[#666666] w-16 shrink-0">ID pobočky</span><span className="font-medium text-black">{order.zasilkovnaId}</span></div>
                  <div className="flex items-baseline gap-3"><span className="text-[#666666] w-16 shrink-0">Pobočka</span><span className="font-medium text-black">{order.zasilkovnaName}</span></div>
                </>
              )}
              {order.shippingMethod === 'ppl_address' && (
                <>
                  <div className="flex items-baseline gap-3"><span className="text-[#666666] w-16 shrink-0">Ulice</span><span className="font-medium text-black">{order.shippingStreet}</span></div>
                  <div className="flex items-baseline gap-3"><span className="text-[#666666] w-16 shrink-0">Město</span><span className="font-medium text-black">{order.shippingCity}</span></div>
                  <div className="flex items-baseline gap-3"><span className="text-[#666666] w-16 shrink-0">PSČ</span><span className="font-medium text-black">{order.shippingZip}</span></div>
                </>
              )}
              {order.shippingMethod === 'ppl_parcelshop' && (
                <>
                  <div className="flex items-baseline gap-3"><span className="text-[#666666] w-16 shrink-0">ParcelShop</span><span className="font-medium text-black">{order.pplId}</span></div>
                  <div className="flex items-baseline gap-3"><span className="text-[#666666] w-16 shrink-0">Název</span><span className="font-medium text-black">{order.pplName}</span></div>
                </>
              )}
            </div>

            {order.packetaPacketId && (
              <div className="mt-4 p-3 border border-black bg-white text-xs uppercase tracking-wider text-black">
                <span className="font-bold">[ ZÁSILKOVNA ]</span> Zásilka vytvořena · ID {order.packetaPacketId}
              </div>
            )}

            {order.packetaError && !order.packetaPacketId && order.shippingMethod === 'zasilkovna' && (
              <div className="mt-4 p-3 border-l-4 border-black border border-black bg-white text-xs uppercase tracking-wider text-black">
                <p className="font-bold mb-1">[ CHYBA ZÁSILKOVNY ]</p>
                <p className="text-[#666666] mb-2">{order.packetaError}</p>
                <button
                  onClick={retryPacketaCreation}
                  disabled={loading}
                  className="px-3 py-1.5 text-xs uppercase font-medium border border-black bg-white text-black hover:bg-black hover:text-white transition-colors"
                >
                  {loading ? 'Zkouším…' : 'Zkusit znovu'}
                </button>
              </div>
            )}

            {!order.packetaPacketId && !order.packetaError && order.shippingMethod === 'zasilkovna' && order.zasilkovnaId && (
              <div className="mt-4 p-3 border border-black bg-white text-xs uppercase tracking-wider text-black">
                <p className="font-bold mb-1">[ ZÁSILKA NEVYTVOŘENA ]</p>
                <p className="text-[#666666] mb-2">Zásilka v systému Zásilkovny zatím nebyla vytvořena.</p>
                <button
                  onClick={retryPacketaCreation}
                  disabled={loading}
                  className="px-3 py-1.5 text-xs uppercase font-medium border border-black bg-black text-white hover:bg-white hover:text-black transition-colors"
                >
                  {loading ? 'Vytvářím…' : 'Vytvořit zásilku'}
                </button>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-black/10">
              <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-2">Číslo zásilky (tracking)</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="flex-1 text-xs uppercase px-3 py-2 border border-black bg-white focus:outline-none tracking-wider placeholder:text-black/30"
                  placeholder="Zadejte číslo zásilky"
                />
                <button
                  onClick={updateTrackingNumber}
                  className="px-4 py-2 text-xs uppercase tracking-wider font-medium border border-black bg-black text-white hover:bg-white hover:text-black transition-colors whitespace-nowrap"
                >
                  Uložit
                </button>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white border border-black p-5">
            <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-4 pb-2 border-b border-black">
              Platba
            </p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase text-[#666666]">Celková cena</span>
              <span className="text-lg font-bold text-black">{Number(order.totalPrice).toFixed(0)} Kč</span>
            </div>
            <div className="flex items-baseline gap-3 mb-4 text-xs uppercase tracking-wider">
              <span className="text-[#666666] w-24 shrink-0">Status platby</span>
              <span className="font-bold text-black">{order.paymentStatus}</span>
            </div>
            {order.paymentId && (
              <div className="flex items-baseline gap-3 mb-4 text-xs uppercase tracking-wider">
                <span className="text-[#666666] w-24 shrink-0">ID platby</span>
                <span className="font-mono text-black">{order.paymentId}</span>
              </div>
            )}
            {order.paymentId ? (
              <button
                onClick={checkPaymentStatus}
                disabled={checkingPayment}
                className="w-full text-xs uppercase tracking-wider font-medium border border-black bg-white text-black hover:bg-black hover:text-white py-2.5 transition-colors disabled:opacity-50"
              >
                {checkingPayment ? 'Kontroluji…' : 'Obnovit stav platby'}
              </button>
            ) : (
              <p className="text-xs uppercase tracking-wider text-[#666666] border border-black/10 p-2">Objednávka nemá přiřazené ID platby z GoPay.</p>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Status manager */}
          <div className="bg-white border border-black p-5">
            <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-4 pb-2 border-b border-black">
              Status objednávky
            </p>
            <div className="mb-4">
              <p className="text-[10px] text-[#666666] uppercase tracking-widest mb-1">Aktuální stav</p>
              <span className={`inline-flex items-center text-xs font-bold uppercase tracking-wider px-3 py-1 border ${order.status === 'COMPLETED' ? 'bg-black text-white border-black' : order.status === 'CANCELLED' ? 'bg-white text-black border-2 border-black' : 'bg-white text-black border border-black'}`}>
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>
            <p className="text-[10px] text-[#666666] uppercase tracking-widest mb-2">Změnit na</p>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  disabled={status === order.status}
                  className={`text-xs uppercase font-medium tracking-wider px-3 py-2 border border-black transition-colors ${
                    status === order.status
                      ? 'bg-black text-white opacity-80 cursor-default'
                      : 'bg-white text-black hover:bg-black hover:text-white'
                  }`}
                >
                  {STATUS_LABELS[status] ?? status}
                </button>
              ))}
            </div>
          </div>

          {/* Order items */}
          <div className="bg-white border border-black p-5">
            <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-4 pb-2 border-b border-black">
              Položky ({order.items.length})
            </p>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-3 items-start pb-3 border-b border-black/10 last:border-b-0">
                  {item.image && (
                    <img src={item.image} alt={item.productName} className="w-14 h-14 object-cover border border-black shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase font-bold text-black truncate">{item.productName}</p>
                    <p className="text-[10px] uppercase tracking-wide text-[#666666] mt-0.5">
                      {item.size}{item.color ? ` · ${item.color}` : ''} · {item.quantity}×
                    </p>
                    <div className="flex items-center justify-between mt-1.5 text-xs">
                      <span className="text-[#666666]">{Number(item.price).toFixed(0)} Kč / ks</span>
                      <span className="font-bold text-black">{(Number(item.price) * item.quantity).toFixed(0)} Kč</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-black mt-2">
              <span className="text-xs font-bold uppercase tracking-wider">Celkem k úhradě</span>
              <span className="text-base font-bold text-black">{Number(order.totalPrice).toFixed(0)} Kč</span>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white border border-black p-5">
            <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-3 pb-2 border-b border-black">
              Časové údaje
            </p>
            <div className="space-y-2 text-xs uppercase tracking-wider">
              <div className="flex items-baseline gap-3">
                <span className="text-[#666666] w-28 shrink-0">Vytvořeno</span>
                <span className="font-medium text-black">{new Date(order.createdAt).toLocaleString('cs-CZ')}</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-[#666666] w-28 shrink-0">Poslední aktualizace</span>
                <span className="font-medium text-black">{new Date(order.updatedAt).toLocaleString('cs-CZ')}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <ConfirmModal
        isOpen={!!statusModal}
        title="Změnit status objednávky"
        message={`Opravdu chcete změnit status na „${STATUS_LABELS[statusModal?.newStatus ?? ''] ?? statusModal?.newStatus}"?`}
        confirmLabel="Změnit"
        isDestructive={false}
        onConfirm={confirmUpdateStatus}
        onCancel={() => setStatusModal(null)}
      />
      <ConfirmModal
        isOpen={retryModal}
        title="Vytvořit zásilku v Zásilkovně"
        message="Zkusit znovu vytvořit zásilku pro tuto objednávku v systému Zásilkovna?"
        confirmLabel="Vytvořit"
        isDestructive={false}
        onConfirm={confirmRetry}
        onCancel={() => setRetryModal(false)}
      />
    </div>
  );
}
