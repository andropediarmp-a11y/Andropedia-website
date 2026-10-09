"use client";

import { useRef } from "react";
import { motion, useTransform } from "framer-motion";
import { Check } from "lucide-react";
import { useActiveStep } from "@/components/design/scroll";
import { ACCENTS, accentVars } from "@/content/accents";
import { ELIGIBILITY, PROCESS_STEPS } from "@/content/recruitment";

const STEP_ACCENTS = [ACCENTS.blue, ACCENTS.teal, ACCENTS.purple, ACCENTS.pink, ACCENTS.amber];

const STATE_CLASS = {
  on: "",
  active: "translate-x-0 scale-[1.02] opacity-100",
  done: "translate-x-0 opacity-55",
  todo: "translate-x-8 opacity-25",
} as const;

/**
 * "Who can apply" and "How selection works". On large screens the stage is pinned while the five steps of
 * the process slide in and light up one by one as you scroll. On phones and with reduced motion it is a
 * normal two-column section showing every step (the wrapper has no extra height and nothing is sticky).
 */
export function SelectionStage() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { active, progress, pinned } = useActiveStep(wrapRef, PROCESS_STEPS.length);
  const fill = useTransform(progress, [0, 1], [0.04, 1]);

  return (
    <div ref={wrapRef} className="relative lg:h-[260svh] lg:motion-reduce:h-auto">
      <div className="lg:sticky lg:top-0 lg:flex lg:h-svh lg:items-center lg:pb-4 lg:pt-16 lg:motion-reduce:static lg:motion-reduce:h-auto lg:motion-reduce:py-0">
        <section className="grid w-full grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-[0.8fr_1.2fr]" aria-label="Eligibility and selection process">
          <div className="glass-card space-y-4 p-6 sm:p-8">
            <h2 className="text-fade-strong text-xl font-semibold">Who can apply</h2>
            <ul className="space-y-3">
              {ELIGIBILITY.map((line) => (
                <li key={line} className="flex gap-3 text-sm leading-relaxed text-slate-300">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" aria-hidden="true" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card space-y-5 p-6 sm:p-8">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-fade-strong text-xl font-semibold">How selection works</h2>
              {pinned && (
                <span className="font-mono text-[12px] tabular-nums text-white/45" aria-hidden="true">
                  Step {active + 1} / {PROCESS_STEPS.length}
                </span>
              )}
            </div>
            <div className="relative">
              {pinned && (
                <div aria-hidden="true" className="absolute -left-3 bottom-2 top-2 w-px bg-white/10">
                  <motion.div className="h-full w-full origin-top bg-gradient-to-b from-teal-300 via-blue-400 to-fuchsia-400" style={{ scaleY: fill }} />
                </div>
              )}
              <ol className="space-y-4">
                {PROCESS_STEPS.map((s, i) => {
                  const state = active < 0 ? "on" : i === active ? "active" : i < active ? "done" : "todo";
                  return (
                    <li
                      key={s.title}
                      aria-current={state === "active" ? "step" : undefined}
                      className={`flex gap-4 rounded-2xl transition-all duration-500 ease-out ${STATE_CLASS[state]}`}
                      style={accentVars(STEP_ACCENTS[i % 5])}
                    >
                      <span aria-hidden="true" className="chip-accent !h-8 !w-8 shrink-0 justify-center !px-0 text-sm font-bold" style={{ boxShadow: state === "todo" ? "none" : "0 0 18px var(--a1-soft)" }}>
                        {state === "done" ? <Check className="h-4 w-4" /> : i + 1}
                      </span>
                      <div>
                        <h3 className="text-accent text-sm font-semibold">{s.title}</h3>
                        <p className="text-sm leading-relaxed text-slate-300">{s.text}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
