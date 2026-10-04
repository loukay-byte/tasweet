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
  // On the large bar, the leading side gets the larger figure.
  const figure = (leading: boolean) => (lg ? (leading ? "text-5xl" : "text-3xl text-muted") : "text-base");

  return (
    <div className={lg ? "space-y-3" : "space-y-1.5"}>
      {resolved && (
        <div className="flex items-end justify-between gap-4">
          <span className={`font-bold tabular-nums leading-none ${figure(a >= 50)}`}>
            {formatNumber(lang, a)}%
          </span>
          <span className={`font-bold tabular-nums leading-none ${figure(a < 50)}`}>
            {formatNumber(lang, 100 - a)}%
          </span>
        </div>
      )}
      <div
        className={`flex overflow-hidden rounded-full ${lg ? "h-4" : "h-2"}`}
        role="img"
        aria-label={resolved && labelA && labelB ? `${labelA} ${a}%, ${labelB} ${100 - a}%` : undefined}
      >
        <span
          className={`h-full transition-[width] duration-1000 ease-out ${resolved ? "bg-yes" : "bg-undecided"}`}
          style={{ width: `${a}%` }}
        />
        <span className="h-full w-[3px] shrink-0 bg-surface" />
        <span className={`h-full flex-1 ${resolved ? "bg-no" : "bg-undecided"}`} />
      </div>
      {(labelA || labelB) && (
        <div className={`flex justify-between gap-4 ${lg ? "text-base" : "text-sm"}`}>
          <span className="flex flex-wrap items-center gap-2">
            <span className={lg ? "font-medium" : ""}>{labelA}</span>
            {mine === "a" && mineLabel && <MineTag label={mineLabel} choice="a" />}
          </span>
          <span className="flex flex-wrap items-center justify-end gap-2 text-end">
            {mine === "b" && mineLabel && <MineTag label={mineLabel} choice="b" />}
            <span className={lg ? "font-medium" : "text-muted"}>{labelB}</span>
          </span>
        </div>
      )}
    </div>
  );
}

function MineTag({ label, choice }: { label: string; choice: "a" | "b" }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 text-xs leading-5">
      <span className={`size-2 rounded-full ${choice === "a" ? "bg-yes" : "bg-no"}`} />
      {label}
    </span>
  );
}
