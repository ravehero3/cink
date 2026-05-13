'use client';

import { useEffect, useState } from 'react';
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

export default function AllProductsClientPage() {
  const { data: session } = useSession();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentSort, setCurrentSort] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [savedProducts, setSavedProducts] = useState<string[]>([]);

  const { colors, sizes } = useFilterStore();
  const { selectedSort } = useSortPanelStore();
  const { setVisible, setShowSearchIcon } = useSearchBarStore();

  useEffect(() => {
    setCurrentSort(selectedSort);
  }, [selectedSort]);

  useEffect(() => {
    setVisible(true);
    setShowSearchIcon(false);
    
    return () => {
      setVisible(false);
      setShowSearchIcon(false);
    };
  }, [setVisible, setShowSearchIcon]);

  useEffect(() => {
    fetchAllProducts();
  }, []);

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
        }
      } else if (session === null) {
        const zustandSavedIds = useSavedProductsStore.getState().savedIds;
        setSavedProducts(zustandSavedIds);
      }
    };
    
    loadSavedProducts();
  }, [session]);

  useEffect(() => {
    fetchFilteredProducts();
  }, [colors, sizes, currentSort]);

  const fetchAllProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=100');
      const data = await response.json();
      setAllProducts(data.products || []);
    } catch (error) {
      setAllProducts([]);
    }
  };

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

  const fetchFilteredProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        sort: currentSort,
        limit: '100',
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
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setIsLoading(false);
    }
  };

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
      }
    }
  };

  return (
    <div>
      <SearchBar />
      <div className="relative">
        <CategoryHero title="VŠECHNY PRODUKTY" imageUrl="" />
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
    </div>
  );
}
