import type { MetadataRoute } from "next";
import { isSiteLocked } from "@/lib/site-lock";

// Rendered per request so it always matches the lock setting.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  // While the site is locked, ask search engines to stay out entirely.
  if (isSiteLocked) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
  };
}
