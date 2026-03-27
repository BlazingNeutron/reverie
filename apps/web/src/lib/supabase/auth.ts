import logger from "../logger/logger";
import { supabase } from "./client";

export async function ensureSession() {
  logger.debug("[ensureSession] Starting session check...");

  const { data, error } = await supabase.auth.getSession();

  if (error || !data) {
    logger.error("[ensureSession] Error:", error);
    return null;
  }

  const session = data.session;

  logger.debug("[ensureSession] Session check result:", {
    hasSession: !!session,
    userId: session?.user?.id,
    error,
    tokenPreview: session?.access_token?.substring(0, 20) + "...",
  });

  return session;
}
