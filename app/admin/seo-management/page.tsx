'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Save, AlertCircle } from 'lucide-react';

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
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products?limit=1000');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

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
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (response.ok) {
        const updated = await response.json();
        setProducts(products.map(p => p.id === productId ? { ...p, ...editData } : p));
        setEditingId(null);
      }
    } catch (error) {
      console.error('Failed to save SEO:', error);
    } finally {
      setSavingId(null);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const productsMissingSEO = filteredProducts.filter(p => !p.seoTitle || !p.seoDescription);

  if (loading) return <div className="p-8">Načítání...</div>;

  return (
    <div className="bg-white min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 
          className="mb-8 uppercase"
          style={{
            fontFamily: 'BB-CondBold, "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '32px',
            letterSpacing: '0.02em',
          }}
        >
          SEO Správa
        </h1>

        <div className="mb-6 border-b border-black pb-6">
          <input
            type="text"
            placeholder="Hledat produkty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-black p-3 text-sm focus:outline-none mb-4"
          />
          
          {productsMissingSEO.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 flex gap-2 text-sm">
              <AlertCircle size={18} className="text-yellow-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong>{productsMissingSEO.length} produktů</strong> chybí SEO metadata. Doporučujeme je doplnit pro lepší SEO.
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="border border-black p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium uppercase mb-1">{product.name}</h3>
                  <p className="text-xs text-gray-600">{product.slug}</p>
                </div>
                {!editingId && editingId !== product.id && (
                  <button
                    onClick={() => startEdit(product)}
                    className="px-4 py-2 border border-black uppercase text-xs hover:bg-black hover:text-white transition-colors"
                  >
                    Editovat
                  </button>
                )}
              </div>

              {editingId === product.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase font-medium mb-2">SEO Nadpis (Title Tag)</label>
                    <input
                      type="text"
                      maxLength={60}
                      value={editData.seoTitle}
                      onChange={(e) => setEditData({ ...editData, seoTitle: e.target.value })}
                      className="w-full border border-black p-2 text-sm focus:outline-none"
                      placeholder="Doporučeno: 50-60 znaků"
                    />
                    <p className="text-xs text-gray-500 mt-1">{editData.seoTitle?.length || 0}/60</p>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-medium mb-2">SEO Popis (Meta Description)</label>
                    <textarea
                      maxLength={160}
                      value={editData.seoDescription}
                      onChange={(e) => setEditData({ ...editData, seoDescription: e.target.value })}
                      className="w-full border border-black p-2 text-sm focus:outline-none"
                      rows={3}
                      placeholder="Doporučeno: 150-160 znaků"
                    />
                    <p className="text-xs text-gray-500 mt-1">{editData.seoDescription?.length || 0}/160</p>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-medium mb-2">Klíčová slova</label>
                    <input
                      type="text"
                      value={editData.seoKeywords}
                      onChange={(e) => setEditData({ ...editData, seoKeywords: e.target.value })}
                      className="w-full border border-black p-2 text-sm focus:outline-none"
                      placeholder="Oddělte čárkami: slovo1, slovo2, slovo3"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-medium mb-2">OG Obrázek (pro sdílení)</label>
                    <input
                      type="url"
                      value={editData.ogImage}
                      onChange={(e) => setEditData({ ...editData, ogImage: e.target.value })}
                      className="w-full border border-black p-2 text-sm focus:outline-none"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => saveSEO(product.id)}
                      disabled={savingId === product.id}
                      className="flex items-center gap-2 px-4 py-2 bg-black text-white border border-black uppercase text-xs hover:bg-white hover:text-black transition-colors disabled:opacity-50"
                    >
                      <Save size={16} />
                      {savingId === product.id ? 'Ukládání...' : 'Uložit'}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 border border-black uppercase text-xs hover:bg-black hover:text-white transition-colors"
                    >
                      Zrušit
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-xs uppercase font-medium">Title: </span>
                    <p className="text-gray-700">{product.seoTitle || <span className="text-red-600 italic">Nenastaven</span>}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase font-medium">Description: </span>
                    <p className="text-gray-700">{product.seoDescription || <span className="text-red-600 italic">Nenastaven</span>}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase font-medium">Keywords: </span>
                    <p className="text-gray-700">{product.seoKeywords || <span className="text-gray-400 italic">—</span>}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
