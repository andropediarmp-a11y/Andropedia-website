"use client";

import { useRef } from "react";
import { useState } from "react";
import { AnimatePresence, cubicBezier, motion, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import { AndropediaMark } from "@/components/design/AndropediaMark";
import { useActiveStep } from "@/components/design/scroll";
import { DOMAIN_ACCENT } from "@/content/accents";
import { HOME_DOMAINS } from "@/content/home";
import { scrollTopForStep, wheelKeyframes } from "@/lib/scroll-steps";
import { DomainCard } from "./DomainCard";

// How much page the wheel takes while pinned, in screen heights. Lower SCREENS_PER_DOMAIN for a quicker wheel.
const SCREENS_PER_DOMAIN = 0.7;
const COUNT = HOME_DOMAINS.length;
const STAGE_SCREENS = 1 + COUNT * SCREENS_PER_DOMAIN;
const NOTCH = 360 / COUNT;
const KEYFRAMES = wheelKeyframes(COUNT);
const EASE = cubicBezier(0.65, 0, 0.35, 1);

// The logo in the middle is the progress bar: it starts unlit, fills with blue as you scroll through the five
// domains (a sweep from the tail of the A up to the circuit nodes), and shines once the scroll is complete.
const LIT_FROM = 0.03; // scroll progress where the blue starts to fill
const LIT_TO = 0.93; // ...and where it is full (inside the last domain's resting stretch)
const SHINE_FROM = 0.9; // the shine fades in from here to the end
const UNLIT = "#2b3050"; // dark grey-blue: the logo before it is lit
const LIT = "#4566f0";
const SHINE = "#6f8bff";

// The focus arc: 30 degrees of the outer rim centred on 3 o'clock (90 degrees clockwise from the top).
const arcPoint = (deg: number) => `${(50 + 49.4 * Math.sin((deg * Math.PI) / 180)).toFixed(2)} ${(50 - 49.4 * Math.cos((deg * Math.PI) / 180)).toFixed(2)}`;
const FOCUS_ARC = `M${arcPoint(75)} A49.4 49.4 0 0 1 ${arcPoint(105)}`;

/** One domain node on the rim. It sits at `angle` on the wheel and is turned back upright as the wheel turns. */
function Node({ index, ring, active, onJump }: { index: number; ring: MotionValue<number>; active: boolean; onJump: () => void }) {
  const d = HOME_DOMAINS[index];
  const Icon = d.icon;
  const accent = DOMAIN_ACCENT[d.apiDomain];
  const angle = index * NOTCH;
  const upright = useTransform(ring, (v) => -angle - v);

  return (
    <div className="absolute left-1/2 top-1/2 h-0 w-0" style={{ transform: `rotate(${angle}deg) translateX(calc(var(--wheel) / 2))` }}>
      <motion.div className="absolute -left-8 -top-8 h-16 w-16" style={{ rotate: upright }}>
        <button
          type="button"
          onClick={onJump}
          aria-label={`Show ${d.title}`}
          aria-current={active ? "true" : undefined}
          data-cursor-text={d.title}
          className={`group relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${active ? "scale-[1.28]" : "scale-90 opacity-70 hover:opacity-100"}`}
          style={{ color: accent.a1 }}
        >
          {/* like the logo's circuit nodes: a solid ring around a dark centre, with a thin halo */}
          <span aria-hidden="true" className="absolute inset-0 rounded-full border border-current opacity-40" />
          <span
            aria-hidden="true"
            className="absolute inset-[7px] rounded-full bg-current transition-shadow duration-500"
            style={{ boxShadow: active ? `0 0 34px ${accent.a1}, 0 0 80px ${accent.a1}66` : `0 0 14px ${accent.a1}55` }}
          />
          <span aria-hidden="true" className="absolute inset-[19px] rounded-full bg-[#060818]" />
          <Icon className="relative h-[18px] w-[18px] text-white" aria-hidden="true" />
        </button>
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute left-1/2 top-[72px] -translate-x-1/2 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.16em] transition-colors duration-500 ${active ? "text-white" : "text-white/40"}`}
        >
          {String(index + 1).padStart(2, "0")} {d.apiDomain === "PR" ? "PR" : d.title.split(" ")[0]}
        </span>
      </motion.div>
    </div>
  );
}

/**
 * Large screens only (the parent hides this on phones and for reduced motion, where the plain card grid shows).
 * The Andropedia mark is the hub of a wheel with one node per domain. As you scroll, the wheel swings counter-clockwise
 * a notch at a time, brings the next domain round to the right, and pops its description up as a card.
 */
export function DomainsWheel({ className = "" }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { active, progress } = useActiveStep(wrapRef, COUNT);
  const current = Math.max(active, 0); // -1 (before hydration) shows the first domain
  const ring = useTransform(progress, KEYFRAMES.input, KEYFRAMES.output, { ease: EASE });
  const dust = useTransform(ring, (v) => v * 0.35); // the dotted rim drifts slower than the nodes, for depth
  const accent = DOMAIN_ACCENT[HOME_DOMAINS[current].apiDomain];

  const lit = useTransform(progress, [LIT_FROM, LIT_TO], [0, 1], { clamp: true });
  const litMask = useTransform(lit, (v) => {
    const edge = v * 130 - 15; // from fully hidden to fully revealed, with a soft edge
    const m = `linear-gradient(to top right, #000 ${edge}%, transparent ${edge + 14}%)`;
    return m;
  });
  const shine = useTransform(progress, [SHINE_FROM, 1], [0, 1], { clamp: true });
  const [complete, setComplete] = useState(false);
  useMotionValueEvent(progress, "change", (v) => setComplete((c) => (c === v >= 0.985 ? c : v >= 0.985)));

  const jumpTo = (index: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const top = scrollTopForStep(index, COUNT, el.getBoundingClientRect().top + window.scrollY, el.offsetHeight, window.innerHeight);
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`} style={{ height: `${STAGE_SCREENS * 100}svh` }}>
      <div className="sticky top-0 flex h-svh items-center" style={{ ["--wheel" as string]: "min(66svh, 42vw, 540px)" }}>
        {/* faint dot grid, as in the logo artwork */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_70%_60%_at_40%_50%,#000,transparent)]"
          style={{ backgroundImage: "radial-gradient(rgba(110,130,255,0.35) 1px, transparent 1.6px)", backgroundSize: "38px 38px" }}
        />

        <div className="relative grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-x-[clamp(56px,7vw,110px)]">
          {/* ---------- the wheel ---------- */}
          <div className="relative ml-8" style={{ width: "var(--wheel)", height: "var(--wheel)" }}>
            <motion.svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" style={{ rotate: dust }} fill="none">
              <circle cx="50" cy="50" r="49.4" stroke="rgba(110,130,255,0.35)" strokeWidth="0.25" strokeDasharray="0.3 1.6" strokeLinecap="round" />
              <circle cx="50" cy="50" r="44" stroke="rgba(110,130,255,0.22)" strokeWidth="0.18" />
              <circle cx="50" cy="50" r="38" stroke="rgba(110,130,255,0.14)" strokeWidth="0.18" strokeDasharray="0.6 1.2" />
            </motion.svg>
            <motion.div
              aria-hidden="true"
              className="absolute inset-[6%] rounded-full"
              animate={{ opacity: 1 }}
              style={{ background: `radial-gradient(circle, ${accent.a1}22 0%, transparent 62%)`, transition: "background 0.6s" }}
            />

            {/* a faint arc on the rim behind the active node (it always rests at 3 o'clock): easy to miss, easy to follow */}
            <svg aria-hidden="true" viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full" fill="none">
              <path d={FOCUS_ARC} stroke={accent.a1} strokeWidth="2.4" strokeLinecap="round" opacity="0.1" style={{ transition: "stroke 0.6s" }} />
              <path d={FOCUS_ARC} stroke={accent.a1} strokeWidth="0.45" strokeLinecap="round" opacity="0.5" style={{ transition: "stroke 0.6s" }} />
            </svg>

            {/* the hub: the logo as a progress bar. Unlit grey, then blue fills in as you scroll, then it shines. */}
            <div className="absolute left-1/2 top-1/2 w-[58%] -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
              <motion.div
                className="absolute -inset-[18%] rounded-full"
                style={{ opacity: shine, background: "radial-gradient(circle, rgba(111,139,255,0.55) 0%, rgba(69,102,240,0.18) 45%, transparent 70%)" }}
              />
              <AndropediaMark glow={false} className="relative w-full" style={{ color: UNLIT }} />
              <motion.div className="absolute inset-0" style={{ maskImage: litMask, WebkitMaskImage: litMask }}>
                <AndropediaMark glow={false} className="w-full" style={{ color: LIT, filter: "drop-shadow(0 0 10px rgba(69,102,240,0.55))" }} />
              </motion.div>
              <motion.div className={`absolute inset-0 ${complete ? "animate-pulse-glow" : ""}`} style={{ opacity: shine }}>
                <AndropediaMark className="w-full" style={{ color: SHINE }} />
              </motion.div>
            </div>

            {/* the rim: five nodes that turn with the wheel */}
            <motion.div className="absolute inset-0" style={{ rotate: ring }}>
              {HOME_DOMAINS.map((d, i) => (
                <Node key={d.id} index={i} ring={ring} active={i === current} onJump={() => jumpTo(i)} />
              ))}
            </motion.div>
          </div>

          {/* ---------- the pop-up card ---------- */}
          <div className="relative min-h-[420px]">
            <div className="mb-4 font-mono text-[12px] tabular-nums text-white/45" aria-live="polite">
              <span className="text-[26px] font-medium text-white">{String(current + 1).padStart(2, "0")}</span> / {String(COUNT).padStart(2, "0")}
              <span className="ml-3 uppercase tracking-[0.18em]">{HOME_DOMAINS[current].apiDomain === "PR" ? "PR" : HOME_DOMAINS[current].title.split(" ")[0]}</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={HOME_DOMAINS[current].id}
                initial={{ opacity: 0, scale: 0.82, x: -48, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.94, x: 24, filter: "blur(6px)", transition: { duration: 0.18 } }}
                transition={{ type: "spring", stiffness: 240, damping: 20, mass: 0.8 }}
                style={{ transformOrigin: "0% 50%" }}
              >
                <DomainCard d={HOME_DOMAINS[current]} featured />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
