import { createClient } from "@supabase/supabase-js";
import logger from "../logger/logger";

let publishableKey = "";
try {
  const response = await fetch("/api/v1/supabase/keys", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  const content = await response.json();
  publishableKey = content.keys.publishableKey;
} catch (err: any) {
  logger.error("[LoadKey] Error loading supabase publishableKey", err);
}

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
