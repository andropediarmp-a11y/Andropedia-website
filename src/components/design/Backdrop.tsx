import type { CSSProperties } from "react";

// Decorative backgrounds from the Figma design. Both are purely visual (aria-hidden).

type OrbVariant = "hero" | "customers" | "customers-soft" | "features" | "log";

// Each orb is two stacked glow images (a wide soft one and an offset brighter one), blended with "screen".
const ORBS: Record<OrbVariant, { a: string; b: string; aScale: number; aInset: number; bScale: number; bInset: number; bDx: number; bDy: number }> = {
  hero: { a: "/design/bg/blur-hero-a.svg", b: "/design/bg/blur-hero-b.webp", aScale: 1, aInset: 18.98, bScale: 0.766, bInset: 49.57, bDx: -0.098, bDy: 0.059 },
  features: { a: "/design/bg/blur-feat-a.svg", b: "/design/bg/blur-feat-b.webp", aScale: 1.149, aInset: 21.75, bScale: 0.88, bInset: 35.51, bDx: -0.113, bDy: 0.068 },
  customers: { a: "/design/bg/blur-cust-a.webp", b: "/design/bg/blur-cust-b.webp", aScale: 1, aInset: 18.98, bScale: 0.766, bInset: 49.57, bDx: -0.098, bDy: 0.059 },
  "customers-soft": { a: "/design/bg/blur-cust-d.svg", b: "/design/bg/blur-cust-c.webp", aScale: 1.149, aInset: 21.75, bScale: 0.88, bInset: 35.51, bDx: -0.113, bDy: 0.068 },
  log: { a: "/design/bg/blur-log-a.webp", b: "/design/bg/blur-log-b.webp", aScale: 1.149, aInset: 21.75, bScale: 0.88, bInset: 35.51, bDx: -0.113, bDy: 0.068 },
};

interface BlurOrbProps {
  variant?: OrbVariant;
  /** Diameter in px of the orb's box. */
  size?: number;
  opacity?: number;
  /** Position of the orb's centre, e.g. { left: "50%", top: "40%" }. */
  position?: { left?: string; top?: string };
  className?: string;
}

export function BlurOrb({}: BlurOrbProps) {
  // Retain pure black background without purple haze intermixing across the website
  return null;
}

/** Faint circuit-like grid lines with dot nodes - suppressed for pure black theme */
export function GridLines({}: { variant?: "hero" | "customers"; className?: string }) {
  // Suppressed for clean, pure black background
  return null;
}

/** Thin horizontal light under section titles - suppressed for clean pure black theme */
export function TitleLines({}: { className?: string }) {
  return null;
}

