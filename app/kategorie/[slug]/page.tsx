'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import SearchBar from '@/components/SearchBar';
import CategoryHero from '@/components/CategoryHero';
import ControlBar from '@/components/ControlBar';
import ProductsGrid from '@/components/ProductsGrid';
import FilterWindow from '@/components/FilterWindow';
import SortPanel from '@/components/SortPanel';
import { useFilterStore } from '@/lib/filter-store';
import { useSortPanelStore } from '@/lib/sort-panel-store';
import { useSearchBarStore } from '@/lib/search-bar-store';
import { useSavedProductsStore } from '@/lib/saved-products-store';
import { Upload, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  videoUrl?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  color: string;
  sizes: Record<string, number>;
  colorCount?: number;
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: session } = useSession();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategoryProducts, setAllCategoryProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentSort, setCurrentSort] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [savedProducts, setSavedProducts] = useState<string[]>([]);

  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { colors, sizes } = useFilterStore();
  const { selectedSort } = useSortPanelStore();
  const { setVisible, setShowSearchIcon } = useSearchBarStore();

  const isAdmin = session?.user?.role === 'ADMIN';

  // Sync selectedSort from store to currentSort
  useEffect(() => {
    setCurrentSort(selectedSort);
  }, [selectedSort]);

  // Initialize search bar on mount, cleanup on unmount
  useEffect(() => {
    setVisible(true);
    setShowSearchIcon(false);
    
    return () => {
      setVisible(false);
      setShowSearchIcon(false);
    };
  }, [setVisible, setShowSearchIcon]);

  useEffect(() => {
    fetchCategory();
  }, [slug]);

  useEffect(() => {
    if (category) {
      fetchAllCategoryProducts();
    }
  }, [category]);

  // Load saved products from database (if authenticated) or Zustand (if not)
  useEffect(() => {
    const loadSavedProducts = async () => {
      if (session?.user) {
        // Authenticated: fetch from database
        try {
          const response = await fetch('/api/saved-products');
          if (response.ok) {
            const data = await response.json();
            const savedIds = data.map((product: any) => product.id);
            setSavedProducts(savedIds);
          }
        } catch (error) {
          console.error('[kategorie] Error fetching saved products:', error);
        }
      } else if (session === null) {
        // Only set from Zustand when we're sure not authenticated (status !== loading)
        const zustandSavedIds = useSavedProductsStore.getState().savedIds;
        setSavedProducts(zustandSavedIds);
      }
    };
    
    loadSavedProducts();
  }, [session]);

  useEffect(() => {
    if (category && allCategoryProducts.length > 0) {
      fetchProducts();
    }
  }, [category, allCategoryProducts, colors, sizes, currentSort]);

  const fetchCategory = async () => {
    try {
      const response = await fetch('/api/categories');
      const categories = await response.json();
      if (Array.isArray(categories)) {
        const found = categories.find((cat: Category) => cat.slug === slug);
        setCategory(found || null);
      }
    } catch (error) {
      console.error('Error fetching category:', error);
    }
  };

  // Fetch all category products to calculate color counts
  const fetchAllCategoryProducts = async () => {
    if (!category) return;
    
    try {
      const response = await fetch(`/api/products?category=${category.name}&limit=1000`);
      const data = await response.json();
      console.log('fetchAllCategoryProducts data:', data);
      setAllCategoryProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching all category products:', error);
      setAllCategoryProducts([]);
    }
  };

  // Calculate color count for each product based on product name
  const calculateColorCounts = (products: Product[]): Product[] => {
    if (allCategoryProducts.length === 0) return products;

    return products.map(product => {
      // Count unique colors for products with the same name
      const sameNameProducts = allCategoryProducts.filter(p => p.name === product.name);
      const uniqueColors = new Set(sameNameProducts.map(p => p.color));
      
      return {
        ...product,
        colorCount: uniqueColors.size,
      };
    });
  };

  const fetchProducts = async () => {
    if (!category) {
      console.log('fetchProducts: no category, returning');
      return;
    }
    
    console.log('fetchProducts called, category:', category.name);
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        category: category.name,
        sort: currentSort,
      });

      if (colors.length > 0) {
        colors.forEach(color => params.append('color', color));
      }

      if (sizes.length > 0) {
        sizes.forEach(size => params.append('size', size));
      }

      console.log('fetchProducts: about to fetch with URL:', `/api/products?${params.toString()}`);
      const response = await fetch(`/api/products?${params.toString()}`);
      console.log('fetchProducts: fetch response received, status:', response.status);
      const data = await response.json();
      console.log('fetchProducts data:', data);
      
      console.log('fetchProducts: about to calculate color counts, allCategoryProducts length:', allCategoryProducts.length);
      const productsWithColorCount = calculateColorCounts(data.products || []);
      console.log('productsWithColorCount:', productsWithColorCount);
      console.log('fetchProducts: about to set products state');
      setProducts(productsWithColorCount);
      setTotalProducts(data.total || 0);
      console.log('fetchProducts: state updated');
    } catch (error) {
      console.error('ERROR in fetchProducts:', error);
      setProducts([]);
      setTotalProducts(0);
    } finally {
      console.log('fetchProducts: Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const handleToggleSave = async (productId: string) => {
    console.log('[handleToggleSave] Called with:', { productId, authenticated: !!session?.user, userEmail: session?.user?.email });
    const isSaved = savedProducts.includes(productId);
    
    // Update local state immediately for UI feedback
    setSavedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    
    // Update Zustand store
    if (isSaved) {
      useSavedProductsStore.getState().removeProduct(productId);
    } else {
      useSavedProductsStore.getState().addProduct(productId);
    }
    
    // If authenticated, sync with database
    if (session?.user) {
      console.log('[handleToggleSave] User is authenticated, syncing to database...');
      try {
        const url = isSaved 
          ? `/api/saved-products?productId=${productId}`
          : '/api/saved-products';
        const method = isSaved ? 'DELETE' : 'POST';
        const body = isSaved ? undefined : JSON.stringify({ productId });
        
        console.log('[handleToggleSave] Making API call:', { url, method, body });
        const response = await fetch(url, {
          method,
          headers: body ? { 'Content-Type': 'application/json' } : {},
          body,
        });
        const responseText = await response.text();
        console.log('[handleToggleSave] API response:', { status: response.status, body: responseText });
      } catch (error) {
        console.error('[handleToggleSave] Error syncing saved product:', error);
      }
    } else {
      console.log('[handleToggleSave] User NOT authenticated - skipping database sync');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleMediaUpload = async () => {
    if (!selectedFile || !category) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', category.name);

      const uploadResponse = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadData = await uploadResponse.json();
      const mediaUrl = uploadData.media.url;

      const updateResponse = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl: mediaUrl,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Category update failed');
      }

      const updatedCategory = await updateResponse.json();
      setCategory(updatedCategory);
      setShowMediaModal(false);
      setSelectedFile(null);
      alert('Médium bylo úspěšně nahráno a kategorie aktualizována');
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Chyba při nahrávání média');
    } finally {
      setIsUploading(false);
    }
  };

  if (!category) {
    return (
      <div className="relative" style={{ paddingTop: '69px' }}>
        <p className="text-product-name animate-pulse-color absolute left-1/2 transform -translate-x-1/2">Načítání...</p>
      </div>
    );
  }

  return (
    <div>
      <SearchBar />
      <div className="relative">
        <CategoryHero title={category.name} imageUrl={category.videoUrl} />
        {isAdmin && (
          <button
            onClick={() => setShowMediaModal(true)}
            className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-white border border-black hover:bg-black hover:text-white transition-colors z-10"
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '12px',
              fontWeight: 400,
            }}
          >
            <Upload size={14} />
            Upravit médium
          </button>
        )}
      </div>
      <ControlBar
        productCount={totalProducts}
        currentSort={currentSort}
        onSortChange={setCurrentSort}
      />
      
      {isLoading ? (
        <div className="relative" style={{ paddingTop: '69px' }}>
          <p className="text-product-name animate-pulse-color absolute left-1/2 transform -translate-x-1/2">Načítání...</p>
        </div>
      ) : (
        <ProductsGrid
          products={products}
          savedProducts={savedProducts}
          onToggleSave={handleToggleSave}
        />
      )}

      <FilterWindow />
      <SortPanel />

      {showMediaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 max-w-md w-full border border-black">
            <div className="flex justify-between items-center mb-6">
              <h2 
                style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '20px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                Nahrát médium
              </h2>
              <button 
                onClick={() => {
                  setShowMediaModal(false);
                  setSelectedFile(null);
                }}
                className="hover:bg-gray-100 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm mb-2 text-gray-600">
                Doporučené rozlišení pro obrázky: 1920x960px (16:9)
              </p>
              <p className="text-sm mb-4 text-gray-600">
                Podporované formáty: JPEG, PNG, WebP, GIF, MP4, WebM
              </p>

              <input
                type="file"
                onChange={handleFileSelect}
                accept="image/*,video/*"
                className="w-full border border-black p-2 mb-2"
              />

              {selectedFile && (
                <p className="text-sm text-gray-700 mb-4">
                  Vybraný soubor: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleMediaUpload}
                disabled={!selectedFile || isUploading}
                className="flex-1 bg-black text-white px-4 py-3 hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                {isUploading ? 'Nahrávání...' : 'Nahrát'}
              </button>
              <button
                onClick={() => {
                  setShowMediaModal(false);
                  setSelectedFile(null);
                }}
                disabled={isUploading}
                className="flex-1 bg-white text-black px-4 py-3 border border-black hover:bg-gray-100 transition-colors disabled:opacity-50"
                style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                Zrušit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
