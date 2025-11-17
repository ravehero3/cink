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
    { text: 'Dárek Pro Ní', link: '/kategorie/space-love' },
    { text: 'Dárek Pro Něj', link: '/kategorie/voodoo808' },
  ],
  updateShortcuts: (shortcuts) => set({ shortcuts }),
}));
