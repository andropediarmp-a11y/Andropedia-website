"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { AndropediaLogo } from "@/components/brand/AndropediaLogo";
import { AsciiField } from "./AsciiField";

export function JoinStage() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() === true;
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.24 });
  const cardY = useTransform(progress, [0.1, 0.72], [84, -24]);
  const cardScale = useTransform(progress, [0.1, 0.62], [0.92, 1]);
  const leftY = useTransform(progress, [0, 1], [120, -100]);
  const rightY = useTransform(progress, [0, 1], [-60, 120]);
  const backgroundScale = useTransform(progress, [0, 1], [1.12, 0.96]);

  return (
    <section ref={sectionRef} className="relative flex min-h-[110svh] items-center justify-center overflow-hidden bg-paper px-[var(--site-gutter)] py-24 text-ink">
      <motion.div style={reduced ? undefined : { scale: backgroundScale }} className="absolute inset-[4vw] overflow-hidden rounded-[var(--radius-media)] bg-brand-blue-pale" aria-hidden="true">
        <motion.div style={reduced ? undefined : { y: leftY }} className="absolute -left-[8%] -top-[8%] h-[62%] w-[48%] rounded-[45%] bg-brand-blue blur-3xl opacity-55" />
        <motion.div style={reduced ? undefined : { y: rightY }} className="absolute -right-[6%] bottom-[-12%] h-[68%] w-[52%] rounded-[42%] bg-ink blur-3xl opacity-70" />
        <div className="absolute left-[16%] top-[18%] h-[26%] w-[22%] rotate-6 bg-brand-blue" />
        <div className="absolute bottom-[9%] right-[17%] h-[31%] w-[20%] -rotate-6 bg-paper-strong opacity-75" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2"><AsciiField className="text-white/30" /></div>
      </motion.div>

      <motion.div style={reduced ? undefined : { y: cardY, scale: cardScale }} className="relative z-10 w-full max-w-[34rem] rounded-[1.6rem] bg-paper-strong px-6 py-10 text-center shadow-[0_30px_100px_rgba(8,10,13,0.2)] sm:px-12 sm:py-14">
        <AndropediaLogo className="mx-auto w-32 sm:w-36" sizes="(max-width: 640px) 128px, 144px" />
        <h2 className="type-kinetic mt-9 text-[clamp(2.2rem,5vw,4rem)] leading-[0.95]">Come build with Andropedia.</h2>
        <p className="type-body mx-auto mt-6 max-w-[42ch] text-text-muted">Join a student community that learns in public, connects disciplines, and turns ideas into working releases.</p>
        <Link href="/join" className="button-primary mt-8">Join Andropedia <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </motion.div>
    </section>
  );
}
