'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  zasilkovnaName: string | null;
}

const STATUS_OPTIONS = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];
const PAYMENT_STATUS_OPTIONS = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-black text-white';
      case 'CANCELLED':
        return 'bg-white text-black border-2 border-black';
      default:
        return 'bg-white text-black border border-black';
    }
  };

  const openStatusModal = (order: Order) => {
    setSelectedOrderForStatus(order);
    setNewStatus(order.status);
    setStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    setStatusModalOpen(false);
    setSelectedOrderForStatus(null);
    setNewStatus('');
  };

  const confirmStatusChange = async () => {
    if (!selectedOrderForStatus) return;

    setUpdatingOrderId(selectedOrderForStatus.id);
    try {
      const response = await fetch(`/api/admin/orders/${selectedOrderForStatus.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchOrders();
        closeStatusModal();
      } else {
        alert('Nepodařilo se změnit status');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Došlo k chybě při změně statusu');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (paymentFilter !== 'all' && order.paymentStatus !== paymentFilter) return false;
    return true;
  });

  if (loading) {
    return <div className="text-body">Načítání objednávek...</div>;
  }

  return (
    <div>
      <h1 className="text-title font-bold mb-8">OBJEDNÁVKY</h1>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="text-body uppercase mb-2 block">Status objednávky:</label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 text-body uppercase border border-black ${
                statusFilter === 'all' ? 'bg-black text-white' : 'bg-white text-black'
              }`}
            >
              Všechny
            </button>
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 text-body uppercase border border-black ${
                  statusFilter === status ? 'bg-black text-white' : 'bg-white text-black'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-body uppercase mb-2 block">Status platby:</label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setPaymentFilter('all')}
              className={`px-4 py-2 text-body uppercase border border-black ${
                paymentFilter === 'all' ? 'bg-black text-white' : 'bg-white text-black'
              }`}
            >
              Všechny
            </button>
            {PAYMENT_STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => setPaymentFilter(status)}
                className={`px-4 py-2 text-body uppercase border border-black ${
                  paymentFilter === status ? 'bg-black text-white' : 'bg-white text-black'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="border border-black overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black">
              <th className="text-left p-4 text-body uppercase">Číslo objednávky</th>
              <th className="text-left p-4 text-body uppercase">Zákazník</th>
              <th className="text-left p-4 text-body uppercase">Email</th>
              <th className="text-left p-4 text-body uppercase">Adresa</th>
              <th className="text-left p-4 text-body uppercase">Cena</th>
              <th className="text-left p-4 text-body uppercase">Status platby</th>
              <th className="text-left p-4 text-body uppercase">Status objednávky</th>
              <th className="text-left p-4 text-body uppercase">Datum</th>
              <th className="text-left p-4 text-body uppercase">Akce</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-b border-black last:border-b-0">
                <td className="p-4 text-body font-bold">{order.orderNumber}</td>
                <td className="p-4 text-body">{order.customerName}</td>
                <td className="p-4 text-body">{order.customerEmail}</td>
                <td className="p-4 text-body text-small">
                  {order.zasilkovnaName ? order.zasilkovnaName : '—'}
                </td>
                <td className="p-4 text-body">{Number(order.totalPrice).toFixed(2)} Kč</td>
                <td className="p-4">
                  <span className="px-3 py-1 text-body uppercase border border-black">
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => openStatusModal(order)}
                    disabled={updatingOrderId === order.id}
                    className={`px-3 py-1 text-body uppercase border border-black bg-white cursor-pointer hover:bg-black hover:text-white ${
                      updatingOrderId === order.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {order.status}
                  </button>
                </td>
                <td className="p-4 text-body">
                  {new Date(order.createdAt).toLocaleDateString('cs-CZ')}
                </td>
                <td className="p-4">
                  <Link
                    href={`/admin/objednavky/${order.id}`}
                    className="px-3 py-1 text-body uppercase border border-black hover:bg-black hover:text-white inline-block"
                  >
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 text-body">
          Žádné objednávky nebyly nalezeny.
        </div>
      )}

      <div className="mt-6 text-body">
        Zobrazeno: {filteredOrders.length} z {orders.length} objednávek
      </div>

      {/* Status Change Modal Overlay */}
      {statusModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeStatusModal}
        />
      )}

      {/* Status Change Modal */}
      {statusModalOpen && selectedOrderForStatus && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-black p-8 max-w-md w-full">
            <h2 className="text-header font-bold mb-6">ZMĚNA STATUSU</h2>
            
            <div className="mb-6">
              <p className="text-body mb-4">
                <strong>Objednávka:</strong> {selectedOrderForStatus.orderNumber}
              </p>
              <p className="text-body mb-4">
                <strong>Aktuální status:</strong> {selectedOrderForStatus.status}
              </p>
            </div>

            <div className="mb-8">
              <label className="block text-body uppercase mb-4">Nový status:</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-3 border-2 border-black text-body uppercase bg-white"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <button
                onClick={confirmStatusChange}
                disabled={updatingOrderId === selectedOrderForStatus.id}
                className={`flex-1 px-6 py-3 text-body uppercase border-2 border-black font-bold hover:bg-black hover:text-white transition-colors ${
                  updatingOrderId === selectedOrderForStatus.id ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {updatingOrderId === selectedOrderForStatus.id ? 'Ukládám...' : 'Potvrdit'}
              </button>
              <button
                onClick={closeStatusModal}
                disabled={updatingOrderId === selectedOrderForStatus.id}
                className="flex-1 px-6 py-3 text-body uppercase border-2 border-black hover:bg-black hover:text-white transition-colors"
              >
                Zrušit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
