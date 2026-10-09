"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

/** Fills as the answer approaches its minimum length. Purely a visual nudge; the server rule is unchanged. */
export function PowerBar({ length, min }: { length: number; min: number }) {
  const ratio = Math.min(length / min, 1);
  const full = length >= min;
  return (
    <div className="flex items-center gap-3" role="progressbar" aria-label="Answer power" aria-valuemin={0} aria-valuemax={min} aria-valuenow={Math.min(length, min)}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full origin-left rounded-full"
          style={{ background: "linear-gradient(90deg, var(--a2, #8cbfff), var(--a1, #3395ff))", boxShadow: full ? "0 0 12px var(--a1, #3395ff)" : undefined }}
          initial={false}
          animate={{ scaleX: ratio }}
          transition={{ type: "spring", stiffness: 180, damping: 24 }}
        />
      </div>
      <span className="flex shrink-0 items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-slate-400" aria-hidden="true">
        {full ? (
          <>
            <Check className="h-3 w-3 text-a1" /> <span className="text-a1">Full power</span>
          </>
        ) : (
          `${length}/${min}`
        )}
      </span>
    </div>
  );
}
