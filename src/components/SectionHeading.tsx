import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export function SectionHeading({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4">
      <h2 className="text-xl font-bold">{title}</h2>
      {href && linkLabel && (
        <Link href={href} className="inline-flex items-center gap-1 text-sm text-yes hover:underline">
          {linkLabel}
          <ChevronLeft className="size-4 ltr:-scale-x-100" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
