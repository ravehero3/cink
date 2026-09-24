'use client';

import { useEffect, useState } from 'react';

interface Product {
  id: string;
  name: string;
  slug: string;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogImage: string | null;
}

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
      <div className="flex items-center gap-3 py-12">
        <div className="admin-spinner" />
        <span className="admin-sub" style={{ margin: 0 }}>Načítám produkty…</span>
      </div>
    );
  }

  return (
    <div className="space-y-[24px]">
      <div className="border-b border-black pb-4">
        <h1 className="admin-title">SEO správa</h1>
        <p className="admin-sub">{products.length} produktů · {missingSEO.length} bez SEO metadat</p>
      </div>

      <div className="space-y-[16px]">
        <input
          type="text"
          placeholder="Hledat produkty…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-input sm:w-80"
        />
        {missingSEO.length > 0 && (
          <div className="flex items-start gap-3 p-4 border border-black text-xs uppercase tracking-wider">
            <span className="font-bold shrink-0">[ ! ]</span>
            <p>
              <strong>{missingSEO.length} produktů</strong> nemá SEO metadata. Doporučujeme je doplnit pro lepší viditelnost ve vyhledávačích.
            </p>
          </div>
        )}
      </div>

      <div className="border border-black">
        {filtered.map((product, idx) => (
          <div
            key={product.id}
            className={`p-[24px] bg-white ${idx !== filtered.length - 1 ? 'border-b border-black' : ''}`}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider">{product.name}</h3>
                <p className="admin-sub">{product.slug}</p>
              </div>
              {editingId !== product.id && (
                <button onClick={() => startEdit(product)} className="admin-btn admin-btn-secondary" style={{ padding: '6px 12px', fontSize: 10 }}>
                  Upravit SEO
                </button>
              )}
            </div>

            {editingId === product.id ? (
              <div className="space-y-[16px]">
                <div>
                  <label className="admin-label">
                    SEO nadpis — {editData.seoTitle?.length || 0}/60
                  </label>
                  <input type="text" maxLength={60} value={editData.seoTitle}
                    onChange={(e) => setEditData({ ...editData, seoTitle: e.target.value })}
                    className="admin-input" placeholder="Doporučeno: 50–60 znaků" />
                </div>
                <div>
                  <label className="admin-label">
                    SEO popis — {editData.seoDescription?.length || 0}/160
                  </label>
                  <textarea maxLength={160} value={editData.seoDescription}
                    onChange={(e) => setEditData({ ...editData, seoDescription: e.target.value })}
                    className="admin-textarea" rows={3} placeholder="Doporučeno: 150–160 znaků" />
                </div>
                <div>
                  <label className="admin-label">Klíčová slova</label>
                  <input type="text" value={editData.seoKeywords}
                    onChange={(e) => setEditData({ ...editData, seoKeywords: e.target.value })}
                    className="admin-input" placeholder="Oddělte čárkami: slovo1, slovo2, slovo3" />
                </div>
                <div>
                  <label className="admin-label">OG obrázek (pro sdílení)</label>
                  <input type="url" value={editData.ogImage}
                    onChange={(e) => setEditData({ ...editData, ogImage: e.target.value })}
                    className="admin-input" style={{ textTransform: 'none' }} placeholder="https://…" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => saveSEO(product.id)} disabled={savingId === product.id} className="admin-btn">
                    {savingId === product.id ? 'Ukládám…' : 'Uložit'}
                  </button>
                  <button onClick={() => setEditingId(null)} className="admin-btn admin-btn-secondary">
                    Zrušit
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-[16px] text-xs uppercase tracking-wider">
                <div>
                  <p className="admin-label">Title</p>
                  {product.seoTitle
                    ? <p className="normal-case tracking-normal">{product.seoTitle}</p>
                    : <p className="text-[#666666]">Nenastaveno</p>}
                </div>
                <div>
                  <p className="admin-label">Description</p>
                  {product.seoDescription
                    ? <p className="normal-case tracking-normal line-clamp-2">{product.seoDescription}</p>
                    : <p className="text-[#666666]">Nenastaveno</p>}
                </div>
                <div>
                  <p className="admin-label">Keywords</p>
                  {product.seoKeywords
                    ? <p className="normal-case tracking-normal">{product.seoKeywords}</p>
                    : <p className="text-[#666666]">—</p>}
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="admin-empty">Žádné produkty neodpovídají hledání.</div>
        )}
      </div>
    </div>
  );
}
