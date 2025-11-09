import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VideoSectionData {
  videoUrl: string;
}

interface ProductSectionData {
  imageUrl: string;
  headerText: string;
  button1Text: string;
  button2Text: string;
  button1Link: string;
  button2Link: string;
}

interface HeroSectionsState {
  section1: VideoSectionData;
  section2: VideoSectionData;
  section3: ProductSectionData;
  updateSection1: (data: VideoSectionData) => void;
  updateSection2: (data: VideoSectionData) => void;
  updateSection3: (data: ProductSectionData) => void;
}

export const useHeroSectionsStore = create<HeroSectionsState>()(
  persist(
    (set) => ({
      section1: {
        videoUrl: '',
      },
      section2: {
        videoUrl: '',
      },
      section3: {
        imageUrl: '',
        headerText: 'VÍME ŽE JSI ALIEN',
        button1Text: 'Shop Now',
        button2Text: 'View Collection',
        button1Link: '/kategorie/voodoo808',
        button2Link: '/kategorie/space-love',
      },
      updateSection1: (data) => set({ section1: data }),
      updateSection2: (data) => set({ section2: data }),
      updateSection3: (data) => set({ section3: data }),
    }),
    {
      name: 'hero-sections-storage',
    }
  )
);
