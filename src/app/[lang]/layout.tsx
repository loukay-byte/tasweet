import type { Metadata, Viewport } from "next";
import { Readex_Pro, Reem_Kufi } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BottomNav } from "@/components/nav/BottomNav";
import { HeaderLinks } from "@/components/nav/HeaderLinks";
import { PlusIcon } from "@/components/nav/icons";
import { SplitMark } from "@/components/nav/SplitMark";
import { dir, hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import "../globals.css";

// Display: Reem Kufi, a geometric Kufic face, used for headlines and figures.
const kufi = Reem_Kufi({
  variable: "--font-kufi",
  subsets: ["arabic", "latin"],
  weight: ["500", "600", "700"],
});

// Body: Readex Pro, designed for Arabic and Latin reading at small sizes.
const body = Readex_Pro({
  variable: "--font-body",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600"],
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: { default: dict.meta.title, template: `%s · ${dict.meta.title}` },
    description: dict.meta.description,
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
  };
}

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5efe3" },
    { media: "(prefers-color-scheme: dark)", color: "#0d5c52" },
  ],
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const other = lang === "ar" ? "en" : "ar";
  const navLabels = { home: dict.nav.home, explore: dict.nav.explore, results: dict.nav.results };

  return (
    <html lang={lang} dir={dir(lang)} className={`${kufi.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
          <nav className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-2.5">
            <Link href={`/${lang}`} className="flex items-center gap-2" aria-label={dict.meta.title}>
              <SplitMark className="size-7" />
              <span className="font-display text-2xl font-bold leading-none">{dict.meta.title}</span>
            </Link>
            <div className="ms-6 flex-1">
              <HeaderLinks lang={lang} labels={navLabels} />
            </div>
            <Link
              href={`/${other}`}
              hrefLang={other}
              lang={other}
              aria-label={dict.nav.switchLanguage}
              className="rounded-full px-2 py-1 text-sm text-muted hover:text-foreground"
            >
              {dict.nav.switchLanguageShort}
            </Link>
            <Link
              href={`/${lang}/submit`}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent py-2 ps-3 pe-4 text-sm font-medium text-accent-foreground shadow-sm transition hover:brightness-110 active:scale-95"
            >
              <PlusIcon className="size-4" />
              {dict.nav.suggest}
            </Link>
          </nav>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-6 pb-28 md:pb-12">{children}</main>

        <footer className="hidden border-t border-border py-8 text-sm text-muted md:block">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4">
            <span className="font-display text-foreground">{dict.footer.tagline}</span>
            <Link href={`/${lang}/methodology`} className="hover:text-foreground">
              {dict.nav.methodology}
            </Link>
          </div>
        </footer>

        <BottomNav lang={lang} labels={navLabels} />
      </body>
    </html>
  );
}
