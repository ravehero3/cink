'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import VideoPromo from './VideoPromo';
import VideoSection from './VideoSection';
import ProductShowcaseSection from './ProductShowcaseSection';
import EditSectionModal from './EditSectionModal';
import EditCategorySectionModal from './EditCategorySectionModal';
import { useSession } from 'next-auth/react';
import { useHeroSectionsStore } from '@/store/heroSectionsStore';
import { useCategorySectionsStore } from '@/store/categorySectionsStore';

const categories = [
  { name: 'VOODOO808', slug: 'voodoo808', storeKey: 'voodoo808' as const },
  { name: 'SPACE LOVE', slug: 'space-love', storeKey: 'spaceLove' as const },
  { name: 'RECREATION WELLNESS', slug: 'recreation-wellness', storeKey: 'recreationWellness' as const },
  { name: 'T SHIRT GALLERY', slug: 't-shirt-gallery', storeKey: 'tShirtGallery' as const },
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

function AnimatedButton({ text, link }: { text: string; link: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={link}
      className="relative overflow-hidden bg-white text-black font-normal uppercase tracking-tight transition-all border border-black text-sm"
      style={{ borderRadius: '4px', padding: '13.8px 25.6px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        className="block transition-all duration-300"
        style={{
          transform: isHovered ? 'translateY(-150%)' : 'translateY(0)',
          opacity: isHovered ? 0 : 1,
        }}
      >
        {text}
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{
          transform: isHovered ? 'translateY(0)' : 'translateY(150%)',
          opacity: isHovered ? 1 : 0,
        }}
      >
        {text}
      </span>
    </a>
  );
}

export default function HomePageContent() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const [categoryProducts, setCategoryProducts] = useState<CategoryProducts>({});
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<'section1' | 'section2' | 'section3' | null>(null);
  const [categoryEditModalOpen, setCategoryEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<'voodoo808' | 'spaceLove' | 'recreationWellness' | 'tShirtGallery' | null>(null);
  
  const { section1, section2, section3, updateSection1, updateSection2, updateSection3 } = useHeroSectionsStore();
  const categorySections = useCategorySectionsStore();

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

  const handleEditCategorySection = (storeKey: 'voodoo808' | 'spaceLove' | 'recreationWellness' | 'tShirtGallery') => {
    setEditingCategory(storeKey);
    setCategoryEditModalOpen(true);
  };

  const handleSaveCategorySection = (data: any) => {
    if (editingCategory === 'voodoo808') {
      categorySections.updateVoodoo808(data);
    } else if (editingCategory === 'spaceLove') {
      categorySections.updateSpaceLove(data);
    } else if (editingCategory === 'recreationWellness') {
      categorySections.updateRecreationWellness(data);
    } else if (editingCategory === 'tShirtGallery') {
      categorySections.updateTShirtGallery(data);
    }
  };

  const getCurrentCategoryEditData = () => {
    if (editingCategory === 'voodoo808') return categorySections.voodoo808;
    if (editingCategory === 'spaceLove') return categorySections.spaceLove;
    if (editingCategory === 'recreationWellness') return categorySections.recreationWellness;
    if (editingCategory === 'tShirtGallery') return categorySections.tShirtGallery;
    return {
      title: '',
      button1Text: '',
      button2Text: '',
      button1Link: '',
      button2Link: '',
    };
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
        headerText={section1.headerText}
        button1Text={section1.button1Text}
        button2Text={section1.button2Text}
        button1Link={section1.button1Link}
        button2Link={section1.button2Link}
        isAdmin={isAdmin}
        onEdit={() => handleEditSection('section1')}
        sectionId="section1"
      />

      {/* Section 3: Product Showcase */}
      <ProductShowcaseSection
        imageUrl={section3.imageUrl}
        headerText={section3.headerText}
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
        headerText={section2.headerText}
        button1Text={section2.button1Text}
        button2Text={section2.button2Text}
        button1Link={section2.button1Link}
        button2Link={section2.button2Link}
        isAdmin={isAdmin}
        onEdit={() => handleEditSection('section2')}
        sectionId="section2"
      />

      {categories.map((category) => {
        const products = categoryProducts[category.slug] || [];
        const sectionData = categorySections[category.storeKey];
        
        return (
          <section key={category.slug} className="w-full border-b border-black" style={{ minHeight: '80vh' }}>
            <div className="w-full bg-white border-b border-black py-md px-5 relative">
              <div className="max-w-container mx-auto flex flex-col items-center">
                <h2 className="uppercase tracking-tighter mb-[8px]" style={{
                  fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '22px',
                  fontWeight: 700,
                  lineHeight: '1.1'
                }}>
                  {sectionData.title}
                </h2>
                <div className="flex gap-1">
                  <AnimatedButton text={sectionData.button1Text} link={sectionData.button1Link} />
                  <AnimatedButton text={sectionData.button2Text} link={sectionData.button2Link} />
                </div>
              </div>
              
              {isAdmin && (
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => handleEditCategorySection(category.storeKey)}
                    className="px-4 py-2 bg-white text-black text-xs uppercase hover:bg-black hover:text-white transition-colors border border-black"
                  >
                    Edit Section
                  </button>
                </div>
              )}
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

      {/* Category Edit Modal */}
      {editingCategory && (
        <EditCategorySectionModal
          isOpen={categoryEditModalOpen}
          onClose={() => {
            setCategoryEditModalOpen(false);
            setEditingCategory(null);
          }}
          currentData={getCurrentCategoryEditData()}
          onSave={handleSaveCategorySection}
        />
      )}
    </div>
  );
}
