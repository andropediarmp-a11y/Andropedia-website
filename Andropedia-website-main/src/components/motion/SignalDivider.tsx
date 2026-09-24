"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll } from "framer-motion";

export function SignalDivider({ dark = false }: { dark?: boolean }) {
  const dividerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() === true;
  const { scrollYProgress } = useScroll({ target: dividerRef, offset: ["start 92%", "end 58%"] });
  const color = dark ? "var(--color-brand-blue-light)" : "var(--color-brand-blue)";
  return <div ref={dividerRef} className="site-container py-2" aria-hidden="true"><svg className="h-10 w-full" viewBox="0 0 1200 40" preserveAspectRatio="none"><motion.path d="M0 20H480L500 4H700L720 20H1200" fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" style={{ pathLength: reduceMotion ? 1 : scrollYProgress }} /><circle cx="500" cy="4" r="3.5" fill={color} /><circle cx="720" cy="20" r="3.5" fill={color} /></svg></div>;
}
