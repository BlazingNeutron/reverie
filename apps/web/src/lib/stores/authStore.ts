import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";
import logger from "../logger/logger";

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  setAuth: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  setAuth: (session) => {
    logger.debug("[Auth Store] Setting auth:", {
      hasSession: !!session,
      userId: session?.user?.id,
    });
    set({
      session,
      user: session?.user ?? null,
      loading: false,
    });
  },
  setLoading: (loading) => {
    logger.debug("[Auth Store] Loading state:", loading);
    set({ loading });
  },
  clearAuth: () => {
    logger.debug("[Auth Store] Clearing auth");
    set({
      user: null,
      session: null,
      loading: false,
    });
  },
}));
