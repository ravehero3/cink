'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/store/toastStore';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { TableSkeleton, PageHeaderSkeleton, FilterBarSkeleton } from '@/components/admin/Skeleton';

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
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ id: string; name: string } | null>(null);

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

  const handleDelete = (id: string, name: string) => {
    setDeleteModal({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    try {
      const response = await fetch(`/api/admin/products/${deleteModal.id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Produkt byl úspěšně smazán');
        fetchProducts();
      } else {
        toast.error('Nepodařilo se smazat produkt');
      }
    } catch {
      toast.error('Došlo k chybě při mazání produktu');
    } finally {
      setDeleteModal(null);
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
        toast.success(`Produkt byl duplikován: ${data.product.name}`);
        fetchProducts();
      } else {
        toast.error('Nepodařilo se duplikovat produkt');
      }
    } catch (error) {
      console.error('Failed to duplicate product:', error);
      toast.error('Došlo k chybě při duplikování produktu');
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
        setProducts(products.map((p) => (p.id === id ? { ...p, isVisible: !currentVisibility } : p)));
        toast.success('Viditelnost produktu změněna');
      } else {
        toast.error('Nepodařilo se změnit viditelnost');
      }
    } catch {
      toast.error('Došlo k chybě při změně viditelnosti');
    }
  };

  const toggleProductSelection = (id: string) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllSelection = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const handleBulkOperation = async () => {
    if (selectedProducts.size === 0 || !bulkValue) return;
    setProcessingBulk(true);

    try {
      const productIds = Array.from(selectedProducts);
      let updateData: any = {};

      if (bulkMode === 'price') {
        const p = parseFloat(bulkValue);
        if (isNaN(p) || p < 0) {
          toast.error('Neplatná cena');
          setProcessingBulk(false);
          return;
        }
        updateData.price = p;
      } else if (bulkMode === 'category') {
        if (!bulkValue) {
          toast.error('Vyberte kategorii');
          setProcessingBulk(false);
          return;
        }
        updateData.category = bulkValue;
      } else if (bulkMode === 'visibility') {
        updateData.isVisible = bulkValue === 'visible';
      } else if (bulkMode === 'stock') {
        const s = parseInt(bulkValue);
        if (isNaN(s) || s < 0) {
          toast.error('Neplatný počet kusů');
          setProcessingBulk(false);
          return;
        }
        updateData.totalStock = s;
      } else if (bulkMode === 'threshold') {
        const t = parseInt(bulkValue);
        if (isNaN(t) || t < 0) {
          toast.error('Neplatný práh');
          setProcessingBulk(false);
          return;
        }
        updateData.lowStockThreshold = t;
      }

      const res = await fetch('/api/admin/products/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds, updateData }),
      });

      if (res.ok) {
        toast.success(`Hromadná úprava provedena pro ${productIds.length} produktů`);
        fetchProducts();
        setSelectedProducts(new Set());
        setBulkMode('none');
        setBulkValue('');
      } else {
        toast.error('Nepodařilo se provést hromadnou úpravu');
      }
    } catch {
      toast.error('Došlo k chybě při hromadné úpravě');
    } finally {
      setProcessingBulk(false);
    }
  };

  const lowStockCount = products.filter((p) => p.totalStock <= p.lowStockThreshold).length;

  const filteredProducts = products.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }
    if (filter === 'visible') return p.isVisible;
    if (filter === 'hidden') return !p.isVisible;
    if (filter === 'lowstock') return p.totalStock <= p.lowStockThreshold;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-6" style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
        <PageHeaderSkeleton />
        <FilterBarSkeleton tabs={4} />
        <div className="bg-white border border-black overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-black">
              <tr>
                {['Produkt','Kategorie','Cena','Sklad','Status','Akce'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody><TableSkeleton rows={9} cols={6} /></tbody>
          </table>
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
    <div className="space-y-6" style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif' }}>

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-black pb-4">
        <div>
          <h1 className="admin-title">
            Produkty
          </h1>
          <p className="admin-sub">
            {products.length} produktů celkem v katalogu
          </p>
        </div>
        <Link
          href="/admin/produkty/novy"
          className="inline-flex items-center gap-2 bg-black text-white text-xs uppercase tracking-wider font-medium px-4 py-2.5 border border-black hover:bg-white hover:text-black transition-colors"
        >
          + Přidat produkt
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hledat produkt…"
            className="w-full text-xs uppercase px-3 py-2 border border-black bg-white focus:outline-none tracking-wider placeholder:text-black/30"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:opacity-60 transition-opacity"
              aria-label="Vymazat"
            >
              ×
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => {
            const isActive = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider font-medium border border-black transition-colors ${
                  isActive
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-black hover:text-white'
                }`}
              >
                <span>{f.label}</span>
                <span className={`text-[10px] font-bold ${isActive ? 'text-white/80' : 'text-[#666666]'}`}>
                  ({f.count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bulk operations panel */}
      {selectedProducts.size > 0 && (
        <div className="border border-black bg-black text-white p-4 flex items-center justify-between gap-4 flex-wrap text-xs uppercase tracking-wider">
          <p className="font-bold">
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
                  className="px-3 py-1 border border-white bg-black text-white hover:bg-white hover:text-black transition-colors text-[10px] font-bold uppercase tracking-wider"
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => setSelectedProducts(new Set())}
                className="px-3 py-1 text-white/60 hover:text-white text-[10px] uppercase font-bold"
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
                  className="text-xs uppercase bg-white text-black border border-black px-2 py-1 focus:outline-none"
                >
                  <option value="">Vyberte kategorii</option>
                  {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              ) : bulkMode === 'visibility' ? (
                <select
                  value={bulkValue}
                  onChange={(e) => setBulkValue(e.target.value)}
                  className="text-xs uppercase bg-white text-black border border-black px-2 py-1 focus:outline-none"
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
                  className="text-xs uppercase bg-white text-black border border-black px-2 py-1 w-28 focus:outline-none"
                />
              )}
              <button
                onClick={handleBulkOperation}
                disabled={processingBulk}
                className="px-3 py-1 text-xs uppercase font-medium bg-white text-black border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-50"
              >
                {processingBulk ? 'Zpracovávám…' : 'Potvrdit'}
              </button>
              <button
                onClick={() => { setBulkMode('none'); setBulkValue(''); }}
                className="px-3 py-1 text-xs uppercase text-white/60 hover:text-white"
              >
                Zrušit
              </button>
            </div>
          )}
        </div>
      )}

      {/* Products table */}
      <div className="bg-white border border-black overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-white border-b border-black">
              <tr>
                <th className="px-4 py-3 w-10 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                    onChange={toggleAllSelection}
                    className="accent-black cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-black w-16">Foto</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-black">Název</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-black">Kategorie</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-black">Cena</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-black">Sklad</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-black">Stav</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-black">Akce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {filteredProducts.map((product) => {
                const isLowStock = product.totalStock <= product.lowStockThreshold;
                return (
                  <tr
                    key={product.id}
                    onClick={() => router.push(`/admin/produkty/${product.id}`)}
                    className={`cursor-pointer transition-colors ${
                      isLowStock ? 'bg-black/5 hover:bg-black/10 border-l-4 border-l-black' : 'hover:bg-black/5'
                    }`}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="accent-black cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-10 h-10 object-cover border border-black"
                        />
                      ) : (
                        <div className="w-10 h-10 border border-black bg-white flex items-center justify-center text-[10px] uppercase text-[#666666]">
                          —
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold uppercase text-black">{product.name}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] uppercase tracking-wider text-[#666666] font-medium">{product.category}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-black whitespace-nowrap">{product.price} Kč</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs uppercase font-medium ${isLowStock ? 'font-bold text-black' : 'text-black'}`}>
                        {product.totalStock} ks
                        {isLowStock && (
                          <span className="ml-1.5 text-[10px] font-bold text-black">[!]</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleVisibility(product.id, product.isVisible)}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-black transition-colors ${
                          product.isVisible
                            ? 'bg-black text-white hover:bg-white hover:text-black'
                            : 'bg-white text-black hover:bg-black hover:text-white'
                        }`}
                      >
                        {product.isVisible ? 'Viditelný' : 'Skrytý'}
                      </button>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDuplicate(product.id)}
                          className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 border border-black bg-white text-black hover:bg-black hover:text-white transition-colors"
                        >
                          Kopie
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 border border-black bg-white text-black hover:bg-black hover:text-white transition-colors"
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
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-xs uppercase tracking-wider text-[#666666]">
              {search ? `Žádné výsledky pro „${search}"` : 'Žádné produkty v tomto filtru'}
            </p>
            {!search && filter === 'all' && (
              <Link
                href="/admin/produkty/novy"
                className="mt-4 px-4 py-2 text-xs uppercase tracking-wider font-medium border border-black bg-black text-white hover:bg-white hover:text-black transition-colors"
              >
                + Přidat produkt
              </Link>
            )}
          </div>
        )}

        {filteredProducts.length > 0 && (
          <div className="px-4 py-3 border-t border-black text-xs uppercase tracking-wider text-[#666666]">
            Zobrazeno {filteredProducts.length} z {products.length} produktů
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteModal}
        title="Smazat produkt"
        message={`Opravdu chcete smazat produkt „${deleteModal?.name}"? Tuto akci nelze vrátit zpět.`}
        confirmLabel="Smazat"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal(null)}
      />
    </div>
  );
}
