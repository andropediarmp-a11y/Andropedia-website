import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BlurOrb } from "@/components/design/Backdrop";
import { Reveal } from "@/components/design/Reveal";
import { HOME_HIGHLIGHTS } from "@/content/home";
import { ACCENTS, accentVars } from "@/content/accents";

const CARD_ACCENTS = [ACCENTS.blue, ACCENTS.purple, ACCENTS.teal];

// "Changelog" frame from the design: a two-tone statement, then flat dark cards.
export function Highlights() {
  return (
    <section id="highlights" className="relative isolate overflow-hidden bg-black px-5 py-24 sm:px-10 lg:px-[90px]">
      <BlurOrb variant="log" size={800} opacity={0.4} position={{ left: "50%", top: "60%" }} />

      <div className="relative mx-auto max-w-[1260px] space-y-14">
        <Reveal className="max-w-[720px] space-y-7">
          <p className="text-[24px] font-medium leading-[1.25] tracking-[-1.2px] text-white sm:text-[30px]">
            <span style={{ color: ACCENTS.blue.a2 }}>Hackathons,</span>{" "}
            <span style={{ color: ACCENTS.purple.a2 }}>sprints</span> and{" "}
            <span style={{ color: ACCENTS.teal.a2 }}>open source.</span>{" "}
            <span className="text-[#606060]">
              Here is what the club is building and shipping right now, and where you can join in.
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/events" className="btn-glass">
              All events <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/projects" className="btn-ghost">
              All projects <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>

        <ul className="grid gap-5 md:grid-cols-3">
          {HOME_HIGHLIGHTS.map((h, i) => (
            <Reveal as="li" key={h.title} delay={i * 0.08} className="h-full">
              <article className="dark-card flex h-full flex-col justify-between gap-8 p-6 sm:p-[30px]" style={accentVars(CARD_ACCENTS[i % 3])}>
                <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 30% at 50% 0%, var(--a1-soft), transparent 75%)" }} />
                <div className="relative space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="chip !px-3 !tracking-[0.06em]">{h.tag}</span>
                    <span className="chip-accent">{h.badge}</span>
                  </div>
                  <h3 className="text-accent text-[20px] font-medium leading-[30px]">{h.title}</h3>
                  <p className="text-[12px] leading-[18px] text-white/50">{h.date}</p>
                  <p className="text-[16px] leading-6 text-white/70">{h.desc}</p>
                </div>
                <Link href={h.link} className="text-a2 relative inline-flex items-center gap-1.5 text-[14px] font-medium hover:text-white">
                  {h.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
