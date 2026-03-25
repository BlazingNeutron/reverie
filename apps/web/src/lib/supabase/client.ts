import { createClient } from "@supabase/supabase-js";
import logger from "../logger/logger";
import { getPublishableKey } from "./keys";

const publishableKey = await getPublishableKey();

const baseUrl = `${window.location.protocol}//${window.location.host}`;

if (!publishableKey || publishableKey.trim() == "") {
  logger.warn("Supabase publishable key not found at runtime or build-time.");
}
logger.log("Creating client...", baseUrl, publishableKey);
export const supabase = createClient(baseUrl, publishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
