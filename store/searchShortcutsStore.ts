import { create } from 'zustand';

interface SearchShortcut {
  text: string;
  link: string;
}

interface SearchShortcutsState {
  shortcuts: SearchShortcut[];
  updateShortcuts: (shortcuts: SearchShortcut[]) => void;
}

export const useSearchShortcutsStore = create<SearchShortcutsState>((set) => ({
  shortcuts: [
    { text: 'TRIKO', link: '/vyhledavani?search=triko' },
    { text: 'MIKINA', link: '/vyhledavani?search=mikina' },
  ],
  updateShortcuts: (shortcuts) => set({ shortcuts }),
}));
