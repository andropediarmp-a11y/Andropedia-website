"use client";

import {
  Children,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  type RefObject,
} from "react";
import { animate, motion, useInView, useMotionValueEvent, useReducedMotion, useScroll, useSpring, type MotionValue, type Variants } from "framer-motion";
import { stepForProgress } from "@/lib/scroll-steps";

// Scroll helpers shared by the landing page sections. Everything here only animates transform and
// opacity, and every effect has a plain, fully readable fallback for reduced motion and small screens.

const LG = "(min-width: 1024px)";
const subscribeLg = (notify: () => void) => {
  const query = window.matchMedia(LG);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};

/** True when a section is shown pinned: a large screen and the visitor has not asked for reduced motion. */
export function usePinned(): boolean {
  const reduce = useReducedMotion();
  const large = useSyncExternalStore(subscribeLg, () => window.matchMedia(LG).matches, () => false);
  return large && !reduce;
}

/** Scroll progress 0..1 across a tall wrapper whose child is `sticky` (same spring as the hero). */
export function useStageProgress(ref: RefObject<HTMLElement | null>): MotionValue<number> {
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.35 });
}

/**
 * The active step of a pinned stage. Returns -1 when the stage is not pinned, meaning "show everything
 * normally". Re-renders only when the step changes, not on every scroll frame.
 */
export function useActiveStep(ref: RefObject<HTMLElement | null>, count: number) {
  const pinned = usePinned();
  const progress = useStageProgress(ref);
  const [step, setStep] = useState(0);
  useMotionValueEvent(progress, "change", (v) => {
    const next = stepForProgress(v, count);
    setStep((current) => (current === next ? current : next));
  });
  return { active: pinned ? step : -1, progress, pinned };
}

// ------------------------------------------------------------------ count up

/** "48+" -> prefix "", 48, suffix "+". Anything without a number is shown as it is. */
function splitNumber(text: string) {
  const m = /^(\D*?)(\d[\d,]*)(.*)$/.exec(text);
  if (!m) return null;
  return { prefix: m[1], value: Number(m[2].replace(/,/g, "")), suffix: m[3] };
}

/** Counts up to a value like "48+", "$15k+" or "240" the first time it scrolls into view. */
export function CountUp({ value, className = "", duration = 1.4 }: { value: string; className?: string; duration?: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const parsed = splitNumber(value);
  const target = parsed?.value ?? 0;
  const [shown, setShown] = useState(target);
  const [armed, setArmed] = useState(false);

  // Below the fold at load: start from zero so the count is visible when it arrives.
  useEffect(() => {
    if (reduce || !parsed) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShown(0);
    setArmed(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, value]);

  useEffect(() => {
    if (!inView || !armed || reduce || !parsed) return;
    const controls = animate(0, target, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, armed, reduce, target, duration]);

  if (!parsed) return <span className={className}>{value}</span>;
  return (
    <span ref={ref} className={className} aria-label={value}>
      <span aria-hidden="true">
        {parsed.prefix}
        {shown.toLocaleString("en-US")}
        {parsed.suffix}
      </span>
    </span>
  );
}

// ------------------------------------------------------------------ headings

/** A heading whose lines slide up out of a mask, one after another. Each child is one line. */
export function RevealLines({
  children,
  as = "h2",
  className = "",
  stagger = 0.12,
  margin = "0px 0px -60px 0px",
}: {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  stagger?: number;
  margin?: string;
}) {
  const Tag = motion[as];
  const lines = Children.toArray(children);
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: "some", margin }}
      transition={{ staggerChildren: stagger }}
    >
      {lines.map((line, i) => (
        // The padding and negative margin keep descenders (g, y, p) from being clipped by the mask.
        <span key={i} className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
          <motion.span
            className="block"
            variants={{ hidden: { y: "110%", opacity: 0 }, show: { y: "0%", opacity: 1 } }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

// ------------------------------------------------------------------ stagger

type From = "up" | "left" | "right";

const itemVariants = (from: From, tilt: number): Variants => ({
  hidden: {
    opacity: 0,
    y: from === "up" ? 44 : 24,
    x: from === "left" ? -64 : from === "right" ? 64 : 0,
    rotate: from === "left" ? -tilt : from === "right" ? tilt : 0,
    scale: 0.96,
  },
  show: { opacity: 1, y: 0, x: 0, rotate: 0, scale: 1, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
});

/** Children that use <StaggerItem> arrive one after another when this scrolls into view. */
export function Stagger({
  children,
  as = "div",
  className = "",
  stagger = 0.1,
  delay = 0,
  margin = "0px 0px -60px 0px",
}: {
  children: ReactNode;
  as?: "div" | "ul" | "ol" | "section";
  className?: string;
  stagger?: number;
  delay?: number;
  margin?: string;
}) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: "some", margin }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {children}
    </Tag>
  );
}

export function StaggerItem({
  children,
  as = "div",
  className = "",
  from = "up",
  tilt = 0,
  style,
}: {
  children: ReactNode;
  as?: "div" | "li";
  className?: string;
  style?: CSSProperties;
  from?: From;
  /** Degrees the item starts rotated by when it comes in from the side. */
  tilt?: number;
}) {
  const Tag: ElementType = motion[as];
  return (
    <Tag className={className} style={style} variants={itemVariants(from, tilt)}>
      {children}
    </Tag>
  );
}
