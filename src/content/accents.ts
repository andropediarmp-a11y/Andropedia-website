import type { CSSProperties } from "react";
import type { DomainType } from "@/lib/types";

// Accent colours. The base blue, indigo, purple and teal come from the Figma file's palette
// (Foundation/Blue, Indigo, Purple, Teal); pink, amber and coral extend it so every domain
// has its own colour. `a1` is the saturated colour, `a2` a lighter tint used mid-gradient.
export interface Accent {
  name: string;
  a1: string;
  a2: string;
}

export const ACCENTS = {
  blue: { name: "blue", a1: "#3395ff", a2: "#8cbfff" },
  teal: { name: "teal", a1: "#2dd4bf", a2: "#8ff0e1" },
  purple: { name: "purple", a1: "#af52de", a2: "#d9a5f5" },
  pink: { name: "pink", a1: "#ff5fa2", a2: "#ffa6cd" },
  amber: { name: "amber", a1: "#ffb020", a2: "#ffd98a" },
  coral: { name: "coral", a1: "#ff6b57", a2: "#ffb0a4" },
  indigo: { name: "indigo", a1: "#7978de", a2: "#b3b2f2" },
} satisfies Record<string, Accent>;

export const DOMAIN_ACCENT: Record<DomainType, Accent> = {
  Technical: ACCENTS.teal,
  Web: ACCENTS.blue,
  "R&D": ACCENTS.purple,
  Design: ACCENTS.pink,
  Media: ACCENTS.amber,
  PR: ACCENTS.coral,
};

/** Inline CSS variables consumed by .text-accent, .chip-accent and friends. */
export const accentVars = (a: Accent): CSSProperties =>
  ({ "--a1": a.a1, "--a2": a.a2, "--a1-soft": `${a.a1}26`, "--a1-line": `${a.a1}66` }) as CSSProperties;

// Medal colours for ranks 1-3 on leaderboards.
export const MEDAL = ["#ffc53d", "#c9d3e0", "#e8975a"] as const;
