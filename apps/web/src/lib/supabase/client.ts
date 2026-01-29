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

if (!supabasePublishableKey) {
  // eslint-disable-next-line no-console
  console.warn('Supabase publishable key not found at runtime or build-time.');
}

export const supabase = createClient(baseUrl, supabasePublishableKey ?? '');