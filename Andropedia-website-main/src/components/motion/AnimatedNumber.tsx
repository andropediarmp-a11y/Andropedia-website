"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useMotionValue, useMotionValueEvent, useReducedMotion } from "framer-motion";

export function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.7 });
  const reduced = useReducedMotion() === true;
  const motionValue = useMotionValue(reduced ? value : 0);
  const [display, setDisplay] = useState(reduced ? value : 0);

  useMotionValueEvent(motionValue, "change", (latest) => setDisplay(Math.round(latest)));
  useEffect(() => {
    if (!inView || reduced) return;
    const controls = animate(motionValue, value, { duration: 0.8, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [inView, motionValue, reduced, value]);

  return <span ref={ref}>{display}</span>;
}
