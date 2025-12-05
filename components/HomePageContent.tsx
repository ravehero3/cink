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
  id?: string;
  sectionKey: string;
  sectionType: 'VIDEO' | 'IMAGE';
  order: number;
  videoUrl?: string;
  mobileVideoUrl?: string;
  imageUrl?: string;
  mobileImageUrl?: string;
  headerText?: string;
  button1Text?: string;
  button2Text?: string;
  button1Link?: string;
  button2Link?: string;
  textColor?: 'black' | 'white';
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

const defaultHeroSectionsArray: HeroSectionData[] = [
  { sectionKey: 'section1', sectionType: 'VIDEO', order: 0, videoUrl: '', mobileVideoUrl: '', headerText: '', button1Text: '', button2Text: '', button1Link: '', button2Link: '', textColor: 'black' },
  { sectionKey: 'section2', sectionType: 'IMAGE', order: 1, imageUrl: '', mobileImageUrl: '', headerText: 'TRIKA', button1Text: 'Shop Now', button2Text: 'View Collection', button1Link: '/voodoo808', button2Link: '/space-love', textColor: 'black' },
  { sectionKey: 'section3', sectionType: 'VIDEO', order: 2, videoUrl: '', mobileVideoUrl: '', headerText: '', button1Text: '', button2Text: '', button1Link: '', button2Link: '', textColor: 'black' },
  { sectionKey: 'section4', sectionType: 'IMAGE', order: 3, imageUrl: '', mobileImageUrl: '', headerText: '', button1Text: '', button2Text: '', button1Link: '', button2Link: '', textColor: 'black' },
  { sectionKey: 'section5', sectionType: 'VIDEO', order: 4, videoUrl: '', mobileVideoUrl: '', headerText: '', button1Text: '', button2Text: '', button1Link: '', button2Link: '', textColor: 'black' },
];

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

function ConfirmDeleteModal({ isOpen, onClose, onConfirm, sectionKey }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; sectionKey: string }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black z-40 opacity-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white border border-black w-96 max-w-[90vw]">
        <div className="border-b border-black p-4 text-center">
          <h2 className="text-sm font-bold uppercase tracking-wide">Smazat sekci</h2>
        </div>
        <div className="p-4">
          <p className="text-sm text-center mb-4">
            Opravdu chcete smazat sekci <strong>{sectionKey}</strong>? Tuto akci nelze vrátit zpět.
          </p>
        </div>
        <div className="border-t border-black p-3 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm uppercase border border-black bg-white hover:bg-gray-100 transition-colors"
          >
            Zrušit
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 text-sm uppercase bg-black text-white hover:bg-gray-800 transition-colors"
          >
            Smazat
          </button>
        </div>
      </div>
    </>
  );
}

export default function HomePageContent() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const [categoryProducts, setCategoryProducts] = useState<CategoryProducts>({});
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<HeroSectionData | null>(null);
  const [categoryEditModalOpen, setCategoryEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<'voodoo808' | 'spaceLove' | 'recreationWellness' | 'tShirtGallery' | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);
  
  const [heroSections, setHeroSections] = useState<HeroSectionData[]>(defaultHeroSectionsArray);
  const [categorySections, setCategorySections] = useState<Record<string, CategorySectionData>>(defaultCategorySections);

  const fetchHeroSections = async () => {
    try {
      const timestamp = Date.now();
      const response = await fetch(`/api/hero-sections?_t=${timestamp}`, { cache: 'no-store' });
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const sortedSections = data.sort((a: HeroSectionData, b: HeroSectionData) => a.order - b.order);
        setHeroSections(sortedSections);
      } else {
        setHeroSections(defaultHeroSectionsArray);
      }
    } catch (error) {
      console.error('Error fetching hero sections:', error);
      setHeroSections(defaultHeroSectionsArray);
    }
  };

  const createDefaultSections = async () => {
    if (!isAdmin) {
      setHeroSections(defaultHeroSectionsArray);
      return;
    }
    
    try {
      for (const section of defaultHeroSectionsArray) {
        await fetch('/api/hero-sections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(section),
        });
      }
      await fetchHeroSections();
    } catch (error) {
      console.error('Error creating default sections:', error);
      setHeroSections(defaultHeroSectionsArray);
    }
  };

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

        if (Array.isArray(heroData) && heroData.length > 0) {
          const sortedSections = heroData.sort((a: HeroSectionData, b: HeroSectionData) => a.order - b.order);
          setHeroSections(sortedSections);
        } else {
          setHeroSections(defaultHeroSectionsArray);
        }

        setCategorySections({ ...defaultCategorySections, ...categoryData });

        const productsMap: CategoryProducts = {};
        productResults.forEach(({ slug, products }) => {
          productsMap[slug] = products;
        });
        setCategoryProducts(productsMap);
      } catch (error) {
        console.error('Error fetching data:', error);
        setHeroSections(defaultHeroSectionsArray);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleEditSection = (section: HeroSectionData) => {
    setEditingSection(section);
    setEditModalOpen(true);
  };

  const handleSaveSection = async (data: any) => {
    if (!editingSection) return;
    
    try {
      const response = await fetch('/api/hero-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sectionKey: editingSection.sectionKey, 
          sectionType: editingSection.sectionType,
          order: editingSection.order,
          ...data 
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error('Failed to save section:', result);
        alert(`Chyba při ukládání: ${result.error || 'Neznámá chyba'}`);
        return;
      }
      
      console.log('Section saved successfully:', result);
      setHeroSections(prev => prev.map(s => 
        s.sectionKey === editingSection.sectionKey 
          ? { ...s, ...data, sectionType: editingSection.sectionType }
          : s
      ));
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Chyba při ukládání sekce. Zkuste to prosím znovu.');
    }
  };

  const handleTypeChange = async (newType: 'VIDEO' | 'IMAGE') => {
    if (!editingSection) return;
    
    try {
      const response = await fetch('/api/hero-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sectionKey: editingSection.sectionKey,
          sectionType: newType,
          order: editingSection.order,
          videoUrl: editingSection.videoUrl,
          mobileVideoUrl: editingSection.mobileVideoUrl,
          imageUrl: editingSection.imageUrl,
          mobileImageUrl: editingSection.mobileImageUrl,
          headerText: editingSection.headerText,
          button1Text: editingSection.button1Text,
          button2Text: editingSection.button2Text,
          button1Link: editingSection.button1Link,
          button2Link: editingSection.button2Link,
          textColor: editingSection.textColor,
        }),
      });
      
      if (response.ok) {
        setEditingSection(prev => prev ? { ...prev, sectionType: newType } : null);
        setHeroSections(prev => prev.map(s => 
          s.sectionKey === editingSection.sectionKey 
            ? { ...s, sectionType: newType }
            : s
        ));
      }
    } catch (error) {
      console.error('Error updating section type:', error);
    }
  };

  const handleDeleteSection = async (sectionKey: string) => {
    setSectionToDelete(sectionKey);
    setDeleteModalOpen(true);
  };

  const confirmDeleteSection = async () => {
    if (!sectionToDelete) return;
    
    try {
      const response = await fetch(`/api/hero-sections?sectionKey=${encodeURIComponent(sectionToDelete)}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchHeroSections();
      } else {
        const result = await response.json();
        alert(`Chyba při mazání: ${result.error || 'Neznámá chyba'}`);
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Chyba při mazání sekce. Zkuste to prosím znovu.');
    } finally {
      setDeleteModalOpen(false);
      setSectionToDelete(null);
    }
  };

  const handleAddSection = async () => {
    if (heroSections.length === 0) return;
    
    const firstSection = heroSections[0];
    const newSectionKey = `section_${Date.now()}`;
    const newOrder = heroSections.length;
    
    const newSection: HeroSectionData = {
      sectionKey: newSectionKey,
      sectionType: firstSection.sectionType,
      order: newOrder,
      videoUrl: firstSection.videoUrl || '',
      mobileVideoUrl: firstSection.mobileVideoUrl || '',
      imageUrl: firstSection.imageUrl || '',
      mobileImageUrl: firstSection.mobileImageUrl || '',
      headerText: firstSection.headerText || '',
      button1Text: firstSection.button1Text || '',
      button2Text: firstSection.button2Text || '',
      button1Link: firstSection.button1Link || '',
      button2Link: firstSection.button2Link || '',
      textColor: firstSection.textColor || 'black',
    };
    
    try {
      const response = await fetch('/api/hero-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSection),
      });
      
      if (response.ok) {
        await fetchHeroSections();
      } else {
        const result = await response.json();
        alert(`Chyba při vytváření: ${result.error || 'Neznámá chyba'}`);
      }
    } catch (error) {
      console.error('Error creating section:', error);
      alert('Chyba při vytváření sekce. Zkuste to prosím znovu.');
    }
  };

  const getCurrentEditData = () => {
    if (!editingSection) return {};
    return editingSection;
  };

  const getEditSectionType = (): 'video' | 'product' => {
    if (!editingSection) return 'video';
    return editingSection.sectionType === 'IMAGE' ? 'product' : 'video';
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

  const voodoo808 = categorySections.voodoo808 || defaultCategorySections.voodoo808;
  const spaceLove = categorySections.spaceLove || defaultCategorySections.spaceLove;
  const recreationWellness = categorySections.recreationWellness || defaultCategorySections.recreationWellness;
  const tShirtGallery = categorySections.tShirtGallery || defaultCategorySections.tShirtGallery;

  const categoryMapping: Record<number, CategorySectionData | null> = {
    0: voodoo808,
    1: null,
    2: spaceLove,
    3: tShirtGallery,
    4: recreationWellness,
  };

  const categoryKeyMapping: Record<number, 'voodoo808' | 'spaceLove' | 'recreationWellness' | 'tShirtGallery' | null> = {
    0: 'voodoo808',
    1: null,
    2: 'spaceLove',
    3: 'tShirtGallery',
    4: 'recreationWellness',
  };

  return (
    <div className="w-full">
      <VideoPromo videoUrl={videoUrl} />

      {heroSections.map((section, index) => {
        const isLastSection = index === heroSections.length - 1;
        const categoryData = categoryMapping[index] || null;
        const categoryKey = categoryKeyMapping[index] || null;

        if (section.sectionType === 'VIDEO') {
          return (
            <VideoSection 
              key={section.sectionKey}
              videoUrl={section.videoUrl || ''}
              mobileVideoUrl={section.mobileVideoUrl}
              headerText={categoryData?.title || section.headerText || ''}
              button1Text={categoryData?.button1Text || section.button1Text || ''}
              button2Text={categoryData?.button2Text || section.button2Text || ''}
              button1Link={categoryData?.button1Link || section.button1Link || ''}
              button2Link={categoryData?.button2Link || section.button2Link || ''}
              textColor={section.textColor || 'black'}
              isAdmin={isAdmin}
              onEdit={() => handleEditSection(section)}
              onEditCategory={categoryKey ? () => handleEditCategorySection(categoryKey) : undefined}
              onDelete={() => handleDeleteSection(section.sectionKey)}
              onAdd={handleAddSection}
              isLastSection={isLastSection}
              sectionId={section.sectionKey}
              showProducts={false}
            />
          );
        } else {
          return (
            <ProductShowcaseSection
              key={section.sectionKey}
              imageUrl={section.imageUrl || ''}
              mobileImageUrl={section.mobileImageUrl}
              headerText={categoryData?.title || section.headerText || ''}
              button1Text={categoryData?.button1Text || section.button1Text || ''}
              button2Text={categoryData?.button2Text || section.button2Text || ''}
              button1Link={categoryData?.button1Link || section.button1Link || ''}
              button2Link={categoryData?.button2Link || section.button2Link || ''}
              textColor={section.textColor || 'black'}
              isAdmin={isAdmin}
              onEdit={() => handleEditSection(section)}
              onDelete={() => handleDeleteSection(section.sectionKey)}
              onAdd={handleAddSection}
              isLastSection={isLastSection}
            />
          );
        }
      })}

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
          onTypeChange={handleTypeChange}
        />
      )}

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

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSectionToDelete(null);
        }}
        onConfirm={confirmDeleteSection}
        sectionKey={sectionToDelete || ''}
      />
    </div>
  );
}
