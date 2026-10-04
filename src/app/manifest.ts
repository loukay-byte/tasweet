import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tasweet · تصويت",
    short_name: "تصويت",
    description: "منصة رأي عام موثوقة في السعودية",
    start_url: "/",
    display: "standalone",
    dir: "rtl",
    lang: "ar",
    background_color: "#f5efe3",
    theme_color: "#0d6b5f",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
