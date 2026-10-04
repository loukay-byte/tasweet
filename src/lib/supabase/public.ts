import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { supabaseAnonKey, supabaseUrl } from "./env";

// Cookie-less client for public, cacheable reads (topic pages, homepage).
// Returns null when Supabase isn't configured so pages still render.
export function createPublicClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
