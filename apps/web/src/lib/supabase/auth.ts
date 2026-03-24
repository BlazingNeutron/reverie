import logger from "../logger/logger";
import { supabase } from "./client";

export async function ensureSession() {
  logger.debug("[ensureSession] Starting session check...");

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  logger.debug("[ensureSession] Session check result:", {
    hasSession: !!session,
    userId: session?.user?.id,
    error,
    tokenPreview: session?.access_token?.substring(0, 20) + "...",
  });

  if (error) {
    logger.error("[ensureSession] Error:", error);
  }

  return session;
}
