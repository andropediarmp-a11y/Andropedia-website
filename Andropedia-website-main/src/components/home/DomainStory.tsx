"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { publicDomains } from "@/content/domains";
import type { PublicDomain } from "@/lib/public-content";
import { CircuitNetwork } from "@/components/motion/CircuitNetwork";

function DomainChapter({ domain, index, active }: { domain: PublicDomain; index: number; active: boolean }) {
  const chapterRef = useRef<HTMLAnchorElement>(null);
  const reduced = useReducedMotion() === true;
  const { scrollYProgress } = useScroll({ target: chapterRef, offset: ["start 88%", "end 28%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 26, mass: 0.22 });
  const x = useTransform(progress, [0, 0.55, 1], [56, 0, -12]);
  const opacity = useTransform(progress, [0, 0.35, 1], [0.25, 1, 0.72]);
  const lineScale = useTransform(progress, [0, 0.65], [0, 1]);

  return (
    <Link ref={chapterRef} href={`/domains#${domain.slug}`} className={`group magnetic-target relative grid min-h-[42svh] grid-cols-[3rem_1fr] content-center gap-4 border-t border-[var(--color-line-light)] py-12 transition-colors last:border-b sm:grid-cols-[4rem_1fr] lg:min-h-[54svh] ${active ? "bg-brand-blue-pale/55" : ""}`} data-cursor-text="EXPLORE">
      <motion.span style={reduced ? undefined : { scaleX: lineScale }} className="absolute left-0 top-0 h-px w-full origin-left bg-brand-blue" />
      <span className="type-label pt-2 text-brand-blue">{String(index + 1).padStart(2, "0")}</span>
      <motion.span style={reduced ? undefined : { x, opacity }}>
        <span className="type-kinetic block text-4xl leading-[0.95] text-ink transition-colors group-hover:text-brand-blue sm:text-6xl lg:text-7xl">{domain.name}</span>
        <span className="mt-5 block max-w-xl text-base leading-relaxed text-text-muted sm:text-lg">{domain.summary}</span>
      </motion.span>
    </Link>
  );
}

export function DomainStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() === true;
  const [activeIndex, setActiveIndex] = useState(0);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 85, damping: 28, mass: 0.28 });
  const circuitProgress = useTransform(progress, [0, 0.9], [0, 1]);
  const circuitY = useTransform(progress, [0, 1], [70, -110]);

  useMotionValueEvent(progress, "change", (latest) => {
    if (reduced) return;
    setActiveIndex(Math.min(publicDomains.length - 1, Math.floor(latest * publicDomains.length)));
  });

  return (
    <section ref={sectionRef} className="surface-paper relative overflow-hidden" aria-labelledby="domains-heading">
      <motion.div style={reduced ? undefined : { y: circuitY }} className="pointer-events-none sticky top-20 z-0 h-[calc(100svh-5rem)] opacity-55" aria-hidden="true">
        <CircuitNetwork progress={circuitProgress} className="absolute inset-x-0 top-[24%] h-[46%] w-full" subtle />
        <AnimatePresence mode="wait">
          <motion.p key={publicDomains[activeIndex].id} className="type-kinetic absolute bottom-[7%] left-[var(--site-gutter)] whitespace-nowrap text-[clamp(4rem,13vw,13rem)] leading-none text-brand-blue opacity-[0.08]" initial={reduced ? false : { x: 90, opacity: 0 }} animate={{ x: 0, opacity: 0.08 }} exit={{ x: -90, opacity: 0 }} transition={{ duration: reduced ? 0 : 0.45, ease: [0.22,1,0.36,1] }}>{publicDomains[activeIndex].name}</motion.p>
        </AnimatePresence>
      </motion.div>
      <div className="site-container editorial-grid relative z-10 -mt-[calc(100svh-5rem)] gap-y-12">
        <div className="col-span-4 py-20 md:col-span-8 lg:col-span-4 lg:py-0">
          <div className="lg:sticky lg:top-20 lg:flex lg:min-h-[calc(100svh-5rem)] lg:flex-col lg:justify-center">
            <p className="type-label text-brand-blue">Six pillars</p>
            <h2 id="domains-heading" className="type-kinetic mt-4 max-w-[10ch] text-[clamp(2.8rem,5vw,5rem)] leading-[0.92] text-ink">One working system.</h2>
            <p className="type-body mt-6 text-text-muted">Different disciplines, connected by the same habit: make, test, share, improve.</p>
            <Link href="/domains" className="text-link mt-8 min-h-11" data-cursor-text="EXPLORE">Explore all domains <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
        <div className="col-span-4 md:col-span-8 lg:col-span-7 lg:col-start-6">{publicDomains.map((domain, index) => <DomainChapter key={domain.id} domain={domain} index={index} active={index === activeIndex} />)}</div>
      </div>
    </section>
  );
}
