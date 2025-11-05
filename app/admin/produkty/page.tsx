'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  totalStock: number;
  isVisible: boolean;
  images: string[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Opravdu chcete smazat produkt "${name}"?`)) return;

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Produkt byl úspěšně smazán');
        fetchProducts();
      } else {
        alert('Nepodařilo se smazat produkt');
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Došlo k chybě při mazání produktu');
    }
  };

  const toggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !currentVisibility }),
      });

      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    }
  };

  const filteredProducts = products.filter((product) => {
    if (filter === 'visible') return product.isVisible;
    if (filter === 'hidden') return !product.isVisible;
    return true;
  });

  if (loading) {
    return <div className="text-body">Načítání produktů...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-title font-bold">PRODUKTY</h1>
        <Link
          href="/admin/produkty/novy"
          className="bg-black text-white px-6 py-3 text-body uppercase hover:bg-white hover:text-black border border-black transition-colors"
        >
          + Přidat produkt
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-body uppercase border border-black ${
            filter === 'all' ? 'bg-black text-white' : 'bg-white text-black'
          }`}
        >
          Všechny ({products.length})
        </button>
        <button
          onClick={() => setFilter('visible')}
          className={`px-4 py-2 text-body uppercase border border-black ${
            filter === 'visible' ? 'bg-black text-white' : 'bg-white text-black'
          }`}
        >
          Viditelné ({products.filter((p) => p.isVisible).length})
        </button>
        <button
          onClick={() => setFilter('hidden')}
          className={`px-4 py-2 text-body uppercase border border-black ${
            filter === 'hidden' ? 'bg-black text-white' : 'bg-white text-black'
          }`}
        >
          Skryté ({products.filter((p) => !p.isVisible).length})
        </button>
      </div>

      {/* Products Table */}
      <div className="border border-black">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black">
              <th className="text-left p-4 text-body uppercase">Obrázek</th>
              <th className="text-left p-4 text-body uppercase">Název</th>
              <th className="text-left p-4 text-body uppercase">Kategorie</th>
              <th className="text-left p-4 text-body uppercase">Cena</th>
              <th className="text-left p-4 text-body uppercase">Sklad</th>
              <th className="text-left p-4 text-body uppercase">Stav</th>
              <th className="text-left p-4 text-body uppercase">Akce</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} className="border-b border-black last:border-b-0">
                <td className="p-4">
                  {product.images[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-16 h-16 object-cover border border-black"
                    />
                  )}
                </td>
                <td className="p-4 text-body">{product.name}</td>
                <td className="p-4 text-body uppercase">{product.category}</td>
                <td className="p-4 text-body">{product.price} Kč</td>
                <td className="p-4 text-body">{product.totalStock} ks</td>
                <td className="p-4">
                  <button
                    onClick={() => toggleVisibility(product.id, product.isVisible)}
                    className={`px-3 py-1 text-body uppercase border border-black ${
                      product.isVisible ? 'bg-black text-white' : 'bg-white text-black'
                    }`}
                  >
                    {product.isVisible ? 'Viditelný' : 'Skrytý'}
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/produkty/${product.id}`}
                      className="px-3 py-1 text-body uppercase border border-black hover:bg-black hover:text-white"
                    >
                      Upravit
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="px-3 py-1 text-body uppercase border border-black hover:bg-black hover:text-white"
                    >
                      Smazat
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-body">
          Žádné produkty nebyly nalezeny.
        </div>
      )}
    </div>
  );
}
