import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SavedProductsStore {
  savedIds: string[];
  addProduct: (id: string) => void;
  removeProduct: (id: string) => void;
  isSaved: (id: string) => boolean;
  getCount: () => number;
  setSavedIds: (ids: string[]) => void;
  clearAll: () => void;
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

      setSavedIds: (ids) => {
        set({ savedIds: ids });
      },

      clearAll: () => {
        set({ savedIds: [] });
      },
    }),
    {
      name: 'ufo-saved-products',
    }
  )
);
