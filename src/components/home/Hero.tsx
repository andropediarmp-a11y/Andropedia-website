import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { BlurOrb, GridLines } from "@/components/design/Backdrop";

// Hero from the Figma "Framer Course" frame: grid lines + glowing orb, pill badge, big gradient
// headline, blue glow button, then a glass dashboard card with floating score rings.
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-black pb-28 pt-[80px] sm:pt-[110px]">
      <GridLines variant="hero" />
      <BlurOrb variant="hero" size={1054} opacity={0.4} position={{ left: "50%", top: "62%" }} />

      <div className="relative mx-auto flex max-w-[700px] flex-col items-center gap-5 px-5 text-center">
        <Link href="/join" className="btn-glass" data-cursor-text="Join">
          Recruitment 2026 is open
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>

        <h1 className="text-[40px] font-medium leading-[1.05] tracking-[-2px] sm:text-[60px] sm:tracking-[-3px]">
          <span className="text-fade">Pioneering Technology.</span>{" "}
          <span className="text-aurora">Building Creators.</span>
        </h1>

        <p className="max-w-[510px] text-[16px] leading-6 text-white/70">
          Andropedia is the student technology society where high-velocity engineering, algorithmic mastery and radical
          creativity converge through weekly sprints and live member evaluations.
        </p>

        <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:gap-4">
          <Link href="/join" className="btn-glow" data-cursor-text="Join">
            Join now <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <a href="#domains" className="btn-glass !py-[10px]">
            Explore domains <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
