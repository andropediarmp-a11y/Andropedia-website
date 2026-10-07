import { HOME_DOMAINS } from "@/content/home";

// Oversized, tightly set display type (inspired by bold display typefaces such as Saint Regus).
export const DISPLAY_TYPE = "font-[family-name:var(--font-display)] uppercase leading-[0.86] tracking-[-0.01em]";

/** Slow, endless ribbon of the six domain names in outlined display type. Purely decorative. */
export function Marquee({ className = "" }: { className?: string }) {
  const words = HOME_DOMAINS.map((d) => d.title);
  const row = [...words, ...words];
  return (
    <div className={`overflow-hidden border-y border-white/10 py-5 ${className}`} aria-hidden="true">
      <div className="marquee-track flex w-max gap-10 whitespace-nowrap" style={{ animation: "marquee 38s linear infinite" }}>
        {[...row, ...row].map((w, i) => (
          <span key={i} className={`${DISPLAY_TYPE} flex items-center gap-10 text-[clamp(1.5rem,4vw,3rem)] text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.5)]`}>
            {w}
            <span className="text-[0.5em] text-white/40">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
