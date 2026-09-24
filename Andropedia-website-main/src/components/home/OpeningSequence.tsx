"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { HackerText } from "@/components/motion/HackerText";

const letters = "ANDROPEDIA".split("");

export function OpeningSequence() {
  const [visible, setVisible] = useState(true);
  const reduced = useReducedMotion() === true;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden="true"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-paper text-ink"
          initial={{ y: 0 }}
          animate={{ y: "-100%" }}
          exit={{ opacity: 0 }}
          transition={{ delay: reduced ? 0 : 2.05, duration: reduced ? 0 : 0.82, ease: [0.76, 0, 0.24, 1] }}
          onAnimationComplete={() => setVisible(false)}
        >
          <motion.div
            className="absolute inset-x-[8vw] top-1/2 h-px origin-left bg-brand-blue"
            initial={reduced ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: reduced ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div className="absolute h-4 w-4 rounded-full bg-brand-blue" initial={reduced ? false : { scale: 0, x: "-34vw" }} animate={{ scale: [0, 1, 1, 22], x: ["-34vw", "0vw", "0vw", "34vw"] }} transition={{ duration: reduced ? 0 : 1.7, times: [0, 0.34, 0.72, 1], ease: [0.76, 0, 0.24, 1] }} />
          <div className="relative overflow-hidden px-5 py-8">
            <p className="sr-only">Andropedia</p>
            <div className="type-kinetic flex text-[clamp(2.55rem,9vw,9rem)] leading-none" aria-hidden="true">
              {letters.map((letter, index) => (
                <motion.span
                  key={`${letter}-${index}`}
                  className="inline-block text-ink"
                  initial={reduced ? false : { y: "115%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: reduced ? 0 : 0.12 + index * 0.045, duration: reduced ? 0 : 0.58, ease: [0.22, 1, 0.36, 1] }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>
          </div>
          <motion.p className="type-label absolute bottom-8 text-brand-blue-light" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduced ? 0 : 0.8 }}><HackerText text="Signal established" delay={850} replayOnHover={false} /></motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
