import { Search } from "lucide-react";
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BottomNav } from "@/components/nav/BottomNav";
import { HeaderLinks } from "@/components/nav/HeaderLinks";
import { LanguageToggle } from "@/components/nav/LanguageToggle";
import { MenuDrawer } from "@/components/nav/MenuDrawer";
import { SplitMark } from "@/components/nav/SplitMark";
import { dir, hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import "../globals.css";

// IBM Plex Sans Arabic: one family for Arabic and Latin, headlines to captions.
const plex = IBM_Plex_Sans_Arabic({
  variable: "--font-plex",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
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
    { media: "(prefers-color-scheme: light)", color: "#0c4a43" },
    { media: "(prefers-color-scheme: dark)", color: "#083a34" },
  ],
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <html lang={lang} dir={dir(lang)} className={`${plex.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-40 bg-band text-band-foreground">
          <nav className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
            <MenuDrawer
              lang={lang}
              labels={dict.menu}
              searchPlaceholder={dict.explore.searchPlaceholder}
              categoryNames={dict.categories}
            />
            <Link href={`/${lang}`} className="flex items-center gap-2">
              <SplitMark className="size-6" />
              <span className="text-2xl leading-none font-bold">{dict.meta.title}</span>
            </Link>
            <div className="ms-6 flex-1">
              <HeaderLinks lang={lang} labels={dict.nav} />
            </div>
            <Link
              href={`/${lang}/explore`}
              aria-label={dict.nav.search}
              className="rounded-full p-2 hover:bg-band-foreground/10"
            >
              <Search className="size-5" aria-hidden="true" />
            </Link>
            <LanguageToggle lang={lang} label={dict.nav.language} />
          </nav>
        </header>

        <main className="flex-1 pb-28 md:pb-12">{children}</main>

        <footer className="hidden border-t border-border py-8 text-sm text-muted md:block">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4">
            <span className="text-foreground">{dict.footer.tagline}</span>
            <Link href={`/${lang}/methodology`} className="hover:text-foreground">
              {dict.nav.methodology}
            </Link>
          </div>
        </footer>

        <BottomNav lang={lang} labels={dict.nav} />
      </body>
    </html>
  );
}
