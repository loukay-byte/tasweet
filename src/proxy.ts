import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, hasLocale, locales, type Locale } from "@/i18n/config";
import { updateSession } from "@/lib/supabase/proxy";

function preferredLocale(request: NextRequest): Locale {
  const saved = request.cookies.get("NEXT_LOCALE")?.value;
  if (saved && hasLocale(saved)) return saved;

  // Arabic-first: only switch to English when the browser prefers it over Arabic.
  const accept = request.headers.get("accept-language") ?? "";
  const ranked = accept
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.slice(0, 2).toLowerCase(), q: q ? Number(q) : 1 };
    })
    .filter((entry) => hasLocale(entry.lang))
    .sort((a, b) => b.q - a.q);

  return (ranked[0]?.lang as Locale | undefined) ?? defaultLocale;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasPrefix = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (!hasPrefix) {
    const url = request.nextUrl.clone();
    url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next({ request });
  const current = pathname.split("/")[1];
  if (request.cookies.get("NEXT_LOCALE")?.value !== current) {
    response.cookies.set("NEXT_LOCALE", current, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  return updateSession(request, response);
}

export const config = {
  matcher: [
    // Skip API routes, Next internals, and static files.
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
