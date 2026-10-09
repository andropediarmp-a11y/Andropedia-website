"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AndropediaMark } from "@/components/design/AndropediaMark";
import { DOMAIN_ACCENT } from "@/content/accents";
import { HOME_DOMAINS } from "@/content/home";
import { DomainCard } from "./DomainCard";

const COUNT = HOME_DOMAINS.length;
const NOTCH = 360 / COUNT;

// Focus arc: 30 degrees of outer rim centered at 3 o'clock
const arcPoint = (deg: number) =>
  `${(50 + 49.4 * Math.sin((deg * Math.PI) / 180)).toFixed(2)} ${(50 - 49.4 * Math.cos((deg * Math.PI) / 180)).toFixed(2)}`;
const FOCUS_ARC = `M${arcPoint(75)} A49.4 49.4 0 0 1 ${arcPoint(105)}`;

/** One domain node on the rim. Clicking it rotates the wheel to this domain. */
function Node({
  index,
  rotation,
  active,
  onClick,
}: {
  index: number;
  rotation: number;
  active: boolean;
  onClick: () => void;
}) {
  const d = HOME_DOMAINS[index];
  const Icon = d.icon;
  const accent = DOMAIN_ACCENT[d.apiDomain];
  const angle = index * NOTCH;
  const upright = -angle - rotation;

  return (
    <div
      className="absolute left-1/2 top-1/2 h-0 w-0"
      style={{ transform: `rotate(${angle}deg) translateX(calc(var(--wheel) / 2))` }}
    >
      <motion.div
        className="absolute -left-8 -top-8 h-16 w-16"
        animate={{ rotate: upright }}
        transition={{ type: "spring", stiffness: 180, damping: 22 }}
      >
        <button
          type="button"
          onClick={onClick}
          aria-label={`Show ${d.title}`}
          aria-current={active ? "true" : undefined}
          data-cursor-text={d.title}
          className={`group relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
            active ? "scale-[1.28]" : "scale-90 opacity-70 hover:scale-100 hover:opacity-100"
          }`}
          style={{ color: accent.a1 }}
        >
          <span aria-hidden="true" className="absolute inset-0 rounded-full border border-current opacity-40" />
          <span
            aria-hidden="true"
            className="absolute inset-[7px] rounded-full bg-current transition-shadow duration-500"
            style={{
              boxShadow: active
                ? `0 0 34px ${accent.a1}, 0 0 80px ${accent.a1}66`
                : `0 0 14px ${accent.a1}55`,
            }}
          />
          <span aria-hidden="true" className="absolute inset-[19px] rounded-full bg-[#060818]" />
          <Icon className="relative h-[18px] w-[18px] text-white" aria-hidden="true" />
        </button>
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute left-1/2 top-[72px] -translate-x-1/2 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.16em] transition-colors duration-300 ${
            active ? "text-white" : "text-white/40"
          }`}
        >
          {String(index + 1).padStart(2, "0")} {d.apiDomain === "PR" ? "PR" : d.title.split(" ")[0]}
        </span>
      </motion.div>
    </div>
  );
}

/**
 * Interactive Domains Wheel:
 * Normal page height (no scroll hijacking / 450vh pinning).
 * Clicking any node rotates the wheel smoothly to that domain and displays its details.
 */
export function DomainsWheel({ className = "" }: { className?: string }) {
  const [current, setCurrent] = useState(0);
  const rotation = -current * NOTCH;
  const accent = DOMAIN_ACCENT[HOME_DOMAINS[current].apiDomain];

  return (
    <div
      className={`relative w-full py-8 ${className}`}
      style={{ ["--wheel" as string]: "min(480px, 38vw)" }}
    >
      <div className="relative grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-x-[clamp(48px,6vw,90px)]">
        {/* ---------- The Wheel ---------- */}
        <div className="relative mx-auto" style={{ width: "var(--wheel)", height: "var(--wheel)" }}>
          {/* Decorative outer circle rings */}
          <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" fill="none">
            <circle cx="50" cy="50" r="49.4" stroke="rgba(110,130,255,0.35)" strokeWidth="0.25" strokeDasharray="0.3 1.6" strokeLinecap="round" />
            <circle cx="50" cy="50" r="44" stroke="rgba(110,130,255,0.22)" strokeWidth="0.18" />
            <circle cx="50" cy="50" r="38" stroke="rgba(110,130,255,0.14)" strokeWidth="0.18" strokeDasharray="0.6 1.2" />
          </svg>

          {/* Ambient Glow */}
          <div
            aria-hidden="true"
            className="absolute inset-[6%] rounded-full transition-colors duration-700"
            style={{
              background: `radial-gradient(circle, ${accent.a1}22 0%, transparent 62%)`,
            }}
          />

          {/* Focus arc at 3 o'clock */}
          <svg aria-hidden="true" viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full" fill="none">
            <path d={FOCUS_ARC} stroke={accent.a1} strokeWidth="2.4" strokeLinecap="round" opacity="0.15" style={{ transition: "stroke 0.6s" }} />
            <path d={FOCUS_ARC} stroke={accent.a1} strokeWidth="0.6" strokeLinecap="round" opacity="0.6" style={{ transition: "stroke 0.6s" }} />
          </svg>

          {/* The Hub: Center logo mark with glowing pulse */}
          <div className="absolute left-1/2 top-1/2 w-[55%] -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
            <div
              className="absolute -inset-[18%] rounded-full opacity-60 transition-colors duration-700"
              style={{ background: `radial-gradient(circle, ${accent.a1}55 0%, transparent 70%)` }}
            />
            <AndropediaMark
              className="relative w-full drop-shadow-[0_0_20px_rgba(0,102,255,0.6)]"
              style={{ color: "#4566f0" }}
            />
          </div>

          {/* Rotating Rim of Nodes */}
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: rotation }}
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
          >
            {HOME_DOMAINS.map((d, i) => (
              <Node
                key={d.id}
                index={i}
                rotation={rotation}
                active={i === current}
                onClick={() => setCurrent(i)}
              />
            ))}
          </motion.div>
        </div>

        {/* ---------- The Active Domain Card ---------- */}
        <div className="relative min-h-[420px]">
          {/* Header indicator */}
          <div className="mb-4 flex items-center justify-between font-mono text-[12px] tabular-nums text-white/45">
            <div>
              <span className="text-[26px] font-medium text-white">{String(current + 1).padStart(2, "0")}</span> / {String(COUNT).padStart(2, "0")}
              <span className="ml-3 uppercase tracking-[0.18em] text-[#38bdf8]">
                {HOME_DOMAINS[current].apiDomain === "PR" ? "PR" : HOME_DOMAINS[current].title.split(" ")[0]}
              </span>
            </div>
            {/* Quick switcher dots */}
            <div className="flex items-center gap-1.5">
              {HOME_DOMAINS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrent(i)}
                  aria-label={`Select domain ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === current ? "w-6 bg-[#00d4ff]" : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={HOME_DOMAINS[current].id}
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -16, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
            >
              <DomainCard d={HOME_DOMAINS[current]} featured />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
