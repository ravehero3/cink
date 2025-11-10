import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VideoSectionData {
  videoUrl: string;
  headerText?: string;
  button1Text?: string;
  button2Text?: string;
  button1Link?: string;
  button2Link?: string;
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
  section4: VideoSectionData;
  section5: ProductSectionData;
  updateSection1: (data: VideoSectionData) => void;
  updateSection2: (data: VideoSectionData) => void;
  updateSection3: (data: ProductSectionData) => void;
  updateSection4: (data: VideoSectionData) => void;
  updateSection5: (data: ProductSectionData) => void;
}

export const useHeroSectionsStore = create<HeroSectionsState>()(
  persist(
    (set) => ({
      section1: {
        videoUrl: '',
        headerText: '',
        button1Text: '',
        button2Text: '',
        button1Link: '',
        button2Link: '',
      },
      section2: {
        videoUrl: '',
        headerText: '',
        button1Text: '',
        button2Text: '',
        button1Link: '',
        button2Link: '',
      },
      section3: {
        imageUrl: '',
        headerText: 'TRIKA',
        button1Text: 'Shop Now',
        button2Text: 'View Collection',
        button1Link: '/kategorie/voodoo808',
        button2Link: '/kategorie/space-love',
      },
      section4: {
        videoUrl: '',
        headerText: '',
        button1Text: '',
        button2Text: '',
        button1Link: '',
        button2Link: '',
      },
      section5: {
        imageUrl: '',
        headerText: '',
        button1Text: '',
        button2Text: '',
        button1Link: '',
        button2Link: '',
      },
      updateSection1: (data) => set({ section1: data }),
      updateSection2: (data) => set({ section2: data }),
      updateSection3: (data) => set({ section3: data }),
      updateSection4: (data) => set({ section4: data }),
      updateSection5: (data) => set({ section5: data }),
    }),
    {
      name: 'hero-sections-storage',
    }
  )
);
