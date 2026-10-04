"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { navTabs } from "./BottomNav";

// Desktop counterpart of the bottom tab bar.
export function HeaderLinks({ lang, labels }: { lang: Locale; labels: Dictionary["nav"] }) {
  const pathname = usePathname();
  return (
    <ul className="hidden items-center gap-6 text-sm md:flex">
      {navTabs(lang, labels).map(({ href, label, match }) => {
        const active = match(pathname);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={active ? "font-bold" : "text-band-foreground/75 hover:text-band-foreground"}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
