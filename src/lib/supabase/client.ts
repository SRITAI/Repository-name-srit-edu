import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== 'undefined' && !(window as any).__supabase_warned) {
      console.warn('[Supabase Client] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Running in demo / local draft mode safely.');
      (window as any).__supabase_warned = true;
    }
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export const getSupabaseBrowserClient = createClient;

