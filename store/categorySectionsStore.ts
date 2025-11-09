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
        button1Link: '/kategorie/voodoo808',
        button2Link: '/kategorie/voodoo808',
      },
      spaceLove: {
        title: 'SPACE LOVE',
        button1Text: 'Nakupovat',
        button2Text: 'Zobrazit vše',
        button1Link: '/kategorie/space-love',
        button2Link: '/kategorie/space-love',
      },
      recreationWellness: {
        title: 'RECREATION WELLNESS',
        button1Text: 'Nakupovat',
        button2Text: 'Zobrazit vše',
        button1Link: '/kategorie/recreation-wellness',
        button2Link: '/kategorie/recreation-wellness',
      },
      tShirtGallery: {
        title: 'T SHIRT GALLERY',
        button1Text: 'Nakupovat',
        button2Text: 'Zobrazit vše',
        button1Link: '/kategorie/t-shirt-gallery',
        button2Link: '/kategorie/t-shirt-gallery',
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
