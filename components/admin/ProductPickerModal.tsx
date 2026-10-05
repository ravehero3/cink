'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

export interface PickedProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
}

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  price: string | number;
  category: string;
  images: string[];
  isVisible?: boolean;
}

interface ProductPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (products: PickedProduct[]) => void;
  title?: string;
  description?: string;
  maxSelect?: number; // 1 for single, 4 for 2x2 grid
  initialSelectedSlugs?: string[];
}

export default function ProductPickerModal({
  isOpen,
  onClose,
  onSelect,
  title = 'Vybrat produkty z obchodu',
  description = 'Vyberte produkt pro vložení fotky a automatické propojení s odkazem na detail produktu.',
  maxSelect = 1,
  initialSelectedSlugs = [],
}: ProductPickerModalProps) {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMap, setSelectedMap] = useState<Map<string, ProductItem>>(new Map());

  // Fetch products when opened
  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    fetch('/api/admin/products')
      .then((res) => res.json())
      .then((data: ProductItem[]) => {
        if (Array.isArray(data)) {
          setProducts(data);
          // Set initial selections
          if (initialSelectedSlugs.length > 0) {
            const initialMap = new Map<string, ProductItem>();
            initialSelectedSlugs.forEach((slug) => {
              const found = data.find((p) => p.slug === slug);
              if (found) initialMap.set(found.id, found);
            });
            setSelectedMap(initialMap);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load products for picker:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, initialSelectedSlugs]);

  // Reset search when closed
  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setSelectedCategory('all');
      setSelectedMap(new Map());
    }
  }, [isOpen]);

  // Extract categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        search === '' ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase());

      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, search, selectedCategory]);

  const toggleSelect = (product: ProductItem) => {
    setSelectedMap((prev) => {
      const next = new Map(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
      } else {
        if (maxSelect === 1) {
          next.clear();
          next.set(product.id, product);
        } else {
          if (next.size >= maxSelect) {
            alert(`Můžete vybrat maximálně ${maxSelect} produkty pro tuto sekci.`);
            return prev;
          }
          next.set(product.id, product);
        }
      }
      return next;
    });
  };

  const handleConfirm = () => {
    const result: PickedProduct[] = Array.from(selectedMap.values()).map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.images?.[0] || '',
      price: Number(p.price) || 0,
    }));

    onSelect(result);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-4xl bg-white border border-black flex flex-col max-h-[90vh] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-black flex items-start justify-between gap-4 bg-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-black text-white px-2 py-0.5">
                {maxSelect === 1 ? '1 PRODUKT' : `MAX ${maxSelect} PRODUKTY`}
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider">{title}</h2>
            </div>
            <p className="text-xs text-[#666666] mt-1">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border border-black text-xs font-bold hover:bg-black hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-4 border-b border-black bg-[#fafafa] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Hledat produkt podle názvu nebo kategorie…"
              className="admin-input w-full text-xs"
              style={{ textTransform: 'none' }}
              autoFocus
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#888888] hover:text-black"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`text-[11px] uppercase tracking-wider px-2.5 py-1.5 border transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-black text-white border-black font-bold'
                  : 'bg-white text-black border-black/30 hover:border-black'
              }`}
            >
              Vše ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[11px] uppercase tracking-wider px-2.5 py-1.5 border transition-colors ${
                  selectedCategory === cat
                    ? 'bg-black text-white border-black font-bold'
                    : 'bg-white text-black border-black/30 hover:border-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product list grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-white min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-xs uppercase tracking-wider">
              <div className="admin-spinner" />
              <span>Načítám produkty z obchodu…</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-xs uppercase tracking-wider font-bold">Nenalezeny žádné produkty</p>
              <p className="text-xs text-[#666666] mt-1">Zkuste upravit vyhledávací dotaz nebo filtr kategorií.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredProducts.map((p) => {
                const isSelected = selectedMap.has(p.id);
                const firstImg = p.images?.[0];

                return (
                  <div
                    key={p.id}
                    onClick={() => toggleSelect(p)}
                    className={`group relative border transition-all cursor-pointer flex flex-col bg-white overflow-hidden ${
                      isSelected
                        ? 'border-black ring-2 ring-black shadow-md'
                        : 'border-black/20 hover:border-black'
                    }`}
                  >
                    {/* Image */}
                    <div className="relative aspect-square w-full bg-[#f4f4f4] overflow-hidden flex items-center justify-center">
                      {firstImg ? (
                        <img
                          src={firstImg}
                          alt={p.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-[10px] uppercase tracking-wider text-[#999999]">Bez fotky</span>
                      )}

                      {/* Selected check badge */}
                      <div
                        className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow ${
                          isSelected
                            ? 'bg-black text-white scale-100'
                            : 'bg-white/80 text-transparent border border-black/40 group-hover:text-black/40'
                        }`}
                      >
                        ✓
                      </div>

                      {/* Hover action hint */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-black text-white px-2.5 py-1 shadow">
                          {isSelected ? 'Odebrat' : 'Vybrat'}
                        </span>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="p-3 flex flex-col justify-between flex-1 border-t border-black/10">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#666666] truncate">{p.category}</p>
                        <h4 className="text-xs font-bold uppercase tracking-wider line-clamp-2 mt-0.5" title={p.name}>
                          {p.name}
                        </h4>
                      </div>
                      <div className="mt-2 pt-2 border-t border-black/5 flex items-center justify-between text-xs">
                        <span className="font-bold">{Number(p.price).toLocaleString('cs-CZ')} Kč</span>
                        <span className="text-[9px] uppercase tracking-wider text-[#888888]">/{p.slug}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-black bg-[#fafafa] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs">
            <span className="font-bold uppercase tracking-wider">
              Vybráno: {selectedMap.size} z {maxSelect} {maxSelect === 1 ? 'produktu' : 'produktů'}
            </span>
            <p className="text-[11px] text-[#666666] mt-0.5">
              Vybrané produkty budou v e-mailu automaticky odkazovat na jejich stránku v e-shopu.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="admin-btn admin-btn-secondary flex-1 sm:flex-none text-xs"
            >
              Zrušit
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedMap.size === 0}
              className="admin-btn flex-1 sm:flex-none text-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Použít a propojit ({selectedMap.size})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
