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

      {categories.map((category) => {
        const products = categoryProducts[category.slug] || [];
        
        return (
          <section key={category.slug} className="w-full border-b border-black">
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

            <div className="w-full overflow-x-auto bg-white scrollbar-hide">
              <div className="flex gap-0 min-w-full">
                {isLoading ? (
                  <div className="w-full py-2xl text-center text-sm">Loading...</div>
                ) : products.length === 0 ? (
                  <div className="w-full py-2xl text-center text-sm">No products in this category</div>
                ) : (
                  products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/produkty/${product.slug}`}
                      className="flex-shrink-0 w-[300px] border-r border-black hover:bg-gray-50 transition-colors group"
                    >
                      <div className="aspect-[3/4] relative bg-gray-100 border-b border-black overflow-hidden">
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
                      <div className="p-sm">
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
    </div>
  );
}
