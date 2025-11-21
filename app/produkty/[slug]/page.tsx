'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const sizeFromUrl = searchParams.get('size');

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false);

  const { addItem } = useCartStore();
  const { isSaved, addProduct, removeProduct } = useSavedProductsStore();
  const { addProduct: addRecentlyViewed } = useRecentlyViewedStore();

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  // Pre-select size from URL parameter if present
  useEffect(() => {
    if (product && sizeFromUrl && product.sizes[sizeFromUrl] && product.sizes[sizeFromUrl] > 0) {
      setSelectedSize(sizeFromUrl);
    }
  }, [product, sizeFromUrl]);

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
              <div key={index} className="w-full relative">
                <img
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full object-cover"
                  style={{ filter: 'grayscale(1) contrast(1.2)' }}
                />
                {index === 0 && (
                  <button
                    onClick={toggleSaved}
                    className="absolute"
                    style={{ top: '4px', right: '4px' }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill={isSaved(product.id) ? 'white' : 'none'}
                      stroke="white"
                      strokeWidth="1"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="w-1/2 sticky top-[44px] self-start h-screen overflow-y-auto">
          <div className="flex flex-col justify-center" style={{ paddingLeft: '32px', paddingRight: '48px', paddingTop: '64px' }}>
            <h1 
              className="uppercase"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                lineHeight: '1.4',
                marginBottom: '4px',
                textAlign: 'center'
              }}
            >
              {product.name}
            </h1>
            
            <p 
              style={{
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                textAlign: 'center',
                marginBottom: '64px'
              }}
            >
              {product.price} Kč
            </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <div style={{ borderTop: '1px solid #000000', paddingTop: '0', width: '36vw', marginBottom: '0px' }} />

          <div className="relative" style={{ width: '36vw', marginBottom: '-4px' }}>
            <button
              onClick={() => setIsSizeDropdownOpen(!isSizeDropdownOpen)}
              className="w-full bg-white text-black flex items-center justify-center relative"
              style={{
                fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '22px',
                fontWeight: 700,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                padding: '10.67px 0',
                fontStretch: 'condensed',
                textAlign: 'center',
                border: '1px solid #000',
                borderRadius: '4px'
              }}
            >
              {selectedSize || 'Vyberte velikost'}
              <ChevronDown 
                className="absolute right-3"
                size={16}
                strokeWidth={1}
              />
            </button>

            {isSizeDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black z-40"
                  style={{ opacity: 0.5 }}
                  onClick={() => setIsSizeDropdownOpen(false)}
                />
                <div
                  className="absolute left-0 right-0 bg-white border border-black z-50 mt-1"
                  style={{ borderRadius: '2px' }}
                >
                  {sizes.map(([size, stock]) => {
                    const isAvailable = stock > 0;
                    return (
                      <button
                        key={size}
                        onClick={() => {
                          if (isAvailable) {
                            setSelectedSize(size);
                            setQuantity(1);
                            setIsSizeDropdownOpen(false);
                          }
                        }}
                        disabled={!isAvailable}
                        className={`w-full py-3 border-b border-black last:border-b-0 transition-colors ${
                          isAvailable
                            ? 'hover:bg-black hover:text-white'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        style={{
                          fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                          fontSize: '13px',
                          fontWeight: 400
                        }}
                      >
                        {size}{!isAvailable && ' (Vyprodáno)'}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="bg-black text-white hover:bg-gray-800 transition-colors"
            style={{
              fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              padding: '10.67px 0',
              width: '36vw',
              fontStretch: 'condensed',
              borderRadius: '4px',
              marginBottom: '16px'
            }}
          >
            PŘIDAT DO KOŠÍKU
          </button>

          <div style={{ width: '36vw' }}>
          <div className="border-t border-black flex flex-col gap-1">
            <div className="border-b border-black">
              <button
                onClick={() => toggleSection('details')}
                className="w-full flex items-center justify-between"
                style={{ height: '48px' }}
              >
                <span 
                  className="uppercase flex items-center"
                  style={{
                    fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '22px',
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                    height: '100%',
                    fontStretch: 'condensed'
                  }}
                >
                  INFORMACE O PRODUKTU
                </span>
                <ChevronDown 
                  className={`transition-transform ${expandedSection === 'details' ? 'rotate-180' : ''}`}
                  size={16}
                  strokeWidth={1}
                />
              </button>
              {expandedSection === 'details' && (
                <div 
                  className="pb-4"
                  style={{
                    fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '22px',
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                    lineHeight: '1.6',
                    fontStretch: 'condensed'
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
                className="w-full flex items-center justify-between"
                style={{ height: '48px' }}
              >
                <span 
                  className="uppercase flex items-center"
                  style={{
                    fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '22px',
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                    height: '100%',
                    fontStretch: 'condensed'
                  }}
                >
                  Size & fit
                </span>
                <ChevronDown 
                  className={`transition-transform ${expandedSection === 'size-fit' ? 'rotate-180' : ''}`}
                  size={16}
                  strokeWidth={1}
                />
              </button>
              {expandedSection === 'size-fit' && (
                <div 
                  className="pb-4"
                  style={{
                    fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '22px',
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                    lineHeight: '1.6',
                    fontStretch: 'condensed'
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
                className="w-full flex items-center justify-between"
                style={{ height: '48px' }}
              >
                <span 
                  className="uppercase flex items-center"
                  style={{
                    fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '22px',
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                    height: '100%',
                    fontStretch: 'condensed'
                  }}
                >
                  Doprava zdarma, vrácení zdarma
                </span>
                <ChevronDown 
                  className={`transition-transform ${expandedSection === 'shipping' ? 'rotate-180' : ''}`}
                  size={16}
                  strokeWidth={1}
                />
              </button>
              {expandedSection === 'shipping' && (
                <div 
                  className="pb-4"
                  style={{
                    fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '22px',
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                    lineHeight: '1.6',
                    fontStretch: 'condensed'
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
                className="w-full flex items-center justify-between"
                style={{ height: '48px' }}
              >
                <span 
                  className="uppercase flex items-center"
                  style={{
                    fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '22px',
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                    height: '100%',
                    fontStretch: 'condensed'
                  }}
                >
                  Péče o produkt
                </span>
                <ChevronDown 
                  className={`transition-transform ${expandedSection === 'care' ? 'rotate-180' : ''}`}
                  size={16}
                  strokeWidth={1}
                />
              </button>
              {expandedSection === 'care' && (
                <div 
                  className="pb-4"
                  style={{
                    fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '22px',
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                    lineHeight: '1.6',
                    fontStretch: 'condensed'
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
          <div style={{ height: '64px' }} />
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
