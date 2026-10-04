"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";

const names: Record<Locale, string> = { ar: "العربية", en: "English" };

// Segmented toggle that keeps you on the same page in the other language.
export function LanguageToggle({ lang, label }: { lang: Locale; label: string }) {
  const pathname = usePathname();
  const rest = pathname.replace(/^\/(ar|en)(?=\/|$)/, "");

  return (
    <nav aria-label={label} className="flex rounded-full border border-band-foreground/30 p-0.5 text-sm">
      {locales.map((l) => (
        <Link
          key={l}
          href={`/${l}${rest}`}
          hrefLang={l}
          lang={l}
          aria-current={l === lang ? "true" : undefined}
          className={`rounded-full px-3 py-1 transition-colors ${
            l === lang ? "border border-band-foreground/80" : "border border-transparent text-band-foreground/75 hover:text-band-foreground"
          }`}
        >
          {names[l]}
        </Link>
      ))}
    </nav>
  );
}
