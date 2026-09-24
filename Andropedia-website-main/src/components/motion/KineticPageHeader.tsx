"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { CircuitNetwork } from "@/components/motion/CircuitNetwork";

interface KineticPageHeaderProps {
  label: string;
  title: string;
  description?: string;
  compact?: boolean;
}

export function KineticPageHeader({ label, title, description, compact = false }: KineticPageHeaderProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() === true;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 92, damping: 27, mass: 0.25 });
  const titleY = useTransform(progress, [0, 1], [0, compact ? -48 : -90]);
  const titleScale = useTransform(progress, [0, 1], [1, 0.82]);
  const titleX = useTransform(progress, [0, 1], [0, -26]);
  const copyY = useTransform(progress, [0, 1], [0, 45]);
  const circuitY = useTransform(progress, [0, 1], [30, -55]);
  const circuitProgress = useTransform(progress, [0, 0.72], [0, 1]);

  return (
    <header ref={ref} className={`relative overflow-hidden border-b border-[var(--color-line-light)] ${compact ? "py-16 sm:py-24" : "min-h-[72svh]"}`}>
      <motion.div style={reduced ? undefined : { y: circuitY }} className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] opacity-70">
        <CircuitNetwork progress={circuitProgress} className="h-full w-full" subtle />
      </motion.div>
      <div className={`site-container relative z-10 editorial-grid gap-y-10 ${compact ? "" : "min-h-[72svh] content-center py-16"}`}>
        <div className="col-span-4 md:col-span-8 lg:col-span-9">
          <motion.p style={reduced ? undefined : { y: titleY }} className="type-label text-brand-blue">{label}</motion.p>
          <div className="mt-5 overflow-hidden pb-[0.09em]">
            <motion.h1 style={reduced ? undefined : { y: titleY, x: titleX, scale: titleScale }} className="type-kinetic origin-left max-w-[14ch] text-[clamp(3.25rem,9vw,9rem)] leading-[0.86]">
              {title}
            </motion.h1>
          </div>
        </div>
        {description && <motion.p style={reduced ? undefined : { y: copyY }} className="type-body-lg col-span-4 text-text-muted md:col-span-5 md:col-start-4 lg:col-span-4 lg:col-start-9 lg:self-end">{description}</motion.p>}
      </div>
    </header>
  );
}
