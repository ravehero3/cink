'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  zasilkovnaName: string | null;
}

const STATUS_OPTIONS = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];
const PAYMENT_STATUS_OPTIONS = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

const STATUS_TRANSLATIONS: Record<string, string> = {
  'PENDING': 'ČEKÁ NA VYŘÍZENÍ',
  'PAID': 'ZAPLACENO',
  'PROCESSING': 'ZPRACOVÁVÁ SE',
  'SHIPPED': 'ODESLÁNO',
  'COMPLETED': 'DOKONČENO',
  'CANCELLED': 'ZRUŠENO',
};

const TIME_PERIODS = ['Dnes', '24 hodin', 'Týden', 'Měsíc', 'Rok'];

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('Měsíc');
  const [chartData, setChartData] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [sortBy, setSortBy] = useState<'paymentStatus' | 'status' | 'createdAt' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleRowClick = (orderId: string) => {
    router.push(`/admin/objednavky/${orderId}`);
  };

  useEffect(() => {
    fetchOrders();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setChartData(generateChartData());
    }
  }, [orders, selectedPeriod, mounted]);

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

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchOrders();
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

  const activeOrders = orders.filter((order) => order.status !== 'CANCELLED');

  const calculateStatsForPeriod = (period: string) => {
    const now = new Date();
    let startDate = new Date();

    if (period === 'Dnes') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === '24 hodin') {
      startDate.setDate(now.getDate() - 1);
    } else if (period === 'Týden') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'Měsíc') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (period === 'Rok') {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    const periodOrders = activeOrders.filter((order) => new Date(order.createdAt) >= startDate);
    const revenue = periodOrders.reduce((sum, order) => sum + Number(order.totalPrice), 0);

    return {
      revenue: revenue.toLocaleString('cs-CZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
      orders: periodOrders.length,
    };
  };

  const getTimeFrames = () => {
    return [
      { label: 'Dnes', ...calculateStatsForPeriod('Dnes'), countLabel: calculateStatsForPeriod('Dnes').orders + ' objednávek' },
      { label: '24 hodin', ...calculateStatsForPeriod('24 hodin'), countLabel: calculateStatsForPeriod('24 hodin').orders + ' objednávek' },
      { label: 'Týden', ...calculateStatsForPeriod('Týden'), countLabel: calculateStatsForPeriod('Týden').orders + ' objednávek' },
      { label: 'Měsíc', ...calculateStatsForPeriod('Měsíc'), countLabel: calculateStatsForPeriod('Měsíc').orders + ' objednávek' },
      { label: 'Rok', ...calculateStatsForPeriod('Rok'), countLabel: calculateStatsForPeriod('Rok').orders + ' objednávek' }
    ];
  };

  const generateChartData = () => {
    const now = new Date();
    const dataPoints: Array<{ name: string; revenue: number; orders: number }> = [];

    if (selectedPeriod === 'Dnes') {
      for (let i = 0; i < 24; i++) {
        const hourStart = new Date(now);
        hourStart.setHours(i, 0, 0, 0);
        const hourEnd = new Date(now);
        hourEnd.setHours(i + 1, 0, 0, 0);

        const hourOrders = activeOrders.filter((o) => {
          const date = new Date(o.createdAt);
          return date >= hourStart && date < hourEnd && new Date(o.createdAt).toDateString() === now.toDateString();
        });

        dataPoints.push({
          name: `${i}:00`,
          revenue: hourOrders.reduce((sum, o) => sum + Number(o.totalPrice), 0),
          orders: hourOrders.length,
        });
      }
    } else if (selectedPeriod === '24 hodin') {
      for (let i = 23; i >= 0; i--) {
        const hourStart = new Date(now);
        hourStart.setHours(now.getHours() - i, 0, 0, 0);
        const hourEnd = new Date(hourStart);
        hourEnd.setHours(hourEnd.getHours() + 1);

        const hourOrders = activeOrders.filter((o) => {
          const date = new Date(o.createdAt);
          return date >= hourStart && date < hourEnd;
        });

        dataPoints.push({
          name: `${i}:00`,
          revenue: hourOrders.reduce((sum, o) => sum + Number(o.totalPrice), 0),
          orders: hourOrders.length,
        });
      }
    } else if (selectedPeriod === 'Týden') {
      const days = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
      for (let i = 6; i >= 0; i--) {
        const dayStart = new Date(now);
        dayStart.setDate(now.getDate() - i);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const dayOrders = activeOrders.filter((o) => {
          const date = new Date(o.createdAt);
          return date >= dayStart && date < dayEnd;
        });

        dataPoints.push({
          name: days[dayStart.getDay()],
          revenue: dayOrders.reduce((sum, o) => sum + Number(o.totalPrice), 0),
          orders: dayOrders.length,
        });
      }
    } else if (selectedPeriod === 'Měsíc') {
      for (let i = 29; i >= 0; i--) {
        const dayStart = new Date(now);
        dayStart.setDate(now.getDate() - i);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const dayOrders = activeOrders.filter((o) => {
          const date = new Date(o.createdAt);
          return date >= dayStart && date < dayEnd;
        });

        dataPoints.push({
          name: dayStart.getDate().toString(),
          revenue: dayOrders.reduce((sum, o) => sum + Number(o.totalPrice), 0),
          orders: dayOrders.length,
        });
      }
    } else if (selectedPeriod === 'Rok') {
      const months = ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čer', 'Čer', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro'];
      for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(now);
        monthStart.setMonth(now.getMonth() - i);
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        const monthOrders = activeOrders.filter((o) => {
          const date = new Date(o.createdAt);
          return date >= monthStart && date < monthEnd;
        });

        dataPoints.push({
          name: months[monthStart.getMonth()],
          revenue: monthOrders.reduce((sum, o) => sum + Number(o.totalPrice), 0),
          orders: monthOrders.length,
        });
      }
    }

    return dataPoints;
  };

  const handleSort = (column: 'paymentStatus' | 'status' | 'createdAt') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const displayedOrders = [...orders].sort((a, b) => {
    if (!sortBy) return 0;

    let aValue: any;
    let bValue: any;

    if (sortBy === 'paymentStatus') {
      aValue = a.paymentStatus;
      bValue = b.paymentStatus;
    } else if (sortBy === 'status') {
      aValue = a.status;
      bValue = b.status;
    } else if (sortBy === 'createdAt') {
      aValue = new Date(a.createdAt).getTime();
      bValue = new Date(b.createdAt).getTime();
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  if (loading) {
    return <div className="text-body">Načítání objednávek...</div>;
  }

  return (
    <div>
      {/* Order Dashboard */}
      <div style={{ 
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        background: 'white',
        marginBottom: '32px'
      }}>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '1px',
          background: 'black',
          border: '1px solid black',
          marginBottom: '32px'
        }}>
          {getTimeFrames().map((frame, idx) => (
            <div 
              key={idx} 
              onClick={() => setSelectedPeriod(frame.label)}
              style={{ 
                background: selectedPeriod === frame.label ? '#f5f5f5' : 'white',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}>
              <div style={{ 
                fontSize: '11px', 
                color: '#666',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {frame.label}
              </div>
              <div style={{ 
                fontSize: '20px', 
                fontWeight: selectedPeriod === frame.label ? '500' : '400',
                marginBottom: '6px'
              }}>
                {frame.revenue} Kč
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#666'
              }}>
                {frame.countLabel}
              </div>
            </div>
          ))}
        </div>

        <div style={{ 
          border: '1px solid black',
          padding: '32px',
          marginBottom: '32px'
        }}>
          <div style={{ 
            fontSize: '11px', 
            marginBottom: '24px',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Graf prodeje - {selectedPeriod}
          </div>
          <div style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="0" stroke="#000" strokeWidth={0.5} />
                <XAxis 
                  dataKey="name" 
                  stroke="#000"
                  style={{ fontSize: '11px', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                />
                <YAxis 
                  stroke="#000"
                  style={{ fontSize: '11px', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    border: '1px solid black', 
                    background: 'white',
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#000" 
                  strokeWidth={2}
                  dot={{ fill: '#000', r: 3 }}
                  name="Prodej (Kč)"
                />
              </LineChart>
            </ResponsiveContainer>
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
              <th className="text-left p-4 text-body uppercase">Telefon</th>
              <th className="text-left p-4 text-body uppercase">Adresa</th>
              <th className="text-left p-4 text-body uppercase">Cena</th>
              <th 
                className="text-left p-4 text-body uppercase cursor-pointer hover:bg-gray-100 transition-colors group relative whitespace-nowrap"
                onClick={() => handleSort('paymentStatus')}
              >
                Status platby
                <span className={`ml-1 inline-block transition-opacity ${sortBy === 'paymentStatus' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  ↓
                </span>
              </th>
              <th 
                className="text-left p-4 text-body uppercase cursor-pointer hover:bg-gray-100 transition-colors group relative whitespace-nowrap"
                onClick={() => handleSort('status')}
              >
                Status objednávky
                <span className={`ml-1 inline-block transition-opacity ${sortBy === 'status' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  ↓
                </span>
              </th>
              <th 
                className="text-left p-4 text-body uppercase cursor-pointer hover:bg-gray-100 transition-colors group relative whitespace-nowrap"
                onClick={() => handleSort('createdAt')}
              >
                Datum
                <span className={`ml-1 inline-block transition-opacity ${sortBy === 'createdAt' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  ↓
                </span>
              </th>
              <th className="text-left p-4 text-body uppercase">Akce</th>
            </tr>
          </thead>
          <tbody>
            {displayedOrders.map((order) => (
              <tr 
                key={order.id} 
                className="border-b border-black last:border-b-0 cursor-pointer transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-gray-50 hover:shadow-md origin-center"
                onClick={() => handleRowClick(order.id)}
              >
                <td className="p-4 text-body font-bold">{order.orderNumber}</td>
                <td className="p-4 text-body">{order.customerName}</td>
                <td className="p-4 text-body">{order.customerEmail}</td>
                <td className="p-4 text-body">{order.customerPhone}</td>
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
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    disabled={updatingOrderId === order.id}
                    className={`px-3 py-1 text-body uppercase border border-black bg-white cursor-pointer hover:bg-gray-50 ${
                      updatingOrderId === order.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    style={{ minWidth: '160px' }}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_TRANSLATIONS[status] || status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-4 text-body">
                  {new Date(order.createdAt).toLocaleDateString('cs-CZ')}
                </td>
                <td className="p-4">
                  <Link
                    href={`/admin/objednavky/${order.id}`}
                    onClick={(e) => e.stopPropagation()}
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

      {displayedOrders.length === 0 && (
        <div className="text-center py-12 text-body">
          Žádné objednávky nebyly nalezeny.
        </div>
      )}

      <div className="mt-6 text-body">
        Zobrazeno: {displayedOrders.length} z {orders.length} objednávek
      </div>
    </div>
  );
}
