"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";
import { Zap } from "lucide-react";
import { MAX_XP } from "./config";

/** Cosmetic XP counter that counts up to the new value. */
export function XpChip({ xp }: { xp: number }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(xp);
  const from = useRef(xp);

  useEffect(() => {
    const controls = animate(from.current, xp, {
      duration: reduce ? 0 : 0.7,
      ease: "easeOut",
      onUpdate: (v) => {
        from.current = v;
        setShown(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [xp, reduce]);

  return (
    <span className="chip-accent !px-3 !py-1 font-mono uppercase tracking-wider">
      <Zap className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="sr-only">{xp} of {MAX_XP} experience points</span>
      <span aria-hidden="true">{shown} XP</span>
    </span>
  );
}
