'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import VideoPromo from './VideoPromo';
import { useSession } from 'next-auth/react';

const categories = [
  { name: 'VOODOO808', slug: 'voodoo808' },
  { name: 'SPACE LOVE', slug: 'space-love' },
  { name: 'RECREATION WELLNESS', slug: 'recreation-wellness' },
  { name: 'T SHIRT GALLERY', slug: 't-shirt-gallery' },
];

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  category: string;
}

interface CategoryProducts {
  [key: string]: Product[];
}

export default function HomePageContent() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const [categoryProducts, setCategoryProducts] = useState<CategoryProducts>({});
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const productPromises = categories.map(async (category) => {
          const response = await fetch(`/api/products?category=${encodeURIComponent(category.name)}&limit=10`);
          const data = await response.json();
          return { slug: category.slug, products: data.products || [] };
        });

        const results = await Promise.all(productPromises);
        const productsMap: CategoryProducts = {};
        results.forEach(({ slug, products }) => {
          productsMap[slug] = products;
        });
        setCategoryProducts(productsMap);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="w-full">
      <VideoPromo videoUrl={videoUrl} />
      
      {isAdmin && (
        <div className="w-full bg-gray-100 border-b border-black p-sm text-center">
          <button className="text-xs uppercase hover:underline">
            Edit Video
          </button>
        </div>
      )}

      {/* Section 1: Featured Collection Banner */}
      <section className="w-full border-b border-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600" style={{ minHeight: '60vh' }}>
        <div className="w-full h-full flex items-center justify-center px-5 py-2xl">
          <div className="max-w-container mx-auto text-center text-white">
            <h2 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter mb-lg">
              NEW COLLECTION
            </h2>
            <p className="text-xl md:text-2xl mb-xl max-w-2xl mx-auto">
              Explore the latest designs inspired by cosmic adventures and urban energy
            </p>
            <Link 
              href="/kategorie/space-love"
              className="inline-block bg-white text-black px-xl py-md text-lg font-bold uppercase tracking-tight hover:bg-black hover:text-white transition-colors border-2 border-white"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {categories.map((category) => {
        const products = categoryProducts[category.slug] || [];
        
        return (
          <section key={category.slug} className="w-full border-b border-black" style={{ minHeight: '80vh' }}>
            <div className="w-full bg-white border-b border-black py-md px-5">
              <div className="max-w-container mx-auto flex items-center justify-between">
                <h2 className="text-section-header font-bold uppercase tracking-tighter">
                  {category.name}
                </h2>
                <Link 
                  href={`/kategorie/${category.slug}`}
                  className="text-xs uppercase hover:underline"
                >
                  View All
                </Link>
              </div>
            </div>

            <div className="w-full overflow-x-auto bg-white scrollbar-hide" style={{ height: 'calc(80vh - 66px)' }}>
              <div className="flex gap-0 h-full">
                {isLoading ? (
                  <div className="w-full py-2xl text-center text-sm">Loading...</div>
                ) : products.length === 0 ? (
                  <div className="w-full py-2xl text-center text-sm">No products in this category</div>
                ) : (
                  products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/produkty/${product.slug}`}
                      className="flex-shrink-0 w-[300px] border-r border-black hover:bg-gray-50 transition-colors group h-full flex flex-col"
                    >
                      <div className="flex-1 relative bg-gray-100 border-b border-black overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="300px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="p-sm flex-shrink-0">
                        <h3 className="text-product-name font-bold uppercase tracking-tighter mb-1">
                          {product.name}
                        </h3>
                        <p className="text-sm">{product.price} Kč</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </section>
        );
      })}

      {/* Section 2: Why Shop With Us */}
      <section className="w-full border-b border-black bg-black text-white" style={{ minHeight: '70vh' }}>
        <div className="w-full py-2xl px-5">
          <div className="max-w-container mx-auto">
            <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter mb-2xl text-center">
              Why UFO Sport?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
              <div className="text-center p-lg border border-white/20 hover:bg-white/10 transition-colors">
                <div className="text-6xl mb-lg">🚀</div>
                <h3 className="text-2xl font-bold uppercase tracking-tight mb-md">Out of This World Quality</h3>
                <p className="text-base opacity-80">
                  Premium materials and cutting-edge designs that stand the test of time and space.
                </p>
              </div>
              <div className="text-center p-lg border border-white/20 hover:bg-white/10 transition-colors">
                <div className="text-6xl mb-lg">⚡</div>
                <h3 className="text-2xl font-bold uppercase tracking-tight mb-md">Lightning Fast Delivery</h3>
                <p className="text-base opacity-80">
                  Get your gear delivered at warp speed. Most orders ship within 24 hours.
                </p>
              </div>
              <div className="text-center p-lg border border-white/20 hover:bg-white/10 transition-colors">
                <div className="text-6xl mb-lg">🌟</div>
                <h3 className="text-2xl font-bold uppercase tracking-tight mb-md">Cosmic Customer Care</h3>
                <p className="text-base opacity-80">
                  Our support team is here to help you navigate your shopping journey 24/7.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Newsletter Signup */}
      <section className="w-full bg-white" style={{ minHeight: '50vh' }}>
        <div className="w-full py-2xl px-5">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter mb-lg">
              Join the Universe
            </h2>
            <p className="text-xl mb-xl">
              Subscribe to get special offers, free giveaways, and exclusive UFO SPORT news.
            </p>
            <form className="flex flex-col sm:flex-row gap-md max-w-xl mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-lg py-md border-2 border-black text-base focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
              <button
                type="submit"
                className="px-xl py-md bg-black text-white font-bold uppercase tracking-tight hover:bg-purple-600 transition-colors border-2 border-black hover:border-purple-600"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs mt-md opacity-60">
              By subscribing you agree to our Privacy Policy and consent to receive updates from UFO SPORT.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
