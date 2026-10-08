import { BlurOrb } from "@/components/design/Backdrop";
import { Reveal } from "@/components/design/Reveal";
import { ScoreRing } from "@/components/design/ScoreRing";
import { DEMO_LEADERBOARD, HOME_METRICS } from "@/content/home";
import { ACCENTS, DOMAIN_ACCENT, MEDAL, accentVars } from "@/content/accents";
import type { DomainType } from "@/lib/types";

const METRIC_ACCENTS = [ACCENTS.blue, ACCENTS.teal, ACCENTS.amber, ACCENTS.pink];

// Glass "app" card from the hero frame: a snapshot of the live sprint and the club in numbers.
// It sits after the club description and the domains, with the other highlights.
export function SprintSnapshot() {
  return (
    <section id="sprint" className="relative isolate overflow-hidden bg-black px-5 py-24 sm:px-10">
      <BlurOrb variant="hero" size={900} opacity={0.3} position={{ left: "50%", top: "50%" }} />

      <Reveal className="relative mx-auto max-w-[975px]">
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
              <h2 className="text-aurora text-[16px] font-medium leading-6">Top performers</h2>
              <ol className="mt-3 space-y-2">
                {DEMO_LEADERBOARD.map((row) => (
                  <li key={row.rank} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                    <span className="w-5 text-[14px] font-semibold" style={{ color: MEDAL[row.rank - 1] ?? "rgba(255,255,255,0.5)" }}>{row.rank}</span>
                    <span className="flex-1 text-[14px] font-medium leading-5 text-white">{row.name}</span>
                    <span className="chip-accent hidden sm:inline-flex" style={accentVars(DOMAIN_ACCENT[row.domain as DomainType])}>{row.domain}</span>
                    <span className="w-12 text-right text-[15px] font-semibold" style={{ color: MEDAL[row.rank - 1] ?? "#ffffff" }}>{row.score}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {HOME_METRICS.map(({ label, value, icon: Icon, sub }, i) => (
                <div key={label} className="glass-inner flex flex-col justify-between gap-3 p-4" style={accentVars(METRIC_ACCENTS[i % 4])}>
                  <Icon className="text-a1 h-5 w-5" aria-hidden="true" />
                  <div>
                    <div className="text-accent text-[30px] font-semibold leading-none tracking-[-1px]">{value}</div>
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
