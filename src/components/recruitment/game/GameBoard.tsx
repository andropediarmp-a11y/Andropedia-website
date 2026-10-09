"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Lock, Trophy } from "lucide-react";
import { LEVELS } from "./config";

// Tile centres along the track, in percent of the board. Alternating heights make the wave.
const XS = [10, 30, 50, 70, 90];
const YS = [32, 68, 32, 68, 32];

/** Smooth S-curve between two tiles, in the 100x100 box the track is drawn in. */
const segment = (i: number) => {
  const mid = (XS[i] + XS[i + 1]) / 2;
  return `M${XS[i]} ${YS[i]} C${mid} ${YS[i]} ${mid} ${YS[i + 1]} ${XS[i + 1]} ${YS[i + 1]}`;
};

interface GameBoardProps {
  /** Level being played now (0-based). */
  current: number;
  /** Furthest level reached; every level before it is cleared. */
  reached: number;
  onSelect?: (level: number) => void;
  /** Player's initial for the pawn. */
  initial: string;
  /** Success screen: every tile is done and the pawn gives way to a trophy. */
  finished?: boolean;
}

export function GameBoard({ current, reached, onSelect, initial, finished = false }: GameBoardProps) {
  const reduce = useReducedMotion();
  const pawnTransition = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 140, damping: 18 };

  return (
    <div>
      <div className="relative h-[104px] sm:h-[128px]">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true" focusable="false">
          {XS.slice(0, -1).map((_, i) => {
            const done = finished || i < reached;
            return (
              <path
                key={i}
                d={segment(i)}
                fill="none"
                vectorEffect="non-scaling-stroke"
                strokeWidth={done ? 3.5 : 3}
                strokeLinecap="round"
                strokeDasharray="0.1 9"
                stroke={done ? "var(--a1, #3395ff)" : "rgba(255,255,255,0.25)"}
                style={done ? { filter: "drop-shadow(0 0 4px var(--a1, #3395ff))" } : undefined}
              />
            );
          })}
        </svg>

        <ol className="contents" aria-label="Application progress">
          {LEVELS.map((level, i) => {
            const isCurrent = !finished && i === current;
            const cleared = finished || i < reached;
            const locked = !finished && i > reached;
            const Icon = level.icon;
            const state = isCurrent ? "current" : cleared ? "cleared" : locked ? "locked" : "available";
            const clickable = !finished && !isCurrent && i <= reached && !!onSelect;
            return (
              <li key={level.label} className="contents" aria-current={isCurrent ? "step" : undefined}>
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => onSelect?.(i)}
                  aria-label={`Level ${i + 1}: ${level.label}, ${state}`}
                  style={{ left: `${XS[i]}%`, top: `${YS[i]}%` }}
                  className={`absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 sm:h-12 sm:w-12 ${
                    isCurrent
                      ? "glass-inner !rounded-xl !border-[var(--a1)] text-white shadow-[0_0_26px_var(--a1-soft)]"
                      : cleared
                        ? "border-[var(--a1-line)] bg-[var(--a1-soft)] text-a1 enabled:cursor-pointer enabled:hover:border-[var(--a1)]"
                        : "border-white/10 bg-black/60 text-slate-500"
                  } ${locked ? "cursor-not-allowed" : ""}`}
                >
                  {cleared && !isCurrent ? (
                    <Check className="h-5 w-5" aria-hidden="true" />
                  ) : locked ? (
                    <Lock className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </li>
            );
          })}
        </ol>

        {finished ? (
          <motion.div
            className="pointer-events-none absolute flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-[var(--a1)] text-black"
            style={{ left: `${XS[4]}%`, top: `calc(${YS[4]}% - 44px)` }}
            initial={reduce ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            aria-hidden="true"
          >
            <Trophy className="h-4 w-4" />
          </motion.div>
        ) : (
          <motion.div
            className="pointer-events-none absolute -translate-x-1/2"
            initial={false}
            animate={{ left: `${XS[current]}%`, top: `calc(${YS[current]}% - 44px)` }}
            transition={pawnTransition}
            aria-hidden="true"
          >
            <motion.span
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--a1)] text-sm font-bold uppercase text-black shadow-[0_0_16px_var(--a1)]"
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              {initial}
            </motion.span>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-5" aria-hidden="true">
        {LEVELS.map((level, i) => (
          <span
            key={level.label}
            className={`text-center font-mono text-[10px] uppercase tracking-wider sm:text-xs ${!finished && i === current ? "text-a1" : "text-slate-400"}`}
          >
            <span className="sm:hidden">{level.short}</span>
            <span className="hidden sm:inline">{level.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
