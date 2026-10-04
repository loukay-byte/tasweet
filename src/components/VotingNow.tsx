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
    <p className="inline-flex items-center gap-2 text-xs text-band-foreground/85">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-live opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-live" />
      </span>
      {fill(label, { count: formatNumber(lang, count) })}
    </p>
  );
}
