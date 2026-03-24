import { useEffect } from "react";
import { supabase } from "../supabase/client";
import { useAuthStore } from "../stores/authStore";
import logger from "../logger/logger";

export function useAuthListener() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    let mounted = true;
    if (mounted) setLoading(true);

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        if (session) {
          setAuth(session);
        } else {
          clearAuth();
        }
        if (mounted) setLoading(false);
      })
      .catch((error) => {
        logger.error("[useAuthListener] Session check failed:", error);
        if (mounted) {
          setLoading(false);
          clearAuth();
        }
      });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setAuth(session);
      else clearAuth();
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);
}
