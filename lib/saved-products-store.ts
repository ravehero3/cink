import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SavedProductsStore {
  savedIds: string[];
  addProduct: (id: string) => void;
  removeProduct: (id: string) => void;
  isSaved: (id: string) => boolean;
  getCount: () => number;
}

export const useSavedProductsStore = create<SavedProductsStore>()(
  persist(
    (set, get) => ({
      savedIds: [],

      addProduct: (id) => {
        const savedIds = get().savedIds;
        if (!savedIds.includes(id)) {
          set({ savedIds: [...savedIds, id] });
        }
      },

      removeProduct: (id) => {
        set({ savedIds: get().savedIds.filter((savedId) => savedId !== id) });
      },

      isSaved: (id) => {
        return get().savedIds.includes(id);
      },

      getCount: () => {
        return get().savedIds.length;
      },
    }),
    {
      name: 'ufo-saved-products',
    }
  )
);
