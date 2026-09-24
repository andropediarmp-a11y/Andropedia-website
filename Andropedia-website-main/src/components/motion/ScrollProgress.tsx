"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const reduced = useReducedMotion() === true;
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.2 });

  if (reduced) return null;

  return (
    <div className="pointer-events-none fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 md:block" aria-hidden="true">
      <div className="relative h-24 w-px bg-[rgba(8,10,13,0.16)]">
        <motion.div style={{ scaleY }} className="absolute inset-0 origin-top bg-brand-blue" />
      </div>
      <div className="absolute -left-[3px] -top-2 h-[7px] w-[7px] rounded-full border border-brand-blue bg-paper" />
      <div className="absolute -bottom-2 -left-[3px] h-[7px] w-[7px] rounded-full bg-brand-blue" />
    </div>
  );
}
