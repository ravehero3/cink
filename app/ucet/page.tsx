'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Order {
  id: string;
  orderNumber: string;
  securityToken: string;
  createdAt: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  items: any[];
}

interface SavedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'saved'>('orders');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/prihlaseni');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      const [ordersRes, savedRes] = await Promise.all([
        fetch('/api/orders/my-orders'),
        fetch('/api/saved-products'),
      ]);

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }

      if (savedRes.ok) {
        const savedData = await savedRes.json();
        setSavedProducts(savedData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-body">Načítání...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const statusLabels: Record<string, string> = {
    PENDING: 'Čeká na platbu',
    PAID: 'Zaplaceno',
    PROCESSING: 'Pracujeme na tom',
    SHIPPED: 'Odeslali jsme zásilku',
    COMPLETED: 'Doručeno',
    CANCELLED: 'Zrušeno',
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-black">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-title font-bold text-center uppercase">MŮJ ÚČET</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 border border-black p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-body font-bold mb-2">{session.user?.name || 'Bez jména'}</p>
              <p className="text-body">{session.user?.email}</p>
            </div>
            <button
              onClick={async () => {
                await signOut({ redirect: false });
                window.location.href = '/';
              }}
              className="border border-black px-6 py-2 text-body uppercase hover:bg-black hover:text-white transition-colors"
            >
              ODHLÁSIT SE
            </button>
          </div>
        </div>

        <div className="border-b border-black mb-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-4 text-body uppercase ${
                activeTab === 'orders' ? 'border-b-2 border-black font-bold' : ''
              }`}
            >
              MOJE OBJEDNÁVKY
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`pb-4 text-body uppercase ${
                activeTab === 'saved' ? 'border-b-2 border-black font-bold' : ''
              }`}
            >
              ULOŽENÉ PRODUKTY
            </button>
          </div>
        </div>

        {activeTab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-body mb-4">Zatím nemáte žádné objednávky</p>
                <Link
                  href="/"
                  className="inline-block border border-black px-6 py-2 text-body uppercase hover:bg-black hover:text-white transition-colors"
                >
                  ZAČÍT NAKUPOVAT
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const isPending = order.status === 'PENDING' && order.paymentStatus === 'PENDING';
                  const paymentUrl = `/platba?order=${order.orderNumber}&token=${order.securityToken}`;
                  
                  return (
                    <div 
                      key={order.id} 
                      className={`border border-black p-6 ${isPending ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
                      onClick={() => {
                        if (isPending) {
                          router.push(paymentUrl);
                        }
                      }}
                    >
                      <div className="flex justify-between mb-4">
                        <div>
                          <p className="text-product-name font-bold mb-1">
                            Objednávka #{order.orderNumber}
                          </p>
                          <p className="text-body">
                            {new Date(order.createdAt).toLocaleDateString('cs-CZ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-product-name font-bold mb-1">{order.totalPrice} Kč</p>
                          <p className="text-body">{statusLabels[order.status] || order.status}</p>
                        </div>
                      </div>
                      <div className="border-t border-black pt-4">
                        {order.items.slice(0, 3).map((item: any, idx: number) => (
                          <p key={idx} className="text-body">
                            {item.name} - {item.size} ({item.quantity}x)
                          </p>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-body">+ {order.items.length - 3} další produkty</p>
                        )}
                      </div>
                      {isPending && (
                        <div className="flex justify-end mt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(paymentUrl);
                            }}
                            className="bg-black text-white px-6 py-2 text-body uppercase hover:bg-gray-800 transition-colors"
                            style={{ borderRadius: '4px' }}
                          >
                            ZAPLATIT OBJEDNÁVKU
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div>
            {savedProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-body mb-4">Nemáte žádné uložené produkty</p>
                <Link
                  href="/"
                  className="inline-block border border-black px-6 py-2 text-body uppercase hover:bg-black hover:text-white transition-colors"
                >
                  PROHLÍŽET PRODUKTY
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-black">
                {savedProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/produkty/${product.slug}`}
                    className="bg-white p-6 border border-white hover:border-black transition-colors"
                  >
                    <div className="aspect-square border border-black relative mb-4">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-product-name font-bold mb-2">{product.name}</p>
                    <p className="text-body">{product.price} Kč</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
