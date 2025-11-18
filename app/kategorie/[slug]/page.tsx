'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import CategoryHero from '@/components/CategoryHero';
import ControlBar from '@/components/ControlBar';
import ProductsGrid from '@/components/ProductsGrid';
import FilterWindow from '@/components/FilterWindow';
import { useFilterStore } from '@/lib/filter-store';
import { useSearchBarStore } from '@/lib/search-bar-store';

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
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategoryProducts, setAllCategoryProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentSort, setCurrentSort] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [savedProducts, setSavedProducts] = useState<string[]>([]);

  const { colors, sizes } = useFilterStore();
  const { setVisible, setShowSearchIcon } = useSearchBarStore();

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

  const handleToggleSave = (productId: string) => {
    setSavedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  if (!category) {
    return (
      <div className="flex items-center justify-center" style={{ paddingTop: '64px' }}>
        <p className="text-product-name animate-pulse-color">Načítání...</p>
      </div>
    );
  }

  return (
    <div>
      <SearchBar />
      <CategoryHero title={category.name} imageUrl={category.videoUrl} />
      <ControlBar
        productCount={totalProducts}
        currentSort={currentSort}
        onSortChange={setCurrentSort}
      />
      
      {isLoading ? (
        <div className="text-center" style={{ paddingTop: '64px' }}>
          <p className="text-product-name animate-pulse-color">Načítání...</p>
        </div>
      ) : (
        <ProductsGrid
          products={products}
          savedProducts={savedProducts}
          onToggleSave={handleToggleSave}
        />
      )}

      <FilterWindow />
    </div>
  );
}
