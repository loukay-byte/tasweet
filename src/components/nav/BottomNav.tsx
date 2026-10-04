"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { HomeIcon, ResultsIcon, SearchIcon } from "./icons";

type Labels = { home: string; explore: string; results: string };

// Phone-only tab bar for the three places people return to.
export function BottomNav({ lang, labels }: { lang: Locale; labels: Labels }) {
  const pathname = usePathname();
  const tabs = [
    { href: `/${lang}`, label: labels.home, Icon: HomeIcon, active: pathname === `/${lang}` },
    { href: `/${lang}/explore`, label: labels.explore, Icon: SearchIcon, active: pathname.startsWith(`/${lang}/explore`) },
    { href: `/${lang}/results`, label: labels.results, Icon: ResultsIcon, active: pathname.startsWith(`/${lang}/results`) },
  ];

  return (
    <nav
      aria-label={labels.home}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-3">
        {tabs.map(({ href, label, Icon, active }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={`relative flex flex-col items-center gap-1 py-2.5 text-xs ${
                active ? "font-bold text-accent" : "text-muted"
              }`}
            >
              {active && <span className="absolute inset-x-8 top-0 h-0.5 rounded-full bg-accent" />}
              <Icon className="size-6" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
