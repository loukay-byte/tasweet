"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";

type Labels = { home: string; explore: string; results: string };

// Desktop counterpart of the bottom tab bar.
export function HeaderLinks({ lang, labels }: { lang: Locale; labels: Labels }) {
  const pathname = usePathname();
  const links = [
    { href: `/${lang}`, label: labels.home, active: pathname === `/${lang}` },
    { href: `/${lang}/explore`, label: labels.explore, active: pathname.startsWith(`/${lang}/explore`) },
    { href: `/${lang}/results`, label: labels.results, active: pathname.startsWith(`/${lang}/results`) },
  ];
  return (
    <ul className="hidden items-center gap-6 text-sm md:flex">
      {links.map((l) => (
        <li key={l.href}>
          <Link
            href={l.href}
            aria-current={l.active ? "page" : undefined}
            className={l.active ? "font-bold text-foreground" : "text-muted hover:text-foreground"}
          >
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
