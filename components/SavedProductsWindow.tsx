'use client';

import type { MouseEvent } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSavedProductsStore } from '@/lib/saved-products-store';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
}

interface SavedProductsWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SavedProductsWindow({ isOpen, onClose }: SavedProductsWindowProps) {
  const savedIds = useSavedProductsStore((state) => state.savedIds);
  const removeProduct = useSavedProductsStore((state) => state.removeProduct);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && savedIds.length > 0) {
      fetchSavedProducts();
    } else if (savedIds.length === 0) {
      setProducts([]);
    }
  }, [isOpen, savedIds]);

  const fetchSavedProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/saved-products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching saved products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (productId: string, e: MouseEvent) => {
    e.preventDefault();
    removeProduct(productId);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-white bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-white border-l border-black z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="h-header border-b border-black flex items-center justify-center relative">
            <h2 className="text-header font-bold">ULOŽENÉ PRODUKTY</h2>
            <button
              onClick={onClose}
              className="absolute right-4 w-6 h-6 flex items-center justify-center text-black hover:bg-black hover:text-white border border-black"
              aria-label="Zavřít"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-body">Načítám...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex items-center justify-center h-full px-8">
                <p className="text-body text-center">Nemáte žádné uložené produkty</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="border border-black p-3 bg-white relative">
                    <Link
                      href={`/produkty/${product.slug}`}
                      onClick={onClose}
                      className="flex gap-3"
                    >
                      <div className="w-20 h-20 flex-shrink-0 border border-black">
                        <img
                          src={product.images[0] || '/placeholder.png'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          style={{ filter: 'grayscale(1) contrast(1.2)' }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-body font-bold mb-1 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-body">{product.price} Kč</p>
                      </div>
                    </Link>
                    <button
                      onClick={(e) => handleRemove(product.id, e)}
                      className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-white border border-black hover:bg-black hover:text-white"
                      aria-label="Odebrat"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {products.length > 0 && (
            <div className="border-t border-black p-4">
              <Link
                href="/ulozeno"
                onClick={onClose}
                className="block w-full bg-black text-white text-center text-body uppercase py-3 border border-black hover:bg-white hover:text-black transition-colors"
              >
                ZOBRAZIT VŠECHNY ({products.length})
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
