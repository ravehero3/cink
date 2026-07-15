'use client';

import { useEffect, useState } from 'react';
import { Save, AlertCircle, Search } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogImage: string | null;
}

const inputCls = "w-full text-sm bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-300";
const textareaCls = "w-full text-sm bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-300 resize-none";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

export default function SEOManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/products?limit=1000');
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditData({
      seoTitle: product.seoTitle || '',
      seoDescription: product.seoDescription || '',
      seoKeywords: product.seoKeywords || '',
      ogImage: product.ogImage || '',
    });
  };

  const saveSEO = async (productId: string) => {
    setSavingId(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, ...editData } : p));
        setEditingId(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingId(null);
    }
  };

  const filtered = searchTerm.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  const missingSEO = filtered.filter((p) => !p.seoTitle || !p.seoDescription);

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

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">SEO správa</h1>
        <p className="mt-0.5 text-sm text-gray-400">{products.length} produktů · {missingSEO.length} bez SEO metadat</p>
      </div>

      {/* Filters + alert */}
      <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 space-y-3">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Hledat produkty…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white placeholder:text-gray-300"
          />
        </div>
        {missingSEO.length > 0 && (
          <div className="flex items-start gap-3 p-3 border border-orange-200 bg-orange-50 rounded-xl text-sm text-orange-700">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <p>
              <strong>{missingSEO.length} produktů</strong> nemá SEO metadata. Doporučujeme je doplnit pro lepší viditelnost ve vyhledávačích.
            </p>
          </div>
        )}
      </div>

      {/* Product list */}
      <div className="space-y-3">
        {filtered.map((product) => (
          <div key={product.id} className="bg-white rounded-2xl border border-gray-100 p-6">
            {/* Product header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{product.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">{product.slug}</p>
              </div>
              {editingId !== product.id && (
                <button
                  onClick={() => startEdit(product)}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-400 transition-colors shrink-0"
                >
                  Upravit SEO
                </button>
              )}
            </div>

            {editingId === product.id ? (
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>
                    SEO nadpis (Title Tag) — <span className={editData.seoTitle?.length > 55 ? 'text-orange-500' : 'text-gray-400'}>{editData.seoTitle?.length || 0}/60</span>
                  </label>
                  <input type="text" maxLength={60} value={editData.seoTitle}
                    onChange={(e) => setEditData({ ...editData, seoTitle: e.target.value })}
                    className={inputCls} placeholder="Doporučeno: 50–60 znaků" />
                </div>
                <div>
                  <label className={labelCls}>
                    SEO popis (Meta Description) — <span className={editData.seoDescription?.length > 150 ? 'text-orange-500' : 'text-gray-400'}>{editData.seoDescription?.length || 0}/160</span>
                  </label>
                  <textarea maxLength={160} value={editData.seoDescription}
                    onChange={(e) => setEditData({ ...editData, seoDescription: e.target.value })}
                    className={textareaCls} rows={3} placeholder="Doporučeno: 150–160 znaků" />
                </div>
                <div>
                  <label className={labelCls}>Klíčová slova</label>
                  <input type="text" value={editData.seoKeywords}
                    onChange={(e) => setEditData({ ...editData, seoKeywords: e.target.value })}
                    className={inputCls} placeholder="Oddělte čárkami: slovo1, slovo2, slovo3" />
                </div>
                <div>
                  <label className={labelCls}>OG obrázek (pro sdílení)</label>
                  <input type="url" value={editData.ogImage}
                    onChange={(e) => setEditData({ ...editData, ogImage: e.target.value })}
                    className={inputCls} placeholder="https://…" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button onClick={() => saveSEO(product.id)} disabled={savingId === product.id}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 disabled:opacity-50 transition-colors">
                    <Save size={14} />
                    {savingId === product.id ? 'Ukládám…' : 'Uložit'}
                  </button>
                  <button onClick={() => setEditingId(null)}
                    className="px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:border-gray-400 hover:text-gray-900 transition-colors">
                    Zrušit
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Title</p>
                  {product.seoTitle
                    ? <p className="text-gray-800 text-xs">{product.seoTitle}</p>
                    : <p className="text-xs text-red-500 italic">Nenastaveno</p>}
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Description</p>
                  {product.seoDescription
                    ? <p className="text-gray-800 text-xs line-clamp-2">{product.seoDescription}</p>
                    : <p className="text-xs text-red-500 italic">Nenastaveno</p>}
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Keywords</p>
                  {product.seoKeywords
                    ? <p className="text-gray-800 text-xs">{product.seoKeywords}</p>
                    : <p className="text-xs text-gray-400 italic">—</p>}
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
            Žádné produkty neodpovídají hledání.
          </div>
        )}
      </div>
    </div>
  );
}
