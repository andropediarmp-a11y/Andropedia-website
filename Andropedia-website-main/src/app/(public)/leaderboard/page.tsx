import { LeaderboardView } from "@/components/leaderboard/LeaderboardView";

export default function LeaderboardPage() {
  return (
    <div className="surface-paper min-h-[70svh]">
      <header className="section-space-compact border-b border-[var(--color-line-light)]">
        <div className="site-container editorial-grid gap-y-8">
          <div className="col-span-4 md:col-span-8 lg:col-span-8"><p className="type-label text-brand-blue">Club activity</p><h1 className="type-kinetic mt-5 text-[clamp(3rem,8vw,8rem)] leading-[0.88]">Leaderboard.</h1></div>
          <p className="type-body-lg col-span-4 text-text-muted md:col-span-5 md:col-start-4 lg:col-span-4 lg:col-start-9 lg:self-end">Standings based on evaluated club work. Rank movement is shown only when supported by real historical data.</p>
        </div>
      </header>
      <main className="site-container section-space-compact"><LeaderboardView publicData /></main>
    </div>
  );
}

