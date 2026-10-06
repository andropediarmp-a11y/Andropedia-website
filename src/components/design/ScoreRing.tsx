import { useId } from "react";

/** Glass circle with a progress arc and a big number (the "98" score badge from the design). */
export function ScoreRing({ value, max = 100, label, size = 142, className = "" }: { value: number; max?: number; label?: string; size?: number; className?: string }) {
  const id = useId();
  const r = 46;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, value / max));
  return (
    <div
      className={`glass-inner ${className.includes("absolute") ? "" : "relative"} flex items-center justify-center !rounded-full ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ? `${label}: ${value}` : String(value)}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8cbfff" />
            <stop offset="100%" stopColor="#7978de" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={`url(#${id})`} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${c * pct} ${c}`} />
      </svg>
      <div className="relative text-center">
        <div className="text-fade-strong text-[44px] font-medium leading-none tracking-[-2px]">{value}</div>
        {label && <div className="mt-1 text-[11px] leading-4 text-white/50">{label}</div>}
      </div>
    </div>
  );
}
