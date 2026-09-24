"use client";

import { useRef } from "react";
import { motion, MotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { AsciiField } from "./AsciiField";
import { HackerText } from "@/components/motion/HackerText";

const words = ["Learn", "in", "public.", "Build", "together."];

function KineticWord({ word, index, progress, reduced }: { word: string; index: number; progress: MotionValue<number>; reduced: boolean }) {
  const start = Math.min(0.1 + index * 0.07, 0.52);
  const y = useTransform(progress, [start, Math.min(start + 0.28, 0.9)], [80, 0]);
  const rotate = useTransform(progress, [start, Math.min(start + 0.28, 0.9)], [2.5, 0]);
  const opacity = useTransform(progress, [start, Math.min(start + 0.16, 0.82)], [0.15, 1]);

  return <span className="inline-block overflow-hidden align-top"><motion.span className="inline-block" style={reduced ? undefined : { y, rotate, opacity }}>{word}</motion.span></span>;
}

export function AboutStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() === true;
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.24 });
  const copyY = useTransform(progress, [0.25, 0.75], [48, -24]);
  const textureY = useTransform(progress, [0, 1], [90, -110]);

  return (
    <section ref={sectionRef} id="about" className="surface-paper-strong relative min-h-[110svh] overflow-hidden scroll-mt-20">
      <motion.div style={reduced ? undefined : { y: textureY }} className="absolute -right-20 top-[18%] opacity-80"><AsciiField /></motion.div>
      <motion.div style={reduced ? undefined : { y: textureY }} className="absolute -left-28 bottom-[8%] rotate-90 opacity-40"><AsciiField /></motion.div>
      <div className="site-container relative z-10 flex min-h-[110svh] items-center py-16">
        <div className="editorial-grid w-full gap-y-12">
          <p className="type-label col-span-4 text-brand-blue md:col-span-8 lg:col-span-12"><HackerText text="Introduction / 002" /></p>
          <h2 className="type-kinetic col-span-4 max-w-[13ch] text-[clamp(3rem,7vw,7.2rem)] leading-[0.92] md:col-span-8 lg:col-span-10">
            {words.map((word, index) => <span key={`${word}-${index}`}><KineticWord word={word} index={index} progress={progress} reduced={reduced} />{" "}</span>)}
          </h2>
          <motion.p style={reduced ? undefined : { y: copyY }} className="type-body-lg col-span-4 max-w-[45ch] text-text-muted md:col-span-5 md:col-start-4 lg:col-span-4 lg:col-start-9 lg:self-end">Andropedia brings students from six disciplines into one working community—sharing skills, making useful things, and learning through practice.</motion.p>
        </div>
      </div>
    </section>
  );
}
