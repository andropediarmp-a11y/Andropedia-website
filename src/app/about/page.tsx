import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/design/Reveal";
import { BlurOrb } from "@/components/design/Backdrop";
import { DISPLAY_TYPE, Marquee } from "@/components/design/Marquee";
import { ABOUT_POINTS, HOME_DOMAINS, HOME_METRICS } from "@/content/home";
import { DOMAIN_ACCENT, accentVars } from "@/content/accents";

export const metadata: Metadata = {
  title: "About | Andropedia",
  description: "Andropedia is a student technology club: six domains, weekly graded sprints and one live leaderboard.",
};

const display = DISPLAY_TYPE;

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden bg-black text-white">
      {/* Hero */}
      <section className="relative mx-auto max-w-[1200px] px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
        <BlurOrb variant="hero" size={900} opacity={0.35} position={{ left: "70%", top: "30%" }} />
        <p className="relative mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-white/50">About Andropedia</p>
        <h1 className={`${display} relative text-[clamp(2.75rem,9vw,6.5rem)]`}>
          We build
          <br />
          <span className="text-accent" style={accentVars(DOMAIN_ACCENT.Web)}>together.</span>
        </h1>
        <p className="relative mt-10 max-w-xl text-lg leading-7 text-white/70">
          Andropedia is a student technology club. Six domains, one team: members take on weekly tasks, get graded
          against a clear rubric by their domain leads, and see exactly where they stand on a live leaderboard.
        </p>
      </section>

      <Marquee />

      {/* Principles */}
      <section className="mx-auto max-w-[1200px] px-4 py-24 sm:px-6">
        <ol>
          {ABOUT_POINTS.map((p, i) => (
            <Reveal as="li" key={p.title} className="grid gap-4 border-t border-white/10 py-10 sm:grid-cols-[120px_1fr_1fr] sm:items-baseline">
              <span className={`${display} text-3xl text-white/30`}>{String(i + 1).padStart(2, "0")}</span>
              <h2 className={`${display} text-[clamp(1.75rem,4vw,3rem)]`}>{p.title}</h2>
              <p className="max-w-md text-base leading-6 text-white/65">{p.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Numbers */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-px px-4 sm:px-6 lg:grid-cols-4">
          {HOME_METRICS.map((m, i) => (
            <Reveal key={m.label} delay={i * 0.08} className="py-12 pr-6">
              <div className={`${display} text-[clamp(2.5rem,6vw,4.25rem)]`}>{m.value}</div>
              <div className="mt-3 text-sm font-semibold text-white">{m.label}</div>
              <div className="text-xs text-white/50">{m.sub}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Domains as typographic rows */}
      <section className="mx-auto max-w-[1200px] px-4 py-24 sm:px-6">
        <p className="mb-8 text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Six domains</p>
        <ul>
          {HOME_DOMAINS.map((d) => (
            <li key={d.id} style={accentVars(DOMAIN_ACCENT[d.apiDomain])}>
              <Link
                href={`/domains?tab=${encodeURIComponent(d.apiDomain)}`}
                className="group flex items-end justify-between gap-6 border-t border-white/10 py-6 transition-colors hover:bg-white/[0.03]"
              >
                <span className={`${display} text-[clamp(2rem,6vw,4.5rem)] text-white transition-colors group-hover:text-[var(--a1)]`}>
                  {d.title}
                </span>
                <span className="hidden max-w-[260px] pb-3 text-sm text-white/55 md:block">{d.subtitle}</span>
                <ArrowUpRight className="mb-4 h-8 w-8 shrink-0 text-white/40 transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[var(--a1)]" aria-hidden="true" />
              </Link>
            </li>
          ))}
          <li className="border-t border-white/10" />
        </ul>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1200px] px-4 pb-32 sm:px-6">
        <h2 className={`${display} text-[clamp(2.5rem,8vw,6rem)]`}>
          Build with <span className="text-accent" style={accentVars(DOMAIN_ACCENT.Design)}>us.</span>
        </h2>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/join" className="btn-glow">Join the club</Link>
          <Link href="/team" className="btn-ghost">Meet the team</Link>
        </div>
      </section>
    </div>
  );
}
