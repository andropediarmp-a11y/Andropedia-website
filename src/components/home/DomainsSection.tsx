import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { BlurOrb, TitleLines } from "@/components/design/Backdrop";
import { Reveal } from "@/components/design/Reveal";
import { HOME_DOMAINS } from "@/content/home";
import { DOMAIN_ACCENT, accentVars } from "@/content/accents";

// "Features" frame from the design: a small line, a big fading title, then glass cards.
// The domain descriptions sit in the cards and the Join Now button sits directly beneath them.
export function DomainsSection() {
  return (
    <section id="domains" className="relative isolate scroll-mt-20 overflow-hidden bg-black px-5 py-24 sm:px-10">
      <BlurOrb variant="features" size={800} opacity={0.5} position={{ left: "50%", top: "42%" }} />

      <div className="relative mx-auto max-w-[1100px] space-y-14">
        <Reveal className="relative mx-auto max-w-[800px] space-y-3 pt-6 text-center">
          <TitleLines className="-top-2 hidden sm:block" />
          <p className="text-fade text-[20px] leading-7 tracking-[-0.96px] sm:text-[24px]">Six specialised domains</p>
          <h2 className="text-[34px] font-medium leading-[1.1] tracking-[-2px] sm:text-[50px]">
            <span className="text-fade">Find the track that fits</span> <span className="text-aurora">how you build</span>
          </h2>
        </Reveal>

        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {HOME_DOMAINS.map((d, i) => {
            const Icon = d.icon;
            const accent = DOMAIN_ACCENT[d.apiDomain];
            return (
              <Reveal as="li" key={d.id} delay={(i % 3) * 0.08} className="h-full">
                <article className="glass-card flex h-full flex-col gap-5 overflow-hidden p-6 sm:p-7" style={accentVars(accent)} data-cursor-text={d.title}>
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 85% 38% at 50% 0%, var(--a1-soft), transparent 72%)" }} />
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="glass-inner flex h-12 w-12 items-center justify-center !rounded-xl" style={{ borderColor: "var(--a1-line)", boxShadow: "0 0 24px var(--a1-soft)" }}>
                      <Icon className="text-a1 h-6 w-6" aria-hidden="true" />
                    </div>
                    <span className="chip-accent">{d.stats}</span>
                  </div>

                  <div className="relative space-y-1">
                    <h3 className="text-accent text-[20px] font-medium leading-[27px]">{d.title}</h3>
                    <p className="text-a2 text-[12px] leading-[18px] opacity-80">{d.subtitle}</p>
                  </div>

                  <p className="relative text-[16px] leading-6 text-white/65">{d.description}</p>

                  <ul className="relative space-y-1.5 border-t pt-4" style={{ borderColor: "var(--a1-soft)" }}>
                    {d.activities.map((a) => (
                      <li key={a} className="flex items-center gap-2 text-[13px] leading-5 text-white/70">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--a1)", boxShadow: "0 0 8px var(--a1)" }} aria-hidden="true" />
                        {a}
                      </li>
                    ))}
                  </ul>

                  <div className="relative mt-auto pt-2">
                    <Link
                      href={`/domains?tab=${encodeURIComponent(d.id === "RD" ? "R&D" : d.id)}`}
                      className="btn-ghost accent"
                      aria-label={`Explore the ${d.title} track`}
                    >
                      Explore track <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </ul>

        <Reveal className="flex flex-col items-center gap-3 pt-2 text-center">
          <Link href="/join" className="btn-glow" data-cursor-text="Join">
            Join now <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="text-[13px] leading-5 text-white/50">Recruitment 2026 is open. Pick your domain and apply.</p>
        </Reveal>
      </div>
    </section>
  );
}
