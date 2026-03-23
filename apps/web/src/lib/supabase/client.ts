import { createClient } from "@supabase/supabase-js";

const response = await fetch("/api/v1/supabase/keys", {
  method: "POST",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});
const content = await response.json();

const supabasePublishableKey = content.keys.publishableKey;
const baseUrl = `${window.location.protocol}//${window.location.host}`;

if (!supabasePublishableKey || supabasePublishableKey.trim() == "") {
  console.warn("Supabase publishable key not found at runtime or build-time.");
}
export let supabase = createClient(baseUrl, supabasePublishableKey);

const {
  data: { session },
} = await supabase.auth.getSession();
if (session) {
  supabase = createClient(baseUrl, session.access_token);
}
