'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import { useSavedProductsStore } from '@/lib/saved-products-store';
import { useRecentlyViewedStore } from '@/lib/recently-viewed-store';
import { ChevronDown } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  color: string;
  images: string[];
  sizes: Record<string, number>;
  totalStock: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const { addItem } = useCartStore();
  const { isSaved, addProduct, removeProduct } = useSavedProductsStore();
  const { addProduct: addRecentlyViewed } = useRecentlyViewedStore();

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        addRecentlyViewed({
          id: data.id,
          name: data.name,
          slug: data.slug,
          price: Number(data.price),
          image: data.images[0],
        });
      } else {
        setProduct(null);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize || !product) {
      alert('Vyberte prosím velikost');
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      size: selectedSize,
      quantity,
      price: Number(product.price),
      image: product.images[0],
      color: product.color,
    });

    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
    }, 3000);
  };

  const toggleSaved = () => {
    if (!product) return;
    if (isSaved(product.id)) {
      removeProduct(product.id);
    } else {
      addProduct(product.id);
    }
  };

  const incrementQuantity = () => {
    if (selectedSize && product?.sizes[selectedSize]) {
      const maxStock = product.sizes[selectedSize];
      if (quantity < maxStock) {
        setQuantity(quantity + 1);
      }
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-sm">Načítání...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-sm">Produkt nenalezen</p>
      </div>
    );
  }

  const sizes = Object.entries(product.sizes || {});

  return (
    <div className="bg-white">
      {showConfirmation && (
        <div className="fixed top-24 right-8 bg-black text-white px-6 py-4 z-50">
          <p style={{ 
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '12px',
            fontWeight: 400
          }}>
            Produkt přidán do košíku
          </p>
        </div>
      )}

      <div className="flex">
        <div className="w-1/2 border-r border-black">
          <div className="space-y-2">
            {product.images.map((image, index) => (
              <div key={index} className="w-full">
                <img
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full object-cover"
                  style={{ filter: 'grayscale(1) contrast(1.2)' }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="w-1/2 pl-8 pr-12 py-8 sticky top-[44px] self-start h-screen overflow-y-auto">
          <div className="mb-6">
            <h1 
              className="uppercase mb-3"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                lineHeight: '1.4'
              }}
            >
              {product.name}
            </h1>
            
            <p 
              className="mb-6"
              style={{
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 400
              }}
            >
              {product.price} Kč
            </p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <p 
                className="uppercase"
                style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.05em'
                }}
              >
                Size:
              </p>
              <button 
                className="underline"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '12px',
                  fontWeight: 400
                }}
              >
                Size guide
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mb-4">
              {sizes.map(([size, stock]) => {
                const isAvailable = stock > 0;
                const isSelected = selectedSize === size;

                return (
                  <button
                    key={size}
                    onClick={() => {
                      if (isAvailable) {
                        setSelectedSize(size);
                        setQuantity(1);
                      }
                    }}
                    disabled={!isAvailable}
                    className={`py-3 border transition-colors ${
                      isSelected
                        ? 'bg-black text-white border-black'
                        : isAvailable
                        ? 'border-black hover:bg-black hover:text-white'
                        : 'border-gray-300 text-gray-400 cursor-not-allowed'
                    }`}
                    style={{
                      fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '13px',
                      fontWeight: 400
                    }}
                  >
                    {size}
                    {!isAvailable && (
                      <div 
                        className="text-xs mt-1"
                        style={{
                          fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                          fontSize: '10px'
                        }}
                      >
                        Notify me
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedSize && (
              <p 
                className="mb-4"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '12px',
                  fontWeight: 400,
                  color: '#666'
                }}
              >
                Odhadované doručení: {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('cs-CZ')}
              </p>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full py-4 bg-black text-white hover:bg-gray-800 transition-colors mb-4"
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}
          >
            Add to cart
          </button>

          <div className="border-t border-black pt-6 space-y-4">
            <div className="border-b border-black">
              <button
                onClick={() => toggleSection('details')}
                className="w-full py-4 flex items-center justify-between"
              >
                <span 
                  className="uppercase"
                  style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.05em'
                  }}
                >
                  Product details
                </span>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform ${expandedSection === 'details' ? 'rotate-180' : ''}`}
                />
              </button>
              {expandedSection === 'details' && (
                <div 
                  className="pb-4"
                  style={{
                    fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    lineHeight: '1.6'
                  }}
                >
                  <p className="mb-2">{product.description}</p>
                  <p className="mb-1">Barva: {product.color}</p>
                  <p className="mb-1">Kategorie: {product.category}</p>
                  <p className="mb-1">Made in Czech Republic</p>
                  <p className="mt-4 text-xs text-gray-600">Product ID: {product.id}</p>
                </div>
              )}
            </div>

            <div className="border-b border-black">
              <button
                onClick={() => toggleSection('size-fit')}
                className="w-full py-4 flex items-center justify-between"
              >
                <span 
                  className="uppercase"
                  style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.05em'
                  }}
                >
                  Size & fit
                </span>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform ${expandedSection === 'size-fit' ? 'rotate-180' : ''}`}
                />
              </button>
              {expandedSection === 'size-fit' && (
                <div 
                  className="pb-4"
                  style={{
                    fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    lineHeight: '1.6'
                  }}
                >
                  <p className="mb-2">Oversize fit</p>
                  <p>Konzultujte naši tabulku velikostí pro více informací.</p>
                </div>
              )}
            </div>

            <div className="border-b border-black">
              <button
                onClick={() => toggleSection('shipping')}
                className="w-full py-4 flex items-center justify-between"
              >
                <span 
                  className="uppercase"
                  style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.05em'
                  }}
                >
                  Doprava zdarma, vrácení zdarma
                </span>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform ${expandedSection === 'shipping' ? 'rotate-180' : ''}`}
                />
              </button>
              {expandedSection === 'shipping' && (
                <div 
                  className="pb-4"
                  style={{
                    fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    lineHeight: '1.6'
                  }}
                >
                  <p className="mb-2">Nabízíme bezplatné expresní doručení při objednávce nad 2000 Kč.</p>
                  <p className="mb-2">Bezplatné vrácení a výměna do 30 dnů od data doručení.</p>
                  <p>Pro více informací navštivte naše <a href="/faq" className="underline">FAQ</a>.</p>
                </div>
              )}
            </div>

            <div className="border-b border-black">
              <button
                onClick={() => toggleSection('care')}
                className="w-full py-4 flex items-center justify-between"
              >
                <span 
                  className="uppercase"
                  style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.05em'
                  }}
                >
                  Péče o produkt
                </span>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform ${expandedSection === 'care' ? 'rotate-180' : ''}`}
                />
              </button>
              {expandedSection === 'care' && (
                <div 
                  className="pb-4"
                  style={{
                    fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    lineHeight: '1.6'
                  }}
                >
                  <p className="mb-1">Prát max. při 30°C - šetrný proces</p>
                  <p className="mb-1">Prát naruby</p>
                  <p className="mb-1">Nebělit</p>
                  <p className="mb-1">Nesušit v sušičce</p>
                  <p className="mb-1">Sušit na vzduchu ve stínu</p>
                  <p className="mb-1">Nežehlit</p>
                  <p>Nečistit chemicky</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
