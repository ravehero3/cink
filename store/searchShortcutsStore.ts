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
    { text: 'Triko', link: '/voodoo808' },
    { text: 'Mikina', link: '/space-love' },
  ],
  updateShortcuts: (shortcuts) => set({ shortcuts }),
}));
