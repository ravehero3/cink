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

interface HeroSectionData {
  videoUrl?: string;
  mobileVideoUrl?: string;
  imageUrl?: string;
  mobileImageUrl?: string;
  headerText?: string;
  button1Text?: string;
  button2Text?: string;
  button1Link?: string;
  button2Link?: string;
}

interface CategorySectionData {
  title: string;
  button1Text: string;
  button2Text: string;
  button1Link: string;
  button2Link: string;
}

const defaultCategorySections: Record<string, CategorySectionData> = {
  voodoo808: {
    title: 'VOODOO808',
    button1Text: 'Nakupovat',
    button2Text: 'Zobrazit vše',
    button1Link: '/voodoo808',
    button2Link: '/voodoo808',
  },
  spaceLove: {
    title: 'SPACE LOVE',
    button1Text: 'Nakupovat',
    button2Text: 'Zobrazit vše',
    button1Link: '/space-love',
    button2Link: '/space-love',
  },
  recreationWellness: {
    title: 'RECREATION WELLNESS',
    button1Text: 'Nakupovat',
    button2Text: 'Zobrazit vše',
    button1Link: '/recreation-wellness',
    button2Link: '/recreation-wellness',
  },
  tShirtGallery: {
    title: 'T SHIRT GALLERY',
    button1Text: 'Nakupovat',
    button2Text: 'Zobrazit vše',
    button1Link: '/t-shirt-gallery',
    button2Link: '/t-shirt-gallery',
  },
};

const defaultHeroSections: Record<string, HeroSectionData> = {
  section1: { videoUrl: '', mobileVideoUrl: '', headerText: '', button1Text: '', button2Text: '', button1Link: '', button2Link: '' },
  section2: { videoUrl: '', mobileVideoUrl: '', headerText: '', button1Text: '', button2Text: '', button1Link: '', button2Link: '' },
  section3: { imageUrl: '', mobileImageUrl: '', headerText: 'TRIKA', button1Text: 'Shop Now', button2Text: 'View Collection', button1Link: '/voodoo808', button2Link: '/space-love' },
  section4: { videoUrl: '', mobileVideoUrl: '', headerText: '', button1Text: '', button2Text: '', button1Link: '', button2Link: '' },
  section5: { imageUrl: '', mobileImageUrl: '', headerText: '', button1Text: '', button2Text: '', button1Link: '', button2Link: '' },
};

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
        className="block transition-all duration-200"
        style={{
          transform: isHovered ? 'translateY(-150%)' : 'translateY(0)',
          opacity: isHovered ? 0 : 1,
        }}
      >
        {text}
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-200"
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
  
  const [heroSections, setHeroSections] = useState<Record<string, HeroSectionData>>(defaultHeroSections);
  const [categorySections, setCategorySections] = useState<Record<string, CategorySectionData>>(defaultCategorySections);

  useEffect(() => {
    async function fetchData() {
      try {
        const timestamp = Date.now();
        const [heroRes, categoryRes, ...productResults] = await Promise.all([
          fetch(`/api/hero-sections?_t=${timestamp}`, { cache: 'no-store' }),
          fetch(`/api/category-sections?_t=${timestamp}`, { cache: 'no-store' }),
          ...categories.map(async (category) => {
            const response = await fetch(`/api/products?category=${encodeURIComponent(category.name)}&limit=10&_t=${timestamp}`, { cache: 'no-store' });
            const data = await response.json();
            return { slug: category.slug, products: data.products || [] };
          }),
        ]);

        const heroData = await heroRes.json();
        const categoryData = await categoryRes.json();

        setHeroSections({ ...defaultHeroSections, ...heroData });
        setCategorySections({ ...defaultCategorySections, ...categoryData });

        const productsMap: CategoryProducts = {};
        productResults.forEach(({ slug, products }) => {
          productsMap[slug] = products;
        });
        setCategoryProducts(productsMap);
      } catch (error) {
        console.error('Error fetching data:', error);
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

  const handleSaveSection = async (data: any) => {
    if (!editingSection) return;
    
    try {
      const response = await fetch('/api/hero-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionKey: editingSection, ...data }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error('Failed to save section:', result);
        alert(`Chyba při ukládání: ${result.error || 'Neznámá chyba'}`);
        return;
      }
      
      console.log('Section saved successfully:', result);
      setHeroSections(prev => ({ ...prev, [editingSection]: data }));
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Chyba při ukládání sekce. Zkuste to prosím znovu.');
    }
  };

  const getCurrentEditData = () => {
    if (!editingSection) return {};
    return heroSections[editingSection] || {};
  };

  const getEditSectionType = (): 'video' | 'product' => {
    return (editingSection === 'section3' || editingSection === 'section5') ? 'product' : 'video';
  };

  const handleEditCategorySection = (storeKey: 'voodoo808' | 'spaceLove' | 'recreationWellness' | 'tShirtGallery') => {
    setEditingCategory(storeKey);
    setCategoryEditModalOpen(true);
  };

  const handleSaveCategorySection = async (data: any) => {
    if (!editingCategory) return;
    
    try {
      const response = await fetch('/api/category-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionKey: editingCategory, ...data }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error('Failed to save category section:', result);
        alert(`Chyba při ukládání: ${result.error || 'Neznámá chyba'}`);
        return;
      }
      
      console.log('Category section saved successfully:', result);
      setCategorySections(prev => ({ ...prev, [editingCategory]: data }));
    } catch (error) {
      console.error('Error saving category section:', error);
      alert('Chyba při ukládání sekce. Zkuste to prosím znovu.');
    }
  };

  const getCurrentCategoryEditData = () => {
    if (!editingCategory) return defaultCategorySections.voodoo808;
    return categorySections[editingCategory] || defaultCategorySections[editingCategory];
  };

  const section1 = heroSections.section1 || defaultHeroSections.section1;
  const section2 = heroSections.section2 || defaultHeroSections.section2;
  const section3 = heroSections.section3 || defaultHeroSections.section3;
  const section4 = heroSections.section4 || defaultHeroSections.section4;
  const section5 = heroSections.section5 || defaultHeroSections.section5;

  const voodoo808 = categorySections.voodoo808 || defaultCategorySections.voodoo808;
  const spaceLove = categorySections.spaceLove || defaultCategorySections.spaceLove;
  const recreationWellness = categorySections.recreationWellness || defaultCategorySections.recreationWellness;
  const tShirtGallery = categorySections.tShirtGallery || defaultCategorySections.tShirtGallery;

  return (
    <div className="w-full">
      <VideoPromo videoUrl={videoUrl} />

      {/* Section 1: Video Section with VOODOO808 */}
      <VideoSection 
        videoUrl={section1.videoUrl || ''}
        mobileVideoUrl={section1.mobileVideoUrl}
        headerText={voodoo808.title}
        button1Text={voodoo808.button1Text}
        button2Text={voodoo808.button2Text}
        button1Link={voodoo808.button1Link}
        button2Link={voodoo808.button2Link}
        isAdmin={isAdmin}
        onEdit={() => handleEditSection('section1')}
        onEditCategory={() => handleEditCategorySection('voodoo808')}
        sectionId="section1"
        showProducts={false}
      />

      {/* Section 3: Product Showcase */}
      <ProductShowcaseSection
        imageUrl={section3.imageUrl || ''}
        mobileImageUrl={section3.mobileImageUrl}
        headerText={section3.headerText || ''}
        button1Text={section3.button1Text || ''}
        button2Text={section3.button2Text || ''}
        button1Link={section3.button1Link || ''}
        button2Link={section3.button2Link || ''}
        isAdmin={isAdmin}
        onEdit={() => handleEditSection('section3')}
      />

      {/* Section 2: Video Section with SPACE LOVE */}
      <VideoSection 
        videoUrl={section2.videoUrl || ''}
        mobileVideoUrl={section2.mobileVideoUrl}
        headerText={spaceLove.title}
        button1Text={spaceLove.button1Text}
        button2Text={spaceLove.button2Text}
        button1Link={spaceLove.button1Link}
        button2Link={spaceLove.button2Link}
        isAdmin={isAdmin}
        onEdit={() => handleEditSection('section2')}
        onEditCategory={() => handleEditCategorySection('spaceLove')}
        sectionId="section2"
        showProducts={false}
      />

      {/* T SHIRT GALLERY (duplicate) */}
      <ProductShowcaseSection
        imageUrl={section5.imageUrl || ''}
        mobileImageUrl={section5.mobileImageUrl}
        headerText={tShirtGallery.title}
        button1Text={tShirtGallery.button1Text}
        button2Text={tShirtGallery.button2Text}
        button1Link={tShirtGallery.button1Link}
        button2Link={tShirtGallery.button2Link}
        isAdmin={isAdmin}
        onEdit={() => handleEditSection('section5')}
      />

      {/* Section 4: Video Section with RECREATION WELLNESS */}
      <VideoSection 
        videoUrl={section4.videoUrl || ''}
        mobileVideoUrl={section4.mobileVideoUrl}
        headerText={recreationWellness.title}
        button1Text={recreationWellness.button1Text}
        button2Text={recreationWellness.button2Text}
        button1Link={recreationWellness.button1Link}
        button2Link={recreationWellness.button2Link}
        isAdmin={isAdmin}
        onEdit={() => handleEditSection('section4')}
        onEditCategory={() => handleEditCategorySection('recreationWellness')}
        sectionId="section4"
        showProducts={false}
      />

      {/* Section 5: Product Showcase with T SHIRT GALLERY */}
      <ProductShowcaseSection
        imageUrl={section5.imageUrl || ''}
        mobileImageUrl={section5.mobileImageUrl}
        headerText={tShirtGallery.title}
        button1Text={tShirtGallery.button1Text}
        button2Text={tShirtGallery.button2Text}
        button1Link={tShirtGallery.button1Link}
        button2Link={tShirtGallery.button2Link}
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
