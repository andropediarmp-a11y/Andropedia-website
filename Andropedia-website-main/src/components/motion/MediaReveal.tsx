"use client";

import { motion, useReducedMotion } from "framer-motion";

export function MediaReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion() === true;

  return (
    <motion.div
      className={`media-stage ${className}`}
      initial={reduceMotion ? false : { clipPath: "inset(0 0 100% 0)", opacity: 0.7 }}
      whileInView={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: reduceMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
