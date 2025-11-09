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
    { text: 'dárek pro ní', link: '/kategorie/space-love' },
    { text: 'dárek pro něj', link: '/kategorie/voodoo808' },
  ],
  updateShortcuts: (shortcuts) => set({ shortcuts }),
}));
