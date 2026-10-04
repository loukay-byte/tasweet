import { CategoryIcon } from "@/components/CategoryIcon";
import type { Category } from "@/lib/topics-shared";

// Category label with its icon. "band" is for use on the teal hero band.
export function CategoryChip({
  category,
  label,
  tone = "card",
}: {
  category: Category;
  label: string;
  tone?: "card" | "band";
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        tone === "band" ? "border border-band-foreground/25 bg-band-foreground/10" : "bg-yes/10 text-yes"
      }`}
    >
      <CategoryIcon category={category} className="size-3.5" />
      {label}
    </span>
  );
}

export function StatusChip({ label, live }: { label: string; live: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-band-foreground/25 bg-band-foreground/10 px-2.5 py-0.5 text-xs font-medium">
      {live && <span className="size-1.5 rounded-full bg-live" />}
      {label}
    </span>
  );
}
