import type { Metadata } from "next";
import { ArrowRight, Check, ChevronDown, MessageSquareText, Rocket, Sparkles, Users } from "lucide-react";
import { BlurOrb, GridLines } from "@/components/design/Backdrop";
import { JoinForm } from "@/components/recruitment/JoinForm";
import { ELIGIBILITY, FAQS, PROCESS_STEPS, RECRUITMENT_CYCLE, WHY_JOIN } from "@/content/recruitment";

const description =
  "Apply to join Andropedia, the student technology club. See who can apply, how selection works, and submit your application.";

export const metadata: Metadata = {
  title: { absolute: `Join Andropedia | ${RECRUITMENT_CYCLE}` },
  description,
  alternates: { canonical: "/join" },
  openGraph: {
    title: `Join Andropedia | ${RECRUITMENT_CYCLE}`,
    description,
    url: "/join",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Andropedia: student technology club" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Join Andropedia | ${RECRUITMENT_CYCLE}`,
    description,
    images: ["/opengraph-image"],
  },
};

const WHY_ICONS = [Rocket, MessageSquareText, Users];

// Static overview rendered on the server; only the application form is a client component.
export default function JoinPage() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-black py-10 sm:py-14 px-4 sm:px-6 lg:px-8 text-white">
      <GridLines variant="hero" />
      <BlurOrb variant="features" size={800} opacity={0.45} position={{ left: "50%", top: "420px" }} />
      <div className="relative max-w-5xl mx-auto space-y-14 sm:space-y-16">
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <div className="chip">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            ANDROPEDIA {RECRUITMENT_CYCLE.toUpperCase()}
          </div>
          <h1 className="text-fade text-[40px] sm:text-[60px] font-medium leading-[1.05] tracking-[-2px] sm:tracking-[-3px]">
            Join the Tech Forge
          </h1>
          <p className="text-white/70 text-base leading-6">
            Take the leap. Build real systems, solve high-stakes problems, and climb the club leaderboard alongside the sharpest minds on campus.
          </p>
          <a
            href="#apply"
            className="btn-glow"
            data-cursor-text="Apply"
          >
            Start your application <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5" aria-labelledby="why-heading">
          <h2 id="why-heading" className="sr-only">Why join Andropedia</h2>
          {WHY_JOIN.map((item, i) => {
            const Icon = WHY_ICONS[i % WHY_ICONS.length];
            return (
              <div key={item.title} className="glass-card p-6 space-y-3">
                <div className="glass-inner w-10 h-10 !rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{item.text}</p>
              </div>
            );
          })}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6 sm:gap-8" aria-label="Eligibility and selection process">
          <div className="glass-card p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white">Who can apply</h2>
            <ul className="space-y-3">
              {ELIGIBILITY.map((line) => (
                <li key={line} className="flex gap-3 text-sm text-slate-300 leading-relaxed">
                  <Check className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" aria-hidden="true" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card p-6 sm:p-8 space-y-5">
            <h2 className="text-xl font-bold text-white">How selection works</h2>
            <ol className="space-y-5">
              {PROCESS_STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span aria-hidden="true" className="w-8 h-8 shrink-0 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{s.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="apply" className="scroll-mt-24" aria-label="Application">
          <JoinForm />
        </section>

        <section className="glass-card p-6 sm:p-12 space-y-6" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-fade text-[30px] font-medium tracking-[-1.2px]">Frequently asked questions</h2>
          <div className="divide-y divide-white/10">
            {FAQS.map((faq, index) => (
              <details key={faq.q} open={index === 0} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md font-semibold text-white hover:text-emerald-400 transition-colors text-base [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70">
                  <span>{faq.q}</span>
                  <ChevronDown className="w-5 h-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180 group-open:text-emerald-400" aria-hidden="true" />
                </summary>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
