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
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li";
}) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some", margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </Tag>
  );
}
