"use client";

import type { MotionValue } from "framer-motion";
import { motion, useReducedMotion, useTransform } from "framer-motion";

interface CircuitNetworkProps {
  progress: MotionValue<number>;
  className?: string;
  subtle?: boolean;
}

const nodes = [
  { cx: 168, cy: 166, delay: 0.08 },
  { cx: 342, cy: 166, delay: 0.18 },
  { cx: 456, cy: 92, delay: 0.3 },
  { cx: 650, cy: 92, delay: 0.42 },
  { cx: 762, cy: 222, delay: 0.54 },
  { cx: 970, cy: 222, delay: 0.66 },
];

function CircuitNode({ cx, cy, delay, progress }: { cx: number; cy: number; delay: number; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [delay, Math.min(delay + 0.12, 1)], [0, 1]);
  const scale = useTransform(progress, [delay, Math.min(delay + 0.16, 1)], [0.2, 1]);
  return <motion.circle cx={cx} cy={cy} r="5" fill="var(--color-brand-blue)" style={{ opacity, scale, transformOrigin: `${cx}px ${cy}px` }} />;
}

export function CircuitNetwork({ progress, className = "", subtle = false }: CircuitNetworkProps) {
  const reduced = useReducedMotion() === true;
  const primaryLength = useTransform(progress, [0.02, 0.7], [0, 1]);
  const branchLength = useTransform(progress, [0.18, 0.88], [0, 1]);
  const branchOpacity = useTransform(progress, [0.12, 0.38, 0.9, 1], [0, subtle ? 0.42 : 0.72, subtle ? 0.42 : 0.72, 0]);

  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 1200 360" preserveAspectRatio="none">
      <motion.path d="M-40 280H168V166H342L456 92H650L762 222H970L1082 110H1240" fill="none" stroke="var(--color-brand-blue)" strokeWidth={subtle ? 1 : 1.5} vectorEffect="non-scaling-stroke" style={{ pathLength: reduced ? 1 : primaryLength, opacity: branchOpacity }} />
      <motion.path d="M342 166V302H560L650 212V92M762 222V64H914L1004 154" fill="none" stroke="var(--color-brand-blue-light)" strokeWidth="1" vectorEffect="non-scaling-stroke" style={{ pathLength: reduced ? 1 : branchLength, opacity: branchOpacity }} />
      <motion.path d="M168 166L92 90H-20M970 222L1052 304H1240" fill="none" stroke="var(--color-brand-blue)" strokeWidth="1" strokeDasharray="3 7" vectorEffect="non-scaling-stroke" style={{ pathLength: reduced ? 1 : branchLength, opacity: branchOpacity }} />
      {nodes.map((node) => <CircuitNode key={`${node.cx}-${node.cy}`} {...node} progress={progress} />)}
    </svg>
  );
}
