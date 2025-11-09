'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Titlebar from '@/components/Titlebar';
import VideoPromo from '@/components/VideoPromo';
import Infobar from '@/components/Infobar';
import ProductsGrid from '@/components/ProductsGrid';
import FilterWindow from '@/components/FilterWindow';
import { useFilterStore } from '@/lib/filter-store';

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
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentSort, setCurrentSort] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [savedProducts, setSavedProducts] = useState<string[]>([]);

  const { colors, sizes } = useFilterStore();

  useEffect(() => {
    fetchCategory();
  }, [slug]);

  useEffect(() => {
    if (category) {
      fetchProducts();
    }
  }, [category, colors, sizes, currentSort]);

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

  const fetchProducts = async () => {
    if (!category) return;
    
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

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();
      
      setProducts(data.products || []);
      setTotalProducts(data.total || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setTotalProducts(0);
    } finally {
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
      <div className="flex items-center justify-center h-96">
        <p className="text-product-name">Načítání...</p>
      </div>
    );
  }

  return (
    <div>
      <Titlebar title={category.name} />
      <VideoPromo videoUrl={category.videoUrl} />
      <Infobar
        productCount={totalProducts}
        currentSort={currentSort}
        onSortChange={setCurrentSort}
      />
      
      <div className="container mx-auto px-8 py-8">
        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-product-name animate-pulse-color">načítá se</p>
          </div>
        ) : (
          <ProductsGrid
            products={products}
            savedProducts={savedProducts}
            onToggleSave={handleToggleSave}
          />
        )}
      </div>

      <FilterWindow />
    </div>
  );
}
