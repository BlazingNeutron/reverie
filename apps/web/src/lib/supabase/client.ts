import { createClient } from "@supabase/supabase-js";

interface ImportMetaEnv {
  VITE_SUPABASE_PUBLISHABLE_KEY: string;
  VITE_SUPABASE_BASE_URL: string;
}

declare global {
  interface ImportMeta {
    env: ImportMetaEnv;
  }
}

const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
let baseUrl = import.meta.env.VITE_SUPABASE_BASE_URL;

if (!supabasePublishableKey || supabasePublishableKey.trim() == "") {
  console.warn("Supabase publishable key not found at runtime or build-time.");
}
if (!baseUrl || baseUrl.trim() == "") {
  baseUrl = `${window.location.protocol}//${window.location.host}`;
}

export let supabase = createClient(baseUrl, supabasePublishableKey);

const {
  data: { session },
} = await supabase.auth.getSession();
if (session) {
  supabase = createClient(baseUrl, session.access_token);
}
