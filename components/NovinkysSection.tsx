'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { GripVertical, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  color?: string;
  colorCount?: number;
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
  const [products, setProducts] = useState<NovinkysProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState<NovinkysProduct | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Fetch NOVINKY products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/novinky?_t=' + Date.now());
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error('Error fetching novinky:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDragStart = (e: React.DragEvent, product: NovinkysProduct, index: number) => {
    if (!isLoggedInAdmin) return;
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem(product);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetProduct: NovinkysProduct, targetIndex: number) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.productId === targetProduct.productId) return;

    const draggedIndex = products.findIndex((p) => p.productId === draggedItem.productId);
    const newProducts = [...products];
    [newProducts[draggedIndex], newProducts[targetIndex]] = [newProducts[targetIndex], newProducts[draggedIndex]];

    // Update order
    newProducts.forEach((p, idx) => {
      p.order = idx;
    });

    setProducts(newProducts);
    setDraggedItem(null);

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
      setProducts((prev) => prev.filter((p) => p.productId !== productId));
    } catch (error) {
      console.error('Error removing product:', error);
    }
  };

  const handleAddProduct = async () => {
    // Open a modal or dropdown to select products
    const allProducts = await fetch('/api/products?limit=1000').then((r) => r.json());
    const currentIds = new Set(products.map((p) => p.productId));
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
          order: products.length,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProducts([...products, data.novinkysProduct]);
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  if (loading) {
    return <div className="w-full h-80 bg-gray-100 flex items-center justify-center">Loading NOVINKY...</div>;
  }

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

      <div className="px-4 py-8 md:px-8 md:py-12">
        <h2
          className="text-2xl md:text-3xl uppercase mb-8 font-bold"
          style={{
            fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
            letterSpacing: '0.03em',
            fontStretch: 'condensed',
          }}
        >
          NOVINKY
        </h2>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-px bg-black border border-black">
          {products.map((item, index) => (
            <div
              key={item.productId}
              draggable={isLoggedInAdmin}
              onDragStart={(e) => handleDragStart(e, item, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, item, index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`relative bg-white border-b border-black cursor-move transition-all duration-200 group ${
                isLoggedInAdmin && hoveredIndex === index ? 'opacity-90 scale-95' : ''
              }`}
              style={{
                marginRight: '-1px',
                marginBottom: '-1px',
                marginTop: '-1px',
                opacity: draggedItem?.productId === item.productId ? 0.5 : 1,
              }}
            >
              <Link href={`/produkty/${item.product.slug}`} className="block w-full h-full">
                <div className="relative overflow-hidden aspect-product flex items-center justify-center bg-white" style={{ padding: 'clamp(8px, 10%, 40px)' }}>
                  {item.product.images?.[0] && (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="object-contain w-full h-full"
                      style={{ transform: 'scale(1)' }}
                    />
                  )}

                  {/* Admin drag indicator */}
                  {isLoggedInAdmin && hoveredIndex === index && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 transition-opacity duration-200">
                      <GripVertical size={32} className="text-white" strokeWidth={1.5} />
                    </div>
                  )}

                  {/* Remove button for admin */}
                  {isLoggedInAdmin && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveProduct(item.productId);
                      }}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center rounded z-20 transition-all"
                      title="Remove from NOVINKY"
                    >
                      <X size={14} strokeWidth={2} />
                    </button>
                  )}
                </div>

                {/* Product Info */}
                <div className="text-center p-2 md:p-3">
                  <h3
                    className="uppercase text-xs md:text-sm font-bold line-clamp-2"
                    style={{
                      fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '13px',
                      letterSpacing: '0.03em',
                      fontStretch: 'condensed',
                    }}
                  >
                    {item.product.name}
                  </h3>
                  <p className="text-xs md:text-sm mt-1">{item.product.price} Kč</p>
                  {item.product.colorCount && (
                    <p className="text-xs text-gray-600 mt-1">{item.product.colorCount} barev</p>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Add Product Button for Admin */}
        {isLoggedInAdmin && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleAddProduct}
              className="px-6 py-3 bg-black text-white uppercase text-sm font-bold hover:bg-gray-800 transition-colors border border-black"
              style={{ letterSpacing: '0.08em' }}
            >
              + Add Product to NOVINKY
            </button>
          </div>
        )}
      </div>

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
              + Add section
            </button>
          )}
        </div>
      )}
    </section>
  );
}
