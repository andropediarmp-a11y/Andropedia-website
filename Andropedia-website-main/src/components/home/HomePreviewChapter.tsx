"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, type MotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { CircuitNetwork } from "@/components/motion/CircuitNetwork";

export interface PreviewItem {
  id: string;
  kicker: string;
  title: string;
  summary: string;
}

interface HomePreviewChapterProps {
  eyebrow: string;
  title: string;
  href: string;
  linkLabel: string;
  items: PreviewItem[];
  emptyTitle: string;
  emptyBody: string;
  strong?: boolean;
}

function PreviewRow({ item, index, progress, reduced }: { item: PreviewItem; index: number; progress: MotionValue<number>; reduced: boolean }) {
  const x = useTransform(progress, [0.08 + index * 0.05, 0.5 + index * 0.05], [70 + index * 16, 0]);
  return <motion.li style={reduced ? undefined : { x }} className="grid gap-3 border-b border-[var(--color-line-light)] py-7 sm:grid-cols-[9rem_1fr]" data-cursor-text="EXPLORE"><span className="type-label text-brand-blue">{item.kicker}</span><span><span className="block text-2xl font-semibold tracking-[-0.03em]">{item.title}</span><span className="mt-2 block text-sm leading-relaxed text-text-muted">{item.summary}</span></span></motion.li>;
}

export function HomePreviewChapter({ eyebrow, title, href, linkLabel, items, emptyTitle, emptyBody, strong = false }: HomePreviewChapterProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() === true;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.24 });
  const headingY = useTransform(progress, [0.04, 0.44, 1], [120, 0, -75]);
  const headingScale = useTransform(progress, [0.05, 0.48], [1.18, 1]);
  const contentY = useTransform(progress, [0, 1], [68, -36]);
  const circuitProgress = useTransform(progress, [0.08, 0.68], [0, 1]);

  return (
    <section ref={ref} className={`${strong ? "surface-paper-strong" : "surface-paper"} section-space relative min-h-[90svh] overflow-hidden`} aria-labelledby={`${eyebrow.toLowerCase().replaceAll(" ", "-")}-heading`}>
      <CircuitNetwork progress={circuitProgress} className="pointer-events-none absolute inset-x-0 bottom-[4%] h-[38%] w-full opacity-35" subtle />
      <div className="site-container editorial-grid relative z-10 gap-y-12">
        <motion.div style={reduced ? undefined : { y: headingY, scale: headingScale }} className="col-span-4 origin-left md:col-span-8 lg:col-span-5">
          <p className="type-label text-text-muted">{eyebrow}</p>
          <h2 id={`${eyebrow.toLowerCase().replaceAll(" ", "-")}-heading`} className="type-kinetic mt-4 text-[clamp(2.8rem,5.6vw,5.8rem)] leading-[0.92]">{title}</h2>
        </motion.div>
        <motion.div style={reduced ? undefined : { y: contentY }} className="col-span-4 md:col-span-6 md:col-start-3 lg:col-span-6 lg:col-start-7">
          {items.length === 0 ? <div className="border-y border-[var(--color-line-light)] py-10"><p className="text-xl font-semibold">{emptyTitle}</p><p className="type-body mt-3 text-text-muted">{emptyBody}</p></div> : <ol className="border-t border-[var(--color-line-light)]">{items.slice(0,3).map((item, index) => <PreviewRow key={item.id} item={item} index={index} progress={progress} reduced={reduced} />)}</ol>}
          <Link href={href} className="text-link mt-8 min-h-11" data-cursor-text="OPEN">{linkLabel} <ArrowRight className="h-4 w-4" /></Link>
        </motion.div>
      </div>
    </section>
  );
}
