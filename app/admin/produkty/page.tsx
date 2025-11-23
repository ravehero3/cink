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
  lowStockThreshold: number;
  isVisible: boolean;
  images: string[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState<'none' | 'price' | 'category' | 'visibility' | 'stock' | 'threshold'>('none');
  const [bulkValue, setBulkValue] = useState('');
  const [processingBulk, setProcessingBulk] = useState(false);
  const router = useRouter();

  const CATEGORIES = ['VOODOO808', 'SPACE LOVE', 'RECREATION WELLNESS', 'T SHIRT GALLERY'];

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

  const handleDuplicate = async (productId: string) => {
    try {
      const response = await fetch('/api/admin/products/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Produkt byl duplikován: ${data.product.name}`);
        fetchProducts();
      } else {
        alert('Nepodařilo se duplikovat produkt');
      }
    } catch (error) {
      console.error('Failed to duplicate product:', error);
      alert('Došlo k chybě při duplikování produktu');
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

  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const handleBulkOperation = async () => {
    if (!bulkValue.trim()) {
      alert('Prosím zadejte hodnotu');
      return;
    }

    setProcessingBulk(true);

    try {
      const updates: any = {};

      if (bulkMode === 'price') {
        updates.price = parseFloat(bulkValue);
      } else if (bulkMode === 'category') {
        updates.category = bulkValue;
      } else if (bulkMode === 'visibility') {
        updates.isVisible = bulkValue === 'visible';
      } else if (bulkMode === 'stock') {
        updates.totalStock = parseInt(bulkValue);
      } else if (bulkMode === 'threshold') {
        updates.lowStockThreshold = parseInt(bulkValue);
      }

      const response = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: `update${bulkMode.charAt(0).toUpperCase()}${bulkMode.slice(1)}`,
          productIds: Array.from(selectedProducts),
          updates,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        fetchProducts();
        setSelectedProducts(new Set());
        setBulkMode('none');
        setBulkValue('');
      } else {
        alert('Chyba při hromadné úpravě');
      }
    } catch (error) {
      console.error('Failed bulk operation:', error);
      alert('Došlo k chybě');
    } finally {
      setProcessingBulk(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    if (filter === 'visible') return product.isVisible;
    if (filter === 'hidden') return !product.isVisible;
    if (filter === 'lowstock') return product.totalStock <= product.lowStockThreshold;
    return true;
  });

  const lowStockCount = products.filter((p) => p.totalStock <= p.lowStockThreshold).length;

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
      <div className="flex gap-4 mb-6 flex-wrap">
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
        <button
          onClick={() => setFilter('lowstock')}
          className={`px-4 py-2 text-body uppercase border border-black ${
            filter === 'lowstock' ? 'bg-red-600 text-white' : 'bg-white text-black'
          }`}
        >
          ⚠️ Nízký sklad ({lowStockCount})
        </button>
      </div>

      {/* Bulk Operations Panel */}
      {selectedProducts.size > 0 && (
        <div className="border-2 border-green-600 bg-green-50 p-6 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="text-body font-bold">
              Vybráno {selectedProducts.size} produktů
            </div>

            {bulkMode === 'none' ? (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setBulkMode('price')}
                  className="px-4 py-2 text-body uppercase border border-black hover:bg-black hover:text-white transition-colors"
                >
                  💰 Hromadná cena
                </button>
                <button
                  onClick={() => setBulkMode('category')}
                  className="px-4 py-2 text-body uppercase border border-black hover:bg-black hover:text-white transition-colors"
                >
                  📁 Hromadná kategorie
                </button>
                <button
                  onClick={() => setBulkMode('visibility')}
                  className="px-4 py-2 text-body uppercase border border-black hover:bg-black hover:text-white transition-colors"
                >
                  👁️ Hromadná viditelnost
                </button>
                <button
                  onClick={() => setBulkMode('stock')}
                  className="px-4 py-2 text-body uppercase border border-black hover:bg-black hover:text-white transition-colors"
                >
                  📦 Hromadný sklad
                </button>
                <button
                  onClick={() => setBulkMode('threshold')}
                  className="px-4 py-2 text-body uppercase border border-black hover:bg-black hover:text-white transition-colors"
                >
                  ⚠️ Hromadný práh
                </button>
              </div>
            ) : (
              <div className="flex gap-2 items-center flex-wrap">
                {bulkMode === 'category' ? (
                  <select
                    value={bulkValue}
                    onChange={(e) => setBulkValue(e.target.value)}
                    className="border border-black p-2 text-body"
                  >
                    <option value="">Vyberte kategorii</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                ) : bulkMode === 'visibility' ? (
                  <select
                    value={bulkValue}
                    onChange={(e) => setBulkValue(e.target.value)}
                    className="border border-black p-2 text-body"
                  >
                    <option value="">Vyberte stav</option>
                    <option value="visible">Viditelný</option>
                    <option value="hidden">Skrytý</option>
                  </select>
                ) : (
                  <input
                    type={bulkMode === 'price' ? 'number' : 'number'}
                    value={bulkValue}
                    onChange={(e) => setBulkValue(e.target.value)}
                    placeholder={
                      bulkMode === 'price'
                        ? 'Cena (Kč)'
                        : bulkMode === 'stock'
                        ? 'Počet kusů'
                        : 'Práh'
                    }
                    step={bulkMode === 'price' ? '0.01' : '1'}
                    className="border border-black p-2 text-body"
                  />
                )}
                <button
                  onClick={handleBulkOperation}
                  disabled={processingBulk}
                  className="px-4 py-2 bg-green-600 text-white text-body uppercase hover:bg-green-700 disabled:opacity-50"
                >
                  {processingBulk ? 'Zpracovávám...' : '✓ Potvrdit'}
                </button>
                <button
                  onClick={() => {
                    setBulkMode('none');
                    setBulkValue('');
                  }}
                  className="px-4 py-2 text-body uppercase border border-black hover:bg-black hover:text-white transition-colors"
                >
                  ✕ Zrušit
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="border border-black">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black">
              <th className="text-left p-4 text-body uppercase w-10">
                <input
                  type="checkbox"
                  checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                  onChange={toggleAllSelection}
                />
              </th>
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
            {filteredProducts.map((product) => {
              const isLowStock = product.totalStock <= product.lowStockThreshold;
              return (
                <tr
                  key={product.id}
                  onClick={() => router.push(`/admin/produkty/${product.id}`)}
                  className={`border-b border-black last:border-b-0 cursor-pointer transition-colors ${
                    isLowStock ? 'bg-red-50 hover:bg-red-200' : 'hover:bg-gray-300'
                  }`}
                >
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(product.id)}
                      onChange={() => toggleProductSelection(product.id)}
                    />
                  </td>
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
                  <td className={`p-4 text-body font-bold ${isLowStock ? 'text-red-600' : ''}`}>
                    {product.totalStock} ks {isLowStock && '⚠️'}
                  </td>
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
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleDuplicate(product.id)}
                        className="px-3 py-1 text-body uppercase border border-black hover:bg-blue-600 hover:text-white text-sm"
                      >
                        Kopie
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="px-3 py-1 text-body uppercase border border-black hover:bg-red-600 hover:text-white text-sm"
                      >
                        Smazat
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
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
