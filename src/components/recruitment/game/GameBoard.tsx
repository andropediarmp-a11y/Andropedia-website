"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Lock, Trophy } from "lucide-react";
import { LEVELS } from "./config";

// Tile centres along the track: x in percent of the width, y in px of the 96px-tall track. Alternating heights make the wave.
const XS = [10, 30, 50, 70, 90];
const YS = [44, 76, 44, 76, 44];
const PAWN_LIFT = 54;

/** Smooth S-curve between two tiles, in the 100x96 box the track is drawn in. */
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
      <div className="pb-track">
        <svg viewBox="0 0 100 96" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true" focusable="false">
          {XS.slice(0, -1).map((_, i) => {
            const done = finished || i < reached;
            return (
              <path
                key={i}
                d={segment(i)}
                fill="none"
                vectorEffect="non-scaling-stroke"
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray="0.1 9"
                stroke={done ? "var(--blue-bright, #3388ff)" : "rgba(255,255,255,0.3)"}
              />
            );
          })}
        </svg>

        <ol className="contents" aria-label="Application progress">
          {LEVELS.map((level, i) => {
            const isCurrent = !finished && i === current;
            const cleared = finished || i < reached;
            const locked = !finished && i > reached;
            const state = isCurrent ? "current" : cleared ? "cleared" : locked ? "locked" : "available";
            const clickable = !finished && !isCurrent && i <= reached && !!onSelect;
            return (
              <li key={level.label} className="contents" aria-current={isCurrent ? "step" : undefined}>
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => onSelect?.(i)}
                  aria-label={`Level ${i + 1}: ${level.label}, ${state}`}
                  style={{ left: `${XS[i]}%`, top: YS[i] }}
                  className={`pb-tile ${isCurrent ? "cur" : cleared ? "done" : "lock"}`}
                >
                  {cleared && !isCurrent ? (
                    <Check className="h-[18px] w-[18px]" strokeWidth={3} aria-hidden="true" />
                  ) : locked ? (
                    <Lock className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>

        {finished ? (
          <motion.div
            className="pb-pawn"
            style={{ left: `${XS[4]}%`, top: YS[4] - PAWN_LIFT }}
            initial={reduce ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            aria-hidden="true"
          >
            <Trophy className="h-4 w-4" />
          </motion.div>
        ) : (
          <motion.div
            className="pb-pawn"
            initial={false}
            animate={{ left: `${XS[current]}%`, top: YS[current] - PAWN_LIFT }}
            transition={pawnTransition}
            aria-hidden="true"
          >
            <motion.span
              animate={reduce ? undefined : { y: [0, -5, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              {initial}
            </motion.span>
          </motion.div>
        )}
      </div>

      <div className="pb-lbls" aria-hidden="true">
        {LEVELS.map((level, i) => (
          <span key={level.label} className={!finished && i === current ? "on" : undefined}>
            {level.short}
          </span>
        ))}
      </div>
    </div>
  );
}
