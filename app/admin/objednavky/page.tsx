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
        toast.success('Status objednávky byl aktualizován');
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
      { label: 'Dnes', ...calculateStatsForPeriod('Dnes') },
      { label: '24 hodin', ...calculateStatsForPeriod('24 hodin') },
      { label: 'Týden', ...calculateStatsForPeriod('Týden') },
      { label: 'Měsíc', ...calculateStatsForPeriod('Měsíc') },
      { label: 'Rok', ...calculateStatsForPeriod('Rok') }
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
          name: `${hourStart.getHours()}:00`,
          revenue: hourOrders.reduce((sum, o) => sum + Number(o.totalPrice), 0),
          orders: hourOrders.length,
        });
      }
    } else if (selectedPeriod === 'Týden') {
      const days = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
      for (let i = 6; i >= 0; i--) {
        const dayDate = new Date(now);
        dayDate.setDate(now.getDate() - i);
        dayDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(dayDate);
        nextDay.setDate(dayDate.getDate() + 1);

        const dayOrders = activeOrders.filter((o) => {
          const date = new Date(o.createdAt);
          return date >= dayDate && date < nextDay;
        });

        dataPoints.push({
          name: days[dayDate.getDay()],
          revenue: dayOrders.reduce((sum, o) => sum + Number(o.totalPrice), 0),
          orders: dayOrders.length,
        });
      }
    } else if (selectedPeriod === 'Měsíc') {
      for (let i = 29; i >= 0; i -= 2) {
        const dayDate = new Date(now);
        dayDate.setDate(now.getDate() - i);
        dayDate.setHours(0, 0, 0, 0);
        const nextPeriod = new Date(dayDate);
        nextPeriod.setDate(dayDate.getDate() + 2);

        const periodOrders = activeOrders.filter((o) => {
          const date = new Date(o.createdAt);
          return date >= dayDate && date < nextPeriod;
        });

        dataPoints.push({
          name: `${dayDate.getDate()}.${dayDate.getMonth() + 1}`,
          revenue: periodOrders.reduce((sum, o) => sum + Number(o.totalPrice), 0),
          orders: periodOrders.length,
        });
      }
    } else if (selectedPeriod === 'Rok') {
      const months = ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čvn', 'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro'];
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

        const monthOrders = activeOrders.filter((o) => {
          const date = new Date(o.createdAt);
          return date >= monthDate && date < nextMonth;
        });

        dataPoints.push({
          name: months[monthDate.getMonth()],
          revenue: monthOrders.reduce((sum, o) => sum + Number(o.totalPrice), 0),
          orders: monthOrders.length,
        });
      }
    }

    return dataPoints;
  };

  const handleSort = (key: 'paymentStatus' | 'status' | 'createdAt') => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const sortedOrders = [...orders].sort((a, b) => {
    if (!sortBy) return 0;
    let aVal = a[sortBy] || '';
    let bVal = b[sortBy] || '';
    if (sortBy === 'createdAt') {
      return sortOrder === 'asc'
        ? new Date(aVal).getTime() - new Date(bVal).getTime()
        : new Date(bVal).getTime() - new Date(aVal).getTime();
    }
    return sortOrder === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const paymentBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-black text-white border border-black';
      case 'PENDING':
        return 'bg-white text-black border border-black';
      case 'FAILED':
        return 'bg-white text-black border-2 border-black';
      default:
        return 'bg-black/10 text-black border border-black';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6" style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
        <PageHeaderSkeleton />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-black border border-black">
          {[...Array(5)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="bg-white border border-black overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-black">
              <tr>
                {['Objednávka','Zákazník','Datum','Celkem','Status','Platba','Akce'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest">{h}</th>
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
    <div className="space-y-8" style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif' }}>

      {/* Floating order preview */}
      {hoveredOrder && (
        <div
          className="fixed z-[100] pointer-events-none w-[360px] bg-white border border-black shadow-none overflow-hidden"
          style={{
            left: `${(typeof window !== 'undefined' && mousePos.x + 400 > window.innerWidth) ? mousePos.x - 380 : mousePos.x + 20}px`,
            top: `${Math.min(mousePos.y + 10, typeof window !== 'undefined' ? Math.max(10, window.innerHeight - 340) : 0)}px`,
          }}
        >
          <div className="flex justify-between items-start px-4 py-3 border-b border-black bg-white">
            <div>
              <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest">Objednávka</p>
              <p className="font-bold text-black mt-0.5 text-xs uppercase tracking-wider">{hoveredOrder.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest">Celkem</p>
              <p className="font-bold text-black mt-0.5 text-xs">{Number(hoveredOrder.totalPrice).toFixed(0)} Kč</p>
            </div>
          </div>
          <div className="px-4 py-3 space-y-2">
            {Array.isArray(hoveredOrder.items) && hoveredOrder.items.map((item: any, i: number) => (
              <div key={i} className="flex gap-2.5 items-center">
                {item.image && (
                  <img src={item.image} alt="" className="w-10 h-10 object-cover border border-black shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase font-medium truncate">{item.name}</p>
                  <p className="text-[10px] uppercase text-[#666666]">{item.size}{item.color ? ` · ${item.color}` : ''} · {item.quantity} ks</p>
                </div>
                <p className="text-xs font-bold whitespace-nowrap">{item.price} Kč</p>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-black bg-white grid grid-cols-2 gap-3 text-[11px] uppercase tracking-wider">
            <div>
              <p className="text-[10px] font-bold text-[#666666] tracking-widest mb-0.5">Zákazník</p>
              <p className="font-medium text-black truncate">{hoveredOrder.customerName}</p>
              <p className="text-[10px] text-[#666666]">{hoveredOrder.customerPhone}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#666666] tracking-widest mb-0.5">Doprava</p>
              <p className="font-medium text-black truncate">
                {hoveredOrder.shippingMethod === 'zasilkovna' ? 'Zásilkovna' :
                 hoveredOrder.shippingMethod.startsWith('ppl') ? 'PPL' : hoveredOrder.shippingMethod}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="border-b border-black pb-4">
        <h1 className="admin-title">
          Objednávky
        </h1>
        <p className="admin-sub">
          {orders.length} objednávek celkem · Klikněte na řádek pro detail
        </p>
      </div>

      {/* Period selector cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-black border border-black">
        {getTimeFrames().map((frame, idx) => {
          const active = selectedPeriod === frame.label;
          return (
            <button
              key={idx}
              onClick={() => setSelectedPeriod(frame.label)}
              className={`text-left p-4 transition-colors ${
                active
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-black hover:text-white'
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">
                {frame.label}
              </p>
              <p
                className="text-lg font-bold uppercase leading-tight"
                style={{ fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif' }}
              >
                {frame.revenue} Kč
              </p>
              <p className="text-[11px] uppercase tracking-wider mt-1 opacity-70">
                {frame.orders} objednávek
              </p>
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-white border border-black p-6">
        <p className="text-xs font-bold uppercase tracking-widest mb-6">
          Graf prodeje · {selectedPeriod}
        </p>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="#000000" strokeOpacity={0.15} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#000000' }} axisLine={{ stroke: '#000000' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#000000' }} axisLine={{ stroke: '#000000' }} tickLine={false} />
              <Tooltip
                contentStyle={{
                  border: '1px solid #000000',
                  borderRadius: 0,
                  background: '#ffffff',
                  color: '#000000',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  boxShadow: 'none',
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#000000"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#000000' }}
                name="Prodej (Kč)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white border border-black overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-white border-b border-black">
              <tr>
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
                    className={`text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${
                      col.key ? 'cursor-pointer hover:bg-black hover:text-white transition-colors select-none' : ''
                    }`}
                  >
                    {col.label}
                    {col.key && (
                      <span className="ml-1">
                        {sortBy === col.key ? (sortOrder === 'desc' ? '↑' : '↓') : ''}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {sortedOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-black/5 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(order.id)}
                  onMouseEnter={() => setHoveredOrder(order)}
                  onMouseLeave={() => setHoveredOrder(null)}
                  onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                >
                  <td className="px-4 py-3 font-bold uppercase whitespace-nowrap">{order.orderNumber}</td>
                  <td className="px-4 py-3 uppercase whitespace-nowrap font-medium">{order.customerName}</td>
                  <td className="px-4 py-3 text-[#666666] whitespace-nowrap">{order.customerEmail}</td>
                  <td className="px-4 py-3 text-[#666666] whitespace-nowrap">{order.customerPhone}</td>
                  <td className="px-4 py-3 text-[#666666] max-w-[160px] truncate uppercase">
                    {order.shippingMethod === 'zasilkovna' ? (order.zasilkovnaName || '—') :
                     order.shippingMethod === 'ppl_address' ? `${order.shippingStreet}, ${order.shippingCity}` :
                     order.shippingMethod === 'ppl_parcelshop' ? (order.pplName || '—') : '—'}
                  </td>
                  <td className="px-4 py-3 font-bold whitespace-nowrap">{Number(order.totalPrice).toFixed(0)} Kč</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${paymentBadge(order.paymentStatus)}`}>
                      {PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updatingOrderId === order.id}
                      className="text-xs uppercase font-medium border border-black bg-white text-black px-2 py-1 cursor-pointer focus:outline-none disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{STATUS_TRANSLATIONS[s] ?? s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-[#666666] whitespace-nowrap text-xs">
                    {new Date(order.createdAt).toLocaleDateString('cs-CZ')}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <Link
                      href={`/admin/objednavky/${order.id}`}
                      className="text-xs uppercase font-bold text-black hover:underline whitespace-nowrap"
                    >
                      Detail →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sortedOrders.length === 0 && (
          <div className="text-center py-16 text-xs uppercase tracking-widest text-[#666666]">
            Žádné objednávky nebyly nalezeny.
          </div>
        )}
        <div className="px-4 py-3 border-t border-black text-xs uppercase tracking-wider text-[#666666]">
          Zobrazeno {sortedOrders.length} z {orders.length} objednávek
        </div>
      </div>
    </div>
  );
}
