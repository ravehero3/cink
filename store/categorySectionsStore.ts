import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CategorySectionData {
  title: string;
  button1Text: string;
  button2Text: string;
  button1Link: string;
  button2Link: string;
}

interface CategorySectionsState {
  voodoo808: CategorySectionData;
  spaceLove: CategorySectionData;
  recreationWellness: CategorySectionData;
  tShirtGallery: CategorySectionData;
  updateVoodoo808: (data: CategorySectionData) => void;
  updateSpaceLove: (data: CategorySectionData) => void;
  updateRecreationWellness: (data: CategorySectionData) => void;
  updateTShirtGallery: (data: CategorySectionData) => void;
}

export const useCategorySectionsStore = create<CategorySectionsState>()(
  persist(
    (set) => ({
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
      updateVoodoo808: (data) => set({ voodoo808: data }),
      updateSpaceLove: (data) => set({ spaceLove: data }),
      updateRecreationWellness: (data) => set({ recreationWellness: data }),
      updateTShirtGallery: (data) => set({ tShirtGallery: data }),
    }),
    {
      name: 'category-sections-storage',
    }
  )
);
