"use client";

import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { CategoryIcon } from "@/components/CategoryIcon";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { categories } from "@/lib/topics-shared";

type Props = {
  lang: Locale;
  labels: Dictionary["menu"];
  searchPlaceholder: string;
  categoryNames: Dictionary["categories"];
};

// Side menu: search, categories, and the about pages.
export function MenuDrawer({ lang, labels, searchPlaceholder, categoryNames }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  // Close after navigating.
  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        aria-label={labels.open}
        className="-ms-2 rounded-full p-2 hover:bg-band-foreground/10"
      >
        <Menu className="size-6" aria-hidden="true" />
      </button>

      <dialog
        ref={dialog}
        aria-label={labels.title}
        onClick={(e) => e.target === dialog.current && dialog.current.close()}
        className="m-0 ms-0 h-dvh max-h-none w-[min(22rem,85vw)] max-w-none bg-background p-0 text-foreground backdrop:bg-black/40"
      >
        <div className="flex h-full flex-col gap-6 p-5">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">{labels.title}</span>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              aria-label={labels.close}
              className="-me-2 rounded-full p-2 hover:bg-surface"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <form action={`/${lang}/explore`} role="search" className="relative">
            <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              name="q"
              type="search"
              aria-label={labels.search}
              placeholder={searchPlaceholder}
              enterKeyHint="search"
              className="w-full rounded-full border border-border bg-surface py-2.5 ps-10 pe-4 outline-none focus:border-yes"
            />
          </form>

          <nav aria-label={labels.categories} className="space-y-1">
            <p className="mb-2 text-xs font-medium text-muted">{labels.categories}</p>
            {categories.map((c) => (
              <Link
                key={c}
                href={`/${lang}/explore?c=${c}`}
                className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface"
              >
                <CategoryIcon category={c} className="size-5 text-yes" />
                {categoryNames[c]}
              </Link>
            ))}
          </nav>

          <nav className="mt-auto space-y-1 border-t border-border pt-4 text-sm">
            <Link href={`/${lang}/explore`} className="block rounded-xl px-2 py-2 hover:bg-surface">
              {labels.allTopics}
            </Link>
            <Link href={`/${lang}/methodology`} className="block rounded-xl px-2 py-2 hover:bg-surface">
              {labels.methodology}
            </Link>
          </nav>
        </div>
      </dialog>
    </>
  );
}
