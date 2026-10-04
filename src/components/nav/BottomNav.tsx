"use client";

import { ChartNoAxesColumn, CirclePlus, House, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export function navTabs(lang: Locale, labels: Dictionary["nav"]) {
  return [
    { href: `/${lang}`, label: labels.home, Icon: House, match: (p: string) => p === `/${lang}` },
    { href: `/${lang}/results`, label: labels.results, Icon: ChartNoAxesColumn, match: (p: string) => p.startsWith(`/${lang}/results`) },
    { href: `/${lang}/submit`, label: labels.create, Icon: CirclePlus, match: (p: string) => p.startsWith(`/${lang}/submit`) },
    { href: `/${lang}/account`, label: labels.account, Icon: User, match: (p: string) => p.startsWith(`/${lang}/account`) },
  ];
}

// Phone tab bar for the four places people return to.
export function BottomNav({ lang, labels }: { lang: Locale; labels: Dictionary["nav"] }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label={labels.tabs}
      className="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-16px_rgb(0_0_0/0.25)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {navTabs(lang, labels).map(({ href, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 pt-3 pb-2 text-xs ${active ? "font-bold text-yes" : "text-muted"}`}
              >
                <Icon className="size-6" strokeWidth={active ? 2.25 : 1.75} fill={active ? "currentColor" : "none"} fillOpacity={0.15} aria-hidden="true" />
                {label}
                <span className={`size-1 rounded-full ${active ? "bg-yes" : "bg-transparent"}`} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
