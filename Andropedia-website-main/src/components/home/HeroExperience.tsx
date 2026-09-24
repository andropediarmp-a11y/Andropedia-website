"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { AndropediaLogo } from "@/components/brand/AndropediaLogo";
import { HackerText } from "@/components/motion/HackerText";
import { AsciiField } from "./AsciiField";
import { CircuitNetwork } from "@/components/motion/CircuitNetwork";

const stageDots = Array.from({ length: 42 }, (_, index) => index);

export function HeroExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() === true;
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.24 });

  const headlineY = useTransform(progress, [0, 0.34], [0, -130]);
  const headlineScale = useTransform(progress, [0, 0.32], [1, 0.88]);
  const headlineOpacity = useTransform(progress, [0, 0.25, 0.42], [1, 1, 0]);
  const brandScale = useTransform(progress, [0, 0.18, 0.38], [1.08, 0.96, 0.74]);
  const brandY = useTransform(progress, [0, 0.38], [0, -64]);
  const brandTracking = useTransform(progress, [0, 0.38], ["-0.07em", "0.015em"]);
  const supportY = useTransform(progress, [0, 0.24], [38, 0]);
  const supportOpacity = useTransform(progress, [0, 0.12, 0.34], [0, 1, 0]);
  const textureY = useTransform(progress, [0, 1], [0, -160]);
  const textureRotate = useTransform(progress, [0, 1], [0, -3]);

  const stageY = useTransform(progress, [0, 0.62], ["0vh", "-58vh"]);
  const stageScale = useTransform(progress, [0, 0.62], [0.9, 1.02]);
  const stageRadius = useTransform(progress, [0, 0.62], [32, 8]);
  const stageContentOpacity = useTransform(progress, [0.12, 0.32, 0.88, 1], [0, 1, 1, 0.3]);
  const stageTitleScale = useTransform(progress, [0.18, 0.72], [0.76, 1.08]);
  const stageTitleY = useTransform(progress, [0.18, 0.72], [90, -22]);
  const circuitProgress = useTransform(progress, [0.12, 0.7], [0, 1]);

  const tileOneX = useTransform(progress, [0.12, 0.72], [-160, 20]);
  const tileOneY = useTransform(progress, [0.12, 0.72], [110, -55]);
  const tileOneRotate = useTransform(progress, [0.12, 0.72], [-12, 6]);
  const tileTwoX = useTransform(progress, [0.12, 0.72], [180, -38]);
  const tileTwoY = useTransform(progress, [0.12, 0.72], [-80, 70]);
  const tileTwoRotate = useTransform(progress, [0.12, 0.72], [14, -8]);
  const orbX = useTransform(progress, [0.12, 0.72], [120, -86]);
  const orbY = useTransform(progress, [0.12, 0.72], [150, -70]);

  return (
    <section ref={sectionRef} className={`surface-paper relative overflow-clip ${reduced ? "min-h-0" : "min-h-[175svh] lg:min-h-[220svh]"}`}>
      <div className={reduced ? "relative overflow-hidden" : "sticky top-20 h-[calc(100svh-5rem)] overflow-hidden"}>
        <motion.div style={reduced ? undefined : { y: textureY, rotate: textureRotate }} className="absolute left-1/2 top-[8%] w-[min(74rem,92vw)] -translate-x-1/2">
          <AsciiField className="mx-auto opacity-75" />
        </motion.div>

        <motion.div style={reduced ? undefined : { y: headlineY, scale: headlineScale, opacity: headlineOpacity }} className={`site-container relative z-10 flex flex-col items-center justify-center text-center ${reduced ? "min-h-[calc(100svh-5rem)] py-16" : "h-[66%]"}`}>
          <AndropediaLogo className="mb-7 w-36 sm:w-44" priority sizes="(max-width: 640px) 144px, 176px" />
          <div className="w-full overflow-hidden py-2">
            <motion.h1 style={reduced ? undefined : { scale: brandScale, y: brandY, letterSpacing: brandTracking }} className="type-kinetic whitespace-nowrap text-[clamp(3.25rem,11.7vw,11.5rem)] leading-[0.78] text-ink">ANDROPEDIA</motion.h1>
          </div>
          <motion.div style={reduced ? undefined : { y: supportY, opacity: supportOpacity }} className="mt-7 flex flex-col items-center">
            <p className="type-kinetic max-w-[18ch] text-[clamp(1.6rem,3vw,3rem)] leading-[0.98] text-ink">Where people learn, build and share.</p>
            <p className="type-body-lg mt-5 max-w-[52ch] text-text-muted">A student technology community connecting six disciplines through real work.</p>
            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
              <Link href="/join" className="button-primary w-full sm:w-auto" data-cursor-text="JOIN">Join Andropedia <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <Link href="/domains" className="text-link min-h-11" data-cursor-text="EXPLORE">Explore domains <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          </motion.div>
        </motion.div>

        <div className="pointer-events-none absolute bottom-5 left-[var(--site-gutter)] z-20 hidden items-center gap-2 lg:flex">
          <ArrowDown className="h-4 w-4 text-brand-blue" aria-hidden="true" />
          <HackerText text="Scroll to follow the signal" className="type-label text-text-muted" delay={300} />
        </div>

        <motion.div style={reduced ? undefined : { y: stageY, scale: stageScale, borderRadius: stageRadius }} className={`${reduced ? "relative mx-[var(--site-gutter)] mb-10 h-[70svh] rounded-[var(--radius-media)]" : "absolute inset-x-[var(--site-gutter)] top-[72%] h-[84%] origin-top"} overflow-hidden bg-ink text-white shadow-[0_20px_80px_rgba(8,10,13,0.18)]`}>
          <motion.div style={reduced ? undefined : { opacity: stageContentOpacity }} className="relative h-full w-full">
            <div className="absolute inset-0 grid grid-cols-7 grid-rows-6 opacity-40" aria-hidden="true">
              {stageDots.map((dot) => <span key={dot} className={`m-auto rounded-full ${dot % 5 === 0 ? "h-2 w-2 bg-brand-blue" : "h-1 w-1 bg-white"}`} />)}
            </div>

            <CircuitNetwork progress={circuitProgress} className="absolute inset-0 h-full w-full opacity-90" />

            <motion.div style={reduced ? undefined : { x: tileOneX, y: tileOneY, rotate: tileOneRotate }} className="absolute left-[8%] top-[22%] h-[clamp(5rem,12vw,10rem)] w-[clamp(5rem,12vw,10rem)] bg-brand-blue" aria-hidden="true" />
            <motion.div style={reduced ? undefined : { x: tileTwoX, y: tileTwoY, rotate: tileTwoRotate }} className="absolute right-[9%] top-[17%] h-[clamp(5.5rem,14vw,12rem)] w-[clamp(4rem,9vw,8rem)] bg-brand-blue-pale" aria-hidden="true" />
            <motion.div style={reduced ? undefined : { x: orbX, y: orbY }} className="absolute bottom-[14%] right-[18%] h-[clamp(5rem,13vw,11rem)] w-[clamp(5rem,13vw,11rem)] rounded-full border-2 border-brand-blue bg-[rgba(66,115,228,0.2)]" aria-hidden="true" />
            <div className="absolute bottom-[8%] left-[12%] h-24 w-24 rounded-full border border-white/30 sm:h-36 sm:w-36" aria-hidden="true" />

            <motion.div style={reduced ? undefined : { y: stageTitleY, scale: stageTitleScale }} className="absolute inset-0 flex items-center justify-center px-5 text-center">
              <p className="type-kinetic max-w-[10ch] text-[clamp(3.2rem,11vw,10rem)] leading-[0.84] text-white">Learn. Build. Share.</p>
            </motion.div>
            <p className="type-label absolute bottom-7 left-7 text-brand-blue-light sm:bottom-10 sm:left-10"><HackerText text="Signal / 001" delay={450} /></p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
