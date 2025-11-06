'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Titlebar from '@/components/Titlebar';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: any[];
  totalPrice: number;
  paymentStatus: string;
  status: string;
  zasilkovnaName: string;
  createdAt: string;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderNumber}`);
        if (!response.ok) {
          throw new Error('Objednávka nenalezena');
        }
        const data = await response.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <>
        <Titlebar title="POTVRZENÍ OBJEDNÁVKY" />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-body">Načítám objednávku...</p>
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Titlebar title="CHYBA" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-body mb-4">{error || 'Objednávka nenalezena'}</p>
            <Link href="/" className="text-body underline hover:no-underline">
              Zpět na hlavní stránku
            </Link>
          </div>
        </div>
      </>
    );
  }

  const isPaid = order.paymentStatus === 'PAID';

  return (
    <>
      <Titlebar title="POTVRZENÍ OBJEDNÁVKY" />
      
      <div className="max-w-2xl mx-auto px-8 py-16">
        <div className="border border-black p-8 bg-white">
          <h1 className="text-title font-bold text-center mb-8">
            DĚKUJEME ZA OBJEDNÁVKU!
          </h1>

          <div className="text-center mb-8">
            <p className="text-body mb-2">Vaše objednávka</p>
            <p className="text-header font-bold">#{order.orderNumber}</p>
            <p className="text-body mt-1">byla úspěšně přijata.</p>
          </div>

          <div className="border-t border-b border-black py-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-body">Platba:</span>
              <span className="text-body font-bold">
                {isPaid ? '✓ Zaplaceno' : 'Čeká na platbu'}
              </span>
            </div>
          </div>

          <div className="text-body text-center mb-8">
            <p className="mb-2">Na email jsme vám zaslali</p>
            <p className="mb-2">potvrzení objednávky.</p>
          </div>

          <div className="border-t border-black pt-6 mb-8">
            <p className="text-body font-bold mb-4">Co se stane dál?</p>
            <ol className="text-body space-y-2 list-decimal list-inside">
              <li>Připravíme vaši zásilku</li>
              <li>Odešleme na Zásilkovnu</li>
              <li>Obdržíte SMS s kódem pro vyzvednutí</li>
            </ol>
          </div>

          {order.zasilkovnaName && (
            <div className="border-t border-black pt-6 mb-8">
              <p className="text-body font-bold mb-2">Výdejní místo:</p>
              <p className="text-body">{order.zasilkovnaName}</p>
            </div>
          )}

          <div className="border-t border-black pt-6 space-y-3">
            <Link
              href={`/ucet`}
              className="block w-full bg-black text-white text-center text-body uppercase py-3 border border-black hover:bg-white hover:text-black transition-colors"
            >
              SLEDOVAT OBJEDNÁVKU
            </Link>

            <Link
              href="/"
              className="block w-full bg-white text-black text-center text-body uppercase py-3 border border-black hover:bg-black hover:text-white transition-colors"
            >
              POKRAČOVAT V NÁKUPU
            </Link>
          </div>

          <div className="mt-8 text-center text-body opacity-70">
            <p className="text-[12px]">Máte otázky?</p>
            <p className="text-[12px]">Kontaktujte nás na info@ufosport.cz</p>
          </div>
        </div>
      </div>
    </>
  );
}
