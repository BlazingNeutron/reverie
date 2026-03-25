import logger from "../logger/logger";

export async function getPublishableKey() {
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
  return publishableKey;
}
