'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ProductsGrid from './ProductsGrid';
import { useSavedProductsStore } from '@/lib/saved-products-store';
import { X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  color?: string;
  colorCount?: number;
  sizes?: Record<string, number>;
}

interface NovinkysProduct {
  productId: string;
  product: Product;
  order: number;
}

interface NovinkySectionProps {
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onAdd?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  isLastSection?: boolean;
}

export default function NovinkysSection({
  isAdmin,
  onEdit,
  onDelete,
  onAdd,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  isLastSection,
}: NovinkySectionProps) {
  const { data: session } = useSession();
  const isLoggedInAdmin = isAdmin && !!session;
  const [novinkysProducts, setNovinkysProducts] = useState<NovinkysProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedProducts, setSavedProducts] = useState<string[]>([]);
  const [draggedItem, setDraggedItem] = useState<NovinkysProduct | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);

  // Fetch NOVINKY products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/novinky?_t=' + Date.now());
        if (res.ok) {
          const data = await res.json();
          setNovinkysProducts(data.products || []);
        }
      } catch (error) {
        console.error('Error fetching novinky:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const loadSavedProducts = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/saved-products');
          if (response.ok) {
            const data = await response.json();
            const savedIds = data.map((product: any) => product.id);
            setSavedProducts(savedIds);
          }
        } catch (error) {
          console.error('Error loading saved products:', error);
        }
      } else if (session === null) {
        const zustandSavedIds = useSavedProductsStore.getState().savedIds;
        setSavedProducts(zustandSavedIds);
      }
    };

    loadSavedProducts();
  }, [session]);

  const handleToggleSave = async (productId: string) => {
    const isSaved = savedProducts.includes(productId);

    setSavedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );

    if (isSaved) {
      useSavedProductsStore.getState().removeProduct(productId);
    } else {
      useSavedProductsStore.getState().addProduct(productId);
    }

    if (session?.user) {
      try {
        const url = isSaved ? `/api/saved-products?productId=${productId}` : '/api/saved-products';
        const method = isSaved ? 'DELETE' : 'POST';
        const body = isSaved ? undefined : JSON.stringify({ productId });

        await fetch(url, {
          method,
          headers: body ? { 'Content-Type': 'application/json' } : {},
          body,
        });
      } catch (error) {
        console.error('Error updating saved products:', error);
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, product: NovinkysProduct) => {
    if (!isLoggedInAdmin) return;
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem(product);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!isLoggedInAdmin) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverIndex(index);
  };

  const handleDrop = async (e: React.DragEvent, targetProduct: NovinkysProduct, targetIndex: number) => {
    if (!isLoggedInAdmin || !draggedItem) return;
    e.preventDefault();

    if (draggedItem.productId === targetProduct.productId) {
      setDraggedItem(null);
      setDraggedOverIndex(null);
      return;
    }

    const draggedIndex = novinkysProducts.findIndex((p) => p.productId === draggedItem.productId);
    const newProducts = [...novinkysProducts];
    [newProducts[draggedIndex], newProducts[targetIndex]] = [newProducts[targetIndex], newProducts[draggedIndex]];

    newProducts.forEach((p, idx) => {
      p.order = idx;
    });

    setNovinkysProducts(newProducts);
    setDraggedItem(null);
    setDraggedOverIndex(null);

    // Save to API
    try {
      await fetch('/api/novinky/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: newProducts.map((p) => p.productId),
        }),
      });
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    try {
      await fetch(`/api/novinky/${productId}`, { method: 'DELETE' });
      setNovinkysProducts((prev) => prev.filter((p) => p.productId !== productId));
    } catch (error) {
      console.error('Error removing product:', error);
    }
  };

  const handleAddProduct = async () => {
    // Fetch all products to show which ones are available
    const allProducts = await fetch('/api/products?limit=1000').then((r) => r.json());
    const currentIds = new Set(novinkysProducts.map((p) => p.productId));
    const available = allProducts.products.filter((p: Product) => !currentIds.has(p.id));

    if (available.length === 0) {
      alert('All products are already in NOVINKY section');
      return;
    }

    // For now, add the first available product
    const product = available[0];
    try {
      const res = await fetch('/api/novinky', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          order: novinkysProducts.length,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNovinkysProducts([...novinkysProducts, data.novinkysProduct]);
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  if (loading) {
    return <div className="w-full h-80 bg-white flex items-center justify-center border-b border-black">Loading NOVINKY...</div>;
  }

  // Extract only product data for ProductsGrid
  const products: Product[] = novinkysProducts.map((np) => np.product);

  return (
    <section className="w-full relative bg-white border-b border-black">
      {/* Admin dimensions watermark */}
      {isLoggedInAdmin && (
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: '#fff',
            padding: '4px 8px',
            fontSize: '10px',
            fontFamily: 'monospace',
            zIndex: 20,
            pointerEvents: 'none',
            borderRadius: '2px',
          }}
        >
          NOVINKY Grid
        </div>
      )}

      {/* Title */}
      <div className="px-4 md:px-8 py-6 md:py-8 border-b border-black bg-white">
        <div className="flex items-center justify-between">
          <h2
            className="text-xl md:text-2xl uppercase font-bold"
            style={{
              fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
              letterSpacing: '0.03em',
              fontStretch: 'condensed',
            }}
          >
            NOVINKY
          </h2>
          <p className="text-xs md:text-sm uppercase tracking-wide text-gray-600">
            {products.length} produktů
          </p>
        </div>
      </div>

      {/* Product Grid - Same as zobrazit-vse page with admin drag support */}
      {isLoggedInAdmin ? (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 bg-black border border-black" style={{ gap: '0px' }}>
          {novinkysProducts.map((item, index) => (
            <div
              key={item.productId}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, item, index)}
              className={`relative transition-all duration-200 ${
                draggedItem?.productId === item.productId ? 'opacity-50' : ''
              } ${draggedOverIndex === index ? 'ring-2 ring-inset ring-blue-500' : ''}`}
              style={{
                marginRight: '-1px',
                marginBottom: '-1px',
                marginTop: '-1px',
              }}
            >
              <div className="relative group bg-white border border-black cursor-move" style={{ marginRight: '-1px', marginBottom: '-1px', marginTop: '-1px' }}>
                {/* ProductCard content inline */}
                <ProductsGrid
                  products={[item.product]}
                  savedProducts={savedProducts}
                  onToggleSave={handleToggleSave}
                />

                {/* Remove button for admin */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveProduct(item.productId);
                  }}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center rounded z-20 transition-all opacity-0 group-hover:opacity-100"
                  title="Remove from NOVINKY"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ProductsGrid
          products={products}
          savedProducts={savedProducts}
          onToggleSave={handleToggleSave}
        />
      )}

      {/* Add Product Button for Admin */}
      {isLoggedInAdmin && (
        <div className="px-4 md:px-8 py-6 md:py-8 flex justify-center border-t border-black bg-white">
          <button
            onClick={handleAddProduct}
            className="px-6 py-3 bg-black text-white uppercase text-sm font-bold hover:bg-gray-800 transition-colors"
            style={{ letterSpacing: '0.08em' }}
          >
            + Přidat produkt do NOVINKY
          </button>
        </div>
      )}

      {/* Admin section controls */}
      {isLoggedInAdmin && (
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          {onMoveUp && canMoveUp && (
            <button
              onClick={onMoveUp}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-black text-black text-xs uppercase tracking-wide hover:bg-black hover:text-white transition-all duration-200"
              title="Move section up"
            >
              ↑
            </button>
          )}
          {onMoveDown && canMoveDown && (
            <button
              onClick={onMoveDown}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-black text-black text-xs uppercase tracking-wide hover:bg-black hover:text-white transition-all duration-200"
              title="Move section down"
            >
              ↓
            </button>
          )}
          {isLastSection && onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs uppercase tracking-wide hover:bg-gray-800 transition-all duration-200"
            >
              + Přidat sekci
            </button>
          )}
        </div>
      )}
    </section>
  );
}
