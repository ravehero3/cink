'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import { useSavedProductsStore } from '@/lib/saved-products-store';
import { useRecentlyViewedStore } from '@/lib/recently-viewed-store';

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
    <div>
      {showConfirmation && (
        <div className="fixed top-24 right-8 bg-black text-white px-6 py-4 z-50 border border-white">
          <p className="text-xs">Produkt přidán do košíku</p>
        </div>
      )}

      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-[65%]">
            <div className="mb-3">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full aspect-square object-cover"
                style={{ filter: 'grayscale(1) contrast(1.2)' }}
              />
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-16 h-16 border ${
                      selectedImage === index ? 'border-black border-2' : 'border-black'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      style={{ filter: 'grayscale(1) contrast(1.2)' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:w-[35%] lg:pl-6">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-sm font-normal lowercase">{product.name}</h1>
              <button
                onClick={toggleSaved}
                className="flex-shrink-0 ml-4"
                aria-label={isSaved(product.id) ? 'Odebrat z uložených' : 'Uložit produkt'}
              >
                <svg
                  className="w-5 h-5"
                  fill={isSaved(product.id) ? 'black' : 'none'}
                  stroke="black"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            </div>
            
            <p className="text-xs mb-6">{product.price} Kč</p>

            <div className="mb-6 pb-6 border-b border-black">
              <p className="text-xs mb-3">{product.description}</p>
              <p className="text-xs">Barva: {product.color}</p>
            </div>

            <div className="mb-6">
              <p className="text-xs mb-3 uppercase">Size:</p>
              <div className="flex flex-wrap gap-2">
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
                      className={`px-4 py-2 border text-xs transition-colors ${
                        isSelected
                          ? 'bg-black text-white border-black'
                          : isAvailable
                          ? 'border-black hover:bg-black hover:text-white'
                          : 'border-black bg-white text-black cursor-not-allowed opacity-40'
                      }`}
                    >
                      <span className={!isAvailable ? 'line-through' : ''}>{size}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full py-3 bg-black text-white text-xs uppercase border border-black hover:bg-white hover:text-black transition-colors mb-4"
            >
              Add to cart
            </button>

            <div className="border-t border-black pt-6">
              <div className="text-xs space-y-3">
                <details className="cursor-pointer">
                  <summary className="font-normal uppercase">Product details</summary>
                  <div className="mt-3 text-xs leading-relaxed">
                    <p>Kategorie: {product.category}</p>
                    <p>Skladem: {product.totalStock} ks</p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
