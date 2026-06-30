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
    return (
      <div className="flex items-center justify-center h-60">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Načítám produkty…</span>
        </div>
      </div>
    );
  }

  const FILTERS = [
    { key: 'all', label: 'Všechny', count: products.length },
    { key: 'visible', label: 'Viditelné', count: products.filter((p) => p.isVisible).length },
    { key: 'hidden', label: 'Skryté', count: products.filter((p) => !p.isVisible).length },
    { key: 'lowstock', label: 'Nízký sklad', count: lowStockCount },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Produkty</h1>
          <p className="mt-1 text-sm text-gray-400">{products.length} produktů celkem</p>
        </div>
        <Link
          href="/admin/produkty/novy"
          className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-700 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Přidat produkt
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === f.key
                ? f.key === 'lowstock'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
            }`}
          >
            {f.label}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              filter === f.key
                ? f.key === 'lowstock' ? 'bg-red-100 text-red-600' : 'bg-white/20 text-white'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bulk operations panel */}
      {selectedProducts.size > 0 && (
        <div className="bg-gray-900 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm font-semibold text-white">
            Vybráno {selectedProducts.size} {selectedProducts.size === 1 ? 'produkt' : 'produktů'}
          </p>
          {bulkMode === 'none' ? (
            <div className="flex gap-2 flex-wrap">
              {[
                { mode: 'price' as const, label: 'Cena' },
                { mode: 'category' as const, label: 'Kategorie' },
                { mode: 'visibility' as const, label: 'Viditelnost' },
                { mode: 'stock' as const, label: 'Sklad' },
                { mode: 'threshold' as const, label: 'Práh' },
              ].map(({ mode, label }) => (
                <button
                  key={mode}
                  onClick={() => setBulkMode(mode)}
                  className="px-3 py-1.5 text-xs font-semibold text-white/80 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => setSelectedProducts(new Set())}
                className="px-3 py-1.5 text-xs font-semibold text-white/50 hover:text-white/80 transition-colors"
              >
                Zrušit výběr
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {bulkMode === 'category' ? (
                <select
                  value={bulkValue}
                  onChange={(e) => setBulkValue(e.target.value)}
                  className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  <option value="">Vyberte kategorii</option>
                  {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              ) : bulkMode === 'visibility' ? (
                <select
                  value={bulkValue}
                  onChange={(e) => setBulkValue(e.target.value)}
                  className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  <option value="">Vyberte stav</option>
                  <option value="visible">Viditelný</option>
                  <option value="hidden">Skrytý</option>
                </select>
              ) : (
                <input
                  type="number"
                  value={bulkValue}
                  onChange={(e) => setBulkValue(e.target.value)}
                  placeholder={bulkMode === 'price' ? 'Cena (Kč)' : bulkMode === 'stock' ? 'Počet ks' : 'Práh'}
                  step={bulkMode === 'price' ? '0.01' : '1'}
                  className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 w-32 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              )}
              <button
                onClick={handleBulkOperation}
                disabled={processingBulk}
                className="px-3 py-1.5 text-xs font-semibold bg-white text-gray-900 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
              >
                {processingBulk ? 'Zpracovávám…' : 'Potvrdit'}
              </button>
              <button
                onClick={() => { setBulkMode('none'); setBulkValue(''); }}
                className="px-3 py-1.5 text-xs font-semibold text-white/50 hover:text-white/80 transition-colors"
              >
                Zrušit
              </button>
            </div>
          )}
        </div>
      )}

      {/* Products table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                    onChange={toggleAllSelection}
                    className="rounded border-gray-300 accent-gray-900"
                  />
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-widest w-16">Foto</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Název</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Kategorie</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Cena</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Sklad</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Stav</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Akce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((product) => {
                const isLowStock = product.totalStock <= product.lowStockThreshold;
                return (
                  <tr
                    key={product.id}
                    onClick={() => router.push(`/admin/produkty/${product.id}`)}
                    className={`cursor-pointer transition-colors ${isLowStock ? 'bg-red-50/40 hover:bg-red-50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="rounded border-gray-300 accent-gray-900"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{product.name}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md font-medium">{product.category}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{product.price} Kč</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${isLowStock ? 'text-red-600' : 'text-gray-700'}`}>
                        {product.totalStock} ks
                        {isLowStock && (
                          <span className="ml-1.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-red-100 text-red-600 text-[8px] font-bold">!</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleVisibility(product.id, product.isVisible)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                          product.isVisible
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {product.isVisible ? 'Viditelný' : 'Skrytý'}
                      </button>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDuplicate(product.id)}
                          className="text-xs font-medium text-gray-500 hover:text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          Kopie
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="text-xs font-medium text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
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
          <div className="text-center py-16 text-sm text-gray-400">Žádné produkty nebyly nalezeny.</div>
        )}
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
          Zobrazeno {filteredProducts.length} z {products.length} produktů
        </div>
      </div>
    </div>
  );
}
