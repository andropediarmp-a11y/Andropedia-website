"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const glyphs = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%+<>";

interface HackerTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  replayOnHover?: boolean;
}

export function HackerText({
  text,
  className,
  delay = 0,
  duration = 720,
  replayOnHover = true,
}: HackerTextProps) {
  const reduced = useReducedMotion() === true;
  const [display, setDisplay] = useState(text);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    intervalRef.current = null;
    timeoutRef.current = null;
  }, []);

  const run = useCallback(() => {
    stop();
    if (reduced) return;

    timeoutRef.current = window.setTimeout(() => {
      let frame = 0;
      const totalFrames = Math.max(text.length * 2, 16);
      const interval = Math.max(24, Math.round(duration / totalFrames));

      intervalRef.current = window.setInterval(() => {
        frame += 1;
        const revealed = Math.floor((frame / totalFrames) * text.length);
        setDisplay(
          text
            .split("")
            .map((character, index) => {
              if (index < revealed || !/[A-Za-z0-9]/.test(character)) return character;
              return glyphs[Math.floor(Math.random() * glyphs.length)];
            })
            .join(""),
        );

        if (frame >= totalFrames) {
          stop();
          setDisplay(text);
        }
      }, interval);
    }, delay);
  }, [delay, duration, reduced, stop, text]);

  useEffect(() => {
    run();
    return stop;
  }, [run, stop]);

  return (
    <span
      className={className}
      aria-label={text}
      onMouseEnter={replayOnHover ? run : undefined}
    >
      <span aria-hidden="true">{display}</span>
    </span>
  );
}
