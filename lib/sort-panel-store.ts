import { create } from 'zustand';

interface SortPanelState {
  isOpen: boolean;
  selectedSort: string;
  tempSelectedSort: string;
  open: () => void;
  close: () => void;
  setTempSort: (sort: string) => void;
  apply: () => void;
  cancel: () => void;
}

export const useSortPanelStore = create<SortPanelState>((set) => ({
  isOpen: false,
  selectedSort: 'newest',
  tempSelectedSort: 'newest',
  open: () => set((state) => ({ isOpen: true, tempSelectedSort: state.selectedSort })),
  close: () => set({ isOpen: false }),
  setTempSort: (sort) => set({ tempSelectedSort: sort }),
  apply: () => set((state) => ({ selectedSort: state.tempSelectedSort, isOpen: false })),
  cancel: () => set((state) => ({ tempSelectedSort: state.selectedSort, isOpen: false })),
}));
