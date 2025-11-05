import { create } from 'zustand';

interface FilterState {
  colors: string[];
  sizes: string[];
  isOpen: boolean;
  toggleColor: (color: string) => void;
  toggleSize: (size: string) => void;
  reset: () => void;
  open: () => void;
  close: () => void;
  apply: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  colors: [],
  sizes: [],
  isOpen: false,
  toggleColor: (color) =>
    set((state) => ({
      colors: state.colors.includes(color)
        ? state.colors.filter((c) => c !== color)
        : [...state.colors, color],
    })),
  toggleSize: (size) =>
    set((state) => ({
      sizes: state.sizes.includes(size)
        ? state.sizes.filter((s) => s !== size)
        : [...state.sizes, size],
    })),
  reset: () => set({ colors: [], sizes: [] }),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  apply: () => set({ isOpen: false }),
}));
