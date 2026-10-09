import { BlurOrb } from "@/components/design/Backdrop";
import { Reveal } from "@/components/design/Reveal";
import { ScoreRing } from "@/components/design/ScoreRing";
import { CountUp, Stagger, StaggerItem } from "@/components/design/scroll";
import { HOME_METRICS } from "@/content/home";
import { ACCENTS, DOMAIN_ACCENT, MEDAL, accentVars } from "@/content/accents";
import { getLeaderboard, getWeeks } from "@/lib/data-store";
import { log } from "@/lib/logger";
import type { DomainType, LeaderboardEntry } from "@/lib/types";

const METRIC_ACCENTS = [ACCENTS.blue, ACCENTS.teal, ACCENTS.amber, ACCENTS.pink];

// Glass "app" card from the hero frame: a snapshot of the live sprint and the club in numbers.
// It sits after the club description and the domains, with the other highlights.
export async function SprintSnapshot() {
  // Real standings. If the database can't be reached the card shows an empty state instead of failing the page.
  let rows: LeaderboardEntry[] = [];
  let sprint: number | null = null;
  try {
    const [board, weeks] = await Promise.all([getLeaderboard("All", "all-time"), getWeeks()]);
    rows = board.filter((r) => r.totalScore > 0).slice(0, 4); // nobody graded yet means the empty state, not a list of zeros
    sprint = weeks.find((w) => w.isActive)?.weekNumber ?? null;
  } catch (err) {
    log.error("Home leaderboard unavailable", err);
  }
  const top = rows[0];

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
              <span className="ml-3 text-white">{sprint ? `Sprint ${sprint} · ` : ""}Live leaderboard</span>
            </div>
            {sprint && <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-white/80">Evaluation window active</span>}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_1fr]">
            <div className="glass-inner p-4 sm:p-5">
              <h2 className="text-aurora text-[16px] font-medium leading-6">Top performers</h2>
              {rows.length === 0 ? (
                <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-6 text-center text-[14px] text-white/60">
                  Rankings appear after the first graded sprint.
                </p>
              ) : (
                <Stagger as="ol" className="mt-3 space-y-2" stagger={0.12} delay={0.15}>
                  {rows.map((row) => (
                    <StaggerItem as="li" key={row.userId} from="left" className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                      <span className="w-5 text-[14px] font-semibold" style={{ color: MEDAL[row.rank - 1] ?? "rgba(255,255,255,0.5)" }}>{row.rank}</span>
                      <span className="flex-1 text-[14px] font-medium leading-5 text-white">{row.name}</span>
                      <span className="chip-accent hidden sm:inline-flex" style={accentVars(DOMAIN_ACCENT[row.domain as DomainType])}>{row.domain}</span>
                      <span className="w-12 text-right text-[15px] font-semibold" style={{ color: MEDAL[row.rank - 1] ?? "#ffffff" }}><CountUp value={String(row.totalScore)} /></span>
                    </StaggerItem>
                  ))}
                </Stagger>
              )}
            </div>

            <Stagger className="grid grid-cols-2 gap-3" stagger={0.1} delay={0.1}>
              {HOME_METRICS.map(({ label, value, icon: Icon, sub }, i) => (
                <StaggerItem key={label} className="glass-inner flex flex-col justify-between gap-3 p-4" style={accentVars(METRIC_ACCENTS[i % 4])}>
                  <Icon className="text-a1 h-5 w-5" aria-hidden="true" />
                  <div>
                    <div className="text-accent text-[30px] font-semibold leading-none tracking-[-1px]"><CountUp value={value} /></div>
                    <div className="mt-1.5 text-[13px] leading-5 text-white/80">{label}</div>
                    <div className="text-[11px] leading-4 text-white/50">{sub}</div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>

        {/* Floating score ring, as in the design */}
        {top && <ScoreRing value={Math.round(top.avgScore)} label="Top average score" className="animate-float absolute -right-2 -top-12 hidden sm:flex lg:-right-10" />}
      </Reveal>
    </section>
  );
}
