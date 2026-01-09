import { create } from 'zustand';

interface DocState {
    currentDocId: string | null;
    setCurrentDocId: (id: string) => void;
}

export const useDocStore = create<DocState>((set) => ({
    currentDocId: null,
    setCurrentDocId: (id: string) => set({ currentDocId: id }),
}));