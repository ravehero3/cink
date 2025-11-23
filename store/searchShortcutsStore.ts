import { create } from 'zustand';

interface SearchShortcut {
  text: string;
}

interface SearchShortcutsState {
  shortcuts: SearchShortcut[];
  updateShortcuts: (shortcuts: SearchShortcut[]) => void;
}

export const useSearchShortcutsStore = create<SearchShortcutsState>((set) => ({
  shortcuts: [
    { text: 'TRIKO' },
    { text: 'MIKINA' },
  ],
  updateShortcuts: (shortcuts) => set({ shortcuts }),
}));
