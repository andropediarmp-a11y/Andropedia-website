"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { HackerText } from "@/components/motion/HackerText";

export function ScrollStatement() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() === true;
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.24 });
  const x = useTransform(progress, [0, 1], ["10vw", "-14vw"]);
  const scale = useTransform(progress, [0.15, 0.85], [0.92, 1.06]);
  const lineScale = useTransform(progress, [0.08, 0.72], [0, 1]);

  return (
    <section ref={sectionRef} className="surface-paper relative min-h-[85svh] overflow-hidden" aria-label="Work in progress">
      <div className="flex min-h-[85svh] items-center">
        <div className="w-full">
          <motion.div style={reduced ? undefined : { scaleX: lineScale }} className="mx-auto mb-8 h-px w-[calc(100%-2.5rem)] origin-left bg-brand-blue sm:w-[calc(100%-8rem)]" />
          <motion.p style={reduced ? undefined : { x, scale }} className="type-kinetic whitespace-nowrap text-[clamp(3.2rem,10vw,10rem)] leading-[0.86] text-ink">WORK IN PROGRESS.</motion.p>
          <p className="site-container type-label mt-8 text-brand-blue"><HackerText text="Ideas become releases" /></p>
        </div>
      </div>
    </section>
  );
}
