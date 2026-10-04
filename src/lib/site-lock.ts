import type { NextRequest } from "next/server";

// Pre-launch lock. When SITE_USERNAME and SITE_PASSWORD are both set, every
// page asks for them (HTTP Basic Auth). Delete both variables to go live.
const username = process.env.SITE_USERNAME;
const password = process.env.SITE_PASSWORD;

export const isSiteLocked = Boolean(username && password);

// Compares in constant time so the response time doesn't leak the password.
function safeEqual(a: string, b: string) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export function hasSiteAccess(request: NextRequest) {
  if (!isSiteLocked) return true;
  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Basic ")) return false;
  let decoded = "";
  try {
    decoded = atob(header.slice(6));
  } catch {
    return false;
  }
  const split = decoded.indexOf(":");
  if (split < 0) return false;
  const ok = safeEqual(decoded.slice(0, split), username!);
  return safeEqual(decoded.slice(split + 1), password!) && ok;
}

export function lockedResponse() {
  return new Response("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Sotak (preview)", charset="UTF-8"',
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "no-store",
    },
  });
}
