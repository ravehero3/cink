'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/store/toastStore';
import { TableSkeleton, StatCardSkeleton, PageHeaderSkeleton } from '@/components/admin/Skeleton';
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
  shippingMethod: string;
  zasilkovnaName: string | null;
  pplName: string | null;
  shippingStreet: string | null;
  shippingCity: string | null;
  shippingZip: string | null;
  items: any[];
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

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PAID: 'Zaplaceno',
  PENDING: 'Čeká na platbu',
  FAILED: 'Platba selhala',
  REFUNDED: 'Vráceno',
};

const TIME_PERIODS = ['Dnes', '24 hodin', 'Týden', 'Měsíc', 'Rok'];

export default function AdminOrdersPage() {
  const router = useRouter();
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('Měsíc');
  const [chartData, setChartData] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [sortBy, setSortBy] = useState<'paymentStatus' | 'status' | 'createdAt' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [hoveredOrder, setHoveredOrder] = useState<Order | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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
        toast.error('Nepodařilo se změnit status');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Došlo k chybě při změně statusu');
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

  const paymentBadge = (status: string) => {
    const map: Record<string, string> = {
      PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
      FAILED: 'bg-red-50 text-red-600 border-red-200',
      REFUNDED: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return map[status] ?? 'bg-gray-100 text-gray-500 border-gray-200';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr>
                {['Objednávka','Zákazník','Datum','Celkem','Status','Platba','Akce'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody><TableSkeleton rows={10} cols={7} /></tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Floating order preview */}
      {hoveredOrder && (
        <div
          className="fixed z-[100] pointer-events-none w-[380px] bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden"
          style={{
            left: `${(typeof window !== 'undefined' && mousePos.x + 420 > window.innerWidth) ? mousePos.x - 400 : mousePos.x + 20}px`,
            top: `${Math.min(mousePos.y + 10, typeof window !== 'undefined' ? Math.max(10, window.innerHeight - 340) : 0)}px`,
          }}
        >
          <div className="flex justify-between items-start px-5 py-4 border-b border-gray-100 bg-gray-50">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Objednávka</p>
              <p className="font-bold text-gray-900 mt-0.5">{hoveredOrder.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Celkem</p>
              <p className="font-bold text-gray-900 mt-0.5">{Number(hoveredOrder.totalPrice).toFixed(2)} Kč</p>
            </div>
          </div>
          <div className="px-5 py-3 space-y-2.5">
            {Array.isArray(hoveredOrder.items) && hoveredOrder.items.map((item: any, i: number) => (
              <div key={i} className="flex gap-3 items-center">
                {item.image && (
                  <img src={item.image} alt="" className="w-11 h-11 rounded-lg object-cover border border-gray-100 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                  <p className="text-[10px] text-gray-400">{item.size}{item.color ? ` · ${item.color}` : ''} · {item.quantity} ks</p>
                </div>
                <p className="text-xs font-semibold text-gray-700 whitespace-nowrap">{item.price} Kč</p>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Zákazník</p>
              <p className="text-xs font-semibold text-gray-800">{hoveredOrder.customerName}</p>
              <p className="text-[10px] text-gray-400">{hoveredOrder.customerPhone}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Doprava</p>
              <p className="text-xs font-semibold text-gray-800">
                {hoveredOrder.shippingMethod === 'zasilkovna' ? 'Zásilkovna' :
                 hoveredOrder.shippingMethod.startsWith('ppl') ? 'PPL' : hoveredOrder.shippingMethod}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {hoveredOrder.shippingMethod === 'zasilkovna' ? hoveredOrder.zasilkovnaName :
                 hoveredOrder.shippingMethod === 'ppl_address' ? `${hoveredOrder.shippingStreet}, ${hoveredOrder.shippingCity}` :
                 hoveredOrder.shippingMethod === 'ppl_parcelshop' ? hoveredOrder.pplName : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Objednávky</h1>
        <p className="mt-1 text-sm text-gray-400">{orders.length} celkem · klikněte na řádek pro detail</p>
      </div>

      {/* Period selector cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {getTimeFrames().map((frame, idx) => {
          const active = selectedPeriod === frame.label;
          return (
            <button
              key={idx}
              onClick={() => setSelectedPeriod(frame.label)}
              className={`text-left rounded-2xl border p-4 transition-all duration-150 ${
                active
                  ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                  : 'bg-white border-gray-100 text-gray-700 hover:border-gray-200 hover:shadow-sm'
              }`}
            >
              <p className={`text-[10px] font-semibold uppercase tracking-widest mb-2 ${active ? 'text-white/60' : 'text-gray-400'}`}>
                {frame.label}
              </p>
              <p className={`text-lg font-bold leading-tight ${active ? 'text-white' : 'text-gray-900'}`}>
                {frame.revenue} Kč
              </p>
              <p className={`text-xs mt-1 ${active ? 'text-white/60' : 'text-gray-400'}`}>
                {frame.orders} objednávek
              </p>
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">
          Graf prodeje · {selectedPeriod}
        </p>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  background: 'white',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#111827"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#111827' }}
                name="Prodej (Kč)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-gray-100">
                {[
                  { label: 'Číslo', key: null },
                  { label: 'Zákazník', key: null },
                  { label: 'Email', key: null },
                  { label: 'Telefon', key: null },
                  { label: 'Adresa', key: null },
                  { label: 'Cena', key: null },
                  { label: 'Platba', key: 'paymentStatus' as const },
                  { label: 'Stav', key: 'status' as const },
                  { label: 'Datum', key: 'createdAt' as const },
                  { label: '', key: null },
                ].map((col, i) => (
                  <th
                    key={i}
                    onClick={() => col.key && handleSort(col.key)}
                    className={`text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap ${
                      col.key ? 'cursor-pointer hover:text-gray-600 select-none' : ''
                    }`}
                  >
                    {col.label}
                    {col.key && (
                      <span className={`ml-1 ${sortBy === col.key ? 'text-gray-700' : 'opacity-0 group-hover:opacity-100'}`}>
                        {sortBy === col.key && sortOrder === 'desc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayedOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(order.id)}
                  onMouseEnter={() => setHoveredOrder(order)}
                  onMouseLeave={() => setHoveredOrder(null)}
                  onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                >
                  <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{order.customerName}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{order.customerEmail}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{order.customerPhone}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">
                    {order.shippingMethod === 'zasilkovna' ? (order.zasilkovnaName || '—') :
                     order.shippingMethod === 'ppl_address' ? `${order.shippingStreet}, ${order.shippingCity}` :
                     order.shippingMethod === 'ppl_parcelshop' ? (order.pplName || '—') : '—'}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{Number(order.totalPrice).toFixed(0)} Kč</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${paymentBadge(order.paymentStatus)}`}>
                      {PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updatingOrderId === order.id}
                      className="text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{STATUS_TRANSLATIONS[s] ?? s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                    {new Date(order.createdAt).toLocaleDateString('cs-CZ')}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <Link
                      href={`/admin/objednavky/${order.id}`}
                      className="text-xs font-medium text-gray-500 hover:text-gray-900 hover:underline whitespace-nowrap"
                    >
                      Detail →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {displayedOrders.length === 0 && (
          <div className="text-center py-16 text-sm text-gray-400">Žádné objednávky nebyly nalezeny.</div>
        )}
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
          Zobrazeno {displayedOrders.length} z {orders.length} objednávek
        </div>
      </div>
    </div>
  );
}
