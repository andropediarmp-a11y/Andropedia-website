"use client";

import { useRef, type ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { Check } from "lucide-react";
import { useActiveStep } from "@/components/design/scroll";
import { ACCENTS, accentVars } from "@/content/accents";
import { SPRINT_STEPS } from "@/content/home";

const DAY_ACCENTS = [ACCENTS.blue, ACCENTS.teal, ACCENTS.purple, ACCENTS.pink];

const STATE_CLASS = {
  on: "",
  active: "scale-[1.03] border-[color:var(--a1-line)] opacity-100 shadow-[0_0_46px_var(--a1-soft)]",
  done: "opacity-55",
  todo: "opacity-25",
} as const;

/**
 * Large screens: the whole stage (the intro on the left, this card on the right) is pinned while the four
 * steps of the week light up one by one. Phones and reduced motion: a normal two-column section with every
 * step shown (the wrapper has no extra height and nothing is sticky).
 */
export function SprintStage({ intro }: { intro: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { active, progress, pinned } = useActiveStep(wrapRef, SPRINT_STEPS.length);
  const fill = useTransform(progress, [0, 1], [0.04, 1]);

  return (
    <div ref={wrapRef} className="relative lg:h-[240svh] lg:motion-reduce:h-auto">
      <div className="lg:sticky lg:top-0 lg:flex lg:h-svh lg:items-center lg:pb-4 lg:pt-16 lg:motion-reduce:static lg:motion-reduce:h-auto lg:motion-reduce:py-24">
        <div className="relative mx-auto grid w-full max-w-[1300px] items-center gap-14 lg:grid-cols-[minmax(0,582px)_1fr]">
          {intro}

          <div className="relative">
            <div className="glass-card p-5 sm:p-7">
              <p className="text-aurora text-[12px] font-medium uppercase tracking-[0.1em]">A week in a sprint</p>
              <div className="relative mt-5">
                {pinned && (
                  <div aria-hidden="true" className="absolute -left-3 top-1 bottom-1 w-px bg-white/10">
                    <motion.div className="h-full w-full origin-top bg-gradient-to-b from-teal-300 via-blue-400 to-fuchsia-400" style={{ scaleY: fill }} />
                  </div>
                )}
                <ol className="space-y-3">
                  {SPRINT_STEPS.map((step, i) => {
                    const state = active < 0 ? "on" : i === active ? "active" : i < active ? "done" : "todo";
                    return (
                      <li
                        key={step.title}
                        aria-current={state === "active" ? "step" : undefined}
                        className={`glass-inner flex items-start gap-4 p-4 transition-all duration-500 ease-out ${STATE_CLASS[state]}`}
                        style={accentVars(DAY_ACCENTS[i % 4])}
                      >
                        <span className="chip-accent mt-0.5 w-[72px] shrink-0 justify-center !px-1 text-[11px]">{step.day}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-medium leading-5 text-white">{step.title}</p>
                          <p className="mt-0.5 text-[13px] leading-5 text-white/60">{step.text}</p>
                        </div>
                        {state === "done" && <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--a1)]" aria-hidden="true" />}
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
