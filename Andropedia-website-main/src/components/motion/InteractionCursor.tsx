"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

export function InteractionCursor() {
  const reduced = useReducedMotion() === true;
  const [label, setLabel] = useState("");
  const [visible, setVisible] = useState(false);
  const x = useSpring(useMotionValue(-100), { stiffness: 520, damping: 38, mass: 0.2 });
  const y = useSpring(useMotionValue(-100), { stiffness: 520, damping: 38, mass: 0.2 });

  useEffect(() => {
    if (reduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let active: HTMLElement | null = null;

    const resetActive = () => {
      active?.style.removeProperty("--magnetic-x");
      active?.style.removeProperty("--magnetic-y");
    };

    const onMove = (event: PointerEvent) => {
      x.set(event.clientX + 18);
      y.set(event.clientY + 18);
      const target = (event.target as HTMLElement).closest<HTMLElement>("[data-cursor-text]");
      if (target !== active) {
        resetActive();
        active = target;
        setVisible(Boolean(target));
        setLabel(target?.dataset.cursorText || "OPEN");
      }
      if (target) {
        const rect = target.getBoundingClientRect();
        target.style.setProperty("--magnetic-x", `${((event.clientX - rect.left) / rect.width - 0.5) * 7}px`);
        target.style.setProperty("--magnetic-y", `${((event.clientY - rect.top) / rect.height - 0.5) * 7}px`);
      }
    };
    const onLeave = () => { resetActive(); setVisible(false); };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      resetActive();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced, x, y]);

  if (reduced) return null;
  return (
    <motion.div aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[90] hidden h-12 min-w-12 items-center justify-center rounded-full bg-brand-blue px-3 font-mono text-[9px] font-semibold tracking-[0.12em] text-white md:flex" style={{ x, y }} animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.55 }} transition={{ duration: 0.18 }}>
      {label}
    </motion.div>
  );
}
