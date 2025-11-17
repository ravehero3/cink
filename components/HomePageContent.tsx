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
  const [editingSection, setEditingSection] = useState<'section1' | 'section2' | 'section3' | 'section4' | 'section5' | null>(null);
  const [categoryEditModalOpen, setCategoryEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<'voodoo808' | 'spaceLove' | 'recreationWellness' | 'tShirtGallery' | null>(null);
  
  const { section1, section2, section3, section4, section5, updateSection1, updateSection2, updateSection3, updateSection4, updateSection5 } = useHeroSectionsStore();
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

  const handleEditSection = (section: 'section1' | 'section2' | 'section3' | 'section4' | 'section5') => {
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
    } else if (editingSection === 'section4') {
      updateSection4(data);
    } else if (editingSection === 'section5') {
      updateSection5(data);
    }
  };

  const getCurrentEditData = () => {
    if (editingSection === 'section1') return section1;
    if (editingSection === 'section2') return section2;
    if (editingSection === 'section3') return section3;
    if (editingSection === 'section4') return section4;
    if (editingSection === 'section5') return section5;
    return {};
  };

  const getEditSectionType = (): 'video' | 'product' => {
    return (editingSection === 'section3' || editingSection === 'section5') ? 'product' : 'video';
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

      {/* Section 1: Video Section with VOODOO808 */}
      <VideoSection 
        videoUrl={section1.videoUrl}
        headerText={categorySections.voodoo808.title}
        button1Text={categorySections.voodoo808.button1Text}
        button2Text={categorySections.voodoo808.button2Text}
        button1Link={categorySections.voodoo808.button1Link}
        button2Link={categorySections.voodoo808.button2Link}
        isAdmin={isAdmin}
        onEdit={() => handleEditSection('section1')}
        onEditCategory={() => handleEditCategorySection('voodoo808')}
        sectionId="section1"
        showProducts={false}
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

      {/* Section 2: Video Section with SPACE LOVE */}
      <VideoSection 
        videoUrl={section2.videoUrl}
        headerText={categorySections.spaceLove.title}
        button1Text={categorySections.spaceLove.button1Text}
        button2Text={categorySections.spaceLove.button2Text}
        button1Link={categorySections.spaceLove.button1Link}
        button2Link={categorySections.spaceLove.button2Link}
        isAdmin={isAdmin}
        onEdit={() => handleEditSection('section2')}
        onEditCategory={() => handleEditCategorySection('spaceLove')}
        sectionId="section2"
        showProducts={false}
      />

      {/* T SHIRT GALLERY (duplicate) */}
      <ProductShowcaseSection
        imageUrl={section5.imageUrl}
        headerText={categorySections.tShirtGallery.title}
        button1Text={categorySections.tShirtGallery.button1Text}
        button2Text={categorySections.tShirtGallery.button2Text}
        button1Link={categorySections.tShirtGallery.button1Link}
        button2Link={categorySections.tShirtGallery.button2Link}
        isAdmin={isAdmin}
        onEdit={() => handleEditSection('section5')}
      />

      {/* Section 4: Video Section with RECREATION WELLNESS */}
      <VideoSection 
        videoUrl={section4.videoUrl}
        headerText={categorySections.recreationWellness.title}
        button1Text={categorySections.recreationWellness.button1Text}
        button2Text={categorySections.recreationWellness.button2Text}
        button1Link={categorySections.recreationWellness.button1Link}
        button2Link={categorySections.recreationWellness.button2Link}
        isAdmin={isAdmin}
        onEdit={() => handleEditSection('section4')}
        onEditCategory={() => handleEditCategorySection('recreationWellness')}
        sectionId="section4"
        showProducts={false}
      />

      {/* Section 5: Product Showcase with T SHIRT GALLERY */}
      <ProductShowcaseSection
        imageUrl={section5.imageUrl}
        headerText={categorySections.tShirtGallery.title}
        button1Text={categorySections.tShirtGallery.button1Text}
        button2Text={categorySections.tShirtGallery.button2Text}
        button1Link={categorySections.tShirtGallery.button1Link}
        button2Link={categorySections.tShirtGallery.button2Link}
        isAdmin={isAdmin}
        onEdit={() => handleEditSection('section5')}
      />

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
