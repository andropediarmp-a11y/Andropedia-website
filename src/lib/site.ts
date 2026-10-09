/** Public base URL of the site (for canonical links, sitemap and Open Graph). */
export function siteUrl(): URL {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  } catch {
    return new URL("http://localhost:3000");
  }
}

/** Pages that should appear in the sitemap. */
export const PUBLIC_PATHS = ["/", "/join", "/team", "/projects", "/events", "/terms", "/privacy"] as const;

