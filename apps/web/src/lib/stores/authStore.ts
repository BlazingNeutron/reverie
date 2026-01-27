import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';

type AuthState = {
    user: User | null
    session: Session | null
    loading: boolean
    setAuth: (session: Session | null) => void
    setLoading: (loading: boolean) => void
    clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    loading: true,
    setAuth: (session) =>
        set({
            session,
            user: session?.user ?? null,
            loading: false,
        }),
    setLoading: (loading) => set({ loading }),
    clearAuth: () =>
        set({
            user: null,
            session: null,
            loading: false,
        }),
}))