import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "./env";

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
