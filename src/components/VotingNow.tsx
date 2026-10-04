"use client";

import { useEffect, useState } from "react";
import { fill, formatNumber, type Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/client";

const POLL_MS = 30_000;

export function VotingNow({ lang, initial, label }: { lang: Locale; initial: number; label: string }) {
  const [count, setCount] = useState(initial);

  useEffect(() => {
    const supabase = createClient();
    const refresh = async () => {
      if (document.visibilityState !== "visible") return;
      const { data } = await supabase.rpc("voting_now");
      if (typeof data === "number") setCount(data);
    };
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-accent" />
      </span>
      {fill(label, { count: formatNumber(lang, count) })}
    </p>
  );
}
