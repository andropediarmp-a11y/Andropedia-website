import type { Metadata } from "next";
import { ArrowRight, Check, ChevronDown, MessageSquareText, Rocket, Sparkles, Users } from "lucide-react";
import { JoinForm } from "@/components/recruitment/JoinForm";
import { ELIGIBILITY, FAQS, PROCESS_STEPS, RECRUITMENT_CYCLE, WHY_JOIN } from "@/content/recruitment";

const description =
  "Apply to join Andropedia, the student technology club. See who can apply, how selection works, and submit your application.";

export const metadata: Metadata = {
  title: { absolute: `Join Andropedia | ${RECRUITMENT_CYCLE}` },
  description,
  alternates: { canonical: "/join" },
  openGraph: { title: `Join Andropedia | ${RECRUITMENT_CYCLE}`, description, url: "/join", type: "website" },
};

const WHY_ICONS = [Rocket, MessageSquareText, Users];

// Static overview rendered on the server; only the application form is a client component.
export default function JoinPage() {
  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-14 sm:space-y-16">
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            ANDROPEDIA {RECRUITMENT_CYCLE.toUpperCase()}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
            Join the <span className="text-gradient-emerald">Tech Forge</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Take the leap. Build real systems, solve high-stakes problems, and climb the club leaderboard alongside the sharpest minds on campus.
          </p>
          <a
            href="#apply"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
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
              <div key={item.title} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{item.text}</p>
              </div>
            );
          })}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6 sm:gap-8" aria-label="Eligibility and selection process">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
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

          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-5">
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

        <section className="glass-panel p-6 sm:p-12 rounded-3xl border border-white/10 space-y-6" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
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
