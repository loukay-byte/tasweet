import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Confirms the deployment is up and can reach Supabase.
export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ ok: true, supabase: "not_configured" });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("topics").select("id", { count: "exact", head: true });

  return NextResponse.json(
    { ok: !error, supabase: error ? "error" : "connected" },
    { status: error ? 503 : 200 },
  );
}
