'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import VideoPromo from './VideoPromo';
import VideoSection from './VideoSection';
import ProductShowcaseSection from './ProductShowcaseSection';
import EditSectionModal from './EditSectionModal';
import { useSession } from 'next-auth/react';
import { useHeroSectionsStore } from '@/store/heroSectionsStore';

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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<'section1' | 'section2' | 'section3' | null>(null);
  
  const { section1, section2, section3, updateSection1, updateSection2, updateSection3 } = useHeroSectionsStore();

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

  const handleEditSection = (section: 'section1' | 'section2' | 'section3') => {
    setEditingSection(section);
    setEditModalOpen(true);
  };

  const handleSaveSection = (data: any) => {
    if (editingSection === 'section1') {
      updateSection1(data);
    } else if (editingSection === 'section2') {
      updateSection2(data);
    } else if (editingSection === 'section3') {
      updateSection3(data);
    }
  };

  const getCurrentEditData = () => {
    if (editingSection === 'section1') return section1;
    if (editingSection === 'section2') return section2;
    if (editingSection === 'section3') return section3;
    return {};
  };

  const getEditSectionType = (): 'video' | 'product' => {
    return editingSection === 'section3' ? 'product' : 'video';
  };

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

      {/* Section 1: Video Section */}
      <VideoSection 
        videoUrl={section1.videoUrl}
        isAdmin={isAdmin}
        onEdit={() => handleEditSection('section1')}
        sectionId="section1"
      />

      {/* Section 3: Product Showcase */}
      <ProductShowcaseSection
        imageUrl={section3.imageUrl}
        button1Text={section3.button1Text}
        button2Text={section3.button2Text}
        button1Link={section3.button1Link}
        button2Link={section3.button2Link}
        isAdmin={isAdmin}
        onEdit={() => handleEditSection('section3')}
      />

      {/* Section 2: Video Section */}
      <VideoSection 
        videoUrl={section2.videoUrl}
        isAdmin={isAdmin}
        onEdit={() => handleEditSection('section2')}
        sectionId="section2"
      />

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

      {/* Edit Modal */}
      {editingSection && (
        <EditSectionModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditingSection(null);
          }}
          sectionType={getEditSectionType()}
          currentData={getCurrentEditData()}
          onSave={handleSaveSection}
        />
      )}
    </div>
  );
}
