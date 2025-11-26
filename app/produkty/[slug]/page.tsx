'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/lib/cart-store';
import { useSavedProductsStore } from '@/lib/saved-products-store';
import { useRecentlyViewedStore } from '@/lib/recently-viewed-store';
import { ChevronDown, Edit2, Save, X } from 'lucide-react';
import { getDeliveryDateRange } from '@/lib/delivery-date';
import SizeChart from '@/components/SizeChart';
import type { SizeChartType } from '@/components/SizeChart';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  category: string;
  color: string;
  images: string[];
  sizes: Record<string, number>;
  totalStock: number;
  productInfo?: string;
  sizeFit?: string;
  shippingInfo?: string;
  careInfo?: string;
  sizeChartType?: SizeChartType;
  sizeChartData?: any;
}

export default function ProductDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;
  const sizeFromUrl = searchParams.get('size');
  const { data: session } = useSession();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedShortDescription, setEditedShortDescription] = useState('');
  const [editedPrice, setEditedPrice] = useState('');
  const [editedColor, setEditedColor] = useState('');
  const [editedSizes, setEditedSizes] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);

  const { addItem } = useCartStore();
  const { isSaved, addProduct, removeProduct } = useSavedProductsStore();
  const { addProduct: addRecentlyViewed } = useRecentlyViewedStore();

  const isAdmin = session?.user?.role === 'ADMIN';

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
      router.push('/kosik');
    }, 500);
  };

  const toggleSaved = async () => {
    if (!product) return;
    
    const currentlySaved = isSaved(product.id);
    setShowHeartAnimation(true);
    
    // Update Zustand store immediately for UI feedback
    if (currentlySaved) {
      removeProduct(product.id);
    } else {
      addProduct(product.id);
    }
    
    // If authenticated, sync with database
    if (session?.user) {
      try {
        if (currentlySaved) {
          // Remove from database
          await fetch(`/api/saved-products?productId=${product.id}`, {
            method: 'DELETE',
          });
        } else {
          // Add to database
          await fetch('/api/saved-products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: product.id }),
          });
        }
      } catch (error) {
        console.error('Error syncing saved product:', error);
      }
    }
    
    setTimeout(() => setShowHeartAnimation(false), 400);
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

  const handleEditClick = () => {
    if (!product) return;
    setEditedName(product.name);
    setEditedDescription(product.description);
    setEditedShortDescription(product.shortDescription || '');
    setEditedPrice(product.price.toString());
    setEditedColor(product.color);
    setEditedSizes(product.sizes);
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  const handleSaveEdit = async () => {
    if (!product) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editedName,
          description: editedDescription,
          shortDescription: editedShortDescription,
          price: parseFloat(editedPrice),
          color: editedColor,
          sizes: editedSizes,
        }),
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        setProduct(updatedProduct);
        setIsEditMode(false);
        alert('Produkt byl úspěšně upraven');
      } else {
        alert('Chyba při ukládání změn');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Chyba při ukládání změn');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSizeStockChange = (size: string, newStock: number) => {
    setEditedSizes(prev => ({
      ...prev,
      [size]: newStock,
    }));
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
                />
                {index === 0 && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowHeartAnimation(true);
                      toggleSaved();
                      setTimeout(() => setShowHeartAnimation(false), 600);
                    }}
                    className={`absolute heart-icon-pdp ${showHeartAnimation ? 'liked' : ''}`}
                    style={{ top: '4px', right: '4px', width: '22px', height: '22px' }}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill={isSaved(product.id) ? 'black' : 'white'}
                      stroke="black"
                      strokeWidth="1.75"
                    >
                      <path 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="w-1/2 sticky top-[44px] self-start h-screen overflow-y-auto">
          <div className="flex flex-col justify-center" style={{ paddingLeft: '32px', paddingRight: '48px', paddingTop: '64px' }}>
            {isAdmin && !isEditMode && (
              <button
                onClick={handleEditClick}
                className="flex items-center justify-center gap-2 mb-4 px-4 py-2 border border-black hover:bg-black hover:text-white transition-colors"
                style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '12px',
                  fontWeight: 400,
                }}
              >
                <Edit2 size={14} />
                Upravit produkt
              </button>
            )}

            {isEditMode ? (
              <>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="uppercase border border-black px-3 py-2 mb-2"
                  style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '16px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textAlign: 'center'
                  }}
                />
                <input
                  type="number"
                  value={editedPrice}
                  onChange={(e) => setEditedPrice(e.target.value)}
                  className="border border-black px-3 py-2 mb-4"
                  style={{
                    fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    textAlign: 'center'
                  }}
                />
              </>
            ) : (
              <>
                <h1 
                  className="uppercase"
                  style={{
                    fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                    lineHeight: '1.4',
                    marginBottom: '4px',
                    textAlign: 'center',
                    fontStretch: 'condensed'
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
                    marginBottom: '4px'
                  }}
                >
                  {product.price} Kč
                </p>
                
                {product.shortDescription && (
                  <p 
                    style={{
                      fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      textAlign: 'center',
                      marginBottom: '8px'
                    }}
                  >
                    {product.shortDescription}
                  </p>
                )}
              </>
            )}

          {isEditMode && (
            <div style={{ marginBottom: '32px', width: '100%' }}>
              <label className="block mb-2" style={{ fontSize: '12px', fontWeight: 500 }}>
                Barva:
              </label>
              <input
                type="text"
                value={editedColor}
                onChange={(e) => setEditedColor(e.target.value)}
                className="w-full border border-black px-3 py-2 mb-4"
                style={{ fontSize: '14px' }}
              />
              
              <label className="block mb-2" style={{ fontSize: '12px', fontWeight: 500 }}>
                Krátký popis (zobrazen pod cenou):
              </label>
              <textarea
                value={editedShortDescription}
                onChange={(e) => setEditedShortDescription(e.target.value)}
                className="w-full border border-black px-3 py-2 mb-4"
                rows={2}
                style={{ fontSize: '14px' }}
              />

              <label className="block mb-2" style={{ fontSize: '12px', fontWeight: 500 }}>
                Podrobný popis:
              </label>
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="w-full border border-black px-3 py-2 mb-4"
                rows={4}
                style={{ fontSize: '14px' }}
              />

              <label className="block mb-2" style={{ fontSize: '12px', fontWeight: 500 }}>
                Velikosti a skladové zásoby:
              </label>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {Object.entries(editedSizes).map(([size, stock]) => (
                  <div key={size} className="flex items-center gap-2 border border-black p-2">
                    <span className="font-medium" style={{ width: '60px' }}>{size}:</span>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => handleSizeStockChange(size, parseInt(e.target.value) || 0)}
                      className="flex-1 border border-gray-300 px-2 py-1"
                      min="0"
                      style={{ fontSize: '14px' }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="flex-1 bg-black text-white px-4 py-3 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  style={{
                    fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '16px',
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase',
                    fontStretch: 'condensed',
                  }}
                >
                  <Save size={16} />
                  {isSaving ? 'Ukládání...' : 'Uložit změny'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="flex-1 bg-white text-black px-4 py-3 border border-black hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                  style={{
                    fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '16px',
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase',
                    fontStretch: 'condensed',
                  }}
                >
                  <X size={16} />
                  Zrušit
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <div style={{ borderTop: '1px solid #000000', paddingTop: '0', width: '36vw', marginBottom: '0px' }}></div>

          {!isEditMode && (
            <>
          {(() => {
            const delivery = getDeliveryDateRange();
            return (
              <p
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '12px',
                  fontWeight: 400,
                  color: '#666666',
                  textAlign: 'center',
                  marginTop: '20px',
                  marginBottom: '8px',
                  width: '36vw'
                }}
              >
                Odhadované datum doručení: {delivery.minDate} - {delivery.maxDate}
              </p>
            );
          })()}
          <div className="relative" style={{ width: '36vw', marginBottom: '-4px', paddingTop: '12px' }}>
            <button
              onClick={() => setIsSizeDropdownOpen(!isSizeDropdownOpen)}
              className="w-full bg-white text-black flex items-center justify-center relative"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                letterSpacing: 'tight',
                textTransform: 'uppercase',
                padding: '10.67px 0',
                textAlign: 'center',
                border: '1px solid #000',
                borderRadius: '4px'
              }}
            >
              {selectedSize ? selectedSize.toUpperCase() : 'VYBERTE VELIKOST'}
              <ChevronDown 
                className="absolute right-3"
                size={16}
                strokeWidth={1}
              />
            </button>

            {isSizeDropdownOpen && (
              <div
                className="fixed inset-0 bg-black z-40 transition-opacity duration-300"
                style={{ opacity: 0.5 }}
                onClick={() => setIsSizeDropdownOpen(false)}
              />
            )}
            <div
              className="absolute left-0 right-0 bg-white border border-black z-50 transform transition-transform duration-300 ease-in-out origin-top overflow-hidden"
              style={{ 
                borderRadius: '2px',
                top: '100%',
                transform: isSizeDropdownOpen ? 'scaleY(1)' : 'scaleY(0)',
                transformOrigin: 'top'
              }}
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
          </div>

          <button
            onClick={handleAddToCart}
            className="bg-black text-white hover:bg-gray-800 transition-colors"
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              letterSpacing: 'tight',
              textTransform: 'uppercase',
              padding: '10.67px 0',
              width: '36vw',
              borderRadius: '4px',
              marginTop: '4px',
              marginBottom: '16px'
            }}
          >
            PŘIDAT DO KOŠÍKU
          </button>
            </>
          )}

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
                    fontFamily: 'BB-CondBold, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    letterSpacing: '0.03em',
                    height: '100%'
                  }}
                >
                  INFORMACE O PRODUKTU
                </span>
                <ChevronDown 
                  className={`accordion-arrow transition-transform ${expandedSection === 'details' ? 'accordion-arrow-active' : ''}`}
                  size={16}
                  strokeWidth={1}
                />
              </button>
              <div 
                className={`accordion-content ${expandedSection === 'details' ? 'accordion-content-active' : ''}`}
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  letterSpacing: '0.03em',
                  lineHeight: '1.6',
                  maxHeight: expandedSection === 'details' ? '500px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                  <p className="mb-2">{product.description}</p>
                  <p className="mb-1">Barva: {product.color}</p>
                  <p className="mb-1">Kategorie: {product.category}</p>
                  <p className="mb-1">Made in Czech Republic</p>
                  <p className="mt-4 text-xs text-gray-600">Product ID: {product.id}</p>
              </div>
            </div>

            <div className="border-b border-black">
              <button
                onClick={() => {
                  toggleSection('size-fit');
                  if (product.sizeChartType) {
                    setShowSizeChart(true);
                  }
                }}
                className="w-full flex items-center justify-between"
                style={{ height: '48px' }}
              >
                <span 
                  className="uppercase flex items-center"
                  style={{
                    fontFamily: 'BB-CondBold, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    letterSpacing: '0.03em',
                    height: '100%'
                  }}
                >
                  Size & fit
                </span>
                <ChevronDown 
                  className={`accordion-arrow ${expandedSection === 'size-fit' ? 'accordion-arrow-active' : ''}`}
                  size={16}
                  strokeWidth={1}
                />
              </button>
              <div 
                className={`accordion-content ${expandedSection === 'size-fit' ? 'accordion-content-active' : ''}`}
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  letterSpacing: '0.03em',
                  lineHeight: '1.6',
                  maxHeight: expandedSection === 'size-fit' ? '500px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div className="pb-4">
                  <p className="mb-2">Oversize fit</p>
                  <p className="mb-4">Konzultujte naši tabulku velikostí pro více informací.</p>
                  {product.sizeChartType && (
                    <button
                      onClick={() => setShowSizeChart(true)}
                      className="px-4 py-2 border border-black bg-white text-black uppercase text-xs font-medium hover:bg-black hover:text-white transition-colors"
                    >
                      Zobrazit tabulku velikostí
                    </button>
                  )}
                </div>
              </div>
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
                    fontFamily: 'BB-CondBold, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    letterSpacing: '0.03em',
                    height: '100%'
                  }}
                >
                  Doprava zdarma, vrácení zdarma
                </span>
                <ChevronDown 
                  className={`accordion-arrow ${expandedSection === 'shipping' ? 'accordion-arrow-active' : ''}`}
                  size={16}
                  strokeWidth={1}
                />
              </button>
              <div 
                className={`accordion-content ${expandedSection === 'shipping' ? 'accordion-content-active' : ''}`}
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  letterSpacing: '0.03em',
                  lineHeight: '1.6',
                  maxHeight: expandedSection === 'shipping' ? '500px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div className="pb-4">
                  <p className="mb-2">Nabízíme bezplatné expresní doručení při objednávce nad 2000 Kč.</p>
                  <p className="mb-2">Bezplatné vrácení a výměna do 30 dnů od data doručení.</p>
                  <p>Pro více informací navštivte naše <a href="/faq" className="underline">FAQ</a>.</p>
                </div>
              </div>
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
                    fontFamily: 'BB-CondBold, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    letterSpacing: '0.03em',
                    height: '100%'
                  }}
                >
                  Péče o produkt
                </span>
                <ChevronDown 
                  className={`accordion-arrow ${expandedSection === 'care' ? 'accordion-arrow-active' : ''}`}
                  size={16}
                  strokeWidth={1}
                />
              </button>
              <div 
                className={`accordion-content ${expandedSection === 'care' ? 'accordion-content-active' : ''}`}
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  letterSpacing: '0.03em',
                  lineHeight: '1.6',
                  maxHeight: expandedSection === 'care' ? '500px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div className="pb-4">
                  <p className="mb-1">Prát max. při 30°C - šetrný proces</p>
                  <p className="mb-1">Prát naruby</p>
                  <p className="mb-1">Nebělit</p>
                  <p className="mb-1">Nesušit v sušičce</p>
                  <p className="mb-1">Sušit na vzduchu ve stínu</p>
                  <p className="mb-1">Nežehlit</p>
                  <p>Nečistit chemicky</p>
                </div>
              </div>
            </div>
          </div>
          <div style={{ height: '64px' }}></div>
          </div>
        </div>
        </div>
      </div>
      </div>

      {/* Size Chart Modal */}
      <SizeChart
        type={product.sizeChartType}
        data={product.sizeChartData}
        isOpen={showSizeChart}
        onClose={() => setShowSizeChart(false)}
      />

      <style jsx>{`
        .heart-icon-pdp {
          transition: transform 0.1s ease;
          cursor: pointer;
        }

        .heart-icon-pdp.liked {
          animation: scalePop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes scalePop {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.3);
          }
          100% {
            transform: scale(1);
          }
        }

        .heart-icon-pdp path {
          transition: fill 0.2s ease;
        }

        .accordion-arrow {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .accordion-arrow-active {
          transform: rotate(180deg);
        }
      `}</style>
    </div>
  );
}
