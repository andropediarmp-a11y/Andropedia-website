"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import { BlurOrb, GridLines } from "@/components/design/Backdrop";
import { Marquee } from "@/components/design/Marquee";

// Landing hero. A photographic human hand (left) and robotic arm (right) reach toward each other and
// touch at the fingertips in front of a glowing gradient ring. The headline sits BEHIND them, partly
// hidden. Scrolling down pulls the hands apart, the headline clears and sharpens, and the intro
// copy and buttons fade in. The page then continues into the domain marquee.
//
// Assets (public/hero/): hand.png and robot.png, 1376x768, each shot on a PURE BLACK background and
// blended with `mix-blend-mode: screen`, so the black disappears against the dark theme (no cut-outs).
//   hand.png  - forearm enters from the LEFT edge, index finger points right
//   robot.png - forearm enters from the RIGHT edge, index finger points left
//
// Layout (desktop):
//
//   +--------------------------------------------------------------------+
//   |  grid lines + blue orb                                             |
//   |                    .-- gradient ring --.                           |
//   |   HAND ======>  [ Pioneering Technology. ]  <====== ROBOT ARM      |   scroll 0
//   |                 [ Building Creators.     ]                         |
//   |   Andropedia - tagline                       |
//   +--------------------------------------------------------------------+
//                         scroll down (sticky stage)
//   +--------------------------------------------------------------------+
//   |  HAND ==>        Pioneering Technology.           <== ROBOT ARM    |   scroll 1
//   |                  Building Creators.                                |
//   |                    paragraph        [Join now]                     |
//   +--------------------------------------------------------------------+

// Where each index fingertip sits inside its 1376x768 image (fraction of width / height).
// Used to line both tips up on the centre of the stage.
const HAND_TIP = { x: 0.8, y: 0.385 };
const ROBOT_TIP = { x: 0.2, y: 0.35 };

export function HandRobotHero() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // 0 at the top of the section, 1 when the sticky stage is about to scroll away.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.35 });
  // Reduced motion: show the final, already-separated state and let the page scroll normally.
  const settled = useMotionValue(1);
  const p = reduce ? settled : smooth;

  // The hands pull apart over the first 60% of the travel, drifting and growing slightly.
  const handX = useTransform(p, [0, 0.6], ["0%", "-46%"]);
  const handY = useTransform(p, [0, 0.6], ["0%", "-4%"]);
  const handScale = useTransform(p, [0, 0.6], [1, 1.06]);
  const robotX = useTransform(p, [0, 0.6], ["0%", "46%"]);
  const robotY = useTransform(p, [0, 0.6], ["0%", "4%"]);
  const robotScale = useTransform(p, [0, 0.6], [1, 1.06]);
  const partOpacity = useTransform(p, [0.3, 0.6], [1, 0.75]);

  // Gradient ring behind the touch point: swells and dims as they part.
  const ringScale = useTransform(p, [0, 0.6], [1, 1.5]);
  const ringOpacity = useTransform(p, [0, 0.6], [0.85, 0.3]);
  // Spark exactly at the contact point.
  const sparkScale = useTransform(p, [0, 0.2], [1, 2.4]);
  const sparkOpacity = useTransform(p, [0, 0.18], [1, 0]);

  // Headline: present from the start (behind the hands), sharpens and settles as they part.
  const headScale = useTransform(p, [0, 0.6], [1.06, 1]);
  const headBlur = useTransform(p, [0, 0.45], ["blur(3px)", "blur(0px)"]);
  const headDim = useTransform(p, [0, 0.45], [0.8, 1]);
  // Intro copy + buttons appear once there is room.
  const subOpacity = useTransform(p, [0.35, 0.62], [0, 1]);
  const subY = useTransform(p, [0.35, 0.62], [28, 0]);
  const subPointer = useTransform(p, (v) => (v > 0.5 ? "auto" : "none"));
  // Scroll cue fades first.
  const cueOpacity = useTransform(p, [0, 0.12], [1, 0]);

  return (
    <>
      <section ref={sectionRef} aria-label="Andropedia introduction" className={`relative bg-black ${reduce ? "" : "h-[260svh]"}`}>
        <div className={`relative isolate h-svh min-h-[640px] overflow-hidden [--hr-w:150vw] sm:[--hr-w:72vw] [--hr-h:calc(var(--hr-w)*0.558)] ${reduce ? "" : "sticky top-0"}`}>
          <GridLines variant="hero" />
          <BlurOrb variant="hero" size={1054} opacity={0.4} position={{ left: "50%", top: "50%" }} />

          {/* Gradient ring behind the contact point (Andropedia teal -> blue -> purple -> pink). */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
            <motion.div style={{ scale: ringScale, opacity: ringOpacity }}>
              <div
                className="h-[min(78vw,560px)] w-[min(78vw,560px)] rounded-full"
                style={{
                  background: "conic-gradient(from 210deg, #5eead4, #3395ff, #af52de, #ff6fb1, #5eead4)",
                  WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 22px), #000 calc(100% - 21px))",
                  mask: "radial-gradient(farthest-side, transparent calc(100% - 22px), #000 calc(100% - 21px))",
                  filter: "blur(9px)",
                }}
              />
            </motion.div>
          </div>

          {/* Headline: behind the hands. */}
          {/* (Outer div centres it; the inner motion.div owns the transform so the two never fight.) */}
          <div className="absolute inset-x-0 top-1/2 z-0 -translate-y-1/2 px-5">
            <motion.div style={{ scale: headScale, filter: headBlur, opacity: headDim }} className="flex justify-center text-center">
              <h1 className="max-w-[1000px] text-[44px] font-medium leading-[1.02] tracking-[-2px] sm:text-[76px] sm:tracking-[-3.5px] lg:text-[96px] lg:tracking-[-4.5px]">
                <span className="text-fade">Pioneering Technology.</span>
                <br />
                <span className="text-aurora">Building Creators.</span>
              </h1>
            </motion.div>
          </div>

          {/* The hands. Each image is positioned so its index fingertip lands on the stage centre.
              No z-index or transform on these wrappers on purpose: either would create a stacking context
              and stop the `screen` blend from reaching the headline and glow behind the images. */}
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute" style={{ left: `calc(50% - ${HAND_TIP.x} * var(--hr-w))`, top: `calc(50% - ${HAND_TIP.y} * var(--hr-h))`, width: "var(--hr-w)" }}>
              <motion.div className="mix-blend-screen will-change-transform" style={{ x: handX, y: handY, scale: handScale, opacity: partOpacity, transformOrigin: `${HAND_TIP.x * 100}% ${HAND_TIP.y * 100}%` }}>
                <div className="animate-float">
                  <Image src="/hero/hand.png" alt="" width={1376} height={768} priority sizes="150vw" draggable={false} className="h-auto w-full select-none [filter:contrast(1.15)]" />
                </div>
              </motion.div>
            </div>
            <div className="absolute" style={{ left: `calc(50% - ${ROBOT_TIP.x} * var(--hr-w))`, top: `calc(50% - ${ROBOT_TIP.y} * var(--hr-h))`, width: "var(--hr-w)" }}>
              <motion.div className="mix-blend-screen will-change-transform" style={{ x: robotX, y: robotY, scale: robotScale, opacity: partOpacity, transformOrigin: `${ROBOT_TIP.x * 100}% ${ROBOT_TIP.y * 100}%` }}>
                <div className="animate-float" style={{ animationDelay: "-3s" }}>
                  <Image src="/hero/robot.png" alt="" width={1376} height={768} priority sizes="150vw" draggable={false} className="h-auto w-full select-none [filter:contrast(1.15)]" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Contact spark at the fingertips. */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-[3] -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
            <motion.div style={{ scale: sparkScale, opacity: sparkOpacity }}>
              <div
                className="animate-pulse-glow h-[110px] w-[110px] rounded-full mix-blend-screen"
                style={{ background: "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(94,234,212,0.7) 22%, rgba(51,149,255,0.4) 45%, transparent 70%)" }}
              />
            </motion.div>
          </div>

          {/* Intro copy + buttons, revealed in front once the hands have parted. */}
          <motion.div
            style={{ opacity: subOpacity, y: subY, pointerEvents: subPointer }}
            className="absolute inset-x-0 top-[calc(50%+104px)] z-10 flex flex-col items-center gap-5 px-5 text-center sm:top-[calc(50%+142px)] lg:top-[calc(50%+158px)]"
          >
            <p className="max-w-[510px] text-[15px] leading-6 text-white/70 sm:text-[16px]">
              Andropedia is the student technology society where high-velocity engineering, algorithmic mastery and radical
              creativity converge through weekly sprints and live member evaluations.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              <Link href="/join" className="btn-glow" data-cursor-text="Join">
                Join now <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </motion.div>

          {/* Recruitment badge, sitting just above the ring (the ring is min(78vw, 560px) wide, centred on the stage). */}
          <div className="absolute inset-x-0 z-10 flex justify-center px-5" style={{ bottom: "calc(50% + min(39vw, 280px) + 16px)" }}>
            <Link href="/join" className="btn-glass" data-cursor-text="Join">
              Recruitment 2026 is open
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Scroll cue. */}
          <motion.div style={{ opacity: cueOpacity }} className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex justify-center sm:bottom-[104px]" aria-hidden="true">
            <span className="animate-float flex items-center gap-1 text-[13px] font-medium text-white/50">
              Scroll
              <ChevronDown className="h-4 w-4" />
            </span>
          </motion.div>

          {/* Bottom row: tagline. */}
          <div className="absolute inset-x-0 bottom-0 z-10 mx-auto flex max-w-[1180px] flex-col items-center gap-4 px-5 pb-6 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:pb-9">
            <div className="hidden max-w-[300px] sm:block">
              <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-white/50">Andropedia</p>
              <p className="pt-1.5 text-[15px] leading-[22px] text-white/80">Where human creativity meets machine intelligence, one weekly sprint at a time.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-black pb-16">
        <Marquee className="relative" />
      </div>
    </>
  );
}
