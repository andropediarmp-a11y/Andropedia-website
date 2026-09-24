import type { PublicNavigationItem } from "@/lib/public-content";

export const primaryNavigation = [
  { label: "About", href: "/#about" },
  { label: "Domains", href: "/domains" },
  { label: "Projects", href: "/projects" },
  { label: "Events", href: "/events" },
  { label: "Heads", href: "/heads" },
  { label: "Members", href: "/members" },
  { label: "Leaderboard", href: "/leaderboard" },
] satisfies readonly PublicNavigationItem[];

export const publicActions = {
  join: { label: "Join", href: "/join" },
  portal: { label: "Member Portal", href: "/portal/login" },
} satisfies Record<"join" | "portal", PublicNavigationItem>;
