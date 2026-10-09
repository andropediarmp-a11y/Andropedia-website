"use client";

import { AnimatePresence, motion } from "framer-motion";

export type Mood = "hi" | "cheer" | "oops";

const BOB: Record<Mood, { y?: number[]; x?: number[]; rotate?: number[] }> = {
  hi: { y: [0, -3, 0] },
  cheer: { y: [0, -10, 0], rotate: [0, -6, 6, 0] },
  oops: { x: [0, -4, 4, -3, 3, 0] },
};

/** Andy, the club robot. Small inline SVG that takes its colour from --a1. */
export function Mascot({ mood, size = 64 }: { mood: Mood; size?: number }) {
  const eyes =
    mood === "cheer" ? (
      <>
        <path d="M21 31 q4 -6 8 0" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M35 31 q4 -6 8 0" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
      </>
    ) : mood === "oops" ? (
      <path d="M22 28 l6 6 M28 28 l-6 6 M36 28 l6 6 M42 28 l-6 6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
    ) : (
      <>
        <circle cx="25" cy="31" r="3.4" fill="#fff" />
        <circle cx="39" cy="31" r="3.4" fill="#fff" />
      </>
    );
  const mouth = mood === "cheer" ? "M24 41 q8 9 16 0 z" : mood === "oops" ? "M25 44 q3 -4 7 0 t7 0" : "M26 41 q6 5 12 0";
  return (
    <motion.svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className="shrink-0 overflow-visible"
      key={mood}
      animate={BOB[mood]}
      transition={mood === "hi" ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.6, ease: "easeOut" }}
    >
      <line x1="32" y1="9" x2="32" y2="16" stroke="var(--a1, #3395ff)" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="32" cy="7" r="3.4" fill="var(--a2, #8cbfff)" style={{ filter: "drop-shadow(0 0 4px var(--a1, #3395ff))" }} />
      <rect x="12" y="16" width="40" height="34" rx="12" fill="#0b0d1a" stroke="var(--a1, #3395ff)" strokeWidth="2" />
      <rect x="16" y="20" width="32" height="26" rx="9" fill="rgba(255,255,255,0.05)" />
      <rect x="6" y="28" width="5" height="10" rx="2.5" fill="var(--a1, #3395ff)" opacity="0.7" />
      <rect x="53" y="28" width="5" height="10" rx="2.5" fill="var(--a1, #3395ff)" opacity="0.7" />
      {eyes}
      <path d={mouth} fill={mood === "cheer" ? "#fff" : "none"} stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      {mood !== "oops" && (
        <>
          <circle cx="19" cy="38" r="2.4" fill="var(--a1, #3395ff)" opacity="0.45" />
          <circle cx="45" cy="38" r="2.4" fill="var(--a1, #3395ff)" opacity="0.45" />
        </>
      )}
      <rect x="22" y="52" width="20" height="8" rx="4" fill="#0b0d1a" stroke="var(--a1, #3395ff)" strokeWidth="2" />
    </motion.svg>
  );
}

/** Andy plus a speech bubble. The bubble is a polite live region, so changes are announced. */
export function AndySays({ mood, message }: { mood: Mood; message: string }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <Mascot mood={mood} size={56} />
      <div className={`glass-inner relative !rounded-2xl px-4 py-3 ${mood === "oops" ? "!border-rose-400/50" : ""}`} role="status">
        <span
          aria-hidden="true"
          className="absolute -left-[7px] top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border-b border-l bg-[#0c0e1c]"
          style={{ borderColor: mood === "oops" ? "rgb(251 113 133 / 0.5)" : "rgba(255,255,255,0.2)" }}
        />
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-a1">Andy says</p>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="text-base leading-6 text-white/80"
          >
            {message}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
