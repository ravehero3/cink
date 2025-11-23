'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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

function SearchPageContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const searchQuery = searchParams.get('search') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentSort, setCurrentSort] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [savedProducts, setSavedProducts] = useState<string[]>([]);

  const { colors, sizes } = useFilterStore();
  const { selectedSort } = useSortPanelStore();
  const { setVisible, setShowSearchIcon } = useSearchBarStore();

  // Get page title from search query
  const pageTitle = searchQuery ? searchQuery.toUpperCase() : 'VYHLEDÁVÁNÍ';

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

  // Load saved products from database (if authenticated) or Zustand (if not)
  useEffect(() => {
    const loadSavedProducts = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/saved-products');
          if (response.ok) {
            const data = await response.json();
            const savedIds = data.map((product: any) => product.id);
            setSavedProducts(savedIds);
          }
        } catch (error) {
          console.error('[vyhledavani] Error fetching saved products:', error);
        }
      } else if (session === null) {
        const zustandSavedIds = useSavedProductsStore.getState().savedIds;
        setSavedProducts(zustandSavedIds);
      }
    };
    
    loadSavedProducts();
  }, [session]);

  // Fetch all products for search query
  useEffect(() => {
    const fetchAllProducts = async () => {
      if (!searchQuery) {
        setAllProducts([]);
        return;
      }
      
      try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=1000`);
        const data = await response.json();
        setAllProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching all products:', error);
        setAllProducts([]);
      }
    };

    fetchAllProducts();
  }, [searchQuery]);

  // Calculate color count for each product
  const calculateColorCounts = (products: Product[]): Product[] => {
    if (allProducts.length === 0) return products;

    return products.map(product => {
      const sameNameProducts = allProducts.filter(p => p.name === product.name);
      const uniqueColors = new Set(sameNameProducts.map(p => p.color));
      
      return {
        ...product,
        colorCount: uniqueColors.size,
      };
    });
  };

  // Fetch products based on filters and sort
  useEffect(() => {
    const fetchProducts = async () => {
      if (!searchQuery) {
        setProducts([]);
        setTotalProducts(0);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          search: searchQuery,
          sort: currentSort,
        });

        if (colors.length > 0) {
          colors.forEach(color => params.append('color', color));
        }

        if (sizes.length > 0) {
          sizes.forEach(size => params.append('size', size));
        }

        const response = await fetch(`/api/products?${params.toString()}`);
        const data = await response.json();
        
        const productsWithColorCount = calculateColorCounts(data.products || []);
        setProducts(productsWithColorCount);
        setTotalProducts(data.total || 0);
      } catch (error) {
        console.error('ERROR in fetchProducts:', error);
        setProducts([]);
        setTotalProducts(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, colors, sizes, currentSort, allProducts]);

  const handleToggleSave = async (productId: string) => {
    const isSaved = savedProducts.includes(productId);
    
    setSavedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    
    if (isSaved) {
      useSavedProductsStore.getState().removeProduct(productId);
    } else {
      useSavedProductsStore.getState().addProduct(productId);
    }
    
    if (session?.user) {
      try {
        const url = isSaved 
          ? `/api/saved-products?productId=${productId}`
          : '/api/saved-products';
        const method = isSaved ? 'DELETE' : 'POST';
        const body = isSaved ? undefined : JSON.stringify({ productId });
        
        await fetch(url, {
          method,
          headers: body ? { 'Content-Type': 'application/json' } : {},
          body,
        });
      } catch (error) {
        console.error('[handleToggleSave] Error syncing saved product:', error);
      }
    }
  };

  if (!searchQuery) {
    return (
      <div className="relative" style={{ paddingTop: '69px' }}>
        <p className="text-product-name animate-pulse-color absolute left-1/2 transform -translate-x-1/2">Zadejte vyhledávací pojem...</p>
      </div>
    );
  }

  return (
    <div>
      <SearchBar />
      <CategoryHero title={pageTitle} imageUrl={undefined} />
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
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ paddingTop: '69px' }}>Načítání...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
