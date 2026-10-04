import { formatNumber, type Locale } from "@/i18n/config";

type Props = {
  lang: Locale;
  // Share of option A, 0–100. null draws an even, unresolved split.
  pctA: number | null;
  labelA?: string;
  labelB?: string;
  size?: "sm" | "lg";
  mine?: "a" | "b" | null;
  mineLabel?: string;
};

// One bar split in two at the seam. Option A grows from the start side
// (right in Arabic, left in English), option B from the end.
export function SplitBar({ lang, pctA, labelA, labelB, size = "sm", mine, mineLabel }: Props) {
  const resolved = pctA !== null;
  const a = resolved ? pctA : 50;
  const lg = size === "lg";

  return (
    <div className={lg ? "space-y-3" : "space-y-1.5"}>
      {resolved && (
        <div className="flex items-end justify-between gap-4">
          <span className={`font-display font-bold tabular-nums leading-none ${lg ? "text-5xl" : "text-base"}`}>
            {formatNumber(lang, a)}%
          </span>
          <span
            className={`font-display font-bold tabular-nums leading-none text-muted ${lg ? "text-3xl" : "text-base"}`}
          >
            {formatNumber(lang, 100 - a)}%
          </span>
        </div>
      )}
      <div
        className={`flex overflow-hidden rounded-full ${lg ? "h-4" : "h-2"} ${resolved ? "" : "opacity-40"}`}
        role="img"
        aria-label={resolved && labelA && labelB ? `${labelA} ${a}%, ${labelB} ${100 - a}%` : undefined}
      >
        <span className="h-full bg-accent transition-[width] duration-1000 ease-out" style={{ width: `${a}%` }} />
        <span className="h-full w-[3px] shrink-0 bg-background" />
        <span className="h-full flex-1 bg-chart-b" />
      </div>
      {(labelA || labelB) && (
        <div className={`flex justify-between gap-4 ${lg ? "text-base" : "text-sm"}`}>
          <span className="flex flex-wrap items-center gap-2">
            <span className={lg ? "font-medium" : ""}>{labelA}</span>
            {mine === "a" && mineLabel && <MineTag label={mineLabel} />}
          </span>
          <span className="flex flex-wrap items-center justify-end gap-2 text-end">
            {mine === "b" && mineLabel && <MineTag label={mineLabel} />}
            <span className={lg ? "font-medium" : "text-muted"}>{labelB}</span>
          </span>
        </div>
      )}
    </div>
  );
}

function MineTag({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-accent px-2 text-xs leading-5 text-accent">{label}</span>
  );
}
