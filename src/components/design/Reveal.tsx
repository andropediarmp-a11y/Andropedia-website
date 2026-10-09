"use client";

import { motion } from "framer-motion";

/**
 * Fades and lifts content in as it scrolls into view. `amount: "some"` triggers as soon as any part
 * is visible, so very tall sections are never stuck invisible. Honours reduced motion (MotionConfig).
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as = "div",
  margin = "0px 0px -60px 0px",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li";
  /** Root margin for the in-view trigger. Use "0px" inside pinned stages, where content never scrolls into the usual zone. */
  margin?: string;
}) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some", margin }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </Tag>
  );
}
