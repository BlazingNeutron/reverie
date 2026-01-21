import { create } from 'zustand';

export type DocStore = {
    currentDocId: string | null;
    setCurrentDocId: (id: string) => void;
}

export const useDocStore = create<DocStore>((set) => ({
    currentDocId: null,
    setCurrentDocId: (id: string) => set({ currentDocId: id }),
}));