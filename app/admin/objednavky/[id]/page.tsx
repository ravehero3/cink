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

  if (loading) {
    return <div className="text-body">Načítání objednávky...</div>;
  }

  if (!order) {
    return <div className="text-body">Objednávka nenalezena</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-title font-bold">OBJEDNÁVKA #{order.orderNumber}</h1>
        <div className="flex gap-4">
          {nextOrderId && (
            <button
              onClick={() => router.push(`/admin/objednavky/${nextOrderId}`)}
              className="px-6 py-2 text-body uppercase border border-black hover:bg-black hover:text-white"
            >
              Další Objednávka →
            </button>
          )}
          <button
            onClick={() => router.back()}
            className="px-6 py-2 text-body uppercase border border-black hover:bg-black hover:text-white"
          >
            ← Zpět
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="border border-black p-6">
            <h2 className="text-header font-bold mb-4">INFORMACE O ZÁKAZNÍKOVI</h2>
            <div className="space-y-2 text-body">
              <div><strong>Jméno:</strong> {order.customerName}</div>
              <div><strong>Email:</strong> {order.customerEmail}</div>
              <div><strong>Telefon:</strong> {order.customerPhone}</div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="border border-black p-6">
            <h2 className="text-header font-bold mb-4">DOPRAVA</h2>
            <div className="space-y-2 text-body">
              <div><strong>Metoda:</strong> {order.shippingMethod.toUpperCase()}</div>
              {order.zasilkovnaId && (
                <>
                  <div><strong>Pobočka ID:</strong> {order.zasilkovnaId}</div>
                  <div><strong>Název pobočky:</strong> {order.zasilkovnaName}</div>
                </>
              )}
              {order.packetaPacketId && (
                <div className="mt-2 p-2 bg-gray-50 border border-black">
                  <strong>Packeta Packet ID:</strong> {order.packetaPacketId}
                  <div className="text-small mt-1">
                    ✓ Zásilka vytvořena v systému Zásilkovny
                  </div>
                </div>
              )}
              {order.packetaError && !order.packetaPacketId && order.shippingMethod === 'zasilkovna' && (
                <div className="mt-2 p-3 bg-red-50 border border-red-300">
                  <strong className="text-red-700">Chyba při vytváření zásilky:</strong>
                  <div className="text-small mt-1 text-red-600">{order.packetaError}</div>
                  <button
                    onClick={retryPacketaCreation}
                    className="mt-2 px-4 py-2 bg-red-600 text-white text-small uppercase hover:bg-red-700"
                    disabled={loading}
                  >
                    {loading ? 'Zkouším...' : 'Zkusit znovu'}
                  </button>
                </div>
              )}
              {!order.packetaPacketId && !order.packetaError && order.shippingMethod === 'zasilkovna' && order.zasilkovnaId && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-300">
                  <strong className="text-yellow-700">Zásilka nebyla vytvořena</strong>
                  <div className="text-small mt-1 text-yellow-600">
                    Zásilka v systému Zásilkovny zatím nebyla vytvořena
                  </div>
                  <button
                    onClick={retryPacketaCreation}
                    className="mt-2 px-4 py-2 bg-yellow-600 text-white text-small uppercase hover:bg-yellow-700"
                    disabled={loading}
                  >
                    {loading ? 'Vytvářím...' : 'Vytvořit zásilku'}
                  </button>
                </div>
              )}
              <div className="mt-4">
                <label className="block mb-2"><strong>Číslo zásilky (Tracking):</strong></label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="flex-1 border border-black p-2 text-body"
                    placeholder="Zadejte číslo zásilky"
                  />
                  <button
                    onClick={updateTrackingNumber}
                    className="px-4 py-2 bg-black text-white text-body uppercase hover:bg-white hover:text-black border border-black"
                  >
                    Uložit
                  </button>
                </div>
                {order.packetaPacketId && !trackingNumber && (
                  <div className="text-small mt-1 text-gray-600">
                    Číslo zásilky bylo automaticky vytvořeno v Zásilkovně
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="border border-black p-6">
            <h2 className="text-header font-bold mb-4">PLATBA</h2>
            <div className="space-y-2 text-body">
              <div><strong>Status platby:</strong> {order.paymentStatus}</div>
              {order.paymentId && (
                <div><strong>ID platby:</strong> {order.paymentId}</div>
              )}
              <div className="mt-4">
                <strong>Celková cena:</strong> {Number(order.totalPrice).toFixed(2)} Kč
              </div>
              {order.paymentId && (
                <div className="mt-4">
                  <button
                    onClick={checkPaymentStatus}
                    disabled={checkingPayment}
                    className="px-4 py-2 bg-black text-white text-body uppercase hover:bg-white hover:text-black border border-black disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checkingPayment ? 'Kontroluji...' : 'Obnovit stav platby'}
                  </button>
                </div>
              )}
              {!order.paymentId && (
                <div className="mt-4 p-2 bg-gray-100 border border-gray-300 text-small text-gray-600">
                  Objednávka nemá přiřazené ID platby z GoPay
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Order Status */}
          <div className="border border-black p-6">
            <h2 className="text-header font-bold mb-4">STATUS OBJEDNÁVKY</h2>
            <div className="mb-4">
              <div className="text-body mb-2">Aktuální status:</div>
              <div className="text-header font-bold">{order.status}</div>
            </div>
            <div>
              <div className="text-body mb-2">Změnit status na:</div>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(status)}
                    disabled={status === order.status}
                    className={`px-4 py-2 text-body uppercase border border-black ${
                      status === order.status
                        ? 'bg-black text-white cursor-not-allowed'
                        : 'bg-white text-black hover:bg-black hover:text-white'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="border border-black p-6">
            <h2 className="text-header font-bold mb-4">POLOŽKY OBJEDNÁVKY</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="border-b border-black last:border-b-0 pb-4 last:pb-0 flex gap-4">
                  {item.image && (
                    <div className="flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.productName}
                        className="w-20 h-20 object-cover border border-black"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-body font-bold">{item.productName}</div>
                    <div className="text-body">
                      Velikost: {item.size} | Množství: {item.quantity}x
                    </div>
                    {item.color && (
                      <div className="text-body">Barva: {item.color}</div>
                    )}
                    <div className="text-body">
                      Cena: {Number(item.price).toFixed(2)} Kč / ks
                    </div>
                    <div className="text-body font-bold mt-1">
                      Celkem: {(Number(item.price) * item.quantity).toFixed(2)} Kč
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timestamps */}
          <div className="border border-black p-6">
            <h2 className="text-header font-bold mb-4">ČASOVÉ ÚDAJE</h2>
            <div className="space-y-2 text-body">
              <div>
                <strong>Vytvořeno:</strong>{' '}
                {new Date(order.createdAt).toLocaleString('cs-CZ')}
              </div>
              <div>
                <strong>Poslední aktualizace:</strong>{' '}
                {new Date(order.updatedAt).toLocaleString('cs-CZ')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
