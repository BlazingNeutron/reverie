import { createClient } from '@supabase/supabase-js'

interface ImportMetaEnv {
  VITE_SUPABASE_PUBLISHABLE_KEY: string;
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const baseUrl = `${window.location.protocol}//${window.location.host}`;
export const supabase = createClient(baseUrl, supabasePublishableKey)