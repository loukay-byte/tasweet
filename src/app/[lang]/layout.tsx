import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Inter } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dir, hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import "../globals.css";

const arabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
});

const latin = Inter({
  variable: "--font-latin",
  subsets: ["latin"],
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#121211" },
  ],
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const other = lang === "ar" ? "en" : "ar";

  return (
    <html
      lang={lang}
      dir={dir(lang)}
      className={`${arabic.variable} ${latin.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-border">
          <nav className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
            <Link href={`/${lang}`} className="text-xl font-bold text-accent">
              {dict.meta.title}
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href={`/${lang}/methodology`} className="text-muted hover:text-foreground">
                {dict.nav.methodology}
              </Link>
              <Link
                href={`/${other}`}
                hrefLang={other}
                lang={other}
                className="rounded-full border border-border px-3 py-1 hover:bg-surface"
              >
                {dict.nav.switchLanguage}
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-border py-6 text-center text-xs text-muted">
          © {new Date().getFullYear()} {dict.footer.rights}
        </footer>
      </body>
    </html>
  );
}
