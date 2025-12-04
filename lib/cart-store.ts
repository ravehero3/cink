import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  size: string;
  quantity: number;
  price: number;
  image: string;
  color: string;
}

interface CartStore {
  items: CartItem[];
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  getItem: (productId: string, size: string) => CartItem | undefined;
}

const safeStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(name);
    } catch {
      try {
        return sessionStorage.getItem(name);
      } catch {
        return null;
      }
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(name, value);
    } catch {
      try {
        sessionStorage.setItem(name, value);
      } catch {
      }
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(name);
    } catch {
      try {
        sessionStorage.removeItem(name);
      } catch {
      }
    }
  },
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find(
          (i) => i.productId === item.productId && i.size === item.size
        );

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.productId === item.productId && i.size === item.size
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...items, item] });
        }
      },

      removeItem: (productId, size) => {
        set({
          items: get().items.filter(
            (i) => !(i.productId === productId && i.size === size)
          ),
        });
      },

      updateQuantity: (productId, size, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size);
        } else {
          set({
            items: get().items.map((i) =>
              i.productId === productId && i.size === size
                ? { ...i, quantity }
                : i
            ),
          });
        }
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      getItem: (productId, size) => {
        return get().items.find(
          (i) => i.productId === productId && i.size === size
        );
      },
    }),
    {
      name: 'ufo-cart-storage',
      storage: createJSONStorage(() => safeStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export const useCartHydration = () => {
  return useCartStore((state) => state._hasHydrated);
};
