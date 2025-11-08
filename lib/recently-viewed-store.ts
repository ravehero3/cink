import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RecentlyViewedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  viewedAt: number;
}

interface RecentlyViewedStore {
  products: RecentlyViewedProduct[];
  addProduct: (product: Omit<RecentlyViewedProduct, 'viewedAt'>) => void;
  getRecentProducts: (limit?: number) => RecentlyViewedProduct[];
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set, get) => ({
      products: [],

      addProduct: (product) => {
        const products = get().products;
        const existingIndex = products.findIndex((p) => p.id === product.id);
        
        const newProduct = {
          ...product,
          viewedAt: Date.now(),
        };

        let updatedProducts;
        if (existingIndex >= 0) {
          updatedProducts = products.filter((p) => p.id !== product.id);
          updatedProducts.unshift(newProduct);
        } else {
          updatedProducts = [newProduct, ...products].slice(0, 20);
        }

        set({ products: updatedProducts });
      },

      getRecentProducts: (limit = 4) => {
        return get().products.slice(0, limit);
      },
    }),
    {
      name: 'ufo-recently-viewed',
    }
  )
);
