"use client";

import { MotionConfig } from "framer-motion";

/** Makes every framer-motion animation honour the visitor's "reduce motion" OS setting. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
