import { create } from 'zustand';

interface SearchBarState {
  isVisible: boolean;
  showSearchIcon: boolean;
  setVisible: (visible: boolean) => void;
  setShowSearchIcon: (show: boolean) => void;
  openSearchBar: () => void;
}

export const useSearchBarStore = create<SearchBarState>((set) => ({
  isVisible: true,
  showSearchIcon: false,
  setVisible: (visible) => set({ isVisible: visible }),
  setShowSearchIcon: (show) => set({ showSearchIcon: show }),
  openSearchBar: () => set({ isVisible: true, showSearchIcon: false }),
}));
