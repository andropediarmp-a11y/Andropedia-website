"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

export function OrbTransition({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() === true;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 95, damping: 28, mass: 0.24 });
  const scale = useTransform(progress, [0.08, 0.48, 0.82], [0.12, 4.5, 11]);
  const y = useTransform(progress, [0, 1], [80, -110]);
  const opacity = useTransform(progress, [0, 0.15, 0.72, 1], [0, 1, 0.9, 0]);
  const lineScale = useTransform(progress, [0.05, 0.64], [0, 1]);

  return (
    <div ref={ref} className="relative h-32 overflow-hidden bg-paper sm:h-44" aria-hidden="true">
      <motion.div style={reduced ? undefined : { scaleX: lineScale }} className="absolute left-0 top-1/2 h-px w-full origin-left bg-brand-blue" />
      <motion.div style={reduced ? undefined : { scale, y, opacity }} className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-blue shadow-[0_0_0_1px_rgba(66,115,228,0.2)]" />
      <span className="type-label absolute bottom-4 left-[var(--site-gutter)] text-brand-blue">{label}</span>
    </div>
  );
}
