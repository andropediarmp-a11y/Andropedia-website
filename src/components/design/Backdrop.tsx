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

export function BlurOrb({ variant = "hero", size = 1054, opacity = 0.5, position = { left: "50%", top: "50%" }, className = "" }: BlurOrbProps) {
  const o = ORBS[variant];
  const layer = (scale: number, dx = 0, dy = 0): CSSProperties => ({
    position: "absolute",
    left: `calc(50% + ${dx * size}px)`,
    top: `calc(50% + ${dy * size}px)`,
    width: size * scale,
    height: size * scale,
    transform: "translate(-50%, -50%)",
  });
  const image = (url: string, inset: number): CSSProperties => ({
    position: "absolute",
    inset: `${-inset}%`,
    backgroundImage: `url(${url})`,
    backgroundSize: "100% 100%",
    backgroundRepeat: "no-repeat",
  });

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute mix-blend-screen ${className}`}
      style={{ left: position.left, top: position.top, width: size, height: size, opacity, transform: "translate(-50%, -50%)" }}
    >
      <div style={layer(o.aScale)}>
        <div style={image(o.a, o.aInset)} />
      </div>
      <div style={layer(o.bScale, o.bDx, o.bDy)}>
        <div style={image(o.b, o.bInset)} />
      </div>
    </div>
  );
}

/** Faint circuit-like grid lines with dot nodes (the thin lines behind the hero and sections). */
export function GridLines({ variant = "hero", className = "" }: { variant?: "hero" | "customers"; className?: string }) {
  const src = variant === "hero" ? "/design/bg/lines-hero.svg" : "/design/bg/lines-customers.svg";
  const height = variant === "hero" ? 1419 : 1440;
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: variant === "hero" ? -67 : 0,
          width: 1998,
          height,
          transform: "translateX(-50%)",
          backgroundImage: `url(${src})`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          opacity: 0.9,
        }}
      />
    </div>
  );
}

/** Thin horizontal light under section titles (the glowing line from the design). */
export function TitleLines({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute left-1/2 -translate-x-1/2 ${className}`}
      style={{ width: 819, maxWidth: "100vw", height: 138, backgroundImage: "url(/design/bg/title-lines.svg)", backgroundSize: "100% 100%", backgroundRepeat: "no-repeat" }}
    />
  );
}
