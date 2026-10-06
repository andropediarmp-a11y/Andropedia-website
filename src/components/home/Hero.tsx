import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { BlurOrb, GridLines } from "@/components/design/Backdrop";
import { ScoreRing } from "@/components/design/ScoreRing";
import { Reveal } from "@/components/design/Reveal";
import { DEMO_LEADERBOARD, HOME_METRICS } from "@/content/home";

// Hero from the Figma "Framer Course" frame: grid lines + glowing orb, pill badge, big gradient
// headline, blue glow button, then a glass dashboard card with floating score rings.
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-black pb-24 pt-[80px] sm:pt-[110px]">
      <GridLines variant="hero" />
      <BlurOrb variant="hero" size={1054} opacity={0.4} position={{ left: "50%", top: "62%" }} />

      <div className="relative mx-auto flex max-w-[700px] flex-col items-center gap-5 px-5 text-center">
        <Link href="/join" className="btn-glass" data-cursor-text="Join">
          Recruitment 2026 is open
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>

        <h1 className="text-fade text-[40px] font-medium leading-[1.05] tracking-[-2px] sm:text-[60px] sm:tracking-[-3px]">
          Pioneering Technology. Building Creators.
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

      {/* Glass "app" card: the live sprint snapshot */}
      <Reveal className="relative mx-auto mt-16 max-w-[975px] px-5 sm:mt-24">
        <div className="glass-card overflow-hidden p-4 sm:p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 text-[12px] leading-[18px] text-white/70">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="ml-3 text-white">Sprint 4 &middot; Live leaderboard</span>
            </div>
            <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-white/80">Evaluation window active</span>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_1fr]">
            <div className="glass-inner p-4 sm:p-5">
              <h2 className="text-[16px] font-medium leading-6 text-white">Top performers</h2>
              <ol className="mt-3 space-y-2">
                {DEMO_LEADERBOARD.map((row) => (
                  <li key={row.rank} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                    <span className="w-5 text-[13px] text-white/50">{row.rank}</span>
                    <span className="flex-1 text-[14px] font-medium leading-5 text-white">{row.name}</span>
                    <span className="hidden text-[12px] text-white/50 sm:inline">{row.domain}</span>
                    <span className="w-12 text-right text-[14px] font-medium text-white">{row.score}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {HOME_METRICS.map(({ label, value, icon: Icon, sub }) => (
                <div key={label} className="glass-inner flex flex-col justify-between gap-3 p-4">
                  <Icon className="h-5 w-5 text-emerald-300" aria-hidden="true" />
                  <div>
                    <div className="text-[28px] font-medium leading-none tracking-[-1px] text-white">{value}</div>
                    <div className="mt-1.5 text-[13px] leading-5 text-white/80">{label}</div>
                    <div className="text-[11px] leading-4 text-white/50">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating score ring, as in the design */}
        <ScoreRing value={96} label="Top task score" className="animate-float absolute -right-2 -top-12 hidden sm:flex lg:-right-10" />
      </Reveal>
    </section>
  );
}
