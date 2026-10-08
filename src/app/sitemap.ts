import type { MetadataRoute } from "next";
import { PUBLIC_PATHS, siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return PUBLIC_PATHS.map((path) => ({
    url: new URL(path, base).toString(),
    changeFrequency: path === "/join" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/join" ? 0.9 : 0.6,
  }));
}
